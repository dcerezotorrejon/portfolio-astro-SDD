import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Heading from "../../src/components/molecules/Heading.astro";
import MoleculesFixture from "../fixtures/molecules-fixture.astro";
import {
  readStylesheetTokens,
  resolveMediaToken,
  resolveToken,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");
const headingSource = readFileSync(
  "src/components/molecules/Heading.astro",
  "utf8",
);

const BREAKPOINT = "@media (min-width: 768px)";

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

/** Extracts the declaration block of the first rule starting with `selector`. */
function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"));

  expect(rule, `expected CSS rule for ${selector}`).not.toBeNull();
  return rule?.[1] ?? "";
}

/** Returns the `type Props = { … }` object literal from a component source. */
function propsBlock(source: string): string {
  const match = source.match(/type Props = \{([\s\S]*?)\}/);

  expect(match, "expected a Props type in the component source").not.toBeNull();
  return match?.[1] ?? "";
}

describe("Heading molecule semantic level", () => {
  it("maps each level to the matching h1..h6 tag and data-level", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const mapping = [
      ["#fixture-heading-1", "H1", "1", "display"],
      ["#fixture-heading-2", "H2", "2", "section"],
      ["#fixture-heading-3", "H3", "3", "card"],
      ["#fixture-heading-4", "H4", "4", "card"],
      ["#fixture-heading-5", "H5", "5", "section"],
      ["#fixture-heading-6", "H6", "6", "display"],
    ] as const;

    for (const [selector, tag, level, variant] of mapping) {
      const heading = element(doc, selector);

      expect(heading.tagName).toBe(tag);
      expect(heading.getAttribute("data-molecule")).toBe("heading");
      expect(heading.getAttribute("data-level")).toBe(level);
      expect(heading.getAttribute("data-variant")).toBe(variant);
    }
  });

  it("renders the three visual variants independently of the semantic level", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const variants = Array.from(
      doc.querySelectorAll('[data-molecule="heading"]'),
      (node) => node.getAttribute("data-variant"),
    );

    expect(new Set(variants)).toEqual(new Set(["display", "section", "card"]));
    // The same variant is reused across different levels, proving the
    // semantic tag and the visual style are decoupled.
    expect(element(doc, "#fixture-heading-1").getAttribute("data-level")).toBe(
      "1",
    );
    expect(
      element(doc, "#fixture-heading-6").getAttribute("data-variant"),
    ).toBe("display");
    expect(
      element(doc, "#fixture-heading-3").getAttribute("data-variant"),
    ).toBe("card");
    expect(
      element(doc, "#fixture-heading-4").getAttribute("data-variant"),
    ).toBe("card");
  });

  it("forwards remaining attributes and merges a class", async () => {
    const doc = documentFrom(await render(MoleculesFixture));
    const first = element(doc, "#fixture-heading-1");

    expect(first.id).toBe("fixture-heading-1");
    expect(first.getAttribute("data-track")).toBe("heading");
    expect(first.classList.contains("fixture-extra")).toBe(true);
    // The hooks are not replaced by the forwarded class.
    expect(first.getAttribute("data-molecule")).toBe("heading");
    expect(first.getAttribute("data-variant")).toBe("display");
  });

  it("declares level and variant as required props (runtime omission is not meaningful in Astro)", () => {
    const props = propsBlock(headingSource);

    expect(headingSource).toMatch(/type Level = 1 \| 2 \| 3 \| 4 \| 5 \| 6;/);
    expect(props).toMatch(/level:\s*Level/);
    expect(props).not.toMatch(/level\?:/);
    expect(props).toMatch(
      /variant:\s*"display"\s*\|\s*"section"\s*\|\s*"card"/,
    );
    expect(props).not.toMatch(/variant\?:/);
  });

  it("stays a static Astro component with no client directive or script", () => {
    expect(headingSource).not.toMatch(/client:/);
    expect(headingSource).not.toMatch(/<script/);
  });

  it("renders only the content it receives, never hardcoded content", async () => {
    const root = element(
      documentFrom(await render(Heading, { level: 2, variant: "section" })),
      'h2[data-molecule="heading"]',
    );

    expect(root.textContent?.trim()).toBe("");
  });
});

