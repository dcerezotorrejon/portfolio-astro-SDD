import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ProjectDetail, {
  getStaticPaths,
} from "../../src/pages/proyectos/[slug].astro";
import type { ProfileData } from "../../src/content/parsers/content-schema";
import { render } from "../helpers/render";

const projects = await getCollection("projects");
const profile = (await getEntry("profile", "profile"))?.data as ProfileData;

async function renderProject(slug: string): Promise<Document> {
  const project = projects.find((entry) => entry.data.slug === slug);
  if (!project) throw new Error(`Missing project ${slug}`);
  return new JSDOM(await render(ProjectDetail, { project, profile })).window
    .document;
}

describe("project detail routes (R26, AC25, AC26)", () => {
  it("generates one route per collection entry, with no fixed count", async () => {
    const paths = await getStaticPaths();
    expect(paths.map((path) => path.params.slug).sort()).toEqual(
      projects.map((project) => project.data.slug).sort(),
    );
  });

  it.each(projects.map((project) => project.data))(
    "renders $slug with its content and links",
    async (data) => {
      const document = await renderProject(data.slug);
      const headings = document.querySelectorAll("h1");

      expect(headings).toHaveLength(1);
      expect(headings[0].textContent?.trim()).toBe(data.name);
      expect(headings[0].getAttribute("data-variant")).toBe("display");
      expect(document.querySelector("img")).toBeNull();
      expect(document.querySelector(".detail-content")?.textContent).not.toBe(
        "",
      );
      for (const tech of data.technologies) {
        expect(document.body.textContent).toContain(tech);
      }

      const hrefs = Array.from(document.querySelectorAll("main a")).map((a) =>
        a.getAttribute("href"),
      );
      expect(hrefs).toContain(data.repositoryUrl);
      expect(hrefs.some((href) => href?.endsWith("/#proyectos"))).toBe(true);

      expect(
        document.querySelector(".project-license")?.textContent?.trim() ?? null,
      ).toBe(
        data.license
          ? `${profile.projectsLicenseLabel}: ${data.license}`
          : null,
      );
      expect(
        document.querySelector(".project-status")?.textContent?.trim() ?? null,
      ).toBe(data.archived ? profile.projectsArchivedLabel : null);
      expect(
        document
          .querySelector("article")
          ?.getAttribute("data-astro-transition-scope"),
      ).toBeTruthy();
    },
  );

  it("shows a license only on openrazer", () => {
    const withLicense = projects.filter((p) => p.data.license);
    expect(withLicense.map((p) => p.data.slug)).toEqual(["openrazer"]);
  });
});
