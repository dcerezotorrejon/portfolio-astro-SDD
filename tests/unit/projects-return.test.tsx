// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProjectsCarousel from "../../src/components/home/ProjectsCarousel/ProjectsCarousel";
import {
  CLONE_ATTRIBUTE,
  createCarouselController,
  focusStop,
} from "../../src/components/home/ProjectsCarousel/helpers/carousel";
import {
  installReturnListeners,
  returnScriptSource,
} from "../../src/components/home/ProjectsCarousel/helpers/return-listeners";
import {
  END_SPACE_ATTRIBUTE,
  RETURN_RECORD_KEY,
  parseReturnRecord,
  projectSlugFromPath,
  restoredStop,
  restoresOnSwap,
  visibleCardCount,
  writeReturnRecord,
} from "../../src/components/home/ProjectsCarousel/helpers/return-position";

const SLUGS = ["a", "b", "c", "d", "e"];
const STOP_WIDTH = 100;
const EDGE = 20;

const record = (at: string, opened: string) => JSON.stringify({ at, opened });

/** A server-rendered carousel with deterministic geometry, as jsdom has no layout. */
function mountCarousel(visibleCards: number, slugs = SLUGS) {
  const scroller = document.createElement("div");
  const list = document.createElement("ul");
  const width = 2 * EDGE + visibleCards * STOP_WIDTH;

  scroller.className = "projects-carousel-scroller";
  scroller.style.setProperty("scroll-padding-inline-start", `${EDGE}px`);
  scroller.getBoundingClientRect = () => ({ left: 0, width }) as DOMRect;

  const calls: ScrollToOptions[] = [];
  scroller.scrollLeft = 0;
  scroller.scrollTo = ((options: ScrollToOptions) => {
    calls.push(options);
    scroller.scrollLeft = options.left ?? 0;
  }) as typeof scroller.scrollTo;

  slugs.forEach((slug) => {
    const slide = document.createElement("li");

    slide.dataset.projectSlug = slug;
    slide.innerHTML = `<a href="/proyectos/${slug}/">Link</a>`;
    Object.defineProperty(slide, "offsetWidth", { value: STOP_WIDTH });
    slide.getBoundingClientRect = () =>
      ({
        left:
          EDGE +
          Array.from(list.children).indexOf(slide) * STOP_WIDTH -
          scroller.scrollLeft,
      }) as DOMRect;
    list.append(slide);
  });

  scroller.append(list);
  document.body.append(scroller);

  return { scroller, list, calls };
}

/** Run the serialized inline script exactly as the page would. */
function runInlineScript({
  readyState = "loading",
  navigationType = "back_forward",
} = {}) {
  vi.spyOn(document, "readyState", "get").mockReturnValue(
    readyState as DocumentReadyState,
  );
  vi.stubGlobal("performance", {
    getEntriesByType: () => [{ type: navigationType }],
  });
  new Function(returnScriptSource())();
}

function dispatchSwap(from: string, to: string, navigationType = "push") {
  const base = "https://example.com";
  const event = Object.assign(new Event("astro:before-swap"), {
    from: new URL(from, base),
    to: new URL(to, base),
    navigationType,
  });

  document.dispatchEvent(event);
  document.dispatchEvent(new Event("astro:after-swap"));
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  sessionStorage.clear();
});

describe("record parsing (AC43)", () => {
  it("reads a record of two slugs", () => {
    expect(parseReturnRecord(record("a", "b"))).toEqual({
      at: "a",
      opened: "b",
    });
  });

  it("keeps only the two slugs", () => {
    expect(parseReturnRecord('{"at":"a","opened":"b","x":1}')).toEqual({
      at: "a",
      opened: "b",
    });
  });

  it.each([
    ["no value", null],
    ["an empty value", ""],
    ["invalid JSON", "{nope"],
    ["JSON null", "null"],
    ["a number", "5"],
    ["a missing slug", '{"at":"a"}'],
    ["a slug of the wrong type", '{"at":"a","opened":1}'],
    ["an array", '["a","b"]'],
  ])("rejects %s", (_label, raw) => {
    expect(parseReturnRecord(raw)).toBeNull();
  });

  it("survives a store that throws on write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(() => writeReturnRecord({ at: "a", opened: "b" })).not.toThrow();
  });
});

