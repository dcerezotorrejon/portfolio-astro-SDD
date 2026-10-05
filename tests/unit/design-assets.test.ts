import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");
const font = readFileSync("public/fonts/open-sans-latin.woff2");
const license = readFileSync("public/fonts/OFL.txt", "utf8");
const placeholder = readFileSync(
  "public/images/profile-placeholder.svg",
  "utf8",
);
const design = readFileSync("docs/design.md", "utf8");

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = css.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "s"),
  );

  expect(rule, `expected CSS rule for ${selector}`).not.toBeNull();
  return rule?.[1] ?? "";
}

describe("T2 local design assets", () => {
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

  it("declares a local, non-blocking Open Sans variable face with Spanish Latin coverage", () => {
    const fontFace = css.match(/@font-face\s*\{([^}]*)\}/s)?.[1] ?? "";

    expect(fontFace).not.toBe("");
    expect(fontFace).toMatch(/font-family:\s*["']Open Sans["']/);
    expect(fontFace).toMatch(/font-weight:\s*400\s+700/);
    expect(fontFace).toMatch(/font-display:\s*swap/);
    expect(fontFace).toMatch(
      /src:\s*url\(["']?\/fonts\/open-sans-latin\.woff2["']?\)\s*format\(["']woff2["']\)/,
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
      ["--color-primary", "#1d9bf0"],
      ["--color-ink", "#0f1419"],
      ["--color-surface", "#ffffff"],
      ["--color-page", "#eff3f8"],
      ["--color-border", "#cfd9de"],
      ["--color-link", "#075985"],
    ] as const;

    for (const [name, value] of expectedTokens) {
      expect(design.toLowerCase()).toContain(value);
      // Resolution traverses the alias layers; a missing link in the chain
      // (or a cycle) throws instead of returning the raw declaration.
      expect(resolveToken(name, tokens)).toBe(value);
    }

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

  it("defines the responsive container and profile image geometry", () => {
    const container = cssRule(".site-container");
    const profileImage = cssRule(".profile-image");

    expect(resolveDeclaration(container, "width", tokens)).toBe(
      "min(1120px, calc(100% - 2 * 16px))",
    );
    expect(resolveDeclaration(container, "margin-inline", tokens)).toBe("auto");
    expect(resolveDeclaration(profileImage, "width", tokens)).toBe(
      "min(200px, 100%)",
    );
    expect(resolveDeclaration(profileImage, "aspect-ratio", tokens)).toBe("1");
    expect(resolveDeclaration(profileImage, "border-radius", tokens)).toBe(
      "24px",
    );
    // Desktop profile image width comes from its component token.
    expect(resolveToken("--profile-image-width-desktop", tokens)).toBe("240px");
  });

  it("keeps the floating navigator bounded, safe-area aware, and in sync with its CSS indicator contract", () => {
    const nav = cssRule(".floating-nav");
    const indicator = cssRule(".floating-nav-indicator");

    expect(resolveDeclaration(nav, "width", tokens)).toBe(
      "min(360px, calc(100% - 2 * 16px))",
    );
    expect(resolveDeclaration(nav, "padding", tokens)).toBe("4px");
    expect(resolveDeclaration(nav, "bottom", tokens)).toBe(
      "calc(16px + env(safe-area-inset-bottom, 0px))",
    );
    expect(resolveDeclaration(indicator, "transition", tokens)).toBe(
      "transform 200ms ease",
    );
    expect(
      resolveDeclaration(cssRule(".floating-nav-link"), "min-height", tokens),
    ).toBe("44px");
    expect(
      resolveDeclaration(cssRule(".button-link"), "min-width", tokens),
    ).toBe("44px");
    expect(
      resolveDeclaration(cssRule(".button-link"), "min-height", tokens),
    ).toBe("44px");
    expect(
      cssRule('.floating-nav[data-active-index="0"] .floating-nav-indicator'),
    ).toMatch(/translateX\(0\)/);
    expect(
      cssRule('.floating-nav[data-active-index="1"] .floating-nav-indicator'),
    ).toMatch(/translateX\(100%\)/);
    expect(cssRule("html.home-page")).toMatch(
      /scroll-snap-type:\s*y proximity/,
    );
  });

  it("preserves the scroll inset, reduced-motion overrides and un-themed decorations", () => {
    expect(
      resolveDeclaration(cssRule("html"), "scroll-padding-block-start", tokens),
    ).toBe("16px");
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?scroll-behavior:\s*auto/,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.floating-nav-indicator,[\s\S]*?transition:\s*none/,
    );
    // The one-off decorative ink tint is intentionally kept literal in both
    // refactors, so its value stays pinned here.
    expect(cssRule(".floating-nav")).toMatch(
      /border:\s*1px solid rgb\(15 20 25 \/ 8%\)/,
    );
    expect(cssRule(".floating-nav")).toMatch(
      /box-shadow:\s*0 4px 20px rgb\(15 20 25 \/ 14%\)/,
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
