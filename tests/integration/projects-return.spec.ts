import { expect, test, type Page } from "@playwright/test";
import { withBase } from "./helpers/site";

/**
 * 033-projects-section, T6 (R37, AC37-AC46): the carousel keeps its position
 * when the visitor returns from a project detail page.
 */

// Each test crosses several entries and waits for the carousel to settle after
// every step, which does not fit the 30 s default.
test.describe.configure({ timeout: 120_000 });

const viewports = [
  { width: 320, height: 568, visible: 1 },
  { width: 767, height: 1024, visible: 1 },
  { width: 768, height: 1024, visible: 2 },
  { width: 1280, height: 800, visible: 2 },
  { width: 1920, height: 1080, visible: 2 },
] as const;

const order = [
  "portfolio",
  "openrazer",
  "hassio-pacman",
  "custom-aur",
  "zot-quarantine-proxy",
];
const scroller = ".projects-carousel-scroller";
const storeKey = "projects-carousel-return";
const returnLink = "main a[href$='#proyectos']";

/** Records one entry per animation frame, from the start of each document. */
const SAMPLER = `(() => {
  const s = (window.__s = { frames: [], run: true });
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // Page positions, as AC39 states them: nothing may move by more than 1 px.
    return [r.left, r.top, r.width, r.height];
  };
  const frame = () => {
    const sc = document.querySelector(".projects-carousel-scroller");
    if (!sc) {
      s.frames.push(null);
    } else {
      const sr = sc.getBoundingClientRect();
      const cards = {};
      for (const li of sc.querySelectorAll("li.project-slide:not([data-carousel-clone])")) {
        cards[li.dataset.projectSlug] = li.getBoundingClientRect().left;
      }
      const full = [...sc.querySelectorAll("li.project-slide")].filter((li) => {
        const r = li.getBoundingClientRect();
        return r.left >= sr.left - 1 && r.right <= sr.right + 1;
      });
      const buttons = [...document.querySelectorAll(".projects-carousel button")];
      s.frames.push({
        t: performance.now(),
        sl: sc.scrollLeft,
        cards,
        first: full[0]?.dataset.projectSlug ?? null,
        h2: rect(document.querySelector("#proyectos h2")),
        arrows: buttons.map(rect),
        section: document.getElementById("proyectos").getBoundingClientRect().height,
        clones: sc.querySelectorAll("[data-carousel-clone]").length,
        y: scrollY,
      });
    }
    if (s.run) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();`;

interface Frame {
  t: number;
  sl: number;
  cards: Record<string, number>;
  first: string | null;
  h2: number[] | null;
  arrows: (number[] | null)[];
  section: number;
  clones: number;
  y: number;
}

async function frames(page: Page): Promise<(Frame | null)[]> {
  return page.evaluate(() => {
    const s = (
      window as unknown as { __s: { frames: unknown[]; run: boolean } }
    ).__s;
    return s.frames as (Frame | null)[];
  });
}

/** The frames of the latest entry: after the last frame without a carousel. */
function lastEntry(all: (Frame | null)[]): Frame[] {
  const start = all.lastIndexOf(null) + 1;
  return all.slice(start) as Frame[];
}

function expectStable(entry: Frame[], label: string) {
  expect(entry.length, `${label}: frames sampled`).toBeGreaterThan(20);
  const base = entry[0]!;
  const near = (a: number[] | null, b: number[] | null, what: string) => {
    expect(a, `${label}: ${what}`).not.toBeNull();
    for (let i = 0; i < 4; i += 1) {
      expect(
        Math.abs(a![i]! - b![i]!),
        `${label}: ${what}[${i}]`,
      ).toBeLessThanOrEqual(1);
    }
  };
  for (const frame of entry) {
    for (const [slug, left] of Object.entries(base.cards)) {
      expect(
        Math.abs(frame.cards[slug]! - left),
        `${label}: ${slug} moved`,
      ).toBeLessThanOrEqual(1);
    }
    near(frame.h2, base.h2, "h2");
    base.arrows.forEach((arrow, index) =>
      near(frame.arrows[index] ?? null, arrow, `arrow ${index}`),
    );
    expect(
      Math.abs(frame.section - base.section),
      `${label}: section height`,
    ).toBeLessThanOrEqual(1);
  }
}

