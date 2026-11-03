import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "./helpers/content";
import { withBase } from "./helpers/site";

/**
 * 033-projects-section, T5 (R34, R35, AC34, AC35): whole-page axe, horizontal
 * overflow and the computed design of the cards, labels, arrows and buttons.
 */

const viewports = [
  { width: 320, height: 568 },
  { width: 767, height: 1024 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Values from `docs/design.md` and the palette in `global.css`.
const INK = "rgb(15, 20, 25)";
const SURFACE = "rgb(255, 255, 255)";
const PAGE = "rgb(239, 243, 248)";
const BORDER = "rgb(207, 217, 222)";
const PRIMARY = "rgb(12, 122, 191)";
const PRIMARY_HOVER = "rgb(9, 106, 167)";
const PRIMARY_ACTIVE = "rgb(7, 89, 133)";

function channels(color: string): number[] {
  const match = /rgba?\(([^)]+)\)/.exec(color);
  if (!match) throw new Error(`Unexpected color ${color}`);
  return match[1]!
    .split(/[ ,/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(Number);
}

function luminance(color: string): number {
  const [r, g, b] = channels(color).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

async function openHydratedHome(page: Page) {
  await page.goto(withBase("/"));
  await expect(page.locator("[data-carousel-clone]")).toHaveCount(10);
  await expect(page.locator(".projects-carousel button").first()).toBeEnabled();
  await expect(
    page.getByRole("navigation", { name: "Navegación por secciones" }),
  ).toHaveAttribute("data-positioned", "true");
}

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

for (const viewport of viewports) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("AC34: the hydrated home and all five detail pages pass axe and do not scroll sideways", async ({
      page,
    }) => {
      await openHydratedHome(page);
      let results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations, "hydrated home").toEqual([]);
      expect(
        await overflow(page),
        "hydrated home overflow",
      ).toBeLessThanOrEqual(0);

      for (const { slug } of projects) {
        await page.goto(withBase(`/proyectos/${slug}/`));
        results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
        expect(results.violations, slug).toEqual([]);
        expect(await overflow(page), `${slug} overflow`).toBeLessThanOrEqual(0);
      }
    });
  });
}

test.describe("without JavaScript", () => {
  for (const viewport of viewports) {
    test(`AC34: the server-rendered home passes axe and a no-JS page does not scroll sideways at ${viewport.width}px`, async ({
      browser,
    }) => {
      // axe-core cannot run in a context with scripting off, so the audit uses
      // the served HTML with every script removed (nothing hydrates), and the
      // overflow is measured separately in a real JavaScript-disabled context.
      const stripped = await browser.newContext({ viewport });
      const audited = await stripped.newPage();
      await audited.route(
        (url) => url.pathname === withBase("/"),
        async (route) => {
          const response = await route.fetch();
          const html = (await response.text()).replace(
            /<script[\s\S]*?<\/script>/g,
            "",
          );
          await route.fulfill({ response, body: html });
        },
      );
      await audited.goto(withBase("/"));
      await expect(audited.locator("#proyectos article")).toHaveCount(5);
      expect(await audited.locator("script").count()).toBe(0);
      expect(await audited.locator("[data-carousel-clone]").count()).toBe(0);
      const results = await new AxeBuilder({ page: audited })
        .withTags(wcagTags)
        .analyze();
      expect(results.violations, "server-rendered home").toEqual([]);
      await stripped.close();

      const plain = await browser.newContext({
        viewport,
        javaScriptEnabled: false,
      });
      const page = await plain.newPage();
      await page.goto(withBase("/"));
      await expect(page.locator("#proyectos article")).toHaveCount(5);
      expect(await overflow(page), "no-JS overflow").toBeLessThanOrEqual(0);
      await plain.close();
    });
  }
});

