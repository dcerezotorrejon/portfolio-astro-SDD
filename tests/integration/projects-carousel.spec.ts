import { expect, test, type Page } from "@playwright/test";
import { withBase } from "./helpers/site";

/**
 * 033-projects-section, T2 (R7-R25, AC5-AC24): the hydrated carousel, its loop,
 * wheel, focus, no-JS and clone behavior, measured in Chromium.
 */

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

async function openHome(page: Page) {
  await page.goto(withBase("/"));
  await expect(page.locator("[data-carousel-clone]")).toHaveCount(
    order.length * 2,
  );
  await expect(page.locator(".projects-carousel button").first()).toBeEnabled();
  await page.locator("#proyectos").scrollIntoViewIfNeeded();
}

/** Slugs of the cards fully inside the scroller, left to right. */
function fullSlugs(page: Page) {
  return page.evaluate((selector) => {
    const box = document.querySelector(selector)!.getBoundingClientRect();
    return [
      ...document.querySelectorAll<HTMLElement>(`${selector} li.project-slide`),
    ]
      .filter((li) => {
        const r = li.getBoundingClientRect();
        return r.left >= box.left - 1 && r.right <= box.right + 1;
      })
      .map((li) => li.querySelector("a")!.getAttribute("href")!.split("/")[2]);
  }, scroller);
}

/** Visible widths of the cards cut by each scroller edge. */
function peeks(page: Page) {
  return page.evaluate((selector) => {
    const box = document.querySelector(selector)!.getBoundingClientRect();
    const rects = [
      ...document.querySelectorAll(`${selector} li.project-slide`),
    ].map((li) => li.getBoundingClientRect());
    const cardWidth = rects[0]!.width;
    return {
      cardWidth,
      left: rects
        .filter((r) => r.left < box.left - 0.5 && r.right > box.left + 0.5)
        .map((r) => r.right - box.left),
      right: rects
        .filter((r) => r.right > box.right + 0.5 && r.left < box.right - 0.5)
        .map((r) => box.right - r.left),
    };
  }, scroller);
}

/** Wait until the scroller stops moving and the loop has settled. */
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
      { timeout: 5000 },
    )
    .toBe(true);
}

const arrow = (page: Page, direction: "prev" | "next") =>
  page.locator(".projects-carousel button").nth(direction === "prev" ? 0 : 1);

