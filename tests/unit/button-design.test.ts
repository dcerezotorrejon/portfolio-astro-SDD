import { readFileSync } from "node:fs";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ProfileIntroduction from "../../src/components/ProfileIntroduction.astro";
import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import Home from "../../src/pages/index.astro";
import {
  readStylesheetTokens,
  resolveDeclaration,
  resolveToken,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");

/** Public hook for the primary variant, replacing the removed `.button-link`. */
const PRIMARY_BUTTON = '[data-molecule="button"][data-variant="primary"]';

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = css.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "s"),
  );

  expect(rule, `expected CSS rule for ${selector}`).not.toBeNull();
  return rule?.[1] ?? "";
}

/** Resolves a token (through any alias depth) to its final value. */
function token(name: string): string {
  return resolveToken(name, tokens);
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255);
  const linear = [r, g, b].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground: string, background: string): number {
  const lightness = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );

  return (lightness[0] + 0.05) / (lightness[1] + 0.05);
}

describe("T9 primary-button color tokens", () => {
  it("defines one shared primary/action blue and preserves the distinct button states", () => {
    expect(token("--color-button")).toBe("#0c7abf");
    expect(token("--color-button-hover")).toBe("#096aa7");
    expect(token("--color-button-active")).toBe("#075985");
    expect(token("--color-primary")).toBe("#0c7abf");
    expect(tokens.base.get("--color-primary")).toBe(
      "var(--palette-action-blue)",
    );
    expect(tokens.base.get("--color-button")).toBe(
      "var(--palette-action-blue)",
    );
    expect(tokens.base.has("--palette-primary-blue")).toBe(false);
  });

  it("maps white foreground and each component state background to a distinct token chain", () => {
    // The button consumes component tokens; each must resolve through the
    // semantic layer to the approved primitive hex values.
    expect(cssRule(PRIMARY_BUTTON)).toMatch(
      /background:\s*var\(--button-background\)/,
    );
    expect(cssRule(PRIMARY_BUTTON)).toMatch(/color:\s*var\(--button-label\)/);
    expect(resolveToken("--button-background", tokens)).toBe("#0c7abf");
    expect(resolveToken("--button-background-hover", tokens)).toBe("#096aa7");
    expect(resolveToken("--button-background-active", tokens)).toBe("#075985");
    expect(resolveToken("--button-label", tokens)).toBe("#ffffff");
    // The component tokens stay aliased to the semantic roles, not hard-coded.
    expect(tokens.base.get("--button-background")).toBe("var(--color-button)");
    expect(tokens.base.get("--button-label")).toBe("var(--color-surface)");
    expect(cssRule(PRIMARY_BUTTON)).not.toMatch(/--color-ink/);
    expect(cssRule(`${PRIMARY_BUTTON}:hover`)).toMatch(
      /background:\s*var\(--button-background-hover\)/,
    );
    expect(cssRule(`${PRIMARY_BUTTON}:active`)).toMatch(
      /background:\s*var\(--button-background-active\)/,
    );
    // Hover/active must not reintroduce a dark label on the darker blue.
    for (const state of [
      `${PRIMARY_BUTTON}:hover`,
      `${PRIMARY_BUTTON}:active`,
    ]) {
      expect(cssRule(state)).not.toMatch(/color:/);
    }
    expect(token("--color-surface")).toBe("#ffffff");
  });

  it("gives white at least 4.5:1 contrast on normal, hover and active backgrounds", () => {
    const foreground = token("--color-surface");

    for (const background of [
      token("--color-button"),
      token("--color-button-hover"),
      token("--color-button-active"),
    ]) {
      const ratio = contrastRatio(foreground, background);

      expect(ratio, `white on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(foreground, token("--color-button"))).toBeCloseTo(
      4.61,
      1,
    );
  });

  it("keeps the default icon accent in the component layer and exposes visible keyboard focus", () => {
    const componentLayer = css.match(
      /@layer\s+components\s*\{([\s\S]*?)\n\}/,
    )?.[1];

    expect(componentLayer).toMatch(/\.icon\s*\{/);
    const icon = cssRule(".icon");
    expect(icon).toMatch(/width:\s*1rem/);
    expect(icon).toMatch(/height:\s*1rem/);
    expect(resolveDeclaration(icon, "color", tokens)).toBe("#0c7abf");

    const focus = cssRule(
      ":where(a, button, input, select, textarea):focus-visible",
    );
    expect(focus).toMatch(/outline:\s*3px solid var\(--color-focus\)/);
    expect(focus).toMatch(/outline-offset:\s*3px/);
    expect(token("--color-focus")).toBe("#075985");
  });

  it("drives the floating navigator's indicator and active/inactive labels from the T11 tokens", () => {
    // Inactive labels stay dark ink on the white navigator surface.
    expect(cssRule(".floating-nav-link")).toMatch(
      /color:\s*var\(--nav-link-text\)/,
    );
    expect(resolveToken("--nav-link-text", tokens)).toBe("#0f1419");
    // The active label is white and is selected purely by aria-current, so the
    // same current-section state that positions the slider also recolors it.
    const activeLink = cssRule('.floating-nav-link[aria-current="location"]');

    expect(activeLink).toMatch(/color:\s*var\(--nav-link-text-active\)/);
    expect(resolveToken("--nav-link-text-active", tokens)).toBe("#ffffff");
    expect(tokens.base.get("--nav-link-text-active")).toBe(
      "var(--color-surface)",
    );
    // T11: the indicator moved off the bright accent onto the action blue so
    // the white active label reaches >= 4.5:1 contrast.
    expect(cssRule(".floating-nav-indicator")).toMatch(
      /background:\s*var\(--nav-indicator-background\)/,
    );
    expect(resolveToken("--nav-indicator-background", tokens)).toBe("#0c7abf");
    expect(tokens.base.get("--nav-indicator-background")).toBe(
      "var(--color-button)",
    );

    // Both label states meet the AC7/AC12 4.5:1 minimum against their surface.
    expect(
      contrastRatio(
        resolveToken("--nav-link-text-active", tokens),
        resolveToken("--nav-indicator-background", tokens),
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(
        resolveToken("--nav-link-text", tokens),
        resolveToken("--nav-surface", tokens),
      ),
    ).toBeGreaterThanOrEqual(4.5);

    expect(cssRule(".technology-badge")).toMatch(
      /background:\s*var\(--badge-surface\)/,
    );
    expect(cssRule(".technology-badge")).toMatch(
      /color:\s*var\(--badge-text\)/,
    );
    expect(resolveToken("--badge-surface", tokens)).toBe("#ffffff");
    expect(resolveToken("--badge-text", tokens)).toBe("#0f1419");
    expect(token("--color-ink")).toBe("#0f1419");
  });
});

describe("T9 rendered primary actions", () => {
  it("renders social icons as white-utility external symbol references with decorative semantics", async () => {
    const profileEntry = await getEntry("profile", "profile");
    expect(profileEntry).toBeDefined();
    if (!profileEntry) throw new Error("profile entry missing");

    const html = await render(ProfileIntroduction, {
      profile: profileEntry.data,
    });
    const { document } = new JSDOM(html).window;
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        '.social-links [data-molecule="button"]',
      ),
    );

    expect(links).toHaveLength(2);
    expect(
      links.map((link) => {
        const icon = link.querySelector("svg");
        return {
          className: icon?.getAttribute("class"),
          ariaHidden: icon?.getAttribute("aria-hidden"),
          focusable: icon?.getAttribute("focusable"),
          href: icon?.querySelector("use")?.getAttribute("href"),
        };
      }),
    ).toEqual([
      {
        className: "icon text-white",
        ariaHidden: "true",
        focusable: "false",
        href: "/icons/github.svg#icon",
      },
      {
        className: "icon text-white",
        ariaHidden: "true",
        focusable: "false",
        href: "/icons/linkedin.svg#icon",
      },
    ]);
    // No inline color overrides on the rendered buttons.
    expect(links.every((link) => !link.hasAttribute("style"))).toBe(true);
  });

  it("uses the same button molecule across home actions and detail return links", async () => {
    const homeHtml = await render(Home);
    const homeLinks = Array.from(
      new JSDOM(homeHtml).window.document.querySelectorAll(
        '[data-molecule="button"]',
      ),
    );

    expect(homeLinks.length).toBeGreaterThanOrEqual(3);
    expect(homeLinks.every((link) => !link.hasAttribute("style"))).toBe(true);

    const experiences = await getCollection("experience");
    const profileEntry = await getEntry("profile", "profile");
    if (!profileEntry) throw new Error("profile entry missing");

    for (const experience of experiences) {
      const html = await render(ExperienceDetail, {
        experience,
        profile: profileEntry.data,
      });
      const { document } = new JSDOM(html).window;
      const returnLinks = Array.from(
        document.querySelectorAll<HTMLAnchorElement>(
          '[data-molecule="button"]',
        ),
      );

      expect(returnLinks).toHaveLength(1);
      expect(returnLinks[0]?.getAttribute("href")).toBe("/#trayectoria");
      // The rendered markup carries no hardcoded colors or portfolio data.
      expect(returnLinks[0]?.hasAttribute("style")).toBe(false);
      expect(returnLinks[0]?.querySelector("svg")).toBeNull();
    }
  });
});
