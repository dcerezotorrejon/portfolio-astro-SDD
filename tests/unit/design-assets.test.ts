import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import {
  extractTokens,
  normalizeSpaces,
  readStylesheetTokens,
  resolveDeclaration,
  resolveMediaToken,
  resolveToken,
  resolveValue,
  type TokenMap,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");
const floatingNavSource = readFileSync(
  "src/components/home/FloatingNav/FloatingNav.tsx",
  "utf8",
);

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = css.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "s"),
  );

  expect(rule, `expected CSS rule for ${selector}`).not.toBeNull();
  return rule?.[1] ?? "";
}

describe("T2 local design assets", () => {
  const font = readFileSync("public/fonts/open-sans-latin.woff2");
  const license = readFileSync("public/fonts/OFL.txt", "utf8");
  const placeholder = readFileSync(
    "public/images/profile-placeholder.svg",
    "utf8",
  );

  it("contains a structurally valid WOFF2 font file", () => {
    expect(font.length).toBeGreaterThan(48);
    expect(font.toString("ascii", 0, 4)).toBe("wOF2");
    expect(font.readUInt32BE(8)).toBe(font.length);
    expect(font.readUInt16BE(12)).toBeGreaterThan(0);
    expect(font.readUInt16BE(14)).toBe(0);
    expect(font.readUInt32BE(16)).toBeGreaterThan(0);
  });

  it("ships the font under its SIL Open Font License", () => {
    expect(license).toContain("Copyright 2020 The Open Sans Project Authors");
    expect(license).toContain("SIL Open Font License, Version 1.1");
    expect(license).toMatch(
      /each copy[\s\S]*?contains the above copyright notice and this license/i,
    );
  });

  it("declares a local, non-blocking Open Sans variable face with Spanish Latin coverage under the deployment base", async () => {
    // Plain CSS cannot read the build-time base, so the @font-face is emitted
    // from SiteLayout.astro with the base-prefixed URL baked in.
    expect(css).not.toMatch(/@font-face\s*\{/);

    const homeHtml = await render(Home);
    const { document } = new JSDOM(homeHtml).window;
    const fontFaceStyle =
      Array.from(document.querySelectorAll("style"))
        .map((style) => style.textContent ?? "")
        .find((text) => text.includes("@font-face")) ?? "";
    const fontFace =
      fontFaceStyle.match(/@font-face\s*\{([^}]*)\}/s)?.[1] ?? "";

    expect(fontFace).not.toBe("");
    expect(fontFace).toMatch(/font-family:\s*["']Open Sans["']/);
    expect(fontFace).toMatch(/font-weight:\s*400\s+700/);
    expect(fontFace).toMatch(/font-display:\s*swap/);
    expect(fontFace).toMatch(
      /src:\s*url\(["']?\/portfolio-astro-SDD\/fonts\/open-sans-latin\.woff2["']?\)\s*format\(["']woff2["']\)/,
    );
    expect(fontFace).toMatch(/unicode-range:[\s\S]*U\+0000-00FF/);
    expect(fontFace).not.toMatch(/https?:|\/\//i);
    expect(css).toMatch(
      /font-family:\s*["']Open Sans["'],\s*Arial,\s*Helvetica,\s*sans-serif/,
    );
    expect(css).not.toMatch(
      /@import\s+url\(|fonts\.googleapis\.com|fonts\.gstatic\.com/i,
    );
  });

  it("provides a square, self-contained neutral SVG placeholder", () => {
    expect(placeholder).toMatch(/<svg\b[^>]*viewBox="0 0 400 400"/);
    expect(placeholder).toMatch(/<rect\b/);
    expect(placeholder).toMatch(/<circle\b/);
    expect(placeholder).toMatch(/<path\b/);
    expect(placeholder).not.toMatch(/<image\b|(?:xlink:)?href\s*=/i);
    expect(
      placeholder.replace('xmlns="http://www.w3.org/2000/svg"', ""),
    ).not.toMatch(/https?:/i);
  });
});

describe("T2/T10 global style contracts", () => {
  // These source contracts catch token/style drift by resolving the token
  // chains to their final values; they do not replace browser measurements,
  // computed-style, contrast, or responsive-layout verification.
  it("resolves the shared color and layout tokens to the approved global design values", () => {
    const expectedTokens = [
      ["--color-primary", "#0c7abf"],
      ["--color-ink", "#0f1419"],
      ["--color-surface", "#ffffff"],
      ["--color-page", "#eff3f8"],
      ["--color-border", "#cfd9de"],
      ["--color-link", "#075985"],
    ] as const;

    const design = readFileSync("docs/design.md", "utf8");

    for (const [name, value] of expectedTokens) {
      expect(design.toLowerCase()).toContain(value);
      // Resolution traverses the alias layers; a missing link in the chain
      // (or a cycle) throws instead of returning the raw declaration.
      expect(resolveToken(name, tokens)).toBe(value);
    }

    expect(resolveToken("--color-button", tokens)).toBe("#0c7abf");
    expect(tokens.base.get("--color-primary")).toBe(
      "var(--palette-action-blue)",
    );
    expect(tokens.base.get("--color-button")).toBe(
      "var(--palette-action-blue)",
    );
    expect(tokens.base.get("--palette-action-blue")).toBe("#0c7abf");
    expect(tokens.base.has("--palette-primary-blue")).toBe(false);
    expect(design.toLowerCase()).toContain(
      "primary accent / action background",
    );
    expect(design.toLowerCase()).not.toContain("#1d9bf0");

    // Every palette primitive must be referenced by at least one semantic
    // alias, so no primitive silently drifts out of the token system.
    for (const name of tokens.base.keys()) {
      if (name.startsWith("--palette-")) {
        const referenced = [...tokens.base.values()].some((value) =>
          value.includes(`var(${name})`),
        );

        expect(referenced, `orphan palette primitive ${name}`).toBe(true);
      }
    }

    expect(resolveToken("--content-width", tokens)).toBe("1120px");
    expect(resolveToken("--page-gutter", tokens)).toBe("16px");
    expect(
      resolveMediaToken("--page-gutter", "@media (min-width: 768px)", tokens),
    ).toBe("32px");
    expect(resolveToken("--control-transition-duration", tokens)).toBe("200ms");
  });

  it("registers design tokens with Tailwind via @theme inline and removes component selectors", () => {
    expect(css).toMatch(/@theme\s+inline\s*\{/);

    // Generated-namespace keys referenced by the new utility classes.
    const themeBlock = css.match(/@theme\s+inline\s*\{([^}]*)/s)?.[1] ?? "";

    for (const key of [
      "--color-surface",
      "--color-button",
      "--color-button-hover",
      "--color-button-active",
      "--color-ink",
      "--color-page",
      "--color-border",
      "--radius-card",
      "--radius-pill",
      "--text-24",
      "--text-32",
      "--text-display",
      "--text-card",
      "--leading-display",
      "--leading-card",
      "--tracking-display",
    ]) {
      expect(css).toContain(key);
    }

    // The raw motion token (`--duration-control: 200ms`) stays declared in
    // `:root`; the theme block only registers it in Tailwind's generated
    // `--transition-duration-*` namespace so the `duration-control` utility is
    // emitted. Re-declaring the raw `--duration-control:` token inside the
    // generated-namespace block must not happen.
    expect(themeBlock).not.toContain("--duration-control:");
    expect(themeBlock).toMatch(
      /--transition-duration-control\s*:\s*var\(--duration-control\)/,
    );

    // Component-specific selectors are no longer authored in global.css.
    for (const selector of [
      ".icon {",
      '[data-molecule="button"]',
      '[data-molecule="heading"]',
      ".profile-image",
      ".profile-intro",
      ".experience-card",
      ".experience-list",
      ".company-identity",
      ".company-icon",
      ".technology-list",
      ".technology-badge",
      ".floating-nav",
      ".detail-content",
      ".provisional-notice",
    ]) {
      expect(css, `global.css should not contain ${selector}`).not.toContain(
        selector,
      );
    }
  });

  it("defines the responsive container as a Tailwind @utility and preserves profile image geometry", async () => {
    const utility = css.match(/@utility\s+site-container\s*\{([^}]*)\}/s)?.[1];

    expect(utility).toBeDefined();
    expect(utility).toMatch(
      /min\(\s*var\(--content-width\)\s*,\s*calc\(\s*100%\s+-\s*2\s*\*\s*var\(--page-gutter\)\s*\)\s*\)/,
    );
    expect(resolveDeclaration(utility ?? "", "width", tokens)).toBe(
      "min(1120px, calc(100% - 2 * 16px))",
    );
    expect(resolveDeclaration(utility ?? "", "margin-inline", tokens)).toBe(
      "auto",
    );

    const homeHtml = await render(Home);
    const { document } = new JSDOM(homeHtml).window;
    const image = document.querySelector(".profile-image");
    const picture = document.querySelector("#inicio picture");

    expect(image).not.toBeNull();
    expect(image?.className).toMatch(/\baspect-square\b/);
    expect(image?.className).toMatch(/\brounded-card\b/);
    expect(image?.className).toMatch(/\bobject-contain\b/);
    expect(image?.className).toMatch(/\bbg-surface\b/);
    expect(image?.className).toMatch(/\bw-full\b/);
    expect(image?.hasAttribute("style")).toBe(false);

    // The <picture> wrapper is the flex item; it carries the sizing and
    // positioning classes (Astro forwards `class` to the inner <img>).
    expect(picture).not.toBeNull();
    expect(picture?.className).toMatch(/\bshrink-0\b/);
    expect(picture?.className).toMatch(/\bself-center\b/);
    expect(picture?.className).toMatch(/w-\[min\(200px,100%\)\]/);
    expect(picture?.className).toMatch(/md:w-\[240px\]/);

    // Desktop profile image width comes from its component token.
    expect(resolveToken("--profile-image-width-desktop", tokens)).toBe("240px");
  });

  it("keeps the floating navigator bounded, safe-area aware, and in sync with its utility indicator contract", () => {
    // Positioning/surface are now Tailwind utilities in the React component.
    expect(floatingNavSource).toContain("w-[min(360px,calc(100%-32px))]");
    expect(floatingNavSource).toContain("p-1");
    expect(floatingNavSource).toContain(
      "bottom-[calc(16px+env(safe-area-inset-bottom,0px))]",
    );
    expect(floatingNavSource).toContain("rounded-pill");
    // The navigator now paints the liquid-glass surface utility; the opaque
    // fallback lives inside that @utility (asserted in the glass test below).
    expect(floatingNavSource).toContain("nav-glass");

    // Indicator transition and transform states are utility-driven.
    expect(floatingNavSource).toContain("transition-transform");
    expect(floatingNavSource).toContain("duration-control");
    expect(floatingNavSource).toContain(
      "group-data-[active-index=0]:translate-x-0",
    );
    expect(floatingNavSource).toContain(
      "group-data-[active-index=1]:translate-x-full",
    );

    // Minimum tap target is preserved on links.
    expect(floatingNavSource).toContain("min-h-11");
    expect(floatingNavSource).toContain("min-w-0");

    // Button molecule geometry still resolves to the 44px minimum target.
    expect(resolveToken("--button-min-target", tokens)).toBe("44px");
    expect(css).toMatch(/scroll-snap-type:\s*y proximity/);
  });

  it("applies a subtle, fallback-safe liquid-glass surface to the floating navigator only", () => {
    // The frost is the opaque surface white at 70% alpha (within the approved
    // 0.55-0.85 subtlety range), not a new palette hue.
    expect(resolveToken("--nav-glass-surface", tokens)).toBe(
      "rgb(255 255 255 / 0.7)",
    );
    expect(resolveToken("--nav-glass-blur", tokens)).toBe("12px");
    // The opaque surface stays declared as the fallback source.
    expect(tokens.base.get("--nav-surface")).toBe("var(--color-surface)");

    // The blur is registered in Tailwind's --blur-* namespace.
    expect(css).toMatch(
      /@theme\s+inline\s*\{[\s\S]*?--blur-nav\s*:\s*var\(--nav-glass-blur\)/,
    );

    // One self-contained @utility owns the glass plus both opaque fallbacks.
    expect(css).toContain("@utility nav-glass");
    expect(css).toContain("backdrop-filter: blur(var(--nav-glass-blur))");
    expect(css).toMatch(/@supports not[\s\S]*?backdrop-filter/);
    expect(css).toContain("prefers-reduced-transparency: reduce");
    const opaqueFallbacks = css.match(
      /background-color:\s*var\(--nav-surface\)/g,
    );

    expect(opaqueFallbacks?.length ?? 0).toBeGreaterThanOrEqual(2);

    // No component selector leaked back into global.css.
    expect(css).not.toContain(".floating-nav");

    // Non-navigator surfaces keep their opaque values (no glass elsewhere).
    expect(resolveToken("--card-surface", tokens)).toBe("#ffffff");
    expect(resolveToken("--badge-surface", tokens)).toBe("#ffffff");
    expect(resolveToken("--button-secondary-background", tokens)).toBe(
      "#ffffff",
    );
    expect(resolveToken("--color-surface", tokens)).toBe("#ffffff");
    expect(resolveToken("--color-page", tokens)).toBe("#eff3f8");

    // docs/design.md documents the liquid-glass criteria and reconciliation.
    const design = readFileSync("docs/design.md", "utf8").toLowerCase();

    expect(design).toContain("liquid-glass");
    expect(design).toContain("translucent");
    expect(design).toContain("backdrop blur");
    expect(design).toContain("reduced transparency");
    expect(design).toContain("no gradients");
  });

  it("keeps homepage fragment navigation instant and suppresses the pre-position indicator transition", () => {
    const homePage = cssRule("html.home-page");

    // Regression guard: `scroll-behavior: smooth` on `html.home-page` leaked
    // into cross-document fragment navigation (e.g. returning from a detail
    // page to "/#trayectoria") and produced a visible load-time scroll
    // animation. The homepage rule must not declare `scroll-behavior` at all;
    // proximity snap is retained separately.
    expect(homePage).toMatch(/scroll-snap-type:\s*y proximity/);
    expect(homePage).not.toMatch(/scroll-behavior/);
    expect(css).not.toMatch(
      /html\.home-page[\s\S]{0,120}?scroll-behavior:\s*smooth/,
    );

    // The indicator must not animate before the navigator has measured and
    // painted the active section: `data-positioned` flips to "true" after the
    // first frame, and the transition is suppressed until then.
    expect(floatingNavSource).toContain(
      "group-data-[positioned=false]:transition-none",
    );
  });

  it("preserves the scroll inset, reduced-motion overrides and un-themed decorations", () => {
    expect(
      resolveDeclaration(cssRule("html"), "scroll-padding-block-start", tokens),
    ).toBe("16px");

    // Reduced motion still removes the indicator transition via the utility
    // variant and disables view-transition animation (`animation: none`); the
    // native cross-document `@view-transition { navigation: none }` trigger is
    // retired in favor of ClientRouter.
    expect(floatingNavSource).toContain("motion-reduce:transition-none");
    expect(css).not.toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?@view-transition[\s\S]*?navigation:\s*none/,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?::view-transition-[a-z-]+\(\*\)[\s\S]*?animation:\s*none/,
    );

    // The one-off decorative ink tint is intentionally kept literal in the
    // component source, so its value stays pinned here.
    expect(floatingNavSource).toContain("border-[rgb(15_20_25/8%)]");
    expect(floatingNavSource).toContain(
      "shadow-[0_4px_20px_rgb(15_20_25/14%)]",
    );
  });
});

describe("css-tokens resolution helper", () => {
  const synthetic: TokenMap = new Map([
    ["--palette-blue", "#1d9bf0"],
    ["--color-primary", "var(--palette-blue)"],
    ["--color-focus", "var(--color-primary)"],
    ["--shadow", "0 4px 20px var(--color-primary)"],
    ["--with-fallback", "var(--missing, 12px)"],
  ]);

  it("resolves multi-level alias chains to the underlying primitive value", () => {
    expect(resolveValue("var(--color-focus)", synthetic)).toBe("#1d9bf0");
    expect(resolveValue("var(--shadow)", synthetic)).toBe("0 4px 20px #1d9bf0");
  });

  it("throws a descriptive error on token cycles", () => {
    const cyclic: TokenMap = new Map([
      ["--a", "var(--b)"],
      ["--b", "var(--a)"],
    ]);

    expect(() => resolveValue("var(--a)", cyclic)).toThrow(/cycle/i);
  });

  it("throws on missing tokens without a fallback and honors fallbacks", () => {
    expect(() => resolveValue("var(--nope)", synthetic)).toThrow(
      /unresolved token/i,
    );
    expect(resolveValue("var(--with-fallback)", synthetic)).toBe("12px");
  });

  it("extracts media-query token overrides separately from base tokens", () => {
    const parsed = extractTokens(
      ":root { --a: 1px; --b: 2px; } @media (min-width: 768px) { :root { --b: 3px; } }",
    );

    expect(parsed.base.get("--a")).toBe("1px");
    expect(parsed.base.get("--b")).toBe("2px");
    expect(parsed.media.get("@media (min-width: 768px)")?.get("--b")).toBe(
      "3px",
    );
    expect(normalizeSpaces("1px   solid  blue")).toBe("1px solid blue");
  });
});