for (const viewport of viewports) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("AC6/AC10/AC11/AC13/AC24: geometry, snap, peeks, hidden scrollbar and card layout", async ({
      page,
    }) => {
      await openHome(page);
      const style = await page.locator(scroller).evaluate((el) => {
        const cs = getComputedStyle(el);
        const li = getComputedStyle(el.querySelector("li")!);
        return {
          snapType: cs.scrollSnapType,
          snapAlign: li.scrollSnapAlign,
          overflowX: cs.overflowX,
          overflows: el.scrollWidth > el.clientWidth,
          horizontalBar: el.offsetHeight - el.clientHeight,
          verticalScroll: el.scrollHeight - el.clientHeight,
          scrollbarWidth: cs.scrollbarWidth,
        };
      });
      expect(style.snapType).toContain("x");
      expect(style.snapType).toContain("mandatory");
      expect(style.snapAlign).toBe("start");
      expect(style.overflows).toBe(true);
      expect(style.horizontalBar, "no visible scrollbar").toBe(0);
      expect(style.scrollbarWidth).toBe("none");
      expect(style.verticalScroll, "no vertical scroll").toBe(0);

      for (let stop = 0; stop < order.length; stop += 1) {
        const full = await fullSlugs(page);
        expect(full, `stop ${stop}`).toEqual(
          Array.from(
            { length: viewport.visible },
            (_, index) => order[(stop + index) % order.length]!,
          ),
        );
        const { cardWidth, left, right } = await peeks(page);
        for (const side of [left, right]) {
          expect(side).toHaveLength(1);
          expect(side[0]!).toBeGreaterThanOrEqual(16);
          expect(side[0]!).toBeLessThan(cardWidth);
        }
        await arrow(page, "next").click();
        await expect
          .poll(async () => (await fullSlugs(page))[0], { timeout: 3000 })
          .toBe(order[(stop + 1) % order.length]);
        await settled(page);
      }

      // Cards share one height; the links end at the card's bottom edge.
      const cards = await page.evaluate(() =>
        [...document.querySelectorAll("li:not([data-carousel-clone]) article")]
          .filter((card) => card.closest("#proyectos"))
          .map((card) => {
            const box = card.getBoundingClientRect();
            const links = [...card.querySelectorAll("a")].map((a) =>
              Math.round(box.bottom - a.getBoundingClientRect().bottom),
            );
            return {
              height: Math.round(box.height),
              lastLinkGap: links.at(-1),
              clipped: card.scrollHeight - card.clientHeight,
            };
          }),
      );
      expect(new Set(cards.map((c) => c.height)).size).toBe(1);
      expect(new Set(cards.map((c) => c.lastLinkGap)).size).toBe(1);
      for (const card of cards) expect(card.clipped).toBe(0);
    });

    test("AC7/AC10: ten activations each way land on the expected card, never move focus or the pixels across the wrap", async ({
      page,
    }) => {
      await openHome(page);
      for (const [direction, step] of [
        ["next", 1],
        ["prev", -1],
      ] as const) {
        const button = arrow(page, direction);
        await button.focus();
        await page.evaluate(() => {
          const box = document.querySelector(".projects-carousel-scroller")!;
          const w = window as unknown as { __jumps: number; __run: boolean };
          w.__jumps = 0;
          w.__run = true;
          let previous = new Map<string, number>();
          const frame = () => {
            const rect = box.getBoundingClientRect();
            const current = new Map<string, number>();
            for (const li of box.querySelectorAll("li.project-slide")) {
              const r = li.getBoundingClientRect();
              if (r.right > rect.left && r.left < rect.right) {
                current.set(
                  li.querySelector("a")!.getAttribute("href")!,
                  r.left - rect.left,
                );
              }
            }
            // The same project may only move along with the input.
            for (const [key, left] of current) {
              const before = previous.get(key);
              if (before !== undefined && Math.abs(left - before) > 600) {
                w.__jumps += 1;
              }
            }
            previous = current;
            if (w.__run) requestAnimationFrame(frame);
          };
          frame();
        });
        for (let index = 1; index <= 10; index += 1) {
          await button.click();
          const expected = order[(((step * index) % 5) + 5) % 5];
          await expect
            .poll(async () => (await fullSlugs(page))[0], { timeout: 3000 })
            .toBe(expected);
          await settled(page);
          await expect(button).toBeFocused();
        }
        const jumps = await page.evaluate(() => {
          const w = window as unknown as { __jumps: number; __run: boolean };
          w.__run = false;
          return w.__jumps;
        });
        expect(jumps, `${direction} wrap moved pixels`).toBe(0);
      }
      // No movement without input.
      const before = await page
        .locator(scroller)
        .evaluate((el) => el.scrollLeft);
      await page.waitForTimeout(1500);
      expect(await page.locator(scroller).evaluate((el) => el.scrollLeft)).toBe(
        before,
      );
    });

    test("R9: rapid activations (13 to 23) land on the expected card and never move backward", async ({
      page,
    }) => {
      await openHome(page);
      for (const count of [13, 17, -14, -21]) {
        await page.evaluate(async (n) => {
          const buttons = document.querySelectorAll<HTMLButtonElement>(
            ".projects-carousel button",
          );
          const button = buttons[n > 0 ? 1 : 0]!;
          const w = window as unknown as { __back: number; __run: boolean };
          w.__back = 0;
          w.__run = true;
          const box = document.querySelector(".projects-carousel-scroller")!;
          let previous = new Map<string, number[]>();
          const frame = () => {
            const rect = box.getBoundingClientRect();
            const current = new Map<string, number[]>();
            for (const li of box.querySelectorAll("li.project-slide")) {
              const r = li.getBoundingClientRect();
              if (r.right > rect.left && r.left < rect.right) {
                const key = li.querySelector("a")!.getAttribute("href")!;
                current.set(key, [...(current.get(key) ?? []), r.left]);
              }
            }
            for (const [key, lefts] of current) {
              const before = previous.get(key);
              if (!before) continue;
              for (const left of lefts) {
                // A clone and its real card are identical, so compare with the
                // nearest earlier instance.
                const nearest = before.reduce((a, b) =>
                  Math.abs(b - left) < Math.abs(a - left) ? b : a,
                );
                const delta = left - nearest;
                if (n > 0 ? delta > 1 : delta < -1) w.__back += 1;
              }
            }
            previous = current;
            if (w.__run) requestAnimationFrame(frame);
          };
          frame();
          for (let i = 0; i < Math.abs(n); i += 1) {
            button.click();
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        }, count);
        await expect
          .poll(async () => (await fullSlugs(page))[0], { timeout: 4000 })
          .toBe(order[((count % 5) + 5) % 5]);
        const back = await page.evaluate(() => {
          const w = window as unknown as { __back: number; __run: boolean };
          w.__run = false;
          return w.__back;
        });
        expect(back, `${count} rapid moves`).toBe(0);
        // A fresh load starts the next series on the first card.
        await openHome(page);
      }
    });

    test("AC8: the accessibility tree and ids stay clean after hydration; a clone click navigates", async ({
      page,
    }) => {
      await openHome(page);
      const state = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
        const names = [...document.querySelectorAll("*")]
          .map((e) => getComputedStyle(e).viewTransitionName)
          .filter((name) => name && name !== "none");
        return {
          duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
          duplicateTransitions: names.filter((n, i) => names.indexOf(n) !== i),
          cloneTabbable: [
            ...document.querySelectorAll("[data-carousel-clone] a"),
          ].filter((a) => (a as HTMLElement).tabIndex >= 0).length,
          cloneInert: document.querySelectorAll("[data-carousel-clone][inert]")
            .length,
          cloneHidden: document.querySelectorAll(
            '[data-carousel-clone][aria-hidden="true"]',
          ).length,
          cloneIds: document.querySelectorAll(
            "[data-carousel-clone] [id], [data-carousel-clone] [aria-labelledby]",
          ).length,
        };
      });
      expect(state.duplicateIds).toEqual([]);
      expect(state.duplicateTransitions).toEqual([]);
      expect(state.cloneTabbable).toBe(0);
      expect(state.cloneInert).toBe(0);
      expect(state.cloneHidden).toBe(order.length * 2);
      expect(state.cloneIds).toBe(0);

      const section = page.locator("#proyectos");
      await expect(section.getByRole("heading", { level: 3 })).toHaveCount(5);
      await expect(
        section.getByRole("link", { name: /^Más información: / }),
      ).toHaveCount(5);
      await expect(
        section.getByRole("link", { name: /^GitHub: / }),
      ).toHaveCount(5);

      // Bring a clone fully into view (last stop shows the first card's clone
      // at two cards per view, or the next stop's clone at one) and click it.
      for (let i = 0; i < 5; i += 1) {
        const target = await page.evaluate((selector) => {
          const box = document.querySelector(selector)!.getBoundingClientRect();
          const link = [
            ...document.querySelectorAll<HTMLAnchorElement>(
              "[data-carousel-clone] a[href^='/proyectos/']",
            ),
          ].find((a) => {
            const r = a.getBoundingClientRect();
            return r.left >= box.left && r.right <= box.right;
          });
          link?.scrollIntoView({ block: "center" });
          return link?.getAttribute("href") ?? null;
        }, scroller);
        if (target) {
          const point = await page.evaluate((href) => {
            const box = document
              .querySelector(".projects-carousel-scroller")!
              .getBoundingClientRect();
            const a = [
              ...document.querySelectorAll<HTMLAnchorElement>(
                `[data-carousel-clone] a[href='${href}']`,
              ),
            ].find((el) => {
              const r = el.getBoundingClientRect();
              return r.left >= box.left && r.right <= box.right;
            })!;
            const r = a.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          }, target);
          await page.mouse.move(point.x, point.y);
          await page.mouse.down();
          const insideClone = await page.evaluate(
            () => !!document.activeElement?.closest("[data-carousel-clone]"),
          );
          await page.mouse.up();
          expect(insideClone, "a click must not focus a clone").toBe(false);
          await expect(page).toHaveURL(new RegExp(`${target}$`));
          return;
        }
        await arrow(page, "next").click();
        await page.waitForTimeout(500);
      }
      // At one card per view a clone only peeks, with no link a pointer can hit.
      expect(viewport.visible, "a clone link was never fully visible").toBe(1);
    });

    test("AC17: without JavaScript the cards wrap, with no arrows, clones or horizontal scroll", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport,
        javaScriptEnabled: false,
      });
      const page = await context.newPage();
      await page.goto(withBase("/"));
      const result = await page.locator("#proyectos").evaluate((section) => {
        const box = section.querySelector(".projects-carousel-scroller")!;
        const cards = [...section.querySelectorAll("article")].map((card) => {
          const r = card.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, right: r.right };
        });
        return {
          scripting: matchMedia("(scripting: none)").matches,
          overflowX: getComputedStyle(box).overflowX,
          overflow: box.scrollWidth - box.clientWidth,
          arrows: getComputedStyle(
            section.querySelector(".projects-carousel-controls")!,
          ).display,
          clones: section.querySelectorAll("[data-carousel-clone]").length,
          pageOverflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
          cards,
          viewport: window.innerWidth,
        };
      });
      expect(result.scripting).toBe(true);
      expect(result.overflowX).toBe("visible");
      expect(result.overflow).toBe(0);
      expect(result.arrows).toBe("none");
      expect(result.clones).toBe(0);
      expect(result.pageOverflow).toBeLessThanOrEqual(0);
      expect(result.cards).toHaveLength(5);
      for (const card of result.cards) {
        expect(card.left).toBeGreaterThanOrEqual(0);
        expect(card.right).toBeLessThanOrEqual(result.viewport);
      }
      const columns = new Set(result.cards.map((c) => Math.round(c.left)));
      expect(columns.size).toBe(viewport.visible);
      const links = page.locator("#proyectos article a");
      await expect(links).toHaveCount(10);
      await links.first().click();
      await expect(page).toHaveURL(/\/proyectos\/portfolio\/$/);
      await context.close();
    });

    test("AC15: hydrating changes neither the first card position nor the section height", async ({
      browser,
    }) => {
      const measure = (page: Page) =>
        page.evaluate(() => {
          const first = document.querySelector(
            "#proyectos li:not([data-carousel-clone]) article",
          )!;
          return {
            left: first.getBoundingClientRect().left,
            height: document
              .getElementById("proyectos")!
              .getBoundingClientRect().height,
          };
        });
      const blockedContext = await browser.newContext({ viewport });
      const blocked = await blockedContext.newPage();
      await blocked.route(/\.js(\?.*)?$/, (route) => route.abort());
      await blocked.goto(withBase("/"));
      await blocked.waitForTimeout(500);
      const without = await measure(blocked);
      await blockedContext.close();

      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const problems: string[] = [];
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type())) {
          problems.push(message.text());
        }
      });
      page.on("pageerror", (error) => problems.push(error.message));
      await openHome(page);
      const hydrated = await measure(page);
      expect(Math.abs(hydrated.left - without.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(hydrated.height - without.height)).toBeLessThanOrEqual(1);
      expect(problems).toEqual([]);
      await context.close();
    });

    test("AC12/R14: arrows are 44 px, clear of the cards, keep focus and move instantly under reduced motion", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await openHome(page);
      const geometry = await page.evaluate((selector) => {
        const top = document
          .querySelector(selector)!
          .getBoundingClientRect().top;
        return [...document.querySelectorAll(".projects-carousel button")].map(
          (button) => {
            const r = button.getBoundingClientRect();
            return { width: r.width, height: r.height, bottom: r.bottom, top };
          },
        );
      }, scroller);
      for (const box of geometry) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.bottom, "arrows sit above the cards").toBeLessThanOrEqual(
          box.top,
        );
      }
      const next = arrow(page, "next");
      const seen = new Set<string>();
      for (let i = 0; i < 6; i += 1) {
        for (const slug of await fullSlugs(page)) seen.add(slug);
        const before = await page
          .locator(scroller)
          .evaluate((el) => el.scrollLeft);
        await next.click();
        await page.waitForTimeout(40);
        const after = await page
          .locator(scroller)
          .evaluate((el) => el.scrollLeft);
        expect(after, "instant under reduced motion").not.toBe(before);
        await expect(next).toBeFocused();
      }
      expect([...seen].sort()).toEqual([...order].sort());
      await context.close();
    });

    test("AC13/R15: a horizontal wheel moves one stop in its direction; vertical wheel scrolls the page", async ({
      page,
    }) => {
      await openHome(page);
      await page.evaluate(
        ([selector]) => {
          const el = document.querySelector(selector!)!;
          window.scrollTo(
            0,
            el.getBoundingClientRect().top + scrollY - innerHeight / 3,
          );
        },
        [scroller],
      );
      const box = (await page.locator(scroller).boundingBox())!;
      await page.mouse.move(
        box.x + box.width / 2,
        Math.min(box.y + box.height / 2, viewport.height - 100),
      );
      expect((await fullSlugs(page))[0]).toBe("portfolio");
      await page.mouse.wheel(120, 0);
      await expect
        .poll(async () => (await fullSlugs(page))[0])
        .toBe("openrazer");
      await settled(page);
      await page.mouse.wheel(-120, 0);
      await expect
        .poll(async () => (await fullSlugs(page))[0])
        .toBe("portfolio");
      await settled(page);
      await page.mouse.wheel(-120, 0);
      await expect
        .poll(async () => (await fullSlugs(page))[0])
        .toBe("zot-quarantine-proxy");
      await settled(page);
      // Shift with a vertical wheel is horizontal input.
      await page.keyboard.down("Shift");
      await page.mouse.wheel(0, 120);
      await page.keyboard.up("Shift");
      await expect
        .poll(async () => (await fullSlugs(page))[0])
        .toBe("portfolio");

      await settled(page);
      const state = await page.evaluate(() => ({
        y: scrollY,
        x: document.querySelector(".projects-carousel-scroller")!.scrollLeft,
      }));
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => ({
        y: scrollY,
        x: document.querySelector(".projects-carousel-scroller")!.scrollLeft,
      }));
      expect(after.x).toBe(state.x);
      expect(after.y).toBeGreaterThan(state.y);
    });

    test("AC19/AC21: tabbing visits links in DOM order and keeps each fully inside the carousel, clear of the navigator", async ({
      page,
    }) => {
      await openHome(page);
      await arrow(page, "prev").focus();
      const visited: string[] = [];
      for (let i = 0; i < 11; i += 1) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(100);
        const state = await page.evaluate((selector) => {
          const active = document.activeElement as HTMLElement;
          const nav = document.querySelector(".floating-nav")!;
          if (nav.contains(active)) return { nav: true };
          const box = document.querySelector(selector)!.getBoundingClientRect();
          const r = active.getBoundingClientRect();
          const n = nav.getBoundingClientRect();
          // 3 px outline plus 3 px offset.
          const margin = 6;
          return {
            nav: false,
            label: active.getAttribute("aria-label"),
            clone: !!active.closest("[data-carousel-clone]"),
            inside:
              active.tagName !== "A" ||
              (r.left - margin >= box.left && r.right + margin <= box.right),
            clear: !(
              r.bottom + 8 > n.top &&
              r.top - 8 < n.bottom &&
              r.right + 8 > n.left &&
              r.left - 8 < n.right
            ),
            hidden: (nav as HTMLElement).dataset.focusObscured === "true",
          };
        }, scroller);
        if (state.nav) continue;
        visited.push(state.label ?? "");
        expect(state.clone).toBe(false);
        expect(state.inside, `${state.label} inside carousel`).toBe(true);
        expect(
          state.clear || state.hidden,
          `${state.label} obscured by navigator`,
        ).toBe(true);
      }
      const links = visited.filter((label) =>
        /^(Más información|GitHub): /.test(label),
      );
      expect(links).toHaveLength(10);
      expect(links.map((l) => l.split(": ")[0])).toEqual(
        Array.from({ length: 5 }, () => ["Más información", "GitHub"]).flat(),
      );
    });
  });
}

