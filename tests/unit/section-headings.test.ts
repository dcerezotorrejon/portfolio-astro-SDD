import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceHistory from "../../src/components/home/ExperienceHistory.astro";
import Home from "../../src/pages/index.astro";
import HeadingFixture from "../fixtures/heading-fixture.astro";
import {
  normalizeSpaces,
  readStylesheetTokens,
  resolveDeclaration,
  resolveMediaToken,
  resolveToken,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");

// Public molecule hooks replacing the removed `.section-heading` and
// `.experience-card h3` class selectors. Compiled Markdown keeps its own rule.
const SECTION_RULE = '[data-molecule="heading"][data-variant="section"]';
const CARD_RULE = '[data-molecule="heading"][data-variant="card"]';
const DISPLAY_RULE = '[data-molecule="heading"][data-variant="display"]';
const MARKDOWN_RULE = ".detail-content h2";
const SHARED_HEADING_TOKENS = [
  "--heading-section-gap",
  "--heading-section-ink",
  "--heading-section-size",
  "--heading-section-weight",
  "--heading-section-leading",
] as const;

/** Captures the declaration block of the first rule starting with `selector`. */
function ruleBodyAfter(selector: string): string {
  const index = css.indexOf(selector);

  expect(index, `expected selector ${selector}`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", index);
  const close = css.indexOf("}", open);

  return css.slice(open + 1, close);
}

describe("T12 shared section-heading hierarchy", () => {
  it("resolves the shared section-heading tokens to the approved design values", () => {
    expect(resolveToken("--section-heading-size", tokens)).toBe("24px");
    expect(resolveToken("--section-heading-size-desktop", tokens)).toBe("32px");
    expect(resolveToken("--section-heading-weight", tokens)).toBe("700");
    expect(resolveToken("--section-heading-leading", tokens)).toBe("1.25");
    expect(resolveToken("--section-heading-gap", tokens)).toBe("24px");
    expect(resolveToken("--section-heading-ink", tokens)).toBe("#0f1419");
  });

  it("raises the shared heading size to 32px from the 768px breakpoint onward", () => {
    expect(
      resolveMediaToken(
        "--section-heading-size",
        "@media (min-width: 768px)",
        tokens,
      ),
    ).toBe("32px");
    // Below the breakpoint the base token stays 24px (already asserted above).
  });

  it("applies one token-driven style to the section variant and Markdown h2/h3, but not card titles", () => {
    const sectionRule = ruleBodyAfter(SECTION_RULE);
    const markdownRule = ruleBodyAfter(MARKDOWN_RULE);

    for (const rule of [sectionRule, markdownRule]) {
      expect(resolveDeclaration(rule, "margin-block-end", tokens)).toBe("24px");
      expect(resolveDeclaration(rule, "color", tokens)).toBe("#0f1419");
      expect(resolveDeclaration(rule, "font-size", tokens)).toBe("24px");
      expect(resolveDeclaration(rule, "font-weight", tokens)).toBe("700");
      expect(resolveDeclaration(rule, "line-height", tokens)).toBe("1.25");
    }

    // Both the component section variant and the retained Markdown rule consume
    // the exact same --heading-section-* component tokens, so they cannot drift.
    for (const name of SHARED_HEADING_TOKENS) {
      expect(sectionRule).toContain(`var(${name})`);
      expect(markdownRule).toContain(`var(${name})`);
    }

    // The retained grouped selector covers compiled Markdown headings and
    // deliberately omits employment card titles.
    const markdownSelectorList = css.slice(
      css.indexOf(MARKDOWN_RULE),
      css.indexOf("{", css.indexOf(MARKDOWN_RULE)),
    );

    expect(normalizeSpaces(markdownSelectorList)).toContain(
      ".detail-content h2, .detail-content h3",
    );
    expect(markdownSelectorList).not.toContain(".experience-card h3");

    // A dedicated display heading rule still exists for the h1 normalization.
    expect(ruleBodyAfter(DISPLAY_RULE)).toMatch(
      /font-size:\s*var\(--heading-display-size\)/,
    );
  });

  it("keeps employment card titles on their own smaller, distinct style", () => {
    const cardTitle = ruleBodyAfter(CARD_RULE);

    expect(resolveDeclaration(cardTitle, "margin", tokens)).toBe("0");
    expect(resolveDeclaration(cardTitle, "font-size", tokens)).toBe("1.25rem");
    expect(resolveDeclaration(cardTitle, "font-weight", tokens)).toBe("700");
    expect(resolveDeclaration(cardTitle, "line-height", tokens)).toBe("1.35");
    // 1.25rem (20px) is smaller than the 24px/32px shared heading scale.
    expect(cardTitle).not.toContain("--heading-section-size");
    expect(cardTitle).not.toContain("--heading-section-gap");
  });

  it("renders genuine compiled Markdown h2/h3 inside .detail-content", async () => {
    const html = await render(HeadingFixture);
    const { document } = new JSDOM(html).window;
    const h2 = document.querySelector(".detail-content h2");
    const h3 = document.querySelector(".detail-content h3");

    expect(h2).not.toBeNull();
    expect(h3).not.toBeNull();
    expect(h2?.textContent?.trim()).toBe("Sección de ejemplo");
    expect(h3?.textContent?.trim()).toBe("Subsección de ejemplo");
    expect(h2?.matches(".detail-content h2")).toBe(true);
    expect(h3?.matches(".detail-content h3")).toBe(true);
  });

  it("marks the rendered history heading as the section variant and excludes card h3", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;
    const historyHeading = document.querySelector("#history-heading");
    const cardHeading = document.querySelector(".experience-card h3");

    expect(historyHeading?.tagName).toBe("H2");
    expect(historyHeading?.getAttribute("data-molecule")).toBe("heading");
    expect(historyHeading?.getAttribute("data-variant")).toBe("section");
    expect(cardHeading).not.toBeNull();
    expect(cardHeading?.getAttribute("data-molecule")).toBe("heading");
    expect(cardHeading?.getAttribute("data-variant")).toBe("card");
    // Card titles live outside `.detail-content`, so the retained shared
    // selector does not reach them even though they are also `h3` elements.
    expect(cardHeading?.closest(".detail-content")).toBeNull();
    expect(cardHeading?.matches(".detail-content h3")).toBe(false);
  });

  it("keeps a single h1 and the h2/h3 order in the ExperienceHistory component", async () => {
    const html = await render(ExperienceHistory, {
      experiences: [],
      profile: {
        historyHeading: "Trayectoria profesional",
      },
    });
    const { document } = new JSDOM(html).window;
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"));

    expect(document.querySelectorAll("h1")).toHaveLength(0);
    expect(headings.map((heading) => heading.tagName)).toEqual(["H2"]);
    expect(
      document.querySelector("#history-heading")?.textContent?.trim(),
    ).toBe("Trayectoria profesional");
  });
});
