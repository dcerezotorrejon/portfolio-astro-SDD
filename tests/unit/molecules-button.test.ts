import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Button from "../../src/components/molecules/Button.astro";
import MoleculesFixture from "../fixtures/molecules-fixture.astro";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { readStylesheetTokens, resolveToken } from "../helpers/css-tokens";
import { render } from "../helpers/render";

const tokens = readStylesheetTokens("src/styles/global.css");
const buttonSource = readFileSync(
  "src/components/molecules/Button.astro",
  "utf8",
);
const globalCss = readFileSync("src/styles/global.css", "utf8");

function documentFrom(html: string): Document {
  return new JSDOM(html).window.document;
}

/** Returns the element or throws, so tests never rely on non-null assertions. */
function element(doc: Document, selector: string): HTMLElement {
  const found = doc.querySelector<HTMLElement>(selector);

  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

/** Resolves a token (through any alias depth) to its final value. */
function token(name: string): string {
  return resolveToken(name, tokens);
}

/** Returns the `type Props = { … }` object literal from a component source. */
function propsBlock(source: string): string {
  const match = source.match(/type Props = \{([\s\S]*?)\}/);

  expect(match, "expected a Props type in the component source").not.toBeNull();
  return match?.[1] ?? "";
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

describe("Button molecule root selection", () => {
  it("renders an <a href> when href is set and a <button> otherwise", async () => {
    const doc = documentFrom(await render(MoleculesFixture));

    const primaryLink = element(doc, "#fixture-primary-link");
    const secondaryLink = element(doc, "#fixture-secondary-link");
    const primaryButton = element(doc, "#fixture-primary-button");
    const secondaryButton = element(doc, "#fixture-secondary-button");

    expect(primaryLink.tagName).toBe("A");
    expect(primaryLink.getAttribute("href")).toBe("/");
    expect(secondaryLink.tagName).toBe("A");
    expect(secondaryLink.getAttribute("href")).toBe("https://example.com/");
    expect(primaryButton.tagName).toBe("BUTTON");
    expect(secondaryButton.tagName).toBe("BUTTON");
  });

  it("emits type/disabled only on the <button> root, with type overridable", async () => {
    const doc = documentFrom(await render(MoleculesFixture));

    const primaryLink = element(doc, "#fixture-primary-link");
    const primaryButton = element(doc, "#fixture-primary-button");
    const submitButton = element(doc, "#fixture-submit-button");

    // Default and overridable `type`.
    expect(primaryButton.getAttribute("type")).toBe("button");
    expect(submitButton.getAttribute("type")).toBe("submit");
    expect(submitButton.hasAttribute("disabled")).toBe(true);

    // Button-only attributes never leak onto the anchor root.
    expect(primaryLink.hasAttribute("type")).toBe(false);
    expect(primaryLink.hasAttribute("disabled")).toBe(false);
  });

  it("never emits type/disabled on an <a> even when they are passed in", async () => {
    // Simulates an accidental props leak: the component destructures `type` and
    // `disabled` and must drop them for the anchor root.
    const html = await render(Button, {
      variant: "primary",
      href: "/",
      type: "submit",
      disabled: true,
      id: "anchor-with-button-attrs",
    });
    const anchor = element(documentFrom(html), "a");

    expect(anchor.getAttribute("href")).toBe("/");
    expect(anchor.hasAttribute("type")).toBe(false);
    expect(anchor.hasAttribute("disabled")).toBe(false);
  });

  it("renders both variants and never both elements", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const primary = doc.querySelectorAll(
      '[data-molecule="button"][data-variant="primary"]',
    );
    const secondary = doc.querySelectorAll(
      '[data-molecule="button"][data-variant="secondary"]',
    );

    expect(primary.length).toBeGreaterThanOrEqual(2);
    expect(secondary.length).toBeGreaterThanOrEqual(2);
    // Every secondary variant is exactly one root element.
    for (const node of Array.from(secondary)) {
      expect(node.children).toHaveLength(0);
    }
  });
});

describe("Button molecule hooks and forwarding", () => {
  it("exposes the molecule hooks and forwards remaining attributes", async () => {
    const doc = documentFrom(await render(MoleculesFixture));

    const link = element(doc, "#fixture-primary-link");
    expect(link.getAttribute("data-molecule")).toBe("button");
    expect(link.getAttribute("data-variant")).toBe("primary");
    expect(link.id).toBe("fixture-primary-link");
    expect(link.getAttribute("data-track")).toBe("link");

    const secondaryLink = element(doc, "#fixture-secondary-link");
    expect(secondaryLink.getAttribute("data-molecule")).toBe("button");
    expect(secondaryLink.getAttribute("data-variant")).toBe("secondary");
    expect(secondaryLink.getAttribute("aria-label")).toBe("Secondary link");
    expect(secondaryLink.getAttribute("rel")).toBe("noopener");
    expect(secondaryLink.getAttribute("target")).toBe("_blank");
  });

  it("merges a forwarded class with the component hooks", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const link = element(doc, "#fixture-primary-link");

    expect(link.classList.contains("fixture-extra")).toBe(true);
    // The hooks are not replaced by the forwarded class.
    expect(link.getAttribute("data-molecule")).toBe("button");
    expect(link.getAttribute("data-variant")).toBe("primary");
  });

  it("declares variant as a required prop (runtime omission is not meaningful in Astro)", () => {
    const props = propsBlock(buttonSource);

    expect(props).toMatch(/variant:\s*"primary"\s*\|\s*"secondary"/);
    expect(props).not.toMatch(/variant\?:/);
    // `href`, `class` and `disabled` stay optional.
    expect(props).toMatch(/href\?:/);
    expect(props).toMatch(/class\?:/);
  });

  it("stays a static Astro component with no client directive or script", () => {
    expect(buttonSource).not.toMatch(/client:/);
    expect(buttonSource).not.toMatch(/<script/);
  });

  it("renders only the content it receives, never hardcoded content", async () => {
    const root = element(
      documentFrom(await render(Button, { variant: "primary" })),
      '[data-molecule="button"]',
    );

    expect(root.textContent?.trim()).toBe("");
  });
});

