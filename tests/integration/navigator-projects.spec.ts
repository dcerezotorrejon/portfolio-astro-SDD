import { expect, test, type Locator, type Page } from "@playwright/test";
import { navigationSections } from "./helpers/content";
import { withBase } from "./helpers/site";

/**
 * 033-projects-section, T4 (R29-R31, AC29-AC31): the navigator exposes three
 * destinations, aligns its indicator to one whole link for each, fits at 320 px
 * and lets every destination become active by scrolling and by activation.
 */

const viewports = [
  { width: 320, height: 568 },
  { width: 767, height: 1024 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

const navigationName = "Navegación por secciones";

async function openHome(page: Page, path = "/") {
  await page.goto(withBase(path));
  const nav = page.getByRole("navigation", { name: navigationName });
  await expect(nav).toHaveAttribute("data-positioned", "true");
  await page.evaluate(() => document.fonts.ready);
  return nav;
}

async function currentLabels(nav: Locator) {
  return nav
    .locator('[aria-current="location"]')
    .evaluateAll((els) => els.map((el) => el.textContent));
}

/** Indicator box and link box in viewport coordinates. */
async function boxes(nav: Locator, index: number) {
  return nav.evaluate((el, i) => {
    const indicator = el.querySelector(".floating-nav-indicator")!;
    const link = el.querySelectorAll("a")[i]!;
    const ir = indicator.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    return {
      indicator: { left: ir.left, right: ir.right, width: ir.width },
      link: { left: lr.left, right: lr.right, width: lr.width },
    };
  }, index);
}

/** The indicator settles over exactly one whole link (within 1 px). */
async function expectIndicatorOnLink(nav: Locator, index: number) {
  await expect
    .poll(
      async () => {
        const { indicator, link } = await boxes(nav, index);
        return Math.max(
          Math.abs(indicator.left - link.left),
          Math.abs(indicator.right - link.right),
        );
      },
      { timeout: 3000, message: `indicator over link ${index}` },
    )
    .toBeLessThanOrEqual(1);
}

async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: "instant" });
  }, y);
}

async function sectionOffsets(page: Page) {
  return page.evaluate(
    (ids) => {
      const max =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      return {
        max,
        tops: ids.map((id) => {
          const el = document.getElementById(id)!;
          return el.getBoundingClientRect().top + window.scrollY;
        }),
      };
    },
    navigationSections.map(({ id }) => id),
  );
}

test("AC29: three destinations in document order with Markdown labels", async ({
  page,
}) => {
  const nav = await openHome(page);
  const links = nav.getByRole("link");

  expect(navigationSections.map(({ label }) => label)).toEqual([
    "Inicio",
    "Trayectoria",
    "Proyectos",
  ]);
  await expect(links).toHaveCount(3);
  for (const [index, { id, label }] of navigationSections.entries()) {
    await expect(links.nth(index)).toHaveText(label);
    await expect(links.nth(index)).toHaveAttribute("href", `#${id}`);
  }

  // Link order matches the order of the target sections in the document.
  const { tops } = await sectionOffsets(page);
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);

  // No two-destination assumption survives in the rendered markup.
  const grid = await nav.locator(".floating-nav-list").evaluate((el) => ({
    columns: getComputedStyle(el).gridTemplateColumns.split(" ").length,
  }));
  expect(grid.columns).toBe(3);
});

test("AC29: the indicator slides between links instead of jumping", async ({
  page,
}) => {
  const nav = await openHome(page);
  const props = await nav
    .locator(".floating-nav-indicator")
    .evaluate((el) => getComputedStyle(el).transitionProperty);

  // The indicator moves through the `translate` property and changes width,
  // so both must be transitioned for the 200 ms slide to survive.
  expect(props).toMatch(/\btranslate\b|\ball\b/);
  expect(props).toMatch(/\bwidth\b|\ball\b/);

  const samples = await page.evaluate(async () => {
    const indicator = document.querySelector(".floating-nav-indicator")!;
    const link =
      document.querySelectorAll<HTMLAnchorElement>(".floating-nav a")[2]!;
    const lefts: number[] = [indicator.getBoundingClientRect().left];
    link.click();
    for (let i = 0; i < 20; i += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      lefts.push(indicator.getBoundingClientRect().left);
    }
    return lefts;
  });
  const start = samples[0]!;
  const end = samples.at(-1)!;
  const between = samples.filter((left) => left > start + 2 && left < end - 2);

  expect(end).toBeGreaterThan(start + 20);
  expect(
    between.length,
    `indicator samples ${samples.join(",")}`,
  ).toBeGreaterThan(0);
});

