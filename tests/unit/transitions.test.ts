import { getCollection, getEntry } from "astro:content";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceHistory from "../../src/components/home/ExperienceHistory.astro";
import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import {
  readStylesheetTokens,
  resolveDeclaration,
  resolveToken,
} from "../helpers/css-tokens";
import { render } from "../helpers/render";

const css = readFileSync("src/styles/global.css", "utf8");
const tokens = readStylesheetTokens("src/styles/global.css");
const fallbackCompanyIcon = {
  src: "/images/companies/astro.svg",
  alt: "Provisional company icon",
};

describe("native experience view transitions", () => {
  it("pairs each overview card with its complete matching detail card", async () => {
    const collectionEntries = await getCollection("experience");
    const experiences = collectionEntries.map((experience) => ({
      ...experience,
      data: {
        ...experience.data,
        // The transition contract is independent of the company-icon field.
        // Supply a local fallback for stale Container collection snapshots.
        companyIcon: experience.data.companyIcon ?? fallbackCompanyIcon,
      },
    }));
    const profile = await getEntry("profile", "profile");

    expect(profile).toBeDefined();
    if (!profile) return;

    const historyHtml = await render(ExperienceHistory, {
      experiences,
      profile: profile.data,
    });
    const { document: history } = new JSDOM(historyHtml).window;
    const overviewCards = Array.from(
      history.querySelectorAll<HTMLElement>(".experience-card"),
    );
    const transitionName = (element: HTMLElement | null) =>
      element
        ?.getAttribute("style")
        ?.match(/view-transition-name:\s*([^;]+)/)?.[1]
        ?.trim() ?? "";

    expect(overviewCards).toHaveLength(experiences.length);
    const overviewNames = overviewCards.map(transitionName);
    expect(overviewNames).toHaveLength(experiences.length);
    expect(overviewNames.every(Boolean)).toBe(true);
    expect(new Set(overviewNames).size).toBe(experiences.length);

    for (const experience of experiences) {
      const slug = experience.data.slug;
      const detailHtml = await render(ExperienceDetail, {
        experience,
        profile: profile.data,
      });
      const { document: detail } = new JSDOM(detailHtml).window;
      const overviewCard = overviewCards.find((element) =>
        element.querySelector(`a[href="/experiencia/${slug}/"]`),
      );
      const detailCard = detail.querySelector<HTMLElement>(
        "article.experience-detail-card",
      );
      const header = detail.querySelector<HTMLElement>(
        ".experience-detail-header",
      );
      const body = detail.querySelector<HTMLElement>(".experience-detail-body");
      const expectedName = `experience-${slug}`;

      expect(overviewCard).not.toBeNull();
      expect(transitionName(overviewCard)).toBe(expectedName);
      expect(detailCard?.getAttribute("data-experience-slug")).toBe(slug);
      expect(transitionName(detailCard)).toBe(expectedName);
      expect(header).not.toBeNull();
      expect(body).not.toBeNull();
      expect(detailCard?.contains(header)).toBe(true);
      expect(detailCard?.contains(body)).toBe(true);
      expect(header?.querySelector("h1")).not.toBeNull();
      expect(body?.querySelector(".technology-list")).not.toBeNull();
      expect(body?.querySelector(".detail-content")).not.toBeNull();
      expect(body?.querySelector(".provisional-notice")).not.toBeNull();
      expect(body?.querySelector('a[href="/#trayectoria"]')).not.toBeNull();
      const namedElements = Array.from(
        detail.querySelectorAll<HTMLElement>("[style*='view-transition-name']"),
      ).filter((element) => transitionName(element));
      expect(namedElements).toHaveLength(1);
      expect(namedElements[0]).toBe(detailCard);
      expect(transitionName(header)).toBe("");
    }
  });

  it("enables native MPA transitions and disables them for reduced motion", () => {
    expect(css).toMatch(/@view-transition\s*\{\s*navigation:\s*auto;\s*\}/);
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?@view-transition\s*\{\s*navigation:\s*none;\s*\}/,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?::view-transition-group\(\*\)[\s\S]*?animation:\s*none/,
    );
  });

  it("pins the native view-transition pseudo-elements to the 200 ms control duration", () => {
    // T6c: the UA ships ~250 ms; the global design requires 200 ms. The rule
    // must resolve through the shared motion token, not a hard-coded literal.
    const index = css.indexOf("::view-transition-group(*)");
    const open = css.indexOf("{", index);

    expect(index).toBeGreaterThanOrEqual(0);
    const selectorList = css.slice(index, open);
    expect(selectorList).toContain("::view-transition-old(*)");
    expect(selectorList).toContain("::view-transition-new(*)");

    const body = css.slice(open + 1, css.indexOf("}", open));
    expect(resolveDeclaration(body, "animation-duration", tokens)).toBe(
      "200ms",
    );
    expect(resolveToken("--duration-control", tokens)).toBe("200ms");
  });

  it("keeps the reduced-motion reset after the timing rule so it wins at equal specificity", () => {
    const durationIndex = css.indexOf("::view-transition-group(*)");
    const reducedMotionIndex = css.indexOf(
      "@media (prefers-reduced-motion: reduce)",
    );

    expect(durationIndex).toBeGreaterThanOrEqual(0);
    // The reset must come later in source order; with equal specificity the
    // later `animation: none` shorthand overrides the earlier duration.
    expect(reducedMotionIndex).toBeGreaterThan(durationIndex);

    const reducedBlock = css.slice(reducedMotionIndex);
    for (const pseudo of [
      "::view-transition-group(*)",
      "::view-transition-image-pair(*)",
      "::view-transition-old(*)",
      "::view-transition-new(*)",
    ]) {
      expect(reducedBlock).toContain(pseudo);
    }
    expect(reducedBlock).toMatch(/animation:\s*none/);
    expect(reducedBlock).not.toMatch(/animation-duration:\s*var\(--duration/);
  });

  it("keeps the card and return affordances as native same-tab anchors", async () => {
    const entries = await getCollection("experience");
    const experience = entries[0];
    const profile = await getEntry("profile", "profile");

    expect(experience).toBeDefined();
    expect(profile).toBeDefined();
    if (!experience || !profile) return;

    const entry = {
      ...experience,
      data: {
        ...experience.data,
        companyIcon: experience.data.companyIcon ?? fallbackCompanyIcon,
      },
    };
    const historyHtml = await render(ExperienceHistory, {
      experiences: [entry],
      profile: profile.data,
    });
    const detailHtml = await render(ExperienceDetail, {
      experience: entry,
      profile: profile.data,
    });
    const { document: history } = new JSDOM(historyHtml).window;
    const { document: detail } = new JSDOM(detailHtml).window;
    const cardLink = history.querySelector<HTMLAnchorElement>(
      `a[href="/experiencia/${entry.data.slug}/"]`,
    );
    const returnLink = detail.querySelector<HTMLAnchorElement>(
      'a[href="/#trayectoria"]',
    );

    expect(cardLink?.getAttribute("target")).toBeNull();
    expect(returnLink?.getAttribute("target")).toBeNull();
    expect(returnLink?.textContent?.trim()).toBe("Volver a la trayectoria");
  });
});
