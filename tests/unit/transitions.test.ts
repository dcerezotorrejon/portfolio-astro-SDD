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
const experienceHistorySource = readFileSync(
  "src/components/home/ExperienceHistory.astro",
  "utf8",
);
const experienceDetailSource = readFileSync(
  "src/pages/experiencia/[slug].astro",
  "utf8",
);
const fallbackCompanyIcon = {
  src: "/images/companies/astro.svg",
  alt: "Provisional company icon",
};

describe("native experience view transitions", () => {
  it("pairs each overview card with its matching detail card through a per-slug transition name", async () => {
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

    // AC1 source contract: both cards declare the same per-slug transition
    // name, so the overview card and its matching detail card share a unique
    // view-transition-name once the directive is compiled.
    const directivePattern = /transition:name=\{`([^`]+)`\}/;
    const expectedExpression = "experience-transition-${slug}";
    const historyMatch = experienceHistorySource.match(directivePattern);
    const detailMatch = experienceDetailSource.match(directivePattern);

    expect(historyMatch).not.toBeNull();
    expect(detailMatch).not.toBeNull();
    expect(historyMatch?.[1]).toBe(expectedExpression);
    expect(detailMatch?.[1]).toBe(expectedExpression);
    expect(experienceHistorySource).not.toContain("view-transition-name:");
    expect(experienceDetailSource).not.toContain("view-transition-name:");

    const historyHtml = await render(ExperienceHistory, {
      experiences,
      profile: profile.data,
    });
    const { document: history } = new JSDOM(historyHtml).window;
    const overviewCards = Array.from(
      history.querySelectorAll<HTMLElement>(".experience-card"),
    );

    expect(overviewCards).toHaveLength(experiences.length);

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

      expect(overviewCard).not.toBeNull();
      expect(detailCard).not.toBeNull();
      expect(detailCard?.getAttribute("data-experience-slug")).toBe(slug);
    }
  });

  it("assigns an Astro transition scope to every overview and detail card", async () => {
    const collectionEntries = await getCollection("experience");
    const experiences = collectionEntries.map((experience) => ({
      ...experience,
      data: {
        ...experience.data,
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

    expect(overviewCards).toHaveLength(experiences.length);
    for (const card of overviewCards) {
      expect(card.hasAttribute("data-astro-transition-scope")).toBe(true);
    }

    for (const experience of experiences) {
      const detailHtml = await render(ExperienceDetail, {
        experience,
        profile: profile.data,
      });
      const { document: detail } = new JSDOM(detailHtml).window;
      const detailCard = detail.querySelector<HTMLElement>(
        "article.experience-detail-card",
      );

      expect(detailCard).not.toBeNull();
      expect(detailCard?.hasAttribute("data-astro-transition-scope")).toBe(
        true,
      );
    }
  });

  it("relies on ClientRouter instead of the native MPA trigger and disables animations for reduced motion", () => {
    expect(css).not.toMatch(/@view-transition\s*\{\s*navigation:\s*auto;\s*\}/);
    expect(css).not.toMatch(/@view-transition\s*\{\s*navigation:\s*none;\s*\}/);
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