for (const viewport of viewports) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test.describe(`motion: ${reducedMotion}`, () => {
        test.use({ reducedMotion });

        test("AC29/AC31: each destination becomes active by activation with the indicator on one whole link", async ({
          page,
        }) => {
          const nav = await openHome(page);
          const { max, tops } = await sectionOffsets(page);

          // Order matters: forward, then back, so upward moves are covered.
          const order = [1, 2, 0, 2, 1, 0];
          for (const index of order) {
            const { id, label } = navigationSections[index]!;
            await nav.getByRole("link", { name: label }).click();
            await expect(page).toHaveURL(new RegExp(`#${id}$`));
            await expect(
              nav.getByRole("link", { name: label }),
            ).toHaveAttribute("aria-current", "location");
            // The measured activation must not flip back after the jump.
            await page.waitForTimeout(250);
            expect(await currentLabels(nav)).toEqual([label]);
            await expectIndicatorOnLink(nav, index);
            await expect(nav).toHaveAttribute("data-active-index", `${index}`);
          }

          // R31: the last section's top can reach the 16 px activation offset.
          const target = tops[2]! - 16;
          expect(
            max,
            `max scroll ${max} must reach #proyectos top offset ${target}`,
          ).toBeGreaterThanOrEqual(Math.floor(target));
        });

        test("AC29/AC31: scrolling down and back up moves aria-current through all three", async ({
          page,
        }) => {
          const nav = await openHome(page);
          const { max, tops } = await sectionOffsets(page);
          const stops = tops.map((top, index) =>
            index === 0 ? 0 : Math.min(Math.max(top - 16, 0), max),
          );

          for (const index of [0, 1, 2, 1, 0, 2, 0]) {
            await scrollToY(page, stops[index]!);
            const { label } = navigationSections[index]!;
            await expect
              .poll(() => currentLabels(nav), {
                message: `scroll to section ${index} at y=${stops[index]}`,
              })
              .toEqual([label]);
            await expectIndicatorOnLink(nav, index);
          }

          // At the very bottom the final destination is active.
          await scrollToY(page, max);
          await expect
            .poll(() => currentLabels(nav))
            .toEqual([navigationSections[2]!.label]);

          if (reducedMotion === "reduce") {
            const property = await nav
              .locator(".floating-nav-indicator")
              .evaluate((el) => getComputedStyle(el).transitionProperty);
            expect(property).toBe("none");
          }
        });

        test("AC31: final content and focused controls stay clear of the navigator", async ({
          page,
        }) => {
          const nav = await openHome(page);
          const { max } = await sectionOffsets(page);
          await scrollToY(page, max);

          const clearance = await page.evaluate(() => {
            const navTop = document
              .querySelector(".floating-nav")!
              .getBoundingClientRect().top;
            const section = document.getElementById("proyectos")!;
            const controls = [
              ...section.querySelectorAll<HTMLElement>("a[href], button"),
            ].filter((el) => !el.closest("[aria-hidden='true']"));
            const bottoms = controls.map(
              (el) => el.getBoundingClientRect().bottom,
            );
            return {
              navTop,
              sectionBottom: section.getBoundingClientRect().bottom,
              lowestControl: Math.max(...bottoms),
            };
          });

          // 8 px covers the 3 px outline plus its 3 px offset, with margin.
          expect(clearance.sectionBottom).toBeLessThanOrEqual(clearance.navTop);
          expect(clearance.lowestControl + 8).toBeLessThanOrEqual(
            clearance.navTop,
          );

          // Keyboard: every link and button in the section, focus-visible, never
          // leaves the navigator covering the focused control.
          const controls = page.locator(
            "#proyectos a[href]:not([tabindex='-1']), #proyectos button:not([disabled])",
          );
          const count = await controls.count();
          expect(count).toBeGreaterThan(0);
          await controls.first().focus();
          for (let i = 0; i < count; i += 1) {
            await page.keyboard.press("Tab");
            const state = await page.evaluate(() => {
              const active = document.activeElement as HTMLElement;
              const navEl =
                document.querySelector<HTMLElement>(".floating-nav")!;
              if (navEl.contains(active)) return { inNav: true };
              const a = active.getBoundingClientRect();
              const n = navEl.getBoundingClientRect();
              const overlap =
                a.bottom + 8 > n.top &&
                a.top - 8 < n.bottom &&
                a.right + 8 > n.left &&
                a.left - 8 < n.right;
              return {
                inNav: false,
                overlap,
                obscured: navEl.dataset.focusObscured === "true",
                visible: a.top >= 0 && a.bottom <= window.innerHeight,
              };
            });
            if (state.inNav) continue;
            // Either the control is clear of the navigator, or the navigator
            // yields (hidden) so that the focused control is not covered.
            if (state.overlap) {
              await expect(nav).toHaveAttribute("data-focus-obscured", "true");
            }
          }
        });
      });
    }
  });
}

