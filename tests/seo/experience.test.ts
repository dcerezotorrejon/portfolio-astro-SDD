import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { base, site } from "../../astro.config.mjs";
import { getContainer } from "../helpers/render";

const canonicalBase = `${site}${base}`;

const routeMetadata = [
  {
    slug: "babel-senior-frontend-engineer",
    title:
      "Senior Software Engineer (Frontend) (2022) | Daniel Cerezo Torrejón | Portfolio profesional",
    description:
      "Arquitectura Frontend desde cero en Iberia.com con React, TypeScript y Clean Architecture como Senior Software Engineer.",
  },
  {
    slug: "nttdata-lead-engineer",
    title:
      "Lead Engineer (2017) | Daniel Cerezo Torrejón | Portfolio profesional",
    description:
      "Progresión hasta Lead Engineer en Iberia.com: liderazgo técnico y migración de módulos legacy.",
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
    request: new Request(new URL(`${base}/experiencia/${slug}/`, site)),
  });
}

describe("experience detail SEO", () => {
  it.each(routeMetadata)(
    "renders unique Spanish metadata and canonical URL for $slug",
    async ({ slug, title, description }) => {
      const html = await renderExperience(slug);
      const { document } = new JSDOM(html).window;
      const descriptions = document.querySelectorAll(
        'meta[name="description"]',
      );
      const canonicals = document.querySelectorAll('link[rel="canonical"]');

      expect(document.documentElement.lang).toBe("es");
      expect(document.title).toBe(title);
      expect(descriptions).toHaveLength(1);
      expect(descriptions[0]?.getAttribute("content")).toBe(description);
      expect(canonicals).toHaveLength(1);
      expect(canonicals[0]?.getAttribute("href")).toBe(
        `${canonicalBase}/experiencia/${slug}/`,
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
        ).toBe(`${canonicalBase}/experiencia/${slug}/`);
        expect(
          document
            .querySelector("[data-experience-slug]")
            ?.getAttribute("data-experience-slug"),
        ).toBe(slug);
        expect(document.querySelector(".floating-nav")).toBeNull();
        expect(document.querySelectorAll("astro-island")).toHaveLength(0);
        expect(sitemap).toContain(
          `<loc>${canonicalBase}/experiencia/${slug}/</loc>`,
        );
      }
    },
  );
});