async function stopState(page: Page) {
  return page.evaluate((selector) => {
    const sc = document.querySelector(selector)!;
    const box = sc.getBoundingClientRect();
    const full = [...sc.querySelectorAll<HTMLElement>("li.project-slide")]
      .filter((li) => {
        const r = li.getBoundingClientRect();
        return r.left >= box.left - 1 && r.right <= box.right + 1;
      })
      .map((li) => ({
        slug: li.dataset.projectSlug!,
        clone: li.hasAttribute("data-carousel-clone"),
        left: li.getBoundingClientRect().left - box.left,
      }));
    return {
      full,
      first: full[0]?.slug,
      offset: full[0]?.left ?? Number.NaN,
      clones: sc.querySelectorAll("[data-carousel-clone]").length,
      items: document.querySelectorAll(
        "#proyectos li.project-slide:not([data-carousel-clone])",
      ).length,
    };
  }, scroller);
}

async function settled(page: Page) {
  let previous = Number.NaN;
  await expect
    .poll(
      async () => {
        const current = await page
          .locator(scroller)
          .evaluate((el) => el.scrollLeft);
        const still = current === previous;
        previous = current;
        await page.waitForTimeout(200);
        return still;
      },
      { timeout: 6000 },
    )
    .toBe(true);
}

/** The detail page is on screen, not just in the address bar. */
async function onDetailPage(page: Page) {
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("#proyectos")).toHaveCount(0);
}

async function hydrated(page: Page) {
  await expect(page.locator(scroller)).toBeVisible();
  await expect(page.locator(".projects-carousel button").first()).toBeEnabled();
}

async function openHomeAtStop(page: Page, stop: number) {
  await page.goto(withBase("/"));
  await hydrated(page);
  await page.locator("#proyectos").scrollIntoViewIfNeeded();
  for (let i = 0; i < stop; i += 1) {
    await page.locator(".projects-carousel button").nth(1).click();
    await settled(page);
  }
  await settled(page);
}

/** Open the link of the nth fully visible card (negative counts from the end). */
async function openFullCard(page: Page, position: number, clone = false) {
  const slug = await page.evaluate(
    ([selector, index, wantClone]) => {
      const sc = document.querySelector(selector as string)!;
      const box = sc.getBoundingClientRect();
      const full = [
        ...sc.querySelectorAll<HTMLElement>("li.project-slide"),
      ].filter((li) => {
        const r = li.getBoundingClientRect();
        return r.left >= box.left - 1 && r.right <= box.right + 1;
      });
      const li = full.at(index as number)!;
      if (wantClone && !li.hasAttribute("data-carousel-clone")) {
        throw new Error("The card at this position is not a clone");
      }
      li.querySelector("a")!.click();
      return li.dataset.projectSlug!;
    },
    [scroller, position, clone] as const,
  );
  await expect(page).toHaveURL(new RegExp(`/proyectos/${slug}/$`));
  return slug;
}

async function returnBy(page: Page, how: "link" | "back") {
  if (how === "link") await page.locator(returnLink).first().click();
  else await page.goBack();
  await hydrated(page);
  await settled(page);
}

const record = (page: Page) =>
  page.evaluate((key) => sessionStorage.getItem(key), storeKey);

function trackProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    // The tests abort the router's own fetch of a detail page to force a full
    // document load; that request's failure is expected, any other is not.
    const aborted =
      message.text() === "Failed to load resource: net::ERR_FAILED" &&
      message.location().url.includes("/proyectos/");
    if (["error", "warning"].includes(message.type()) && !aborted) {
      problems.push(message.text());
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

for (const viewport of viewports) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    for (const how of ["link", "back"] as const) {
      test(`AC37: each project at the stop is restored through ${how}`, async ({
        page,
      }) => {
        const problems = trackProblems(page);
        for (let stop = 0; stop < order.length; stop += 1) {
          await openHomeAtStop(page, stop);
          const before = await stopState(page);
          expect(before.first).toBe(order[stop]);
          const slug = await openFullCard(page, 0);
          expect(slug).toBe(order[stop]);
          expect(await record(page)).toBe(
            JSON.stringify({ at: slug, opened: slug }),
          );
          await returnBy(page, how);
          const after = await stopState(page);
          expect(after.first, `stop ${stop}`).toBe(order[stop]);
          expect(Math.abs(after.offset - before.offset)).toBeLessThanOrEqual(1);
          expect(after.clones).toBe(before.clones);
          expect(after.items).toBe(5);
          expect(await record(page), "the record is consumed").toBeNull();
        }
        expect(problems).toEqual([]);
      });
    }

    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`AC39: no card, heading, arrow or height moves on any entry (${reducedMotion})`, async ({
        browser,
      }) => {
        const context = await browser.newContext({ viewport, reducedMotion });
        await context.addInitScript(SAMPLER);
        const page = await context.newPage();
        const problems = trackProblems(page);

        for (const stop of [2, 4]) {
          const scenarios = [
            "link",
            "back",
            "after-reload",
            "full-document",
          ] as const;
          for (const scenario of scenarios) {
            await openHomeAtStop(page, stop);
            const expectedFirst = (await stopState(page)).first;
            if (scenario === "full-document") {
              // The router falls back to a full document load for the detail page.
              await page.route(
                (url) => url.pathname.startsWith("/proyectos/"),
                (route) =>
                  route.request().resourceType() === "fetch"
                    ? route.abort()
                    : route.continue(),
              );
            }
            await openFullCard(page, 0);
            if (scenario === "after-reload") await page.reload();
            if (scenario === "full-document") {
              await page.unrouteAll({ behavior: "ignoreErrors" });
              await page.waitForLoadState("load");
              expect(await record(page)).not.toBeNull();
            }
            await page.evaluate(() => {
              (window as unknown as { __s?: { run: boolean } }).__s!.run = true;
            });
            if (scenario === "link" || scenario === "after-reload") {
              await returnBy(page, "link");
            } else {
              await returnBy(page, "back");
            }
            if (scenario === "full-document") {
              const type = await page.evaluate(
                () =>
                  performance.getEntriesByType("navigation")[0]!.toJSON().type,
              );
              expect(type).toBe("back_forward");
            }
            await page.waitForTimeout(1100);
            const entry = lastEntry(await frames(page));
            expect(entry[0]!.first, `${scenario} stop ${stop}`).toBe(
              expectedFirst,
            );
            expectStable(entry, `${scenario} stop ${stop} ${reducedMotion}`);
          }
        }
        expect(problems).toEqual([]);
        await context.close();
      });
    }

    test("AC41: entries that must start at the first project", async ({
      page,
    }) => {
      const problems = trackProblems(page);
      const atStart = async (label: string) => {
        await hydrated(page);
        await settled(page);
        expect((await stopState(page)).first, label).toBe("portfolio");
      };

      // Reload.
      await openHomeAtStop(page, 3);
      await openFullCard(page, 0);
      await returnBy(page, "link");
      expect((await stopState(page)).first).toBe("custom-aur");
      await page.reload();
      await atStart("reload");

      // A new load of / and of /#proyectos from another document.
      for (const target of ["/", "/#proyectos"]) {
        await openHomeAtStop(page, 3);
        await openFullCard(page, 0);
        expect(await record(page)).not.toBeNull();
        await page.goto(withBase(target));
        await atStart(`goto ${target}`);
        expect(await record(page)).toBeNull();
      }

      // An entry from an experience page, by link.
      await openHomeAtStop(page, 3);
      await openFullCard(page, 0);
      await page.goto(withBase("/experiencia/nttdata-lead-engineer/"));
      await page.locator("main a[href$='#trayectoria']").first().click();
      await atStart("experience link");
      expect(await record(page)).toBeNull();

      // An entry from an experience page, by history.
      await openHomeAtStop(page, 3);
      await page
        .locator("#trayectoria a[href*='/experiencia/']")
        .first()
        .evaluate((a) => (a as HTMLAnchorElement).click());
      await expect(page).toHaveURL(/\/experiencia\//);
      await page.goBack();
      await atStart("experience history");

      // A direct landing on a detail page has no record to apply.
      await page.goto(withBase("/proyectos/custom-aur/"));
      await page.locator(returnLink).first().click();
      await atStart("direct landing");
      expect(problems).toEqual([]);
    });

    test("AC44: restoration leaves focus alone; arrows, width and Tab continue from the restored stop", async ({
      page,
    }) => {
      const problems = trackProblems(page);
      const activeOf = () =>
        page.evaluate(
          () =>
            document.activeElement?.getAttribute("aria-label") ??
            document.activeElement?.tagName,
        );

      // The baseline: a return with no record.
      await page.goto(withBase("/proyectos/openrazer/"));
      await page.locator(returnLink).first().click();
      await hydrated(page);
      const baseline = await activeOf();

      await openHomeAtStop(page, 3);
      await openFullCard(page, -1);
      await returnBy(page, "link");
      expect(await activeOf()).toBe(baseline);
      const restored = (await stopState(page)).first!;
      expect(restored).toBe("custom-aur");
      const index = order.indexOf(restored);

      await page.locator(".projects-carousel button").nth(1).click();
      await settled(page);
      expect((await stopState(page)).first).toBe(order[(index + 1) % 5]);
      await page.locator(".projects-carousel button").nth(0).click();
      await settled(page);
      await page.locator(".projects-carousel button").nth(0).click();
      await settled(page);
      expect((await stopState(page)).first).toBe(order[(index + 4) % 5]);
      await page.locator(".projects-carousel button").nth(1).click();
      await settled(page);

      // The wrap point, in both directions.
      for (let i = 0; i < 3; i += 1) {
        await page.locator(".projects-carousel button").nth(1).click();
        await settled(page);
      }
      expect((await stopState(page)).first).toBe(order[(index + 3) % 5]);

      // A width change keeps the project at the stop.
      const keep = (await stopState(page)).first;
      await page.setViewportSize({
        width: viewport.width === 320 ? 360 : 320,
        height: viewport.height,
      });
      await page.waitForTimeout(500);
      await settled(page);
      expect((await stopState(page)).first).toBe(keep);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await settled(page);

      // Tabbing still keeps every link inside the carousel.
      await page.locator(".projects-carousel button").nth(0).focus();
      for (let i = 0; i < 10; i += 1) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(80);
        const ok = await page.evaluate((selector) => {
          const active = document.activeElement as HTMLElement;
          const box = document.querySelector(selector)!.getBoundingClientRect();
          const r = active.getBoundingClientRect();
          return (
            active.tagName !== "A" ||
            (r.left - 6 >= box.left && r.right + 6 <= box.right)
          );
        }, scroller);
        expect(ok, `tab ${i}`).toBe(true);
      }
      expect(problems).toEqual([]);
    });

    test("AC45: vertical position matches a return with no record and a back restores scrollY", async ({
      page,
    }) => {
      // A return with no record.
      await page.goto(withBase("/proyectos/openrazer/"));
      await page.locator(returnLink).first().click();
      await hydrated(page);
      await settled(page);
      const without = await page.evaluate(
        () => document.getElementById("proyectos")!.getBoundingClientRect().top,
      );

      await openHomeAtStop(page, 3);
      await openFullCard(page, 0);
      await returnBy(page, "link");
      const withRecord = await page.evaluate(
        () => document.getElementById("proyectos")!.getBoundingClientRect().top,
      );
      expect(Math.abs(withRecord - without)).toBeLessThanOrEqual(1);
      await page.waitForTimeout(800);
      expect(
        Math.abs(
          (await page.evaluate(
            () =>
              document.getElementById("proyectos")!.getBoundingClientRect().top,
          )) - withRecord,
        ),
      ).toBeLessThanOrEqual(1);

      // Back keeps the vertical position at departure.
      await openHomeAtStop(page, 2);
      await page.evaluate(() => window.scrollBy(0, -60));
      const departure = await page.evaluate(() => scrollY);
      await openFullCard(page, 0);
      await returnBy(page, "back");
      await page.waitForTimeout(800);
      expect(
        Math.abs((await page.evaluate(() => scrollY)) - departure),
      ).toBeLessThanOrEqual(1);

      // A vertical wheel over the carousel still scrolls the page.
      const box = (await page.locator(scroller).boundingBox())!;
      await page.mouse.move(
        box.x + box.width / 2,
        Math.max(Math.min(box.y + 40, viewport.height - 100), 5),
      );
      const y = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, -80);
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => scrollY)).not.toBe(y);
    });
  });
}

