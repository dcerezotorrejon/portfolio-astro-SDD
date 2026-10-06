// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getActiveSectionIndex,
  prefersReducedMotion,
  scrollToSection,
} from "../../src/components/home/FloatingNav/helpers/navigation";

describe("getActiveSectionIndex (section-start activation)", () => {
  const sections = [
    { id: "inicio", top: 16 },
    { id: "trayectoria", top: 400 },
  ];

  it("activates the last section whose top passed the 16px inset, even if a tall earlier section still fills the viewport center", () => {
    expect(getActiveSectionIndex(sections)).toBe(0);

    // "inicio" starts at the inset while "trayectoria" is far below.
    expect(getActiveSectionIndex([{ id: "inicio", top: 16 }])).toBe(0);

    // A tall first section (top 100, so its center is near the viewport
    // center) is NOT active when a later section already reached the inset.
    const tallEarlier = [
      { id: "inicio", top: 100 },
      { id: "trayectoria", top: 16 },
    ];
    expect(getActiveSectionIndex(tallEarlier)).toBe(1);
  });

  it("treats tops of 16, 16.4 and 17 as passed (1px tolerance) and 17.1 as not", () => {
    expect(getActiveSectionIndex([{ id: "a", top: 16 }])).toBe(0);
    expect(getActiveSectionIndex([{ id: "a", top: 16.4 }])).toBe(0);
    expect(getActiveSectionIndex([{ id: "a", top: 17 }])).toBe(0);
    // 17.1 px is past the tolerance band: the section has not reached the
    // inset yet, so with nothing qualified the first section stays active.
    expect(getActiveSectionIndex([{ id: "a", top: 17.1 }])).toBe(0);
    expect(
      getActiveSectionIndex([
        { id: "a", top: 500 },
        { id: "b", top: 17.1 },
      ]),
    ).toBe(0);
    expect(
      getActiveSectionIndex([
        { id: "a", top: 500 },
        { id: "b", top: 17 },
      ]),
    ).toBe(1);
  });

  it("returns the last qualifying section on an upward reversal of scroll", () => {
    // Scrolling back up: "trayectoria" leaves the inset, "inicio" qualifies.
    expect(
      getActiveSectionIndex([
        { id: "inicio", top: 10 },
        { id: "trayectoria", top: 300 },
      ]),
    ).toBe(0);
    // Slightly further up: both qualify, later wins.
    expect(
      getActiveSectionIndex([
        { id: "inicio", top: 0 },
        { id: "trayectoria", top: 16 },
      ]),
    ).toBe(1);
    // Reversed again on the way down.
    expect(
      getActiveSectionIndex([
        { id: "inicio", top: 0 },
        { id: "trayectoria", top: 30 },
      ]),
    ).toBe(0);
  });

  it("breaks ties by the later section in the given order", () => {
    expect(
      getActiveSectionIndex([
        { id: "a", top: 16 },
        { id: "b", top: 16 },
      ]),
    ).toBe(1);
    expect(
      getActiveSectionIndex([
        { id: "a", top: -50 },
        { id: "b", top: -50 },
        { id: "c", top: 16.4 },
      ]),
    ).toBe(2);
  });

  it("keeps the first section active when nothing qualifies, and returns 0 for an empty list", () => {
    expect(
      getActiveSectionIndex([
        { id: "a", top: 18 },
        { id: "b", top: 20 },
      ]),
    ).toBe(0);
    expect(getActiveSectionIndex([])).toBe(0);
  });

  it("honors a custom activation offset and tolerance", () => {
    const list = [
      { id: "a", top: 90 },
      { id: "b", top: 101 },
      { id: "c", top: 122 },
    ];
    expect(getActiveSectionIndex(list, 100, 0)).toBe(0);
    expect(getActiveSectionIndex(list, 100, 1)).toBe(1);
    expect(getActiveSectionIndex(list, 120)).toBe(1);
    expect(getActiveSectionIndex(list, 120, 5)).toBe(2);
  });
});

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reflects the reduce media query in both directions", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    expect(prefersReducedMotion()).toBe(true);

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    expect(prefersReducedMotion()).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
  });

  it("returns false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("scrollToSection", () => {
  afterEach(() => {
    document.getElementById("target")?.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function makeTarget(): HTMLElement {
    const target = document.createElement("section");
    target.id = "target";
    document.body.append(target);
    return target;
  }

  it("returns false for a missing target without scrolling", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    expect(scrollToSection("missing")).toBe(false);
  });

  it("smooth-scrolls an existing target to the block start", () => {
    const target = makeTarget();
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );

    expect(scrollToSection("target")).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "smooth",
    });
  });

  it("scrolls immediately under reduced motion", () => {
    const target = makeTarget();
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );

    expect(scrollToSection("target")).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
  });

  it("returns false when the target cannot scroll into view", () => {
    const target = makeTarget();
    Object.defineProperty(target, "scrollIntoView", {
      configurable: true,
      value: undefined,
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );

    expect(scrollToSection("target")).toBe(false);
  });
});