describe("Heading molecule tokens", () => {
  it("resolves the display/section/card tokens to the delivered values", () => {
    expect(token("--heading-display-size")).toBe("clamp(2rem, 5vw, 2.75rem)");
    expect(token("--heading-display-weight")).toBe("700");
    expect(token("--heading-display-leading")).toBe("1.2");
    expect(token("--heading-display-tracking")).toBe("-0.025em");

    expect(token("--heading-section-size")).toBe("24px");
    expect(token("--heading-section-weight")).toBe("700");
    expect(token("--heading-section-leading")).toBe("1.25");
    expect(token("--heading-section-gap")).toBe("24px");
    expect(token("--heading-section-ink")).toBe("#0f1419");

    expect(token("--heading-card-size")).toBe("1.25rem");
    expect(token("--heading-card-weight")).toBe("700");
    expect(token("--heading-card-leading")).toBe("1.35");
  });

  it("raises the section heading to 32px from the 768px breakpoint onward", () => {
    expect(token("--heading-section-size")).toBe("24px");
    expect(
      resolveMediaToken("--heading-section-size", BREAKPOINT, tokens),
    ).toBe("32px");
  });

  it("keeps --section-heading-* as an alias of --heading-section-* with the approved values", () => {
    const aliases = [
      ["--section-heading-size", "--heading-section-size"],
      ["--section-heading-size-desktop", "--heading-section-size-desktop"],
      ["--section-heading-weight", "--heading-section-weight"],
      ["--section-heading-leading", "--heading-section-leading"],
      ["--section-heading-gap", "--heading-section-gap"],
      ["--section-heading-ink", "--heading-section-ink"],
    ] as const;

    for (const [alias, target] of aliases) {
      expect(tokens.base.get(alias)).toBe(`var(${target})`);
      expect(token(alias)).toBe(token(target));
    }

    expect(token("--section-heading-size")).toBe("24px");
    expect(token("--section-heading-size-desktop")).toBe("32px");
    expect(token("--section-heading-weight")).toBe("700");
    expect(token("--section-heading-leading")).toBe("1.25");
    expect(token("--section-heading-gap")).toBe("24px");
    expect(token("--section-heading-ink")).toBe("#0f1419");
    expect(
      resolveMediaToken("--section-heading-size", BREAKPOINT, tokens),
    ).toBe("32px");
  });

  it("drives each heading variant rule from the molecule hooks and heading tokens", () => {
    const display = cssRule(
      '[data-molecule="heading"][data-variant="display"]',
    );
    const section = cssRule(
      '[data-molecule="heading"][data-variant="section"]',
    );
    const card = cssRule('[data-molecule="heading"][data-variant="card"]');

    expect(display).toMatch(/font-size:\s*var\(--heading-display-size\)/);
    expect(display).toMatch(/font-weight:\s*var\(--heading-display-weight\)/);
    expect(display).toMatch(/line-height:\s*var\(--heading-display-leading\)/);
    expect(display).toMatch(
      /letter-spacing:\s*var\(--heading-display-tracking\)/,
    );

    expect(section).toMatch(/margin-block-end:\s*var\(--heading-section-gap\)/);
    expect(section).toMatch(/color:\s*var\(--heading-section-ink\)/);
    expect(section).toMatch(/font-size:\s*var\(--heading-section-size\)/);
    expect(section).toMatch(/font-weight:\s*var\(--heading-section-weight\)/);
    expect(section).toMatch(/line-height:\s*var\(--heading-section-leading\)/);

    expect(card).toMatch(/font-size:\s*var\(--heading-card-size\)/);
    expect(card).toMatch(/font-weight:\s*var\(--heading-card-weight\)/);
    expect(card).toMatch(/line-height:\s*var\(--heading-card-leading\)/);
  });
});
