import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

type Rgb = [number, number, number];

interface ParsedColor {
  rgb: Rgb;
  alpha: number;
}

/**
 * Parse a CSS `rgb()` / `rgba()` computed value in either the comma form
 * (`rgba(255, 255, 255, 0.7)`) or the modern space/slash form
 * (`rgb(255 255 255 / 0.7)`).
 */
function parseColor(value: string): ParsedColor {
  const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
  const [r = 0, g = 0, b = 0, a = 1] = numbers;

  return { rgb: [r, g, b], alpha: a };
}

/** Read the blur radius (in px) from a `backdrop-filter` computed value. */
function parseBlur(value: string | undefined): number | null {
  if (!value || value === "none") return null;
  const match = /blur\(([\d.]+)px\)/.exec(value);

  return match ? Number(match[1]) : null;
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;

  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: Rgb): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];

  return (hi + 0.05) / (lo + 0.05);
}

/** Composite a translucent foreground color over an opaque background. */
function composite(fg: Rgb, alpha: number, bg: Rgb): Rgb {
  return fg.map((channel, index) =>
    Math.round(channel * alpha + bg[index] * (1 - alpha)),
  ) as Rgb;
}

function rgbTuple(value: string): Rgb {
  return parseColor(value).rgb;
}

async function computed(page: Page, selector: string) {
  return page.evaluate((target) => {
    const element = document.querySelector(target);

    if (!element) throw new Error(`missing element ${target}`);

    const styles = getComputedStyle(element);

    return {
      backgroundColor: styles.backgroundColor,
      backdropFilter: styles.backdropFilter,
      webkitBackdropFilter: styles.webkitBackdropFilter,
      backgroundImage: styles.backgroundImage,
      borderTopWidth: styles.borderTopWidth,
      borderTopStyle: styles.borderTopStyle,
      borderTopColor: styles.borderTopColor,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow,
    };
  }, selector);
}

/** Move keyboard focus to `target` by tabbing, so `:focus-visible` applies. */
async function focusViaKeyboard(page: Page, target: Locator): Promise<void> {
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press("Tab");

    if (await target.evaluate((el) => el === document.activeElement)) return;
  }

  throw new Error("target was not reachable through Tab order");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Navegación por secciones" }),
  ).toHaveAttribute("data-positioned", "true");
});

test("AC1: the navigator renders a subtle translucent frosted surface", async ({
  page,
}) => {
  const nav = page.locator(".floating-nav");
  const styles = await computed(page, ".floating-nav");

  // Translucent light background with alpha inside the 0.55-0.85 bound.
  const background = parseColor(styles.backgroundColor);

  expect(background.alpha).toBeGreaterThanOrEqual(0.55);
  expect(background.alpha).toBeLessThanOrEqual(0.85);
  // Light frosted surface, not a dark or strongly tinted fill.
  for (const channel of background.rgb) {
    expect(channel).toBeGreaterThan(200);
  }

  // Backdrop blur of at least 8 px.
  const blur =
    parseBlur(styles.backdropFilter) ?? parseBlur(styles.webkitBackdropFilter);

  expect(blur).not.toBeNull();
  expect(blur ?? 0).toBeGreaterThanOrEqual(8);

  // The glass is translucency + blur only: no gradient fill.
  expect(styles.backgroundImage).toBe("none");

  // Pill shape, fine border/highlight, and shadow are retained.
  expect(styles.borderRadius).toBe("999px");
  expect(styles.borderTopWidth).toBe("1px");
  expect(styles.borderTopStyle).toBe("solid");
  expect(parseColor(styles.borderTopColor).alpha).toBeLessThan(1);
  expect(styles.boxShadow).not.toBe("none");

  await expect(nav).toBeVisible();
});

test("AC2: cards, badges, buttons, and the page keep their opaque values", async ({
  page,
}) => {
  const surfaces = await page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector(selector);

      if (!element) throw new Error(`missing element ${selector}`);

      const styles = getComputedStyle(element);

      return {
        backgroundColor: styles.backgroundColor,
        backdropFilter: styles.backdropFilter,
      };
    };

    return {
      page: read("html"),
      body: read("body"),
      card: read(".experience-card"),
      badge: read(".technology-badge"),
      primary: read('[data-molecule="button"][data-variant="primary"]'),
    };
  });

  const expectations: Array<[string, string]> = [
    ["page", "rgb(239, 243, 248)"],
    ["body", "rgb(239, 243, 248)"],
    ["card", "rgb(255, 255, 255)"],
    ["badge", "rgb(255, 255, 255)"],
    ["primary", "rgb(12, 122, 191)"],
  ];

  for (const [key, expected] of expectations) {
    const value = surfaces[key as keyof typeof surfaces];
    const background = parseColor(value.backgroundColor);

    // No glass leaked onto other surfaces: fully opaque, no backdrop filter.
    expect(background.alpha, `${key} alpha`).toBe(1);
    expect(rgbTuple(value.backgroundColor), `${key} background`).toEqual(
      rgbTuple(expected),
    );
    expect(value.backdropFilter, `${key} backdrop-filter`).toBe("none");
  }
});

