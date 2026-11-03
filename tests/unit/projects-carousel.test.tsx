// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProjectsCarousel from "../../src/components/home/ProjectsCarousel/ProjectsCarousel";
import {
  CLONE_ATTRIBUTE,
  WHEEL_THRESHOLDS,
  createCarouselController,
  createClone,
  createWheelClassifier,
  focusStop,
  horizontalWheelDelta,
  insertClones,
  isAlignedToStop,
  planMove,
  stopFromPosition,
  stopLeft,
  wrapStop,
} from "../../src/components/home/ProjectsCarousel/helpers/carousel";

const STOP_WIDTH = 100;

function buildList(count: number): HTMLUListElement {
  const list = document.createElement("ul");

  for (let index = 0; index < count; index += 1) {
    const slide = document.createElement("li");
    slide.innerHTML = `<article data-astro-transition-scope="scope-${index}"><h3 id="title-${index}">Project ${index}</h3><div aria-labelledby="title-${index}"><img loading="lazy" src="/image.svg" alt=""><a href="/proyectos/${index}/">Link</a></div></article>`;
    list.append(slide);
  }

  return list;
}

/** A scroller with deterministic geometry, since jsdom has no layout. */
function mountScroller(count: number, { animate = false } = {}) {
  const scroller = document.createElement("div");
  const list = buildList(count);
  const calls: ScrollToOptions[] = [];

  scroller.append(list);
  document.body.append(scroller);
  scroller.scrollLeft = 0;
  scroller.getBoundingClientRect = () => ({ left: 0, width: 300 }) as DOMRect;
  scroller.scrollTo = ((options: ScrollToOptions) => {
    calls.push(options);

    // A smooth scroll only moves here when the test asks for it.
    if (options.behavior === "instant" || animate) {
      scroller.scrollLeft = options.left ?? 0;
    }
  }) as typeof scroller.scrollTo;

  for (const slide of Array.from(list.children) as HTMLElement[]) {
    slide.getBoundingClientRect = () =>
      ({
        left:
          Array.from(list.children).indexOf(slide) * STOP_WIDTH -
          scroller.scrollLeft,
      }) as DOMRect;
  }

  return { scroller, list, calls };
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query }));
}

const metrics = { origin: 500, stopWidth: 100, visibleCards: 2 };

describe("carousel math", () => {
  it("converts between stops and scroll positions", () => {
    expect(stopLeft(metrics, 0)).toBe(500);
    expect(stopLeft(metrics, -2)).toBe(300);
    expect(stopFromPosition(metrics, 500)).toBe(0);
    expect(stopFromPosition(metrics, 640)).toBe(1);
    expect(stopFromPosition(metrics, 340)).toBe(-2);
  });

  it("allows only a rounding error when checking alignment", () => {
    expect(isAlignedToStop(metrics, 601.5, 1)).toBe(true);
    expect(isAlignedToStop(metrics, 610, 1)).toBe(false);
  });

  it.each([
    [5, 5, 0],
    [-1, 5, 4],
    [7, 5, 2],
    [-5, 5, 0],
    [4, 4, 0],
    [-1, 4, 3],
  ])("wraps stop %i of %i cards to %i", (stop, count, expected) => {
    expect(wrapStop(stop, count)).toBe(expected);
  });

  it.each([4, 5, 6])(
    "moves %i cards inside the range where every slot exists",
    (count) => {
      expect(planMove(0, 1, count, 0)).toEqual({ shift: 0, target: 1 });
      expect(planMove(2 * count - 4, 1, count, 2 * count - 4)).toEqual({
        shift: 0,
        target: 2 * count - 3,
      });
      expect(planMove(1 - count, 1, count, 1 - count).shift).toBe(0);
    },
  );

  it.each([4, 5, 6])(
    "shifts by one full set of %i cards past either bound",
    (count) => {
      const last = 2 * count - 3;
      const first = 1 - count;

      expect(planMove(last, 1, count, last)).toEqual({
        shift: -count,
        target: last + 1 - count,
      });
      expect(planMove(first, -1, count, first)).toEqual({
        shift: count,
        target: first - 1 + count,
      });
    },
  );

  it("does not jump when rapid input outran the animation", () => {
    // The position cannot go five stops further back than -4.78, so a jump
    // would clamp at the scroller's edge and visibly pull the cards.
    expect(planMove(7, 1, 5, -4.78)).toEqual({ shift: 0, target: 3 });
    expect(planMove(-4, -1, 5, 8.4)).toEqual({ shift: 0, target: 0 });
  });

  it("keeps a focused card's stop when it is already fully visible", () => {
    expect(focusStop(2, 1, 2)).toBe(1);
    expect(focusStop(2, 2, 2)).toBe(2);
  });

  it("moves to the nearest stop that shows a focused card in full", () => {
    expect(focusStop(3, 0, 2)).toBe(2);
    expect(focusStop(0, 3, 2)).toBe(0);
    expect(focusStop(4, 0, 2)).toBe(3);
    expect(focusStop(4, 4, 2)).toBe(4);
    expect(focusStop(2, 0, 1)).toBe(2);
    expect(focusStop(0, -1, 2)).toBe(0);
  });
});

