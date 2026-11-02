import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { site } from "../../astro.config.mjs";
import { getContainer, render } from "../helpers/render";

async function renderDetails(): Promise<[string, string][]> {
  const experiences = await getCollection("experience");
  const profile = await getEntry("profile", "profile");
  if (!profile) throw new Error("Missing profile content");
  const container = await getContainer();
  return Promise.all(
    experiences.map(async (experience): Promise<[string, string]> => [
      experience.data.slug,
      await container.renderToString(ExperienceDetail, {
        props: { experience, profile: profile.data },
        request: new Request(
          new URL(`/experiencia/${experience.data.slug}/`, site),
        ),
      }),
    ]),
  );
}

function expectOneSitemapLink(html: string, label: string) {
  const { document } = new JSDOM(html).window;
  const links = document.head.querySelectorAll('link[rel="sitemap"]');
  expect(links, label).toHaveLength(1);
  expect(links[0].getAttribute("href"), label).toBe("/sitemap-index.xml");
}

describe("sitemap discovery link", () => {
  it("renders exactly one sitemap link on the home page", async () => {
    expectOneSitemapLink(
      await render(Home, {}, new Request(new URL("/", site))),
      "home",
    );
  });

  it("renders exactly one sitemap link on every experience detail page", async () => {
    const pages = await renderDetails();
    expect(pages.length).toBeGreaterThan(0);
    for (const [slug, html] of pages) expectOneSitemapLink(html, slug);
  });

  it("adds no island to the detail pages", async () => {
    for (const [slug, html] of await renderDetails()) {
      const { document } = new JSDOM(html).window;
      expect(document.querySelectorAll("astro-island"), slug).toHaveLength(0);
    }
  });
});