for (const viewport of viewports) {
  test.describe(`AC35 at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("heading scale, typeface, flat surfaces and keyboard focus follow design.md", async ({
      page,
    }) => {
      await openHydratedHome(page);
      await page.locator("#proyectos").scrollIntoViewIfNeeded();
      const measured = await page.evaluate(() => {
        const card = document.querySelector(
          "#proyectos li.project-slide:not([data-carousel-clone]) article",
        )!;
        const h2 = getComputedStyle(document.querySelector("#proyectos h2")!);
        const elements = [
          card,
          ...card.querySelectorAll("a, .technology-badge, .project-status"),
          ...document.querySelectorAll(".projects-carousel button"),
        ];
        return {
          h2: {
            size: h2.fontSize,
            weight: h2.fontWeight,
            marginBottom: h2.marginBottom,
          },
          title: getComputedStyle(card.querySelector("h3")!).fontSize,
          fonts: elements.map((el) => getComputedStyle(el).fontFamily),
          images: elements.map((el) => getComputedStyle(el).backgroundImage),
        };
      });
      expect(measured.h2.size).toBe(viewport.width >= 768 ? "32px" : "24px");
      expect(measured.h2.weight).toBe("700");
      expect(measured.title).toBe("20px");
      for (const family of measured.fonts)
        expect(family).toContain("Open Sans");
      for (const image of measured.images)
        expect(image, "no gradient").toBe("none");

      // Keyboard focus: the link/focus color outline on a card link and an arrow.
      const targets = [
        page.locator(".projects-carousel button").first(),
        page
          .locator("#proyectos li.project-slide:not([data-carousel-clone]) a")
          .first(),
      ];
      for (const target of targets) {
        await target.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        // The 200 ms color transition has to finish before the outline is read.
        await page.waitForTimeout(350);
        const outline = await target.evaluate((el) => {
          const cs = getComputedStyle(el);
          return {
            focusVisible: el.matches(":focus-visible"),
            style: cs.outlineStyle,
            width: Number.parseFloat(cs.outlineWidth),
            color: cs.outlineColor,
          };
        });
        expect(outline.focusVisible).toBe(true);
        expect(outline.style).not.toBe("none");
        expect(outline.width).toBeGreaterThanOrEqual(2);
        expect(outline.color).toBe("rgb(7, 89, 133)");
      }
    });
  });
}

test.describe("AC35: design.md on the cards", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("cards, headings, labels, badges, arrows and link buttons compute to the design tokens", async ({
    page,
  }) => {
    await openHydratedHome(page);
    const styles = await page.evaluate(() => {
      const pick = (el: Element, props: string[]) => {
        const cs = getComputedStyle(el);
        return Object.fromEntries(
          props.map((p) => [p, cs.getPropertyValue(p)]),
        );
      };
      const card = document.querySelector(
        "#proyectos li.project-slide:not([data-carousel-clone]) article",
      )!;
      const archived = [...document.querySelectorAll(".project-status")];
      return {
        card: pick(card, [
          "background-color",
          "border-top-width",
          "border-top-color",
          "border-top-left-radius",
          "padding-top",
        ]),
        title: pick(card.querySelector("h3")!, [
          "font-size",
          "font-weight",
          "line-height",
          "margin-top",
          "color",
        ]),
        section: pick(document.querySelector("#proyectos h2")!, [
          "font-size",
          "font-weight",
          "line-height",
        ]),
        status: archived.map((el) =>
          pick(el, ["font-weight", "color", "text-transform"]),
        ),
        statusParents: archived.map((el) =>
          getComputedStyle(el.closest("article")!).getPropertyValue(
            "background-color",
          ),
        ),
        badge: pick(card.querySelector(".technology-badge")!, [
          "background-color",
          "border-top-width",
          "border-top-color",
          "border-top-left-radius",
          "color",
        ]),
        summary: pick(card.querySelector(".project-summary")!, ["color"]),
        arrow: [...document.querySelectorAll(".projects-carousel button")].map(
          (el) => ({
            ...pick(el, [
              "border-top-left-radius",
              "color",
              "background-color",
            ]),
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height,
          }),
        ),
        links: [...card.querySelectorAll("a")].map((el) => ({
          ...pick(el, [
            "border-top-left-radius",
            "min-height",
            "color",
            "background-color",
            "text-decoration-line",
          ]),
          height: el.getBoundingClientRect().height,
        })),
        count: archived.length,
      };
    });

    expect(styles.card).toMatchObject({
      "background-color": SURFACE,
      "border-top-width": "1px",
      "border-top-color": BORDER,
      "border-top-left-radius": "24px",
      "padding-top": "24px",
    });
    expect(styles.title).toMatchObject({
      "font-size": "20px",
      "font-weight": "700",
      "line-height": "27px",
      "margin-top": "0px",
      color: INK,
    });
    expect(styles.section).toMatchObject({
      "font-size": "32px",
      "font-weight": "700",
      "line-height": "40px",
    });
    expect(styles.count).toBeGreaterThanOrEqual(3);
    for (const [index, status] of styles.status.entries()) {
      expect(status["font-weight"]).toBe("600");
      expect(status["text-transform"]).toBe("none");
      expect(
        contrast(status.color!, styles.statusParents[index]!),
        "archived label contrast",
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(styles.badge).toMatchObject({
      "background-color": SURFACE,
      "border-top-width": "1px",
      "border-top-color": BORDER,
      color: INK,
    });
    expect(
      Number.parseFloat(styles.badge["border-top-left-radius"]!),
    ).toBeGreaterThanOrEqual(500);
    expect(contrast(styles.summary.color!, SURFACE)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(styles.arrow).toHaveLength(2);
    for (const arrow of styles.arrow) {
      expect(arrow.width).toBe(44);
      expect(arrow.height).toBe(44);
      expect(
        Number.parseFloat(arrow["border-top-left-radius"]!),
      ).toBeGreaterThan(20);
    }
    expect(styles.links).toHaveLength(2);
    for (const link of styles.links) {
      expect(link.height).toBeGreaterThanOrEqual(44);
      expect(
        Number.parseFloat(link["border-top-left-radius"]!),
      ).toBeGreaterThan(20);
    }
    expect(styles.links[0]).toMatchObject({
      "background-color": PRIMARY,
      color: SURFACE,
    });
    expect(styles.links[1]).toMatchObject({
      "background-color": SURFACE,
      color: INK,
    });
  });

  test("card buttons keep 4.5:1 in the normal, hover and pressed states and match the tokens", async ({
    page,
  }) => {
    await openHydratedHome(page);
    await page.locator("#proyectos").scrollIntoViewIfNeeded();
    const card = page
      .locator("#proyectos li.project-slide:not([data-carousel-clone])")
      .first();
    const expected = [
      {
        index: 0,
        name: "primary",
        normal: PRIMARY,
        hover: PRIMARY_HOVER,
        active: PRIMARY_ACTIVE,
      },
      {
        index: 1,
        name: "secondary",
        normal: SURFACE,
        hover: PAGE,
        active: BORDER,
      },
    ];

    for (const { index, name, normal, hover, active } of expected) {
      const link = card.locator("a").nth(index);
      const read = () =>
        link.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { bg: cs.backgroundColor, fg: cs.color };
        });

      await page.mouse.move(1, 1);
      await page.waitForTimeout(350);
      let state = await read();
      expect(state.bg, `${name} normal`).toBe(normal);
      expect(
        contrast(state.fg, state.bg),
        `${name} normal`,
      ).toBeGreaterThanOrEqual(4.5);

      const box = (await link.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(350);
      state = await read();
      expect(state.bg, `${name} hover`).toBe(hover);
      expect(
        contrast(state.fg, state.bg),
        `${name} hover`,
      ).toBeGreaterThanOrEqual(4.5);

      await page.mouse.down();
      await page.waitForTimeout(350);
      state = await read();
      expect(state.bg, `${name} pressed`).toBe(active);
      expect(
        contrast(state.fg, state.bg),
        `${name} pressed`,
      ).toBeGreaterThanOrEqual(4.5);
      // Release away from the link, so that no navigation happens.
      await page.mouse.move(1, 1);
      await page.mouse.up();
    }
    await expect(page).toHaveURL(/\/$/);
  });
});