describe("wheel input", () => {
  const sample = {
    deltaX: 0,
    deltaY: 0,
    deltaMode: 0,
    shiftKey: false,
    time: 1000,
  };

  it("reads Shift with a vertical wheel as horizontal, in either report", () => {
    expect(
      horizontalWheelDelta({ deltaX: 0, deltaY: 120, shiftKey: true }),
    ).toBe(120);
    expect(
      horizontalWheelDelta({ deltaX: -120, deltaY: 0, shiftKey: true }),
    ).toBe(-120);
  });

  it("reads vertical-dominant input as not horizontal", () => {
    expect(
      horizontalWheelDelta({ deltaX: 0, deltaY: 200, shiftKey: false }),
    ).toBe(0);
    expect(
      horizontalWheelDelta({ deltaX: 50, deltaY: 50, shiftKey: false }),
    ).toBe(0);
  });

  it("never touches vertical input", () => {
    const classify = createWheelClassifier();

    expect(classify({ ...sample, deltaY: 200 })).toBe("native");
    expect(classify({ ...sample, deltaX: 5, deltaY: 200 })).toBe("native");
  });

  it("treats a large or line-based first event as a discrete gesture", () => {
    expect(
      createWheelClassifier()({
        ...sample,
        deltaX: WHEEL_THRESHOLDS.discreteDeltaPx,
      }),
    ).toBe("move");
    expect(
      createWheelClassifier()({ ...sample, deltaX: 1, deltaMode: 1 }),
    ).toBe("move");
    expect(
      createWheelClassifier()({ ...sample, deltaY: 120, shiftKey: true }),
    ).toBe("move");
  });

  it("keeps a continuous gesture native even if a later event is large", () => {
    const classify = createWheelClassifier();

    expect(classify({ ...sample, deltaX: 4 })).toBe("native");
    expect(classify({ ...sample, deltaX: 90, time: 1016 })).toBe("native");
  });

  it("throttles a discrete gesture to one move per interval", () => {
    const classify = createWheelClassifier();
    const { moveIntervalMs } = WHEEL_THRESHOLDS;

    expect(classify({ ...sample, deltaX: 120 })).toBe("move");
    expect(classify({ ...sample, deltaX: 120, time: 1050 })).toBe("consume");
    expect(
      classify({ ...sample, deltaX: 120, time: 1000 + moveIntervalMs }),
    ).toBe("move");
  });

  it("classifies again after the gesture gap", () => {
    const classify = createWheelClassifier();
    const later = 1000 + WHEEL_THRESHOLDS.gestureGapMs + 1;

    expect(classify({ ...sample, deltaX: 4 })).toBe("native");
    expect(classify({ ...sample, deltaX: 120, time: later })).toBe("move");
  });
});

