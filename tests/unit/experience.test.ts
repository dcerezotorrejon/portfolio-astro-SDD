import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { assertUniqueExperienceSlugs } from "../../src/content/parsers/content";
import { render } from "../helpers/render";

const approvedExpandedDescription =
  "Información ampliada de ejemplo sobre las responsabilidades y el contexto del puesto. Este contenido no representa una experiencia laboral real";

async function renderExperience(slug: string): Promise<string> {
  const experiences = await getCollection("experience");
  const experience = experiences.find((entry) => entry.data.slug === slug);
  const profile = await getEntry("profile", "profile");

  if (!experience || !profile) {
    throw new Error(`Missing approved collection content for ${slug}`);
  }

  return render(ExperienceDetail, { experience, profile: profile.data });
}

describe("experience detail routes", () => {
  it.each([
    {
      slug: "puesto-ejemplo-2024",
      dateRange: "enero de 2024 – actualidad",
      technologies: ["Astro", "Tailwind CSS"],
    },
    {
      slug: "puesto-ejemplo-2022",
      dateRange: "enero de 2022 – diciembre de 2023",
      technologies: ["React", "TypeScript"],
    },
  ])(
    "renders matching collection content for $slug",
    async ({ slug, dateRange, technologies }) => {
      const html = await renderExperience(slug);
      const { document } = new JSDOM(html).window;
      const header = document.querySelector<HTMLElement>(
        ".experience-detail-header",
      );
      const card = document.querySelector<HTMLElement>(
        "article.experience-card.experience-detail-card",
      );
      const body = card?.querySelector<HTMLElement>(".experience-detail-body");
      const description = body?.querySelector(".detail-content");
      const notice = body?.querySelector(".provisional-notice");
      const returnLink = body?.querySelector('a[href="/#trayectoria"]');

      expect(document.documentElement.lang).toBe("es");
      expect(document.querySelectorAll("h1")).toHaveLength(1);
      expect(document.querySelector("h1")?.textContent?.trim()).toBe(
        "Puesto de ejemplo",
      );
      expect(card?.getAttribute("data-experience-slug")).toBe(slug);
      expect(document.querySelectorAll(".experience-card")).toHaveLength(1);
      expect(card?.tagName).toBe("ARTICLE");
      expect(card?.contains(header)).toBe(true);
      expect(header?.matches(".experience-card")).toBe(false);
      expect(body).not.toBeNull();
      expect(card?.contains(body ?? null)).toBe(true);
      expect(body?.contains(description ?? null)).toBe(true);
      expect(body?.contains(notice ?? null)).toBe(true);
      expect(body?.contains(returnLink ?? null)).toBe(true);
      expect(body?.querySelectorAll(".technology-badge")).toHaveLength(
        technologies.length,
      );
      expect(card?.getAttribute("style")).toMatch(
        new RegExp(
          `(?:^|;)\\s*view-transition-name:\\s*experience-${slug}\\s*(?:;|$)`,
        ),
      );
      expect(header?.getAttribute("style") ?? "").not.toMatch(
        /view-transition-name\s*:/,
      );
      expect(header?.querySelectorAll("p")[0]?.textContent?.trim()).toBe(
        "Empresa de ejemplo",
      );
      const companyIcon =
        header?.querySelector<HTMLImageElement>(".company-icon");
      expect(companyIcon?.getAttribute("src")).toBe(
        "/images/companies/astro.svg",
      );
      expect(companyIcon?.getAttribute("alt")).toBe(
        "Icono provisional de Astro para Empresa de ejemplo",
      );
      expect(companyIcon?.getAttribute("width")).toBe("40");
      expect(companyIcon?.getAttribute("height")).toBe("40");
      expect(companyIcon?.hasAttribute("loading")).toBe(false);
      expect(header?.querySelectorAll("p")[1]?.textContent?.trim()).toBe(
        dateRange,
      );
      expect(
        Array.from(document.querySelectorAll(".technology-badge"), (badge) =>
          badge.textContent?.trim(),
        ),
      ).toEqual(technologies);
      expect(
        document.querySelector(".detail-content")?.textContent?.trim(),
      ).toBe(approvedExpandedDescription);
      expect(document.querySelector(".provisional-notice")?.textContent).toBe(
        "Contenido provisional de ejemplo",
      );
      expect(
        document.querySelector('a[href="/#trayectoria"]')?.textContent?.trim(),
      ).toBe("Volver a la trayectoria");
      expect(document.querySelector(".floating-nav")).toBeNull();
      expect(document.querySelectorAll("astro-island")).toHaveLength(0);
    },
  );

  it("rejects duplicate route slugs from entries with distinct collection IDs", async () => {
    const [entry] = await getCollection("experience");
    expect(entry).toBeDefined();
    if (!entry) return;

    expect(() =>
      assertUniqueExperienceSlugs([
        entry,
        { ...entry, id: `${entry.id}-duplicate` },
      ]),
    ).toThrow(/Duplicate experience route slug/);
  });
});