test.describe("320x568 labels", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("AC30: every label fits in its link and each link keeps a 44 px target", async ({
    page,
  }) => {
    const nav = await openHome(page);
    const result = await nav.evaluate((el) => {
      const navRect = el.getBoundingClientRect();
      const list = el.querySelector<HTMLElement>(".floating-nav-list")!;
      const links = [...el.querySelectorAll<HTMLAnchorElement>("a")];
      return {
        navLeft: navRect.left,
        navRight: navRect.right,
        viewport: window.innerWidth,
        pageOverflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        listOverflow: list.scrollWidth - list.clientWidth,
        links: links.map((link) => {
          const rect = link.getBoundingClientRect();
          const style = getComputedStyle(link);
          const range = document.createRange();
          range.selectNodeContents(link);
          const text = range.getBoundingClientRect();
          return {
            label: link.textContent,
            width: rect.width,
            height: rect.height,
            textLeft: text.left - rect.left,
            textRight: rect.right - text.right,
            scrollOverflow: link.scrollWidth - link.clientWidth,
            overflow: style.overflow,
            textOverflow: style.textOverflow,
            whiteSpace: style.whiteSpace,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            padLeft: parseFloat(style.paddingLeft),
            padRight: parseFloat(style.paddingRight),
          };
        }),
      };
    });

    expect(result.navLeft).toBeGreaterThanOrEqual(0);
    expect(result.navRight).toBeLessThanOrEqual(result.viewport);
    expect(result.pageOverflow).toBeLessThanOrEqual(0);
    expect(result.listOverflow).toBeLessThanOrEqual(0);
    expect(result.links.map((link) => link.label)).toEqual(
      navigationSections.map(({ label }) => label),
    );
    for (const link of result.links) {
      expect(link.width, `${link.label} width`).toBeGreaterThanOrEqual(44);
      expect(link.height, `${link.label} height`).toBeGreaterThanOrEqual(44);
      expect(link.scrollOverflow, `${link.label} overflow`).toBeLessThanOrEqual(
        0,
      );
      expect(link.textOverflow).not.toBe("ellipsis");
      // The whole text sits inside the link box, with no clipping.
      expect(link.textLeft, `${link.label} text left`).toBeGreaterThanOrEqual(
        0,
      );
      expect(link.textRight, `${link.label} text right`).toBeGreaterThanOrEqual(
        0,
      );
      // Controls are not shrunk to force the fit.
      expect(link.fontSize).toBe("16px");
      expect(link.fontWeight).toBe("600");
    }
  });

  test("AC30: the same holds with the fallback font when Open Sans is blocked", async ({
    page,
  }) => {
    await page.route(/\.(woff2?|ttf|otf)(\?.*)?$/, (route) => route.abort());
    const nav = await openHome(page);
    const result = await nav.evaluate((el) => {
      const list = el.querySelector<HTMLElement>(".floating-nav-list")!;
      return {
        listOverflow: list.scrollWidth - list.clientWidth,
        links: [...el.querySelectorAll<HTMLAnchorElement>("a")].map((link) => {
          const rect = link.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(link);
          const text = range.getBoundingClientRect();
          return {
            width: rect.width,
            leftGap: text.left - rect.left,
            rightGap: rect.right - text.right,
          };
        }),
      };
    });

    expect(result.listOverflow).toBeLessThanOrEqual(0);
    for (const link of result.links) {
      expect(link.width).toBeGreaterThanOrEqual(44);
      expect(link.leftGap).toBeGreaterThanOrEqual(0);
      expect(link.rightGap).toBeGreaterThanOrEqual(0);
    }
  });
});