test.describe("focus and horizontal movement", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("R21/R31: a wheel that carries a focused link under the navigator does not leave it covered", async ({
    page,
  }) => {
    await openHome(page);
    await arrow(page, "prev").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Más información: Portfolio personal" }),
    ).toBeFocused();
    // Put the link at the navigator's height, then move the cards sideways so
    // that it lands inside the navigator's horizontal span.
    await page.evaluate(() => {
      const link = document.activeElement!.getBoundingClientRect();
      const nav = document
        .querySelector(".floating-nav")!
        .getBoundingClientRect();
      window.scrollBy(
        0,
        link.top + link.height / 2 - (nav.top + nav.height / 2),
      );
    });
    const box = (await page.locator(scroller).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, Math.max(box.y + 20, 5));
    await page.mouse.wheel(-120, 0);
    await page.waitForTimeout(900);
    const state = await page.evaluate(() => {
      const a = document.activeElement!.getBoundingClientRect();
      const nav = document.querySelector<HTMLElement>(".floating-nav")!;
      const n = nav.getBoundingClientRect();
      return {
        overlaps:
          a.bottom + 8 > n.top &&
          a.top - 8 < n.bottom &&
          a.right + 8 > n.left &&
          a.left - 8 < n.right,
        hidden: nav.dataset.focusObscured === "true",
      };
    });
    expect(
      !state.overlaps || state.hidden,
      "focused link overlaps a visible navigator",
    ).toBe(true);
  });
});