describe("restored stop selection (AC38)", () => {
  const select = (at: string, opened: string, visible: number) =>
    restoredStop(SLUGS, { at, opened }, visible, focusStop);

  it("is always the opened project's stop with one card per view", () => {
    expect(select("a", "a", 1)).toBe(0);
    expect(select("a", "c", 1)).toBe(2);
    expect(select("e", "b", 1)).toBe(1);
  });

  it("keeps the stop when opening its second card", () => {
    expect(select("a", "b", 2)).toBe(0);
    expect(select("b", "c", 2)).toBe(1);
    expect(select("c", "d", 2)).toBe(2);
    expect(select("d", "e", 2)).toBe(3);
  });

  it("keeps the stop when opening its first card, including the last stop", () => {
    expect(select("a", "a", 2)).toBe(0);
    expect(select("c", "c", 2)).toBe(2);
    expect(select("e", "e", 2)).toBe(4);
  });

  it("restores stop 0 for the clone in the last stop's second slot", () => {
    expect(select("e", "a", 2)).toBe(0);
  });

  it("moves to the nearest stop that shows a peeking card in full", () => {
    // Left peek of stop 2 is b, whose nearest full stop is 1.
    expect(select("c", "b", 2)).toBe(1);
    // Right peek of stop 1 is d, whose nearest full stop is 2.
    expect(select("b", "d", 2)).toBe(2);
    // Peek of the real first stop's left is the clone of e, nearest by linear distance.
    expect(select("a", "e", 2)).toBe(3);
  });

  it("follows the width on return, not the width on departure", () => {
    // Left from the second card at two per view, returned at one per view.
    expect(select("b", "c", 1)).toBe(2);
    // Left at one per view, returned at two per view.
    expect(select("c", "c", 2)).toBe(2);
  });

  it("returns null for a slug that no card has", () => {
    expect(select("nope", "a", 2)).toBeNull();
    expect(select("a", "nope", 2)).toBeNull();
  });

  it("counts visible cards from the scroller's geometry", () => {
    expect(visibleCardCount(288, 32, 236, 224)).toBe(1);
    expect(visibleCardCount(1120, 56, 512, 496)).toBe(2);
    expect(visibleCardCount(801 - 64, 56, 320.5, 304.5)).toBe(2);
  });
});

describe("entry classification (AC41, AC42)", () => {
  const base = "https://example.com";
  const entry = (from: string, to: string, navigationType = "push") => ({
    from: new URL(from, base),
    to: new URL(to, base),
    navigationType,
  });

  it("restores on any router entry from a project detail page", () => {
    expect(restoresOnSwap(entry("/proyectos/a/", "/"))).toBe(true);
    expect(restoresOnSwap(entry("/proyectos/a/", "/#proyectos"))).toBe(true);
    expect(restoresOnSwap(entry("/proyectos/a/", "/", "traverse"))).toBe(true);
  });

  it("does not restore from any other page", () => {
    expect(restoresOnSwap(entry("/experiencia/a/", "/"))).toBe(false);
    expect(restoresOnSwap(entry("/experiencia/a/", "/", "traverse"))).toBe(
      false,
    );
  });

  it("keeps the carousel on a traversal back to the same path only", () => {
    expect(restoresOnSwap(entry("/", "/", "traverse"))).toBe(true);
    expect(restoresOnSwap(entry("/", "/", "push"))).toBe(false);
  });

  it.each([
    ["/proyectos/portfolio/", "portfolio"],
    ["/base/proyectos/portfolio/", "portfolio"],
    ["/proyectos/portfolio", "portfolio"],
    ["/proyectos/", null],
    ["/experiencia/portfolio/", null],
    ["/", null],
  ])("reads the slug of %s", (path, slug) => {
    expect(projectSlugFromPath(path)).toBe(slug);
  });
});

