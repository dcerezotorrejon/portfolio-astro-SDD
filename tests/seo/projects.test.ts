import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ProjectDetail from "../../src/pages/proyectos/[slug].astro";
import { site } from "../../astro.config.mjs";
import { getContainer } from "../helpers/render";

// The site is served from the custom-domain root (see experience.test.ts).
const siteRoot = `${site.replace(/\/+$/, "")}/`;

const projects = await getCollection("projects");
const profile = await getEntry("profile", "profile");

async function renderProject(slug: string): Promise<string> {
  const project = projects.find((entry) => entry.data.slug === slug);
  if (!project || !profile) throw new Error(`Missing content for ${slug}`);
  const container = await getContainer();
  return container.renderToString(ProjectDetail, {
    props: { project, profile: profile.data },
    request: new Request(new URL(`/proyectos/${slug}/`, site)),
  });
}

describe("project detail SEO (spec 033, AC32)", () => {
  it("covers the five approved projects", () => {
    expect(projects.map((project) => project.data.slug).sort()).toEqual([
      "custom-aur",
      "hassio-pacman",
      "openrazer",
      "portfolio",
      "zot-quarantine-proxy",
    ]);
  });

  it.each(projects.map((project) => project.data.slug))(
    "renders the frontmatter title, a description of at most 160 characters and the canonical URL for %s",
    async (slug) => {
      const { seo } = projects.find((entry) => entry.data.slug === slug)!.data;
      const { document } = new JSDOM(await renderProject(slug)).window;
      const descriptions = document.querySelectorAll(
        'meta[name="description"]',
      );
      const canonicals = document.querySelectorAll('link[rel="canonical"]');

      expect(document.documentElement.lang).toBe("es");
      expect(document.title).toBe(seo.title);
      expect(descriptions).toHaveLength(1);
      expect(descriptions[0].getAttribute("content")).toBe(seo.description);
      expect(
        descriptions[0].getAttribute("content")!.length,
      ).toBeLessThanOrEqual(160);
      expect(canonicals).toHaveLength(1);
      expect(canonicals[0].getAttribute("href")).toBe(
        `${siteRoot}proyectos/${slug}/`,
      );
    },
  );

  it.each(projects.map((project) => project.data.slug))(
    "links the sitemap index once and ships no island for %s",
    async (slug) => {
      const { document } = new JSDOM(await renderProject(slug)).window;
      const links = document.head.querySelectorAll('link[rel="sitemap"]');

      expect(links).toHaveLength(1);
      expect(links[0].getAttribute("href")).toBe("/sitemap-index.xml");
      expect(document.querySelectorAll("astro-island")).toHaveLength(0);
    },
  );

  it("gives the five pages unique titles, descriptions and canonicals", async () => {
    const pages = await Promise.all(
      projects.map(async (project) => {
        const { document } = new JSDOM(await renderProject(project.data.slug))
          .window;
        return {
          title: document.title,
          description: document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content"),
          canonical: document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute("href"),
        };
      }),
    );
    for (const key of ["title", "description", "canonical"] as const) {
      expect(new Set(pages.map((page) => page[key])).size, key).toBe(5);
    }
  });

  it.skipIf(!existsSync("dist/sitemap-0.xml"))(
    "emits every project route in the build and lists it once in the sitemap",
    async () => {
      const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
      for (const project of projects) {
        const { slug, seo } = project.data;
        const routeHtml = await readFile(
          `dist/proyectos/${slug}/index.html`,
          "utf8",
        );
        const { document } = new JSDOM(routeHtml).window;

        expect(document.title).toBe(seo.title);
        expect(
          document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        ).toBe(`${siteRoot}proyectos/${slug}/`);
        expect(document.querySelectorAll("astro-island")).toHaveLength(0);
        expect(
          sitemap.split(`<loc>${siteRoot}proyectos/${slug}/</loc>`),
        ).toHaveLength(2);
      }
    },
  );
});
