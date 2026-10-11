import { readFileSync } from "node:fs";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Button from "../../src/components/molecules/Button.astro";
import ProfileIntroduction from "../../src/components/home/ProfileIntroduction.astro";
import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import Home from "../../src/pages/index.astro";
import { readStylesheetTokens, resolveToken } from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");
const buttonSource = readFileSync(
  "src/components/molecules/Button.astro",
  "utf8",
);
const iconSource = readFileSync("src/components/atoms/Icon.astro", "utf8");
const floatingNavSource = readFileSync(
  "src/components/home/FloatingNav/FloatingNav.tsx",
  "utf8",
);

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

  it("maps white foreground and each component state background to a distinct token chain", async () => {
    const html = await render(Button, { variant: "primary", href: "/" });
    const { document } = new JSDOM(html).window;
    const primary = document.querySelector('[data-molecule="button"]');

    expect(primary).not.toBeNull();
    // The rendered primary button uses semantic utilities generated from the
    // same component tokens; no inline color overrides are present.
    expect(primary?.className).toMatch(/\bbg-button\b/);
    expect(primary?.className).toMatch(/\btext-surface\b/);
    expect(primary?.className).toMatch(/\bhover:bg-button-hover\b/);
    expect(primary?.className).toMatch(/\bactive:bg-button-active\b/);
    expect(primary?.hasAttribute("style")).toBe(false);

    // Token chains remain intact.
    expect(resolveToken("--button-background", tokens)).toBe("#0c7abf");
    expect(resolveToken("--button-background-hover", tokens)).toBe("#096aa7");
    expect(resolveToken("--button-background-active", tokens)).toBe("#075985");
    expect(resolveToken("--button-label", tokens)).toBe("#ffffff");
    expect(tokens.base.get("--button-background")).toBe("var(--color-button)");
    expect(tokens.base.get("--button-label")).toBe("var(--color-surface)");
    expect(token("--color-surface")).toBe("#ffffff");

    // The source encodes the same contracts.
    expect(buttonSource).toContain("bg-button");
    expect(buttonSource).toContain("text-surface");
    expect(buttonSource).toContain("hover:bg-button-hover");
    expect(buttonSource).toContain("active:bg-button-active");

    // Global CSS no longer selects on the molecule hook.
    expect(css).not.toContain('[data-molecule="button"]');
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
    // The icon default size and accent now live in Icon.astro's scoped style.
    const scopedStyle =
      iconSource.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

    expect(scopedStyle).toMatch(/@layer\s+components/);
    expect(scopedStyle).toMatch(/\.icon\s*\{/);
    expect(scopedStyle).toMatch(/color:\s*var\(--color-primary\)/);
    expect(resolveToken("--color-primary", tokens)).toBe("#0c7abf");

    const focusRule =
      css.match(
        /:where\(a,\s*button,\s*input,\s*select,\s*textarea\):focus-visible\s*\{([^}]*)\}/,
      )?.[1] ?? "";

    expect(focusRule).toMatch(/outline:\s*3px solid var\(--color-focus\)/);
    expect(focusRule).toMatch(/outline-offset:\s*3px/);
    expect(token("--color-focus")).toBe("#075985");
  });

  it("drives the floating navigator's indicator and active/inactive labels from the T11 tokens", () => {
    // Inactive labels stay dark ink on the white navigator surface.
    expect(resolveToken("--nav-link-text", tokens)).toBe("#0f1419");
    expect(tokens.base.get("--nav-link-text")).toBe("var(--color-ink)");

    // The active label is white and is selected purely by aria-current.
    expect(resolveToken("--nav-link-text-active", tokens)).toBe("#ffffff");
    expect(tokens.base.get("--nav-link-text-active")).toBe(
      "var(--color-surface)",
    );

    // T11: the indicator moved off the bright accent onto the action blue so
    // the white active label reaches >= 4.5:1 contrast.
    expect(resolveToken("--nav-indicator-background", tokens)).toBe("#0c7abf");
    expect(tokens.base.get("--nav-indicator-background")).toBe(
      "var(--color-button)",
    );

    // The TSX source encodes the navigator styling as Tailwind utilities.
    expect(floatingNavSource).toContain("bg-button");
    expect(floatingNavSource).toContain("text-ink");
    expect(floatingNavSource).toContain("aria-[current=location]:text-surface");
    expect(floatingNavSource).toContain("w-[min(360px,calc(100%-32px))]");
    expect(floatingNavSource).toContain(
      "bottom-[calc(16px+env(safe-area-inset-bottom,0px))]",
    );
    expect(floatingNavSource).toContain("border-[rgb(15_20_25/8%)]");
    expect(floatingNavSource).toContain(
      "shadow-[0_4px_20px_rgb(15_20_25/14%)]",
    );
    expect(floatingNavSource).toContain(
      "group-data-[active-index=0]:translate-x-0",
    );
    expect(floatingNavSource).toContain(
      "group-data-[active-index=1]:translate-x-full",
    );
    expect(floatingNavSource).toContain(
      "group-data-[positioned=false]:transition-none",
    );
    expect(floatingNavSource).toContain("motion-reduce:transition-none");
    expect(floatingNavSource).toContain("duration-control");

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

    // Technology badges are also styled via utilities now.
    expect(resolveToken("--badge-surface", tokens)).toBe("#ffffff");
    expect(resolveToken("--badge-text", tokens)).toBe("#0f1419");
    expect(token("--color-ink")).toBe("#0f1419");

    // Global CSS no longer carries component-specific navigator or badge selectors.
    expect(css).not.toContain(".floating-nav");
    expect(css).not.toContain(".technology-badge");
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
        className: "icon size-4 text-white",
        ariaHidden: "true",
        focusable: "false",
        href: "/icons/github.svg#icon",
      },
      {
        className: "icon size-4 text-white",
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