describe("clones", () => {
  it("removes everything that must stay unique or exposed", () => {
    const [slide] = Array.from(buildList(1).children) as HTMLElement[];
    const clone = createClone(slide);

    expect(clone.getAttribute("aria-hidden")).toBe("true");
    expect(clone.hasAttribute(CLONE_ATTRIBUTE)).toBe(true);
    expect(clone.querySelector("[id]")).toBeNull();
    expect(clone.querySelector("[aria-labelledby]")).toBeNull();
    expect(clone.querySelector("[data-astro-transition-scope]")).toBeNull();
    expect(clone.querySelector("a")?.getAttribute("tabindex")).toBe("-1");
    expect(clone.querySelector("img")?.getAttribute("loading")).toBe("eager");
  });

  it("stays operable by pointer, so it never uses inert", () => {
    const [slide] = Array.from(buildList(1).children) as HTMLElement[];
    const clone = createClone(slide);

    expect(clone.querySelector("[inert]")).toBeNull();
    expect(clone.hasAttribute("inert")).toBe(false);
    expect(clone.querySelector("a")?.getAttribute("href")).toBe(
      "/proyectos/0/",
    );
  });

  it("leaves the original slide untouched", () => {
    const [slide] = Array.from(buildList(1).children) as HTMLElement[];

    createClone(slide);

    expect(slide.hasAttribute("aria-hidden")).toBe(false);
    expect(slide.querySelector("h3")?.id).toBe("title-0");
    expect(slide.querySelector("a")?.hasAttribute("tabindex")).toBe(false);
  });

  it.each([4, 5])("surrounds %i slides with a full set each side", (count) => {
    const list = buildList(count);
    const real = Array.from(list.children);
    const remove = insertClones(list);
    const children = Array.from(list.children);

    expect(children).toHaveLength(count * 3);
    expect(children.slice(count, count * 2)).toEqual(real);
    expect(list.querySelectorAll(`[${CLONE_ATTRIBUTE}]`).length).toBe(
      count * 2,
    );
    expect(children[0].querySelector("a")?.getAttribute("href")).toBe(
      "/proyectos/0/",
    );

    remove();

    expect(Array.from(list.children)).toEqual(real);
  });
});

describe("carousel controller", () => {
  beforeEach(() => {
    stubReducedMotion(false);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([4, 5])(
    "applies clones and the looped position in one step for %i cards",
    (count) => {
      const { scroller, list, calls } = mountScroller(count);
      const controller = createCarouselController(scroller, list);

      expect(list.children).toHaveLength(count * 3);
      expect(calls).toEqual([
        { left: count * STOP_WIDTH, behavior: "instant" },
      ]);

      controller.destroy();
    },
  );

  it("removes its clones, so a remount keeps the count", () => {
    const { scroller, list } = mountScroller(5);

    for (let mount = 0; mount < 3; mount += 1) {
      const controller = createCarouselController(scroller, list);

      expect(list.children).toHaveLength(15);
      controller.destroy();
      expect(list.children).toHaveLength(5);
    }
  });

  it("slides one stop per move, and instantly under reduced motion", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);

    controller.move(1);
    expect(calls.at(-1)).toEqual({ left: 600, behavior: "smooth" });

    stubReducedMotion(true);
    controller.move(1);
    expect(calls.at(-1)).toEqual({ left: 700, behavior: "instant" });

    controller.destroy();
  });

  it.each([
    [4, 10, 2],
    [4, -10, 2],
    [5, 10, 0],
    [5, 14, 4],
    [5, -7, 3],
  ])(
    "with %i cards, %i rapid moves land on real stop %i",
    (count, moves, expected) => {
      const { scroller, list, calls } = mountScroller(count);
      const controller = createCarouselController(scroller, list);

      for (let index = 0; index < Math.abs(moves); index += 1) {
        controller.move(Math.sign(moves));
      }

      const last = calls.at(-1)?.left ?? 0;
      const stop = (last - count * STOP_WIDTH) / STOP_WIDTH;

      expect(wrapStop(stop, count)).toBe(expected);
      // Every slot visible at the final stop exists.
      expect(stop).toBeGreaterThanOrEqual(1 - count);
      expect(stop).toBeLessThanOrEqual(2 * count - 3);

      controller.destroy();
    },
  );

  it("wraps instantly from a clone stop to the same real stop", () => {
    const { scroller, list, calls } = mountScroller(5, { animate: true });
    const controller = createCarouselController(scroller, list);

    for (let index = 0; index < 5; index += 1) {
      controller.move(1);
    }

    expect(scroller.scrollLeft).toBe(1000);
    scroller.dispatchEvent(new Event("scrollend"));

    expect(calls.at(-1)).toEqual({ left: 500, behavior: "instant" });
    expect(scroller.scrollLeft).toBe(500);

    controller.destroy();
  });

  it("does not wrap on a stale position while a move is in flight", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);

    controller.move(1);
    const before = calls.length;
    scroller.dispatchEvent(new Event("scrollend"));

    expect(calls).toHaveLength(before);

    controller.destroy();
  });

  it("settles through the debounce when scrollend never fires", () => {
    vi.useFakeTimers();

    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);

    scroller.scrollLeft = 400;
    scroller.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(1000);

    expect(calls.at(-1)).toEqual({ left: 900, behavior: "instant" });

    controller.destroy();
  });

  it("consumes a tilted wheel and moves one stop in its direction", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);
    const event = new WheelEvent("wheel", { deltaX: 120, cancelable: true });

    scroller.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(calls.at(-1)).toEqual({ left: 600, behavior: "smooth" });

    controller.destroy();
  });

  it("moves backward with a negative horizontal wheel", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);

    scroller.dispatchEvent(
      new WheelEvent("wheel", { deltaX: -120, cancelable: true }),
    );

    expect(calls.at(-1)).toEqual({ left: 400, behavior: "smooth" });

    controller.destroy();
  });

  it("moves one stop for Shift with a vertical wheel", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);
    const event = new WheelEvent("wheel", {
      deltaY: 120,
      shiftKey: true,
      cancelable: true,
    });

    scroller.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(calls.at(-1)).toEqual({ left: 600, behavior: "smooth" });

    controller.destroy();
  });

  it("leaves vertical and trackpad-like wheel input alone", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);
    const before = calls.length;
    const vertical = new WheelEvent("wheel", {
      deltaY: 200,
      cancelable: true,
    });
    const trackpad = new WheelEvent("wheel", {
      deltaX: 8,
      cancelable: true,
    });

    scroller.dispatchEvent(vertical);
    scroller.dispatchEvent(trackpad);

    expect(vertical.defaultPrevented).toBe(false);
    expect(trackpad.defaultPrevented).toBe(false);
    expect(calls).toHaveLength(before);

    controller.destroy();
  });

  it("stops listening after destroy", () => {
    const { scroller, list, calls } = mountScroller(5);
    const controller = createCarouselController(scroller, list);

    controller.destroy();

    const before = calls.length;
    const event = new WheelEvent("wheel", { deltaX: 120, cancelable: true });

    scroller.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(calls).toHaveLength(before);
  });

  it("keeps a pointer press from focusing a clone, but not a real link", () => {
    const { scroller, list } = mountScroller(5);
    const controller = createCarouselController(scroller, list);
    const press = () =>
      new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    const onClone = press();
    const onReal = press();

    list.querySelector(`[${CLONE_ATTRIBUTE}] a`)?.dispatchEvent(onClone);
    list.querySelector(`li:not([${CLONE_ATTRIBUTE}]) a`)?.dispatchEvent(onReal);

    expect(onClone.defaultPrevented).toBe(true);
    expect(onReal.defaultPrevented).toBe(false);

    controller.destroy();
  });
});

