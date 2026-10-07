import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceHistory from "../../src/components/home/ExperienceHistory.astro";
import Home from "../../src/pages/index.astro";
import HeadingFixture from "../fixtures/heading-fixture.astro";
import {
  readStylesheetTokens,
  resolveDeclaration,
  resolveMediaToken,
  resolveToken,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const detailPageSource = readFileSync(
  "src/pages/experiencia/[slug].astro",
  "utf8",
);
const tokens = readStylesheetTokens("src/styles/global.css");

const SHARED_HEADING_TOKENS = [
  "--heading-section-gap",
  "--heading-section-ink",
  "--heading-section-size",
  "--heading-section-weight",
  "--heading-section-leading",
] as const;

/** Returns the element or throws, so tests never rely on non-null assertions. */
function element(doc: Document, selector: string): HTMLElement {
  const found = doc.querySelector<HTMLElement>(selector);

  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
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

  it("applies the token-driven section utilities to the rendered heading and Markdown h2/h3, but not card titles", async () => {
    const homeHtml = await render(Home);
    const { document } = new JSDOM(homeHtml).window;
    const sectionHeading = element(document, "#history-heading");

    // The Markdown descendant rule now lives in the detail page's scoped style.
    const markdownRule =
      detailPageSource.match(
        /\.detail-content h2,\s*\.detail-content h3\s*\{([^}]*)\}/s,
      )?.[1] ?? "";

    expect(markdownRule).not.toBe("");

    // Rendered section heading carries the responsive token-backed utilities.
    expect(sectionHeading.className).toMatch(/\btext-24\b/);
    expect(sectionHeading.className).toMatch(/\bmd:text-32\b/);
    expect(sectionHeading.className).toMatch(/\btext-ink\b/);
    expect(sectionHeading.className).toMatch(/\bfont-bold\b/);
    expect(sectionHeading.className).toMatch(/\bleading-tight\b/);
    expect(sectionHeading.className).toMatch(/\bmb-6\b/);
    expect(sectionHeading.hasAttribute("style")).toBe(false);

    // The retained Markdown descendant rule still consumes the same tokens.
    expect(resolveDeclaration(markdownRule, "margin-block-end", tokens)).toBe(
      "24px",
    );
    expect(resolveDeclaration(markdownRule, "color", tokens)).toBe("#0f1419");
    expect(resolveDeclaration(markdownRule, "font-size", tokens)).toBe("24px");
    expect(resolveDeclaration(markdownRule, "font-weight", tokens)).toBe("700");
    expect(resolveDeclaration(markdownRule, "line-height", tokens)).toBe(
      "1.25",
    );

    for (const name of SHARED_HEADING_TOKENS) {
      expect(markdownRule).toContain(`var(${name})`);
    }

    // The retained grouped selector covers compiled Markdown headings and
    // deliberately omits employment card titles.
    expect(detailPageSource).toMatch(
      /\.detail-content h2,\s*\.detail-content h3\s*\{/,
    );
    expect(detailPageSource).not.toMatch(/\.experience-card h3\s*\{/);

    // Global CSS no longer carries component-specific heading or card selectors.
    expect(css).not.toContain('[data-molecule="heading"]');
    expect(css).not.toContain(".experience-card {");
  });

  it("keeps employment card titles on their own smaller, distinct utility style", async () => {
    const homeHtml = await render(Home);
    const { document } = new JSDOM(homeHtml).window;
    const cardHeading = element(document, ".experience-card h3");

    expect(cardHeading.className).toMatch(/\btext-card\b/);
    expect(cardHeading.className).toMatch(/\bfont-bold\b/);
    expect(cardHeading.className).toMatch(/\bleading-card\b/);
    expect(cardHeading.className).not.toMatch(/\btext-24\b/);
    expect(cardHeading.className).not.toMatch(/\bmd:text-32\b/);
    expect(cardHeading.className).not.toMatch(/\bmb-6\b/);
    expect(cardHeading.hasAttribute("style")).toBe(false);

    // Token values: card is 1.25rem (20px), smaller than 24px/32px section scale.
    expect(resolveToken("--heading-card-size", tokens)).toBe("1.25rem");
    expect(resolveToken("--heading-section-size", tokens)).toBe("24px");
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