test("AC3: labels and indicator keep >= 4.5:1 contrast over page and cards", async ({
  page,
}) => {
  const nav = page.locator(".floating-nav");
  const indicator = page.locator(".floating-nav-indicator");
  const activeLink = nav.getByRole("link", { name: "Inicio" });
  const inactiveLink = nav.getByRole("link", { name: "Trayectoria" });

  const navColor = parseColor(
    (await computed(page, ".floating-nav")).backgroundColor,
  );
  const indicatorColor = rgbTuple(
    await indicator.evaluate((el) => getComputedStyle(el).backgroundColor),
  );
  const pageColor = rgbTuple(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  );
  const cardColor = rgbTuple(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".experience-card")!)
          .backgroundColor,
    ),
  );

  const activeLabel = rgbTuple(
    await activeLink.evaluate((el) => getComputedStyle(el).color),
  );
  const inactiveLabel = rgbTuple(
    await inactiveLink.evaluate((el) => getComputedStyle(el).color),
  );

  // Composed navigator surface over the page and over a card.
  const composedOverPage = composite(navColor.rgb, navColor.alpha, pageColor);
  const composedOverCard = composite(navColor.rgb, navColor.alpha, cardColor);

  // Inactive labels (dark ink) over the composed glass surface.
  for (const [name, surface] of [
    ["page", composedOverPage],
    ["card", composedOverCard],
  ] as const) {
    expect(
      contrastRatio(inactiveLabel, surface),
      `inactive label over ${name}`,
    ).toBeGreaterThanOrEqual(4.5);
  }

  // Active label (white) over the solid blue indicator.
  expect(
    contrastRatio(activeLabel, indicatorColor),
    "active label over indicator",
  ).toBeGreaterThanOrEqual(4.5);

  // Screenshots of the navigator over a card and over the plain page. In this
  // layout the fixed navigator already overlaps the first experience card at
  // the top of the page, and the page background at the document end.
  const behindNavIsCard = () =>
    page.evaluate(() => {
      const navElement = document.querySelector(".floating-nav")!;
      const rect = navElement.getBoundingClientRect();
      const stack = document.elementsFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      const element = stack.find((node) => !navElement.contains(node));

      return Boolean(
        (element as HTMLElement | undefined)?.closest(".experience-card"),
      );
    });

  expect(await behindNavIsCard()).toBe(true);
  const overCard = await nav.screenshot({
    path: "test-results/nav-glass-over-card.png",
  });

  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForFunction(
    () =>
      window.scrollY >=
      document.documentElement.scrollHeight - window.innerHeight - 2,
  );

  // Scrolling to the end changes the active section; let the indicator
  // transition settle before capturing the composed surface.
  await page.waitForTimeout(300);

  expect(await behindNavIsCard()).toBe(false);
  const overPage = await nav.screenshot({
    path: "test-results/nav-glass-over-page.png",
  });

  // The two captures must composite genuinely different backgrounds through
  // the glass (card surface vs page background), not the same frame twice.
  expect(Buffer.compare(overCard, overPage)).not.toBe(0);

  // Keyboard focus outline stays visible (3 px solid focus color, 3 px offset).
  await focusViaKeyboard(page, activeLink);
  await expect(activeLink).toBeFocused();
  expect(await activeLink.evaluate((el) => el.matches(":focus-visible"))).toBe(
    true,
  );

  const outline = await activeLink.evaluate((el) => {
    const styles = getComputedStyle(el);

    return {
      style: styles.outlineStyle,
      width: styles.outlineWidth,
      color: styles.outlineColor,
      offset: styles.outlineOffset,
    };
  });

  expect(outline.style).toBe("solid");
  expect(outline.width).toBe("3px");
  expect(rgbTuple(outline.color)).toEqual([7, 89, 133]);
  expect(outline.offset).toBe("3px");

  // The audit passes with the glass surface active.
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations, "axe violations with glass surface").toEqual([]);
});