describe("full-document entries through the inline script", () => {
  it("stays self-contained and restores on a history traversal", () => {
    const { calls, list } = mountCarousel(1);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("c", "c"));
    runInlineScript();

    expect(calls).toEqual([{ left: 200, behavior: "instant" }]);
    expect(list.hasAttribute(END_SPACE_ATTRIBUTE)).toBe(false);
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
  });

  it.each(["reload", "navigate"])(
    "consumes the record without applying it on %s",
    (navigationType) => {
      const { calls } = mountCarousel(2);

      sessionStorage.setItem(RETURN_RECORD_KEY, record("c", "c"));
      runInlineScript({ navigationType });

      expect(calls).toEqual([]);
      expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
    },
  );

  it("does nothing when the router re-runs it after a swap", () => {
    const { calls } = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("c", "c"));
    runInlineScript({ readyState: "complete" });

    expect(calls).toEqual([]);
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).not.toBeNull();
  });

  it("reserves end space only for a stop the server layout cannot reach", () => {
    const last = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("e", "e"));
    runInlineScript();

    expect(last.list.hasAttribute(END_SPACE_ATTRIBUTE)).toBe(true);
    expect(last.calls).toEqual([{ left: 400, behavior: "instant" }]);

    document.body.innerHTML = "";

    const reachable = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("d", "d"));
    runInlineScript();

    expect(reachable.list.hasAttribute(END_SPACE_ATTRIBUTE)).toBe(false);
    expect(reachable.calls).toEqual([{ left: 300, behavior: "instant" }]);
  });

  it.each([
    ["malformed", "{nope"],
    ["unknown at", record("nope", "a")],
    ["unknown opened", record("a", "nope")],
  ])("starts at the first project with a %s record", (_label, raw) => {
    const { calls } = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, raw);
    expect(() => runInlineScript()).not.toThrow();

    expect(calls).toEqual([]);
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
  });

  it("survives a store that throws on read", () => {
    const { calls } = mountCarousel(2);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(() => runInlineScript()).not.toThrow();
    expect(calls).toEqual([]);
  });

  it("survives access to the store itself throwing", () => {
    const { calls } = mountCarousel(2);

    vi.stubGlobal("sessionStorage", undefined);

    expect(() => runInlineScript()).not.toThrow();
    expect(calls).toEqual([]);
  });

  it("does nothing on a page without the carousel, keeping the record", () => {
    sessionStorage.setItem(RETURN_RECORD_KEY, record("c", "c"));

    expect(() => runInlineScript()).not.toThrow();
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).not.toBeNull();
  });
});

describe("router entries through the listeners", () => {
  // The listeners stay on the document, like the bundled module's, so one install
  // serves this whole block.
  installReturnListeners();

  it("restores from a detail page on after-swap", () => {
    const { calls } = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("b", "c"));
    dispatchSwap("/proyectos/c/", "/#proyectos");

    expect(calls).toEqual([{ left: 100, behavior: "instant" }]);
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
  });

  it("consumes without restoring from another page", () => {
    const { calls } = mountCarousel(2);

    sessionStorage.setItem(RETURN_RECORD_KEY, record("b", "c"));
    dispatchSwap("/experiencia/a/", "/");

    expect(calls).toEqual([]);
    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
  });

  it("keeps the record while swapping to a page without the carousel", () => {
    sessionStorage.setItem(RETURN_RECORD_KEY, record("b", "c"));
    dispatchSwap("/", "/proyectos/c/");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).not.toBeNull();
  });

  it("does not move focus or the window", () => {
    const { list } = mountCarousel(2);
    const button = document.createElement("button");
    const scrollWindow = vi.fn();

    vi.stubGlobal("scrollTo", scrollWindow);
    document.body.append(button);
    button.focus();
    list.querySelectorAll("a").forEach((link) => {
      link.focus = vi.fn();
    });
    sessionStorage.setItem(RETURN_RECORD_KEY, record("c", "d"));
    dispatchSwap("/proyectos/d/", "/");

    expect(document.activeElement).toBe(button);
    expect(scrollWindow).not.toHaveBeenCalled();
  });
});