describe("ProjectsCarousel hydration (R17)", () => {
  const labels = { previousLabel: "Anterior", nextLabel: "Siguiente" };
  const tree = (
    <ProjectsCarousel {...labels}>
      <ul>
        <li>
          <a href="/uno/">Uno</a>
        </li>
        <li>
          <a href="/dos/">Dos</a>
        </li>
      </ul>
    </ProjectsCarousel>
  );

  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    Element.prototype.scrollTo = vi.fn() as typeof Element.prototype.scrollTo;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("server-renders native, named, disabled arrows and no clones", () => {
    const host = document.createElement("div");

    host.innerHTML = renderToString(tree);

    const arrows = Array.from(host.querySelectorAll("button"));

    expect(arrows.map((arrow) => arrow.getAttribute("aria-label"))).toEqual([
      "Anterior",
      "Siguiente",
    ]);
    expect(arrows.every((arrow) => arrow.disabled)).toBe(true);
    expect(arrows.every((arrow) => arrow.type === "button")).toBe(true);
    expect(host.querySelector(`[${CLONE_ATTRIBUTE}]`)).toBeNull();
    expect(host.querySelectorAll("li")).toHaveLength(2);
  });

  it("hydrates without a mismatch, then enables arrows and adds clones", async () => {
    const consoleError = vi.spyOn(console, "error");
    const onRecoverableError = vi.fn();
    const host = document.createElement("div");

    document.body.append(host);
    host.innerHTML = renderToString(tree);

    const root = await act(async () =>
      hydrateRoot(host, tree, { onRecoverableError }),
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(
      Array.from(host.querySelectorAll("button")).every(
        (arrow) => !arrow.disabled,
      ),
    ).toBe(true);
    expect(host.querySelectorAll(`[${CLONE_ATTRIBUTE}]`)).toHaveLength(4);

    await act(async () => root.unmount());
  });

  it("removes its clones on unmount", async () => {
    const host = document.createElement("div");

    document.body.append(host);
    host.innerHTML = renderToString(tree);

    const list = host.querySelector("ul");
    const root = await act(async () => hydrateRoot(host, tree));

    expect(list?.children).toHaveLength(6);

    await act(async () => root.unmount());

    expect(list?.querySelector(`[${CLONE_ATTRIBUTE}]`)).toBeNull();
  });
});
