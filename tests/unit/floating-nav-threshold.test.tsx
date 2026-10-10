// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FloatingNav from "../../src/components/home/FloatingNav/FloatingNav";

type FrameCallback = FrameRequestCallback;

const domOrderSections = [
  { id: "inicio", label: "Inicio" },
  { id: "trayectoria", label: "Trayectoria" },
  { id: "contacto", label: "Contacto" },
];

let frameId: number;
let frames: Map<number, FrameCallback>;
let frameRequest: ReturnType<typeof vi.fn>;
let frameCancel: ReturnType<typeof vi.fn>;
let observerInstances: FakeResizeObserver[];
let originalFontsDescriptor: PropertyDescriptor | undefined;

class FakeResizeObserver {
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(readonly callback: ResizeObserverCallback) {
    observerInstances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }
}

function setTop(id: string, top: number, height = 600) {
  const section = document.getElementById(id);
  if (!section) throw new Error(`Missing test section #${id}`);
  vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: top,
    top,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    height,
    toJSON: () => ({}),
  } as DOMRect);
}

function flushFrame() {
  const pendingFrames = [...frames.values()];
  frames.clear();
  act(() => {
    pendingFrames.forEach((callback) => callback(0));
  });
}

function navLink(label: string) {
  return screen.getByRole("link", { name: label });
}

beforeEach(() => {
  frameId = 0;
  frames = new Map();
  observerInstances = [];
  frameRequest = vi.fn((callback: FrameCallback) => {
    const id = ++frameId;
    frames.set(id, callback);
    return id;
  });
  frameCancel = vi.fn((id: number) => frames.delete(id));
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    value: frameRequest,
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    value: frameCancel,
  });
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  originalFontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: new EventTarget(),
  });

  domOrderSections.forEach(({ id }) => {
    const section = document.createElement("section");
    section.id = id;
    document.body.appendChild(section);
  });
});

