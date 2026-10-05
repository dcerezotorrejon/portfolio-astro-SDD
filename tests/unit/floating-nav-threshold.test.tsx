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

import FloatingNav from "../../src/components/FloatingNav";

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

  it("does not change selection from a link click; only geometry drives it", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    setTop("contacto", 600);
    render(<FloatingNav sections={domOrderSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    fireEvent.click(navLink("Contacto"));
    expect(frames.size).toBe(0);
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(navLink("Contacto")).not.toHaveAttribute("aria-current");
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
});