for (const viewport of viewports) {
  test.describe(`focus under the navigator at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("D-T2-1/AC19: after each horizontal move the navigator is hidden exactly while it would cover the focused link", async ({
      page,
    }) => {
      await openHome(page);
      await arrow(page, "prev").focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: /^Más información: / }).first(),
      ).toBeFocused();

      const measure = () =>
        page.evaluate(() => {
          const active = document.activeElement as HTMLElement;
          const a = active.getBoundingClientRect();
          const nav = document.querySelector<HTMLElement>(".floating-nav")!;
          const n = nav.getBoundingClientRect();
          return {
            focusVisible: active.matches(":focus-visible"),
            overlaps:
              a.bottom + 8 > n.top &&
              a.top - 8 < n.bottom &&
              a.right + 8 > n.left &&
              a.left - 8 < n.right,
            hidden: nav.dataset.focusObscured === "true",
          };
        });
      // The link goes to the navigator's height, so that a sideways move can
      // carry it under the navigator or away from it.
      const alignToNavigator = () =>
        page.evaluate(() => {
          const link = document.activeElement!.getBoundingClientRect();
          const nav = document
            .querySelector(".floating-nav")!
            .getBoundingClientRect();
          window.scrollBy(
            0,
            link.top + link.height / 2 - (nav.top + nav.height / 2),
          );
        });

      let covered = 0;
      for (const delta of [-120, -120, 120, 120, 120, 120, -120]) {
        await alignToNavigator();
        await page.waitForTimeout(150);
        const box = (await page.locator(scroller).boundingBox())!;
        await page.mouse.move(
          box.x + box.width / 2,
          Math.min(Math.max(box.y + 20, 5), viewport.height - 5),
        );
        await page.mouse.wheel(delta, 0);
        await page.waitForTimeout(900);
        const state = await measure();
        expect(state.focusVisible).toBe(true);
        expect(state.hidden, `wheel ${delta}: hidden iff covering`).toBe(
          state.overlaps,
        );
        covered += state.overlaps ? 1 : 0;
      }
      // The scenario must actually cover the link sometimes, or it proves nothing.
      expect(
        covered,
        "moves that carried the link under the navigator",
      ).toBeGreaterThan(0);
    });
  });
}

test.describe("ClientRouter round trips", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("AC9: home to detail and back keeps the clone count of a fresh load", async ({
    page,
  }) => {
    await openHome(page);
    const clones = () => page.locator("[data-carousel-clone]").count();
    const fresh = await clones();
    expect(fresh).toBe(10);
    for (const slug of ["openrazer", "portfolio"]) {
      await page.evaluate(() => {
        (window as unknown as { __marker: boolean }).__marker = true;
      });
      await page
        .locator(
          `#proyectos li:not([data-carousel-clone]) a[href$='/${slug}/']`,
        )
        .first()
        .evaluate((a) => (a as HTMLAnchorElement).click());
      await expect(page).toHaveURL(new RegExp(`/proyectos/${slug}/$`));
      expect(await clones()).toBe(0);
      expect(
        await page.evaluate(
          () => (window as unknown as { __marker?: boolean }).__marker,
        ),
        "client-side navigation, not a full load",
      ).toBe(true);

      await page.locator("main a[href$='#proyectos']").first().click();
      await expect(page).toHaveURL(/#proyectos$/);
      await expect(page.locator("[data-carousel-clone]")).toHaveCount(fresh);

      await page
        .locator(
          `#proyectos li:not([data-carousel-clone]) a[href$='/${slug}/']`,
        )
        .first()
        .evaluate((a) => (a as HTMLAnchorElement).click());
      await expect(page).toHaveURL(new RegExp(`/proyectos/${slug}/$`));
      await page.goBack();
      await expect(page.locator("[data-carousel-clone]")).toHaveCount(fresh);
      await expect(
        page.locator(".projects-carousel button").first(),
      ).toBeEnabled();
    }
  });

  test("AC21/AC22: images are same-origin, sized and uncropped; only imageless cards use the default", async ({
    page,
  }) => {
    await openHome(page);
    const images = await page.evaluate(() =>
      [...document.querySelectorAll("li:not([data-carousel-clone]) article")]
        .filter((card) => card.closest("#proyectos"))
        .map((card) => {
          const img = card.querySelector("img")!;
          const r = img.getBoundingClientRect();
          return {
            sameOrigin: new URL(img.src).origin === location.origin,
            width: img.getAttribute("width"),
            height: img.getAttribute("height"),
            fit: getComputedStyle(img).objectFit,
            ratio: Math.round((r.width / r.height) * 100) / 100,
            alt: img.getAttribute("alt"),
            isDefault: img.src.includes("project-default"),
          };
        }),
    );
    expect(images).toHaveLength(5);
    for (const image of images) {
      expect(image.sameOrigin).toBe(true);
      expect(Number(image.width)).toBeGreaterThan(0);
      expect(Number(image.height)).toBeGreaterThan(0);
      expect(image.fit).toBe("contain");
      expect(image.ratio).toBeCloseTo(16 / 9, 1);
      if (image.isDefault) expect(image.alt).toBe("");
      else expect(image.alt!.length).toBeGreaterThan(0);
    }
    expect(images.filter((i) => i.isDefault)).toHaveLength(4);
  });
});
