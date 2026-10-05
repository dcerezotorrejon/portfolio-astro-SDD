import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceHistory from "../../src/components/ExperienceHistory.astro";
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

  it("applies one token-driven rule to the history heading and Markdown h2/h3, but not card titles", () => {
    const sharedRule = ruleBodyAfter(".section-heading");

    expect(resolveDeclaration(sharedRule, "margin-block-end", tokens)).toBe(
      "24px",
    );
    expect(resolveDeclaration(sharedRule, "color", tokens)).toBe("#0f1419");
    expect(resolveDeclaration(sharedRule, "font-size", tokens)).toBe("24px");
    expect(resolveDeclaration(sharedRule, "font-weight", tokens)).toBe("700");
    expect(resolveDeclaration(sharedRule, "line-height", tokens)).toBe("1.25");

    // The grouped selector covers the shared class and compiled Markdown
    // headings, and deliberately omits employment card titles.
    const selectorList = css.slice(
      css.indexOf(".section-heading"),
      css.indexOf("{", css.indexOf(".section-heading")),
    );

    expect(normalizeSpaces(selectorList)).toContain(
      ".section-heading, .detail-content h2, .detail-content h3",
    );
    expect(selectorList).not.toContain(".experience-card h3");
  });

  it("keeps employment card titles on their own smaller, distinct style", () => {
    const cardTitle = ruleBodyAfter(".experience-card h3");

    expect(resolveDeclaration(cardTitle, "margin", tokens)).toBe("0");
    expect(resolveDeclaration(cardTitle, "font-size", tokens)).toBe("1.25rem");
    expect(resolveDeclaration(cardTitle, "font-weight", tokens)).toBe("700");
    expect(resolveDeclaration(cardTitle, "line-height", tokens)).toBe("1.35");
    // 1.25rem (20px) is smaller than the 24px/32px shared heading scale.
    expect(cardTitle).not.toContain("--section-heading-size");
    expect(cardTitle).not.toContain("--section-heading-gap");
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

  it("marks the rendered history heading as the shared heading and excludes card h3", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;
    const historyHeading = document.querySelector("#history-heading");
    const cardHeading = document.querySelector(".experience-card h3");

    expect(historyHeading?.tagName).toBe("H2");
    expect(historyHeading?.classList.contains("section-heading")).toBe(true);
    expect(historyHeading?.matches(".section-heading")).toBe(true);
    expect(cardHeading).not.toBeNull();
    expect(cardHeading?.classList.contains("section-heading")).toBe(false);
    // Card titles live outside `.detail-content`, so the shared selector does
    // not reach them even though they are also `h3` elements.
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
