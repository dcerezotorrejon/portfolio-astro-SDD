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

  it("uses the shared control-duration token without overriding the native view-transition timing", () => {
    // 8bb0ecb intentionally removed the custom `::view-transition-*`
    // `animation-duration` override, so the UA's native duration applies to
    // shared-element transitions. The 200 ms control motion token remains the
    // shared source of truth for component transitions.
    expect(css).not.toMatch(
      /::view-transition-[a-z-]+\(\*\)[^{]*\{[^}]*animation-duration/,
    );
    expect(resolveToken("--duration-control", tokens)).toBe("200ms");
  });

  it("keeps the reduced-motion reset for every view-transition pseudo-element", () => {
    const reducedMotionIndex = css.indexOf(
      "@media (prefers-reduced-motion: reduce)",
    );

    expect(reducedMotionIndex).toBeGreaterThanOrEqual(0);

    const reducedBlock = css.slice(reducedMotionIndex);
    for (const pseudo of [
      "::view-transition-group(*)",
      "::view-transition-image-pair(*)",
      "::view-transition-old(*)",
      "::view-transition-new(*)",
    ]) {
      expect(reducedBlock).toContain(pseudo);
    }
    // The reset disables the animation outright and does not reintroduce a
    // competing custom duration; with the timing rule removed there is no
    // equal-specificity override left to win against.
    expect(resolveDeclaration(reducedBlock, "animation", tokens)).toBe("none");
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