describe("controller and the record", () => {
  const prepare = (to: string, navigationType = "push", from = "/") =>
    document.dispatchEvent(
      Object.assign(new Event("astro:before-preparation"), {
        from: new URL(from, "https://example.com"),
        to: new URL(to, "https://example.com"),
        navigationType,
      }),
    );

  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });

  it("adopts a restored stop as its target, without an animated move", () => {
    const { scroller, list, calls } = mountCarousel(2);

    scroller.scrollLeft = 300;
    list.setAttribute(END_SPACE_ATTRIBUTE, "");

    const controller = createCarouselController(scroller, list);

    expect(calls).toEqual([{ left: 800, behavior: "instant" }]);
    expect(list.hasAttribute(END_SPACE_ATTRIBUTE)).toBe(false);
    expect(list.querySelectorAll(`[${CLONE_ATTRIBUTE}]`)).toHaveLength(10);

    controller.move(1);
    expect(calls.at(-1)).toEqual({ left: 900, behavior: "smooth" });

    controller.destroy();
  });

  it("records the logical stop on leaving, including one still moving", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    controller.move(1);
    controller.move(1);
    prepare("/proyectos/d/");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBe(record("c", "d"));

    controller.destroy();
  });

  it("wraps a clone stop to its project in the record", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    controller.move(-1);
    prepare("/proyectos/a/");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBe(record("e", "a"));

    controller.destroy();
  });

  it("replaces an older record", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    prepare("/proyectos/a/");
    controller.move(1);
    prepare("/proyectos/c/", "traverse");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBe(record("b", "c"));

    controller.destroy();
  });

  it("records nothing for another destination", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    prepare("/experiencia/a/");
    prepare("/", "push");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();

    controller.destroy();
  });

  it("records the current project on a traversal to the same path", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    controller.move(1);
    prepare("/", "traverse");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBe(record("b", "b"));

    controller.destroy();
  });

  it("stops recording after destroy", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    controller.destroy();
    prepare("/proyectos/a/");

    expect(sessionStorage.getItem(RETURN_RECORD_KEY)).toBeNull();
  });

  it("does not throw when the store rejects a write on leaving", () => {
    const { scroller, list } = mountCarousel(2);
    const controller = createCarouselController(scroller, list);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(() => prepare("/proyectos/a/")).not.toThrow();

    controller.destroy();
  });
});

describe("rendering does not read the record (R37, R17)", () => {
  const tree = (
    <ProjectsCarousel previousLabel="Anterior" nextLabel="Siguiente">
      <ul>
        <li data-project-slug="a">
          <a href="/proyectos/a/">Uno</a>
        </li>
        <li data-project-slug="b">
          <a href="/proyectos/b/">Dos</a>
        </li>
      </ul>
    </ProjectsCarousel>
  );

  it("renders and hydrates with a throwing store, without reading it", async () => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    Element.prototype.scrollTo = vi.fn() as typeof Element.prototype.scrollTo;

    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    const consoleError = vi.spyOn(console, "error");
    const onRecoverableError = vi.fn();
    const host = document.createElement("div");

    document.body.append(host);

    const html = renderToString(tree);

    expect(html).not.toContain(CLONE_ATTRIBUTE);
    host.innerHTML = html;

    const root = await act(async () =>
      hydrateRoot(host, tree, { onRecoverableError }),
    );

    expect(getItem).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    await act(async () => root.unmount());
  });
});
