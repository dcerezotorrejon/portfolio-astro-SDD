import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { getContainer } from "../helpers/render";

const approvedDescription =
  "Información ampliada de ejemplo sobre las responsabilidades y el contexto del puesto. Este contenido no representa una experiencia laboral real";

const routeMetadata = [
  {
    slug: "puesto-ejemplo-2024",
    title:
      "Puesto de ejemplo (2024) | Nombre Apellidos | Portfolio profesional",
  },
  {
    slug: "puesto-ejemplo-2022",
    title:
      "Puesto de ejemplo (2022) | Nombre Apellidos | Portfolio profesional",
  },
];

async function renderExperience(slug: string): Promise<string> {
  const experiences = await getCollection("experience");
  const experience = experiences.find((entry) => entry.data.slug === slug);
  const profile = await getEntry("profile", "profile");
  if (!experience || !profile) {
    throw new Error(`Missing approved collection content for ${slug}`);
  }
  const container = await getContainer();
  return container.renderToString(ExperienceDetail, {
    props: { experience, profile: profile.data },
    request: new Request(`https://example.com/experiencia/${slug}/`),
  });
}

describe("experience detail SEO", () => {
  it.each(routeMetadata)(
    "renders unique Spanish metadata and canonical URL for $slug",
    async ({ slug, title }) => {
      const html = await renderExperience(slug);
      const { document } = new JSDOM(html).window;
      const descriptions = document.querySelectorAll(
        'meta[name="description"]',
      );
      const canonicals = document.querySelectorAll('link[rel="canonical"]');

      expect(document.documentElement.lang).toBe("es");
      expect(document.title).toBe(title);
      expect(descriptions).toHaveLength(1);
      expect(descriptions[0]?.getAttribute("content")).toBe(
        approvedDescription,
      );
      expect(canonicals).toHaveLength(1);
      expect(canonicals[0]?.getAttribute("href")).toBe(
        `https://example.com/experiencia/${slug}/`,
      );
    },
  );

  it.skipIf(!existsSync("dist/sitemap-0.xml"))(
    "emits both direct-build detail routes and includes them in the sitemap",
    async () => {
      const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
      for (const { slug, title } of routeMetadata) {
        const routeHtml = await readFile(
          `dist/experiencia/${slug}/index.html`,
          "utf8",
        );
        const { document } = new JSDOM(routeHtml).window;

        expect(document.title).toBe(title);
        expect(
          document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        ).toBe(`https://example.com/experiencia/${slug}/`);
        expect(
          document
            .querySelector("[data-experience-slug]")
            ?.getAttribute("data-experience-slug"),
        ).toBe(slug);
        expect(document.querySelector(".floating-nav")).toBeNull();
        expect(document.querySelectorAll("astro-island")).toHaveLength(0);
        expect(sitemap).toContain(
          `<loc>https://example.com/experiencia/${slug}/</loc>`,
        );
      }
    },
  );
});