afterEach(() => {
  cleanup();
  // `pushState` from a previous test would otherwise leave `location.hash`
  // set and pre-select a section on the next mount.
  window.history.replaceState(null, "", window.location.pathname);
  domOrderSections.forEach(({ id }) => document.getElementById(id)?.remove());
  if (originalFontsDescriptor) {
    Object.defineProperty(document, "fonts", originalFontsDescriptor);
  } else {
    Reflect.deleteProperty(document, "fonts");
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("FloatingNav section-start threshold", () => {
  it("is inactive before the threshold and active after it, per measured tops", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 17.1);
    setTop("contacto", 900);
    render(<FloatingNav sections={domOrderSections} />);

    // Initial state (before any measurement) is the first prop section.
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    flushFrame();
    // 17.1 px misses the 16 + 1 threshold: nothing after "inicio" qualifies.
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "0",
    );

    setTop("trayectoria", 16.4);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "1",
    );
  });

  it("keeps a tall earlier section inactive and activates the last section that passed while the earlier one still covers the viewport center", () => {
    setTop("inicio", 100); // Tall section, center near viewport center.
    setTop("trayectoria", 500);
    setTop("contacto", 16);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "2",
    );
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");
    expect(navLink("Trayectoria")).not.toHaveAttribute("aria-current");
  });

  it("follows an upward reversal back to the earlier section and coalesces scroll bursts into one frame", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 16);
    setTop("contacto", 400);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    // Scroll back up: only "inicio" qualifies now.
    setTop("inicio", 0);
    setTop("trayectoria", 18);
    setTop("contacto", 500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    // One pending frame per effect (measure + focus protection), each
    // coalesced across the remaining events.
    const pendingAfterFirst = frames.size;
    expect(pendingAfterFirst).toBeLessThanOrEqual(2);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    expect(frames.size).toBe(pendingAfterFirst);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(frameCancel).not.toHaveBeenCalled();
  });

  it("resolves ties in actual DOM order even when the sections prop is reversed", () => {
    const reversedProps = [
      domOrderSections[2],
      domOrderSections[1],
      domOrderSections[0],
    ];
    setTop("inicio", 16);
    setTop("trayectoria", 16);
    setTop("contacto", 16);
    render(<FloatingNav sections={reversedProps} />);
    flushFrame();
    // All tops tied: the last DOM-order section ("contacto") wins, and the
    // rendered index follows the prop order, not the DOM order.
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "0",
    );
    expect(navLink("Trayectoria")).not.toHaveAttribute("aria-current");
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");
  });

  it("re-measures on resize, hashchange and observed section resize, but a bare hash event without geometry change does not move the selection", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(observerInstances[0]?.observed).toHaveLength(3);

    setTop("contacto", 16);
    act(() => window.dispatchEvent(new Event("resize")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // hashchange without new geometry: still measures, selection unchanged.
    setTop("contacto", 16);
    act(() => window.dispatchEvent(new Event("hashchange")));
    expect(frames.size).toBe(1);
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // ResizeObserver on a section re-measures too.
    setTop("trayectoria", 10);
    setTop("contacto", 500);
    act(() =>
      observerInstances[0]?.callback([], observerInstances[0] as never),
    );
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
  });

  it("smooth-scrolls and selects on a plain link click, but leaves reduced-motion and modified/new-tab clicks to the browser", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    const scrollIntoView = vi.fn();
    const contacto = document.getElementById("contacto") as HTMLElement;
    contacto.scrollIntoView = scrollIntoView;
    const pushState = vi.spyOn(window.history, "pushState");
    const matchMedia = vi.fn(() => ({ matches: false }));
    vi.stubGlobal("matchMedia", matchMedia);

    // Plain left click: intercept, push the fragment and scroll smoothly.
    fireEvent.click(navLink("Contacto"));
    expect(pushState).toHaveBeenCalledWith(null, "", "#contacto");
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "smooth",
    });
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");

    // Reduced motion: fall through to the native anchor, no interception.
    matchMedia.mockReturnValue({ matches: true });
    pushState.mockClear();
    scrollIntoView.mockClear();
    fireEvent.click(navLink("Inicio"));
    expect(pushState).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
    // Selection is unchanged until geometry changes.
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // Modified / new-tab / middle clicks also keep native behavior.
    matchMedia.mockReturnValue({ matches: false });
    pushState.mockClear();
    scrollIntoView.mockClear();
    for (const modifier of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      fireEvent.click(navLink("Trayectoria"), modifier);
    }
    expect(pushState).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
  });

  it("remounts with fresh measurements and cancels pending frames on unmount", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 16);
    setTop("contacto", 400);
    const { unmount } = render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    act(() => window.dispatchEvent(new Event("scroll")));
    // One frame per effect (measure + focus protection) is pending.
    expect(frames.size).toBe(2);
    unmount();
    expect(frameCancel).toHaveBeenCalled();
    expect(observerInstances[0]?.disconnected).toBe(true);

    setTop("inicio", 900);
    setTop("trayectoria", 900);
    setTop("contacto", 16);
    render(<FloatingNav sections={domOrderSections} />);
    // Fresh mount starts at the first section before measuring.
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "2",
    );
  });

  it("falls back to the first section while no section qualifies", () => {
    setTop("inicio", 200);
    setTop("trayectoria", 400);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "0",
    );
  });

  function stubSmoothScroll(...ids: string[]) {
    for (const id of ids) {
      const section = document.getElementById(id) as HTMLElement;
      section.scrollIntoView = vi.fn();
    }
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
  }

  it("holds the activated target across in-flight scroll measurements until it reaches the inset", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    stubSmoothScroll("contacto");
    fireEvent.click(navLink("Contacto"));
    // Optimistic selection: the indicator moves immediately on activation.
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "2",
    );

    // The smooth scroll is mid-flight: "contacto" is still far below the
    // inset. Measurements during this window must not revert to the origin.
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");

    // A second in-flight measurement keeps holding the target.
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-active-index",
      "2",
    );
  });

  it("keeps the hold past 17.1px, releases it at 17px, then lets geometry govern again", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();

    stubSmoothScroll("contacto");
    fireEvent.click(navLink("Contacto"));

    // 17.1 px misses the 16 + 1 threshold: the hold still pins "contacto"
    // even though geometry alone would fall back to "inicio".
    setTop("contacto", 17.1);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");

    // 17 px reaches the inset: the hold releases and geometry keeps "contacto".
    setTop("contacto", 17);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // The hold is gone, so geometry drives again: scrolling away from the
    // target restores the origin section.
    setTop("contacto", 400);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(navLink("Contacto")).not.toHaveAttribute("aria-current");
  });

  it("releases the hold on wheel so geometry takes over immediately", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();

    stubSmoothScroll("contacto");
    fireEvent.click(navLink("Contacto"));
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // A user wheel takes over from the programmatic scroll: geometry (still
    // at the origin) governs and the indicator returns to "inicio".
    act(() => window.dispatchEvent(new Event("wheel")));
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(navLink("Contacto")).not.toHaveAttribute("aria-current");
  });

  it("releases the hold on a scroll keydown but ignores non-scroll keys", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();

    stubSmoothScroll("contacto");
    fireEvent.click(navLink("Contacto"));

    // A non-scroll key must not disturb the hold.
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" })),
    );
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // A scroll key (Enter/PageDown/Home/End/Space/arrows) releases it.
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" })),
    );
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(navLink("Contacto")).not.toHaveAttribute("aria-current");
  });

  it("retargets an active hold to a newly activated section", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();

    stubSmoothScroll("trayectoria", "contacto");
    fireEvent.click(navLink("Trayectoria"));
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    // Activate a different section while the first hold is still in flight.
    fireEvent.click(navLink("Contacto"));
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");

    // Subsequent in-flight measurements keep the newest target, not the
    // previous one.
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Contacto")).toHaveAttribute("aria-current", "location");
    expect(navLink("Trayectoria")).not.toHaveAttribute("aria-current");
  });
});