describe("Button secondary tokens and contrast", () => {
  it("resolves --button-secondary-* through the semantic token layer", () => {
    expect(tokens.base.get("--button-secondary-background")).toBe(
      "var(--color-surface)",
    );
    expect(tokens.base.get("--button-secondary-background-hover")).toBe(
      "var(--color-page)",
    );
    expect(tokens.base.get("--button-secondary-background-active")).toBe(
      "var(--color-border)",
    );
    expect(tokens.base.get("--button-secondary-label")).toBe(
      "var(--color-ink)",
    );
    expect(tokens.base.get("--button-secondary-border")).toBe(
      "var(--color-border)",
    );

    expect(token("--button-secondary-background")).toBe("#ffffff");
    expect(token("--button-secondary-background-hover")).toBe("#eff3f8");
    expect(token("--button-secondary-background-active")).toBe("#cfd9de");
    expect(token("--button-secondary-label")).toBe("#0f1419");
    expect(token("--button-secondary-border")).toBe("#cfd9de");
  });

  it("drives the variant rules from utility classes on the rendered markup", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const primary = element(doc, "#fixture-primary-link");
    const secondary = element(doc, "#fixture-secondary-link");

    // Base geometry and motion are shared across variants.
    expect(primary.className).toMatch(/\binline-flex\b/);
    expect(primary.className).toMatch(/\bmin-h-11\b/);
    expect(primary.className).toMatch(/\bmin-w-11\b/);
    expect(primary.className).toMatch(/\brounded-pill\b/);
    expect(primary.className).toMatch(/\bduration-control\b/);
    expect(primary.classList.contains("duration-control")).toBe(true);
    expect(primary.classList.contains("motion-reduce:transition-none")).toBe(
      true,
    );

    // Primary: action surface with stateful backgrounds.
    expect(primary.className).toMatch(/\bbg-button\b/);
    expect(primary.className).toMatch(/\btext-surface\b/);
    expect(primary.className).toMatch(/\bhover:bg-button-hover\b/);
    expect(primary.className).toMatch(/\bactive:bg-button-active\b/);

    // Secondary: outline surface with stateful backgrounds.
    expect(secondary.className).toMatch(/\bborder\b/);
    expect(secondary.className).toMatch(/\bborder-border\b/);
    expect(secondary.className).toMatch(/\bbg-surface\b/);
    expect(secondary.className).toMatch(/\btext-ink\b/);
    expect(secondary.className).toMatch(/\bhover:bg-page\b/);
    expect(secondary.className).toMatch(/\bactive:bg-border\b/);

    // No inline color overrides leak onto the rendered buttons.
    expect(primary.hasAttribute("style")).toBe(false);
    expect(secondary.hasAttribute("style")).toBe(false);

    // The source encodes the same contracts as a single source of truth.
    expect(buttonSource).toContain("bg-button");
    expect(buttonSource).toContain("text-surface");
    expect(buttonSource).toContain("hover:bg-button-hover");
    expect(buttonSource).toContain("active:bg-button-active");
    expect(buttonSource).toContain("border-border");
    expect(buttonSource).toContain("bg-surface");
    expect(buttonSource).toContain("text-ink");
    expect(buttonSource).toContain("hover:bg-page");
    expect(buttonSource).toContain("active:bg-border");

    // Global CSS no longer carries component-specific attribute selectors.
    expect(globalCss).not.toContain('[data-molecule="button"]');
  });

  it("keeps the secondary label at >= 4.5:1 in normal, hover and pressed states", () => {
    const label = token("--button-secondary-label");

    for (const state of [
      "--button-secondary-background",
      "--button-secondary-background-hover",
      "--button-secondary-background-active",
    ]) {
      const ratio = contrastRatio(label, token(state));

      expect(ratio, `${label} on ${state}`).toBeGreaterThanOrEqual(4.5);
    }

    // Dark ink on the white surface is comfortably above AA.
    expect(
      contrastRatio(label, token("--button-secondary-background")),
    ).toBeGreaterThan(10);
  });
});

describe("Button molecule accessibility", () => {
  it("has no axe violations in the isolated fixture, covering the page-unused secondary variant", async () => {
    const html = await render(MoleculesFixture);
    const page = `<!doctype html><html lang="en"><head><title>Molecules fixture</title></head><body><main>${html}</main></body></html>`;
    const results = await runAxeOnHtml(page);

    expect(results.violations, formatViolations(results)).toEqual([]);
  });
});