test.describe("fallbacks", () => {
  /** Emulate `prefers-reduced-transparency` through CDP media emulation. */
  async function emulateReducedTransparency(
    page: Page,
    reduce: boolean,
  ): Promise<void> {
    const client = await page.context().newCDPSession(page);

    await client.send("Emulation.setEmulatedMedia", {
      media: "",
      features: [
        {
          name: "prefers-reduced-transparency",
          value: reduce ? "reduce" : "no-preference",
        },
      ],
    });
  }

  test("AC4: reduced transparency falls back to an opaque, still-legible surface", async ({
    page,
  }) => {
    await emulateReducedTransparency(page, true);

    const styles = await computed(page, ".floating-nav");

    // Opaque surface, no blur: the fallback branch applies.
    expect(parseColor(styles.backgroundColor).alpha).toBe(1);
    expect(rgbTuple(styles.backgroundColor)).toEqual([255, 255, 255]);
    expect(styles.backdropFilter).toBe("none");
    // Layout, border, radius and shadow are preserved.
    expect(styles.borderRadius).toBe("999px");
    expect(styles.borderTopWidth).toBe("1px");
    expect(styles.boxShadow).not.toBe("none");

    const nav = page.locator(".floating-nav");

    await expect(nav).toBeVisible();

    // Contrast over the opaque surface stays compliant.
    const inactiveLabel = rgbTuple(
      await nav
        .getByRole("link", { name: "Trayectoria" })
        .evaluate((el) => getComputedStyle(el).color),
    );

    expect(
      contrastRatio(inactiveLabel, [255, 255, 255]),
      "inactive label over opaque fallback",
    ).toBeGreaterThanOrEqual(4.5);

    // Focus outline still visible under the fallback.
    await focusViaKeyboard(page, nav.getByRole("link", { name: "Inicio" }));
    const outline = await nav
      .getByRole("link", { name: "Inicio" })
      .evaluate((el) => getComputedStyle(el).outlineStyle);

    expect(outline).toBe("solid");

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(
      results.violations,
      "axe violations under reduced transparency",
    ).toEqual([]);
  });

  test("AC4: an unsupported backdrop-filter also falls back to an opaque surface", async ({
    page,
  }) => {
    // Chromium always supports `backdrop-filter`, so the `@supports not (...)`
    // branch cannot be reached by emulation. Rewrite the served stylesheet so
    // the real fallback declarations apply, then assert their rendered effect.
    await page.route("**/*.css", async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      const rewritten = body.replace(
        "@supports not ((-webkit-backdrop-filter:blur(0px)) or (backdrop-filter:blur(0px)))",
        "@supports ((-webkit-backdrop-filter:blur(0px)) or (backdrop-filter:blur(0px)))",
      );

      expect(rewritten).not.toBe(body);
      await route.fulfill({ response, body: rewritten });
    });

    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Navegación por secciones" }),
    ).toHaveAttribute("data-positioned", "true");

    const styles = await computed(page, ".floating-nav");

    expect(parseColor(styles.backgroundColor).alpha).toBe(1);
    expect(rgbTuple(styles.backgroundColor)).toEqual([255, 255, 255]);
    expect(styles.backdropFilter).toBe("none");
    expect(styles.borderRadius).toBe("999px");
    expect(styles.boxShadow).not.toBe("none");
  });
});

test("AC6: placement, size, destinations, and indicator motion are unchanged", async ({
  page,
}) => {
  const nav = page.locator(".floating-nav");

  const geometry = await nav.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const styles = getComputedStyle(el);

    return {
      position: styles.position,
      width: rect.width,
      bottom: window.innerHeight - rect.bottom,
      left: rect.left,
      right: window.innerWidth - rect.right,
    };
  });

  expect(geometry.position).toBe("fixed");
  expect(geometry.width).toBeLessThanOrEqual(360);
  expect(Math.round(geometry.bottom)).toBe(16);
  // Centered horizontally: equal gaps on both sides.
  expect(Math.abs(geometry.left - geometry.right)).toBeLessThanOrEqual(1);

  // Two destinations with the settled labels and order.
  const links = nav.getByRole("link");
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveText("Inicio");
  await expect(links.nth(1)).toHaveText("Trayectoria");

  // Indicator wiring is unchanged: hidden from AT and still transitioned on
  // transform (the glass task only swapped the navigator's surface class).
  const indicator = await page
    .locator(".floating-nav-indicator")
    .evaluate((el) => {
      const styles = getComputedStyle(el);

      return {
        transitionProperty: styles.transitionProperty,
        transitionDuration: styles.transitionDuration,
        ariaHidden: el.getAttribute("aria-hidden"),
      };
    });

  expect(indicator.ariaHidden).toBe("true");
  expect(indicator.transitionProperty).toContain("transform");
  // The glass task only swapped the surface class, so the indicator transition
  // stays live (a positive duration) rather than being removed.
  expect(Number.parseFloat(indicator.transitionDuration)).toBeGreaterThan(0);

  // Reduced motion still suppresses the indicator transition (unchanged):
  // Tailwind's `motion-reduce:transition-none` sets transition-property: none.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedProperty = await page
    .locator(".floating-nav-indicator")
    .evaluate((el) => getComputedStyle(el).transitionProperty);

  expect(reducedProperty).toBe("none");

  // The active section still drives the indicator transform.
  await nav.getByRole("link", { name: "Trayectoria" }).click();
  await expect(nav).toHaveAttribute("data-active-index", "1");
  await expect(nav.getByRole("link", { name: "Trayectoria" })).toHaveAttribute(
    "aria-current",
    "location",
  );
});