test.describe("restored stop rule", () => {
  for (const width of [768, 1280]) {
    test(`AC38: opening the second card keeps the stop at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const problems = trackProblems(page);
      for (let stop = 0; stop <= 3; stop += 1) {
        await openHomeAtStop(page, stop);
        const slug = await openFullCard(page, 1);
        expect(slug).toBe(order[stop + 1]);
        await returnBy(page, "link");
        expect((await stopState(page)).first, `stop ${stop}`).toBe(order[stop]);
      }

      // The last stop's first card keeps the last stop.
      await openHomeAtStop(page, 4);
      expect(await openFullCard(page, 0)).toBe(order[4]);
      await returnBy(page, "back");
      expect((await stopState(page)).first).toBe(order[4]);

      // The clone in the last stop's second slot restores stop 0.
      await openHomeAtStop(page, 4);
      const state = await stopState(page);
      expect(state.full[1]).toMatchObject({ slug: "portfolio", clone: true });
      expect(await openFullCard(page, 1, true)).toBe("portfolio");
      expect(await record(page)).toBe(
        JSON.stringify({ at: "zot-quarantine-proxy", opened: "portfolio" }),
      );
      await returnBy(page, "link");
      const after = await stopState(page);
      expect(after.first).toBe("portfolio");
      expect(after.full[0]!.clone).toBe(false);
      expect(problems).toEqual([]);
    });
  }

  test("AC38: leaving at 1280px and returning at 320px, and the other way", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openHomeAtStop(page, 2);
    expect(await openFullCard(page, 1)).toBe("custom-aur");
    await page.setViewportSize({ width: 320, height: 568 });
    await returnBy(page, "link");
    expect((await stopState(page)).first).toBe("custom-aur");

    await page.setViewportSize({ width: 320, height: 568 });
    await openHomeAtStop(page, 3);
    expect(await openFullCard(page, 0)).toBe("custom-aur");
    await page.setViewportSize({ width: 1280, height: 800 });
    await returnBy(page, "link");
    expect((await stopState(page)).full.map((c) => c.slug)).toContain(
      "custom-aur",
    );
    expect((await stopState(page)).first).toBe("custom-aur");
  });
});

test.describe("history and records", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("AC42: a full-document traversal restores, and the newer record applies the stop rule", async ({
    page,
  }) => {
    const problems = trackProblems(page);
    await openHomeAtStop(page, 2);
    await page.route(
      (url) => url.pathname.startsWith("/proyectos/"),
      (route) =>
        route.request().resourceType() === "fetch"
          ? route.abort()
          : route.continue(),
    );
    await openFullCard(page, 1);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.goBack();
    await hydrated(page);
    expect(
      await page.evaluate(
        () => performance.getEntriesByType("navigation")[0]!.toJSON().type,
      ),
    ).toBe("back_forward");
    expect((await stopState(page)).first).toBe("hassio-pacman");

    // Home to detail, back, an arrow move, forward, back.
    for (const [arrow, expected] of [
      [0, "hassio-pacman"],
      [1, "custom-aur"],
    ] as const) {
      await openHomeAtStop(page, 2);
      await openFullCard(page, 1); // custom-aur, the second card of stop 2
      await page.goBack();
      await hydrated(page);
      await settled(page);
      await page.locator(".projects-carousel button").nth(arrow).click();
      await settled(page);
      await page.goForward();
      await expect(page).toHaveURL(/\/proyectos\/custom-aur\/$/);
      await onDetailPage(page);
      await page.goBack();
      await hydrated(page);
      await settled(page);
      // Previous leaves custom-aur outside, so the nearest stop that shows it;
      // next keeps the newer stop, which already shows it in full.
      expect((await stopState(page)).first, `arrow ${arrow}`).toBe(expected);
    }

    // Return link, back to the detail page, forward to the home.
    await openHomeAtStop(page, 1);
    await openFullCard(page, 0);
    await returnBy(page, "link");
    await page.goBack();
    await expect(page).toHaveURL(/\/proyectos\/openrazer\/$/);
    await onDetailPage(page);
    await page.goForward();
    await hydrated(page);
    await settled(page);
    expect((await stopState(page)).first).toBe("openrazer");

    // A move to another section through the navigator leaves the carousel.
    await openHomeAtStop(page, 3);
    await page
      .getByRole("navigation", { name: "Navegación por secciones" })
      .getByRole("link", { name: "Trayectoria" })
      .click();
    await expect(page).toHaveURL(/#trayectoria$/);
    await page.goBack();
    await hydrated(page);
    await settled(page);
    expect((await stopState(page)).first).toBe("custom-aur");
    expect(problems).toEqual([]);
  });

  test("AC43: store failures, malformed and unknown records start at the first project", async ({
    browser,
  }) => {
    const seeds: (string | "throw")[] = [
      "throw",
      "not json",
      '{"at":1,"opened":"openrazer"}',
      '{"at":"nowhere","opened":"also-nowhere"}',
    ];
    for (const seed of seeds) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });
      if (seed === "throw") {
        await context.addInitScript(() => {
          Object.defineProperty(window, "sessionStorage", {
            get() {
              throw new Error("storage blocked");
            },
          });
        });
      }
      const page = await context.newPage();
      const problems = trackProblems(page);
      await page.goto(withBase("/proyectos/openrazer/"));
      if (seed !== "throw") {
        await page.evaluate(
          ([key, value]) => sessionStorage.setItem(key!, value!),
          [storeKey, seed],
        );
      }
      await page.locator(returnLink).first().click();
      await hydrated(page);
      await settled(page);
      expect((await stopState(page)).first, `seed ${seed}`).toBe("portfolio");
      await page.locator(".projects-carousel button").nth(1).click();
      await settled(page);
      expect((await stopState(page)).first).toBe("openrazer");
      // Leaving the home with a blocked store still navigates.
      await openFullCard(page, 0);
      expect(problems, `seed ${seed}`).toEqual([]);
      await context.close();
    }

    // The record holds only slugs and the island props stay as in AC14.
    const context = await browser.newContext();
    const page = await context.newPage();
    await openHomeAtStop(page, 2);
    await openFullCard(page, 1);
    const stored = JSON.parse((await record(page))!) as Record<string, string>;
    expect(Object.keys(stored).sort()).toEqual(["at", "opened"]);
    for (const value of Object.values(stored)) expect(order).toContain(value);
    await page.goto(withBase("/"));
    const props = await page
      .locator("astro-island[component-url*='ProjectsCarousel']")
      .getAttribute("props");
    expect(JSON.parse(props!)).toEqual({
      previousLabel: [0, "Proyecto anterior"],
      nextLabel: [0, "Proyecto siguiente"],
    });
    await context.close();
  });

  test("AC40: the opened card is in place when the transition is ready and when it finishes", async ({
    page,
  }) => {
    await openHomeAtStop(page, 2);
    await openFullCard(page, 1);
    await page.evaluate(() => {
      const w = window as unknown as { __vt: unknown[] };
      w.__vt = [];
      document.addEventListener("astro:before-swap", (event) => {
        const transition = (
          event as unknown as {
            viewTransition?: { ready: Promise<void>; finished: Promise<void> };
          }
        ).viewTransition;
        const measure = (when: string) => {
          const sc = document.querySelector(".projects-carousel-scroller");
          const box = sc?.getBoundingClientRect();
          const card = document.querySelector<HTMLElement>(
            "li.project-slide:not([data-carousel-clone])[data-project-slug='custom-aur']",
          );
          const r = card?.getBoundingClientRect();
          const names = [...document.querySelectorAll("*")]
            .map((e) => getComputedStyle(e).viewTransitionName)
            .filter((n) => n && n !== "none");
          w.__vt.push({
            when,
            inside: !!(r && box && r.left >= box.left && r.right <= box.right),
            left: r && box ? r.left - box.left : null,
            unique: new Set(names).size === names.length,
          });
        };
        transition?.ready.then(
          () => measure("ready"),
          () => {},
        );
        transition?.finished.then(
          () => measure("finished"),
          () => {},
        );
      });
    });
    await returnBy(page, "link");
    await page.waitForTimeout(800);
    const samples = await page.evaluate(
      () =>
        (window as unknown as { __vt: Record<string, unknown>[] }).__vt as {
          when: string;
          inside: boolean;
          left: number;
          unique: boolean;
        }[],
    );
    expect(samples.map((s) => s.when).sort()).toEqual(["finished", "ready"]);
    for (const sample of samples) {
      expect(sample.inside, sample.when).toBe(true);
      expect(sample.unique, sample.when).toBe(true);
    }
    expect(Math.abs(samples[0]!.left - samples[1]!.left)).toBeLessThanOrEqual(
      1,
    );
  });

  test("AC40: under reduced motion the return completes at the same position", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await openHomeAtStop(page, 2);
    const before = await stopState(page);
    await openFullCard(page, 1);
    await returnBy(page, "link");
    const after = await stopState(page);
    expect(after.first).toBe(before.first);
    expect(Math.abs(after.offset - before.offset)).toBeLessThanOrEqual(1);
    await context.close();
  });

  for (const width of [768, 1280, 1920]) {
    test(`R37: before hydration the last stop is reachable without clones, and input is not overridden at ${width}px`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width, height: 800 },
      });
      const page = await context.newPage();
      const problems = trackProblems(page);
      await openHomeAtStop(page, 4);

      // The detail page loads as a full document, because the router's fetch is
      // aborted, and the island's module is delayed so that the entry painted
      // unhydrated can be observed.
      await page.route(/ProjectsCarousel\..*\.js/, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        await route.continue();
      });
      await page.route(
        (url) => url.pathname.startsWith("/proyectos/"),
        (route) =>
          route.request().resourceType() === "fetch"
            ? route.abort()
            : route.continue(),
      );
      await openFullCard(page, 0);
      await page.waitForLoadState("load");
      await page.goBack({ waitUntil: "domcontentloaded" });
      expect(
        await page.evaluate(
          () => performance.getEntriesByType("navigation")[0]!.toJSON().type,
        ),
        "a full-document traversal",
      ).toBe("back_forward");
      const early = await page.evaluate((selector) => {
        const sc = document.querySelector(selector)!;
        const box = sc.getBoundingClientRect();
        const last = sc.querySelector<HTMLElement>(
          "li[data-project-slug='zot-quarantine-proxy']",
        )!;
        return {
          clones: sc.querySelectorAll("[data-carousel-clone]").length,
          endSpace: sc
            .querySelector("ul")!
            .hasAttribute("data-carousel-end-space"),
          lastLeft: last.getBoundingClientRect().left - box.left,
          arrowsDisabled: [
            ...document.querySelectorAll<HTMLButtonElement>(
              ".projects-carousel button",
            ),
          ].every((b) => b.disabled),
        };
      }, scroller);
      expect(early.clones).toBe(0);
      expect(early.endSpace).toBe(true);
      expect(early.arrowsDisabled).toBe(true);
      expect(early.lastLeft).toBeGreaterThan(0);
      expect(early.lastLeft).toBeLessThan(80);

      // The visitor scrolls before hydration; hydration must not override it.
      // Real wheel input, not a scripted scroll: a sideways wheel over the
      // scroller, as a trackpad or tilt wheel would send it.
      const area = (await page.locator(scroller).boundingBox())!;
      await page.mouse.move(area.x + area.width / 2, area.y + 60);
      const wheelStart = await page
        .locator(scroller)
        .evaluate((el) => el.scrollLeft);
      await page.mouse.wheel(-500, 0);
      await expect
        .poll(() => page.locator(scroller).evaluate((el) => el.scrollLeft))
        .toBeLessThan(wheelStart - 100);
      // The card nearest the left edge is the one the visitor moved to.
      const moved = await page.locator(scroller).evaluate((el) => {
        const box = el.getBoundingClientRect();
        const cards = [...el.querySelectorAll<HTMLElement>("li.project-slide")];
        cards.sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().left - box.left) -
            Math.abs(b.getBoundingClientRect().left - box.left),
        );
        return cards[0]!.dataset.projectSlug;
      });
      expect(moved).not.toBe("zot-quarantine-proxy");
      await hydrated(page);
      await settled(page);
      const stop = await stopState(page);
      expect(stop.clones).toBe(10);
      expect(stop.first, "hydration keeps the visitor's stop").toBe(moved);
      expect(problems).toEqual([]);
      await context.close();
    });
  }

  test("AC46: without JavaScript the return link lands on the wrapped layout; with the island blocked nothing throws", async ({
    browser,
  }) => {
    const plain = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      javaScriptEnabled: false,
    });
    const noJs = await plain.newPage();
    await noJs.goto(withBase("/proyectos/openrazer/"));
    await noJs.locator(returnLink).first().click();
    await expect(noJs).toHaveURL(/#proyectos$/);
    const layout = await noJs.locator("#proyectos").evaluate((section) => {
      const box = section.querySelector(".projects-carousel-scroller")!;
      return {
        overflow: getComputedStyle(box).overflowX,
        arrows: getComputedStyle(
          section.querySelector(".projects-carousel-controls")!,
        ).display,
        cards: section.querySelectorAll("article").length,
        clones: section.querySelectorAll("[data-carousel-clone]").length,
      };
    });
    expect(layout).toEqual({
      overflow: "visible",
      arrows: "none",
      cards: 5,
      clones: 0,
    });
    await plain.close();

    const blocked = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await blocked.newPage();
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(error.message));
    await page.route(/(ProjectsCarousel|carousel)\..*\.js/, (route) =>
      route.abort(),
    );
    await page.goto(withBase("/"));
    await page.waitForTimeout(800);
    const scrolled = await page.locator(scroller).evaluate((el) => {
      const before = el.scrollLeft;
      el.scrollTo({ left: before + 300, behavior: "instant" });
      return el.scrollLeft - before;
    });
    expect(scrolled).toBeGreaterThan(100);
    expect(problems).toEqual([]);
    await blocked.close();
  });
});

test.describe("first paint", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("a full-document traversal shows the restored stop on the first sampled frame", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await context.addInitScript(SAMPLER);
    const page = await context.newPage();
    await openHomeAtStop(page, 3);
    await page.route(
      (url) => url.pathname.startsWith("/proyectos/"),
      (route) =>
        route.request().resourceType() === "fetch"
          ? route.abort()
          : route.continue(),
    );
    await openFullCard(page, 0);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await page.goBack();
    await hydrated(page);
    await page.waitForTimeout(600);
    const entry = lastEntry(await frames(page));
    expect(entry[0]!.first).toBe("custom-aur");
    expect(entry[0]!.sl).toBeGreaterThan(0);
    await context.close();
  });
});
