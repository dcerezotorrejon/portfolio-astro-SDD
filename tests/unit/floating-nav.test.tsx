// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FloatingNav from "../../src/components/home/FloatingNav/FloatingNav";
import { getContainer } from "../helpers/render";

const initialSections = [
  { id: "inicio", label: "Inicio" },
  { id: "trayectoria", label: "Trayectoria" },
];

type FrameCallback = FrameRequestCallback;

let frameId: number;
let frames: Map<number, FrameCallback>;
let frameRequest: ReturnType<typeof vi.fn>;
let frameCancel: ReturnType<typeof vi.fn>;
let observerInstances: FakeResizeObserver[];
let originalFontsDescriptor: PropertyDescriptor | undefined;

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
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

/**
 * Pin a section's viewport geometry by its top edge (R11/AC12 contract:
 * activation happens when a section's top reaches the 16 px scroll inset
 * with 1 px rounding tolerance, i.e. top <= 17).
 */
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
  FakeResizeObserver.instances = [];
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

  const home = document.createElement("section");
  home.id = "inicio";
  const experience = document.createElement("section");
  experience.id = "trayectoria";
  document.body.prepend(home, experience);
});

afterEach(() => {
  cleanup();
  // Fragment navigation and the component's pushState leave `location.hash`
  // set; reset it so the next test starts without a stale fragment.
  window.history.replaceState(null, "", window.location.pathname);
  document.getElementById("inicio")?.remove();
  document.getElementById("trayectoria")?.remove();
  if (originalFontsDescriptor) {
    Object.defineProperty(document, "fonts", originalFontsDescriptor);
  } else {
    Reflect.deleteProperty(document, "fonts");
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("FloatingNav", () => {
  it("server-renders normal fragment links, a named nav, and location current state", async () => {
    const container = await getContainer();
    const html = await container.renderToString(FloatingNav, {
      props: {
        sections: initialSections,
        ariaLabel: "Secciones del portfolio",
      },
    });
    const { document: renderedDocument } = new JSDOM(html).window;
    const nav = renderedDocument.querySelector("nav");
    const links = [...(nav?.querySelectorAll("a") ?? [])];

    expect(nav).toHaveAttribute("aria-label", "Secciones del portfolio");
    expect(nav).toHaveAttribute("data-active-index", "0");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#inicio",
      "#trayectoria",
    ]);
    expect(links[0]).toHaveAttribute("aria-current", "location");
    expect(links[1]).not.toHaveAttribute("aria-current");
    expect(links.every((link) => link.getAttribute("role") !== "tab")).toBe(
      true,
    );
    expect(links.every((link) => link.hasAttribute("tabindex") === false)).toBe(
      true,
    );
    expect(nav?.querySelector("[aria-hidden='true']")).toBeTruthy();
  });

  it("pre-selects from the URL fragment before paint, then lets measured geometry govern", () => {
    window.history.replaceState(null, "", "#trayectoria");
    setTop("inicio", 0);
    // 17.5 px misses the 16 px inset + 1 px tolerance threshold.
    setTop("trayectoria", 17.5);
    render(<FloatingNav sections={initialSections} />);

    // The layout effect reads the fragment and selects the hashed section
    // before the first paint, so the indicator never flashes "Inicio".
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");
    // The isPositioned rAF and the measurement scheduler each queue a frame.
    expect(frameRequest).toHaveBeenCalledTimes(2);
    flushFrame();

    // Geometry still governs: the hashed section has not reached the start
    // inset yet, so measurement restores "inicio".
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(document.querySelector(".floating-nav")).toHaveAttribute(
      "data-active-index",
      "0",
    );

    // Crossing the threshold (16.4 <= 16 + 1) activates the next section.
    setTop("trayectoria", 16.4);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    expect(document.querySelector(".floating-nav")).toHaveAttribute(
      "data-active-index",
      "1",
    );
    expect(navLink("Inicio")).not.toHaveAttribute("aria-current");
  });

  it("measures at mount and ignores an unknown or absent fragment", () => {
    // No fragment: measurement selects by geometry once frames run.
    setTop("inicio", 200);
    setTop("trayectoria", 16);
    const { unmount } = render(<FloatingNav sections={initialSections} />);
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    unmount();

    // A fragment that is not one of the sections must not select anything.
    window.history.replaceState(null, "", "#desconocida");
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    render(<FloatingNav sections={initialSections} />);
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(navLink("Trayectoria")).not.toHaveAttribute("aria-current");
  });

  it("crosses downward at the start inset, reverses upward, resolves a tie toward the later section, and coalesces scroll bursts", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    render(<FloatingNav sections={initialSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    setTop("inicio", 0);
    setTop("trayectoria", 16);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    // One pending frame per effect scheduler (section measurement and focus
    // protection), each coalesced across the scroll burst.
    expect(frames.size).toBe(2);
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    // Scrolling back up past the threshold restores the earlier section.
    setTop("inicio", 0);
    setTop("trayectoria", 18);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    // Coinciding tops: the later section in document order wins.
    setTop("inicio", 16);
    setTop("trayectoria", 16);
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    expect(frameCancel).not.toHaveBeenCalled();
  });

  it("responds to resize, hashchange, pageshow and observed section size changes", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    render(<FloatingNav sections={initialSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(observerInstances[0]?.observed).toHaveLength(2);

    setTop("inicio", 400);
    setTop("trayectoria", 16);
    act(() => window.dispatchEvent(new Event("resize")));
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    // hashchange (like pageshow) is only heard by the measurement scheduler,
    // so exactly one frame is pending.
    act(() => window.dispatchEvent(new Event("hashchange")));
    expect(frames.size).toBe(1);
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");

    setTop("inicio", 0);
    setTop("trayectoria", 18);
    act(() => window.dispatchEvent(new PageTransitionEvent("pageshow")));
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    setTop("inicio", 400);
    setTop("trayectoria", 16);
    act(() =>
      observerInstances[0]?.callback(
        [],
        observerInstances[0] as unknown as ResizeObserver,
      ),
    );
    flushFrame();
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
  });

  it("tracks changed section order and removal without making the active state a tab stop", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 650);
    const { rerender } = render(<FloatingNav sections={initialSections} />);
    flushFrame();
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");

    const reordered = [
      { id: "trayectoria", label: "Trayectoria" },
      { id: "inicio", label: "Inicio" },
    ];
    rerender(<FloatingNav sections={reordered} />);
    flushFrame();
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["Trayectoria", "Inicio"],
    );
    // Still selected by geometry, but the index now follows the prop order.
    expect(navLink("Inicio")).toHaveAttribute("aria-current", "location");
    expect(document.querySelector(".floating-nav")).toHaveAttribute(
      "data-active-index",
      "1",
    );

    rerender(
      <FloatingNav sections={[{ id: "trayectoria", label: "Trayectoria" }]} />,
    );
    flushFrame();
    expect(
      screen.queryByRole("link", { name: "Inicio" }),
    ).not.toBeInTheDocument();
    // The only remaining section has not reached the inset, so the first
    // (and only) section is the fallback selection.
    expect(navLink("Trayectoria")).toHaveAttribute("aria-current", "location");
    expect(navLink("Trayectoria")).not.toHaveAttribute("tabindex");

    // Empty section list renders no links and keeps a valid zero index.
    rerender(<FloatingNav sections={[]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(document.querySelector(".floating-nav")).toHaveAttribute(
      "data-active-index",
      "0",
    );
  });

  it("works without ResizeObserver and cleans up listeners, fonts, and every queued frame on unmount", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    const addListener = vi.spyOn(window, "addEventListener");
    const removeListener = vi.spyOn(window, "removeEventListener");
    const fontEvents = document.fonts as unknown as EventTarget;
    const addFontListener = vi.spyOn(fontEvents, "addEventListener");
    const removeFontListener = vi.spyOn(fontEvents, "removeEventListener");
    const { unmount } = render(<FloatingNav sections={initialSections} />);
    // At mount two effects queue a frame: the one-shot `data-positioned`
    // scheduler and the section measurement scheduler.
    expect(frames.size).toBe(2);
    flushFrame();
    expect(addFontListener).toHaveBeenCalledWith(
      "loadingdone",
      expect.any(Function),
    );
    act(() => fontEvents.dispatchEvent(new Event("loadingdone")));
    expect(frames.size).toBe(1);

    // A scroll event wakes both schedulers: measurement and focus protection.
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(frames.size).toBe(2);

    unmount();

    for (const type of ["scroll", "resize", "hashchange", "pageshow"]) {
      expect(
        addListener.mock.calls.some(([eventType]) => eventType === type),
      ).toBe(true);
      expect(
        removeListener.mock.calls.some(([eventType]) => eventType === type),
      ).toBe(true);
    }
    expect(removeFontListener).toHaveBeenCalledWith(
      "loadingdone",
      addFontListener.mock.calls[0]?.[1],
    );
    // Three effects own a frame handle and cancel it on unmount: the one-shot
    // `data-positioned` scheduler, section measurement, and focus protection.
    expect(frameCancel).toHaveBeenCalledTimes(3);
    expect(frames.size).toBe(0);
    expect(observerInstances).toHaveLength(0);
    const requestsBeforeDispatch = frameRequest.mock.calls.length;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(frameRequest).toHaveBeenCalledTimes(requestsBeforeDispatch);
  });

  function setRect(
    element: Element,
    rect: { top: number; bottom: number; left: number; right: number },
  ) {
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      x: rect.left,
      y: rect.top,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      toJSON: () => ({}),
    } as DOMRect);
  }

  function focusObscuredState() {
    return document
      .querySelector(".floating-nav")
      ?.getAttribute("data-focus-obscured");
  }

  it("hides the navigator for a keyboard-focused control it would cover and restores it when focus moves into the navigator", () => {
    // jsdom has no :focus-visible support; emulate the browser's affirmative
    // match so the component's keyboard-focus branch is exercised, while
    // other selectors keep their real behavior.
    const realMatches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      if (selector === ":focus-visible") {
        return true;
      }

      return realMatches.call(this, selector);
    });
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    render(<FloatingNav sections={initialSections} />);
    flushFrame();

    const nav = document.querySelector(".floating-nav");
    expect(nav).toBeTruthy();
    setRect(nav as Element, {
      top: 700,
      bottom: 744,
      left: 50,
      right: 350,
    });

    const control = document.createElement("button");
    control.type = "button";
    control.textContent = "Acción";
    document.body.append(control);
    // Overlaps the navigator (bottom 730 + 8 px focus-outline margin > 700).
    setRect(control, { top: 686, bottom: 730, left: 100, right: 300 });

    act(() => control.focus());
    act(() => document.dispatchEvent(new Event("focusin")));
    flushFrame();
    expect(focusObscuredState()).toBe("true");

    // Focus into the navigator itself: it must become visible again while
    // staying in the tab order (opacity hiding, not removal).
    act(() => navLink("Inicio").focus());
    act(() => document.dispatchEvent(new Event("focusin")));
    flushFrame();
    expect(focusObscuredState()).toBeNull();
    expect(navLink("Inicio")).not.toHaveAttribute("tabindex");
    expect(navLink("Trayectoria")).not.toHaveAttribute("tabindex");
    control.remove();
  });

  it("keeps the navigator visible when a keyboard-focused control does not overlap it", () => {
    const realMatches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      if (selector === ":focus-visible") {
        return true;
      }

      return realMatches.call(this, selector);
    });
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    render(<FloatingNav sections={initialSections} />);
    flushFrame();

    const nav = document.querySelector(".floating-nav");
    expect(nav).toBeTruthy();
    setRect(nav as Element, {
      top: 700,
      bottom: 744,
      left: 50,
      right: 350,
    });

    const control = document.createElement("button");
    control.type = "button";
    control.textContent = "Acción";
    document.body.append(control);
    // Sits well above the navigator, including the 8 px outline margin.
    setRect(control, { top: 600, bottom: 644, left: 100, right: 300 });

    act(() => control.focus());
    act(() => document.dispatchEvent(new Event("focusin")));
    flushFrame();
    expect(focusObscuredState()).toBeNull();
    control.remove();
  });

  it("disconnects its ResizeObserver and does not retain removed section nodes", () => {
    setTop("inicio", 0);
    setTop("trayectoria", 300);
    const { unmount } = render(<FloatingNav sections={initialSections} />);
    expect(observerInstances[0]?.observed).toEqual([
      document.getElementById("inicio"),
      document.getElementById("trayectoria"),
    ]);

    unmount();

    expect(observerInstances[0]?.disconnected).toBe(true);
  });
});
