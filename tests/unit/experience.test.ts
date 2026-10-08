import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { assertUniqueExperienceSlugs } from "../../src/content/parsers/content";
import { render } from "../helpers/render";

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
      slug: "babel-senior-frontend-engineer",
      role: "Senior Software Engineer (Frontend)",
      company: "Babel Sistemas de Información",
      icon: {
        src: "/images/companies/babel.svg",
        alt: "Logotipo de Babel Sistemas de Información",
      },
      dateRange: "febrero de 2022 – actualidad",
      technologies: [
        "React",
        "TypeScript",
        "Zustand",
        "Stencil.js",
        "Angular",
        "AngularJS",
      ],
      contentSnippet: "Liderazgo de Arquitectura Frontend",
    },
    {
      slug: "nttdata-lead-engineer",
      role: "Lead Engineer",
      company: "NTTData Europe & LATAM",
      icon: {
        src: "/images/companies/nttdata.svg",
        alt: "Logotipo de NTTData Europe & LATAM",
      },
      dateRange: "julio de 2017 – enero de 2022",
      technologies: [
        "TypeScript",
        "JavaScript",
        "Angular",
        "AngularJS",
        "jQuery",
        "Webpack",
      ],
      contentSnippet: "Progresión Técnica",
    },
  ])(
    "renders matching collection content for $slug",
    async ({
      slug,
      role,
      company,
      icon,
      dateRange,
      technologies,
      contentSnippet,
    }) => {
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
      const returnLink = body?.querySelector('a[href="/#trayectoria"]');

      expect(document.documentElement.lang).toBe("es");
      expect(document.querySelectorAll("h1")).toHaveLength(1);
      expect(document.querySelector("h1")?.textContent?.trim()).toBe(role);
      expect(card?.getAttribute("data-experience-slug")).toBe(slug);
      expect(document.querySelectorAll(".experience-card")).toHaveLength(1);
      expect(card?.tagName).toBe("ARTICLE");
      expect(card?.contains(header)).toBe(true);
      expect(header?.matches(".experience-card")).toBe(false);
      expect(body).not.toBeNull();
      expect(card?.contains(body ?? null)).toBe(true);
      expect(body?.contains(description ?? null)).toBe(true);
      expect(body?.contains(returnLink ?? null)).toBe(true);
      expect(body?.querySelectorAll(".technology-badge")).toHaveLength(
        technologies.length,
      );
      expect(header?.querySelectorAll("p")[0]?.textContent?.trim()).toBe(
        company,
      );
      const companyIcon =
        header?.querySelector<HTMLImageElement>(".company-icon");
      expect(companyIcon?.getAttribute("src")).toBe(icon.src);
      expect(companyIcon?.getAttribute("alt")).toBe(icon.alt);
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
      ).toContain(contentSnippet);
      expect(document.querySelector(".provisional-notice")).toBeNull();
      expect(
        document.querySelector('a[href="/#trayectoria"]')?.textContent?.trim(),
      ).toBe("Volver a la trayectoria");
      expect(document.querySelector(".floating-nav")).toBeNull();
      expect(document.querySelectorAll("astro-island")).toHaveLength(0);
    },
  );

  it("renders the detail main with my-8 vertical spacing", async () => {
    const html = await renderExperience("babel-senior-frontend-engineer");
    const { document } = new JSDOM(html).window;
    const main = document.querySelector<HTMLElement>("main");

    expect(main).not.toBeNull();
    expect(main?.classList.contains("my-8")).toBe(true);
  });

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
