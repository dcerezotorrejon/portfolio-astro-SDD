import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ProjectsSection from "../../src/components/home/ProjectsSection.astro";
import type { ProfileData } from "../../src/content/parsers/content-schema";
import { sortProjects } from "../../src/content/parsers/content";
import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

const repoRoot = join(import.meta.dirname, "..", "..");

// The expected values come from the collection, so a new entry needs no change
// here. Its exact contents are pinned by the R3 test in projects.test.ts.
const projects = sortProjects(await getCollection("projects"));
const profile = (await getEntry("profile", "profile"))?.data as ProfileData;
const { document } = new JSDOM(await render(Home)).window;
const section = document.querySelector("#proyectos") as HTMLElement;
const cards = Array.from(section.querySelectorAll("li.project-slide"));
const expected = projects.map((project) => project.data);

const cardOf = (slug: string) =>
  cards[expected.findIndex((project) => project.slug === slug)];

describe("home projects section (R7, AC5)", () => {
  it("follows the professional history directly", () => {
    expect(document.querySelector("#trayectoria")?.nextElementSibling).toBe(
      section,
    );
  });

  it("uses a section h2 and one card h3 per project, in order", () => {
    const heading = section.querySelector("h2");

    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(heading?.textContent?.trim()).toBe(profile.projectsHeading);
    expect(heading?.getAttribute("data-variant")).toBe("section");
    expect(section.getAttribute("aria-labelledby")).toBe(heading?.id);
    expect(
      Array.from(section.querySelectorAll("h3")).map((title) =>
        title.textContent?.trim(),
      ),
    ).toEqual(expected.map((project) => project.name));
    expect(
      Array.from(section.querySelectorAll("h3")).every(
        (title) => title.getAttribute("data-variant") === "card",
      ),
    ).toBe(true);
  });
});

describe("island output (AC14, AC16)", () => {
  it("renders one card and two links per project, with no clones", () => {
    expect(cards.length).toBeGreaterThan(0);
    expect(cards).toHaveLength(expected.length);
    expect(section.querySelectorAll("li.project-slide a")).toHaveLength(
      expected.length * 2,
    );
    expect(section.querySelector("[data-carousel-clone]")).toBeNull();
  });

  it("declares client:load and serializes no card content", () => {
    // The test container omits the `props` attribute that the build emits, so
    // this checks the opening tag, and AC14 checks the props over the build.
    const island = section.querySelector("astro-island");
    const openingTag = island?.outerHTML.split(">")[0] ?? "";

    expect(island?.getAttribute("client")).toBe("load");

    for (const project of expected) {
      expect(openingTag).not.toContain(project.name);
      expect(openingTag).not.toContain(project.summary);
      expect(openingTag).not.toContain(project.repositoryUrl);
    }
  });

  it("keeps the cards in static slotted HTML", () => {
    expect(section.querySelector("astro-island astro-slot ul")).not.toBeNull();
    expect(
      section.querySelectorAll("astro-slot li.project-slide"),
    ).toHaveLength(expected.length);
  });

  it("server-renders both arrows disabled, with Markdown names", () => {
    const arrows = Array.from(section.querySelectorAll("button"));

    expect(arrows.map((arrow) => arrow.getAttribute("aria-label"))).toEqual([
      profile.projectsPreviousLabel,
      profile.projectsNextLabel,
    ]);
    expect(arrows.every((arrow) => arrow.hasAttribute("disabled"))).toBe(true);
  });
});

describe("project card (R19, R20, AC18)", () => {
  it.each(expected.map((project) => [project.slug, project] as const))(
    "%s shows its content and two ordered links",
    (slug, project) => {
      const card = cardOf(slug);
      const links = Array.from(card.querySelectorAll("a"));
      const [detail, github] = links;

      expect(card.querySelector("h3")?.textContent?.trim()).toBe(project.name);
      expect(card.textContent).toContain(project.summary);
      expect(
        Array.from(card.querySelectorAll(".technology-badge")).map((badge) =>
          badge.textContent?.trim(),
        ),
      ).toEqual(project.technologies);
      expect(card.querySelectorAll("img")).toHaveLength(1);

      expect(links).toHaveLength(2);
      expect(detail.getAttribute("href")).toMatch(
        new RegExp(`/proyectos/${slug}/$`),
      );
      expect(detail.getAttribute("data-variant")).toBe("primary");
      expect(detail.textContent?.trim()).toBe(profile.moreInfoLabel);

      expect(github.getAttribute("href")).toBe(project.repositoryUrl);
      expect(github.getAttribute("data-variant")).toBe("secondary");
      expect(github.textContent?.trim()).toBe(profile.projectsGithubLabel);
      expect(github.children).toHaveLength(0);
      expect(github.hasAttribute("target")).toBe(false);
    },
  );

  it("names the view transition after the project on each article", () => {
    expect(
      section.querySelectorAll("article[data-astro-transition-scope]"),
    ).toHaveLength(expected.length);
  });

  it("keeps the links last in the card, at its bottom", () => {
    for (const card of cards) {
      const article = card.querySelector("article");
      const links = article?.lastElementChild;

      expect(links?.querySelectorAll("a")).toHaveLength(2);
      expect(links?.className).toContain("mt-auto");
      expect(links?.className).toContain("flex-wrap");
    }
  });
});

describe("accessible names (R21, AC20)", () => {
  const links = Array.from(section.querySelectorAll("li.project-slide a"));
  const names = links.map((link) => link.getAttribute("aria-label") ?? "");

  it("start with the visible label and include the project name", () => {
    links.forEach((link, index) => {
      const project = expected[Math.floor(index / 2)];

      expect(names[index]).toBe(`${link.textContent?.trim()}: ${project.name}`);
    });
  });

  it("are unique", () => {
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("card images (R22, R23, AC22)", () => {
  const defaultSvg = readFileSync(
    join(repoRoot, "src/assets/project-default.svg"),
    "utf8",
  );

  it.each(expected.map((project) => [project.slug, project] as const))(
    "%s uses its own image or the neutral default",
    (slug, project) => {
      const image = cardOf(slug).querySelector("img");
      const src = image?.getAttribute("src") ?? "";

      expect(image?.getAttribute("width")).toBeTruthy();
      expect(image?.getAttribute("height")).toBeTruthy();
      expect(image?.className).toContain("project-card-image");
      expect(src).not.toMatch(/^https?:/);

      if (project.image) {
        expect(image?.getAttribute("alt")).toBe(project.image.alt);
        expect(src).not.toContain("project-default");
      } else {
        expect(image?.getAttribute("alt")).toBe("");
        expect(src).toContain("project-default");
      }
    },
  );

  it("exercises both kinds of image", () => {
    expect(expected.some((project) => project.image)).toBe(true);
    expect(expected.some((project) => !project.image)).toBe(true);
  });

  it("keeps the default image free of gradients and text", () => {
    expect(defaultSvg).not.toMatch(/gradient|<text|<image|<use/i);
  });
});

describe("archived label (R24, AC23)", () => {
  it("appears as text only on archived projects", () => {
    expect(expected.some((project) => project.archived)).toBe(true);
    expect(expected.some((project) => !project.archived)).toBe(true);

    for (const project of expected) {
      const label = cardOf(project.slug).querySelector(".project-status");

      if (project.archived) {
        expect(label?.textContent?.trim()).toBe(profile.projectsArchivedLabel);
      } else {
        expect(label).toBeNull();
      }
    }
  });
});

describe("Markdown-sourced strings (R6, AC4)", () => {
  it("renders whatever the profile fields say", async () => {
    const custom: ProfileData = {
      ...profile,
      moreInfoLabel: "ETIQUETA-DETALLE",
      projectsHeading: "ETIQUETA-TITULO",
      projectsPreviousLabel: "ETIQUETA-ANTERIOR",
      projectsNextLabel: "ETIQUETA-SIGUIENTE",
      projectsGithubLabel: "ETIQUETA-REPO",
      projectsArchivedLabel: "ETIQUETA-ARCHIVO",
    };
    const archived = projects.find((project) => project.data.archived);
    const html = await render(ProjectsSection, {
      projects: archived ? [archived] : [],
      profile: custom,
    });
    const { document: rendered } = new JSDOM(html).window;
    const name = archived?.data.name;

    expect(rendered.querySelector("h2")?.textContent?.trim()).toBe(
      custom.projectsHeading,
    );
    expect(rendered.querySelector(".project-status")?.textContent?.trim()).toBe(
      custom.projectsArchivedLabel,
    );
    expect(
      Array.from(rendered.querySelectorAll("button")).map((arrow) =>
        arrow.getAttribute("aria-label"),
      ),
    ).toEqual([custom.projectsPreviousLabel, custom.projectsNextLabel]);
    expect(
      Array.from(rendered.querySelectorAll("li.project-slide a")).map((link) =>
        link.getAttribute("aria-label"),
      ),
    ).toEqual([
      `${custom.moreInfoLabel}: ${name}`,
      `${custom.projectsGithubLabel}: ${name}`,
    ]);
  });

  it("hardcodes no portfolio string in the new components", () => {
    const sources = [
      "src/components/home/ProjectCard.astro",
      "src/components/home/ProjectsSection.astro",
      "src/components/home/ProjectsCarousel/ProjectsCarousel.tsx",
    ].map((path) => readFileSync(join(repoRoot, path), "utf8"));
    const strings = [
      profile.projectsHeading,
      profile.projectsPreviousLabel,
      profile.projectsNextLabel,
      profile.projectsArchivedLabel,
      profile.moreInfoLabel,
      "GitHub",
    ];

    for (const source of sources) {
      for (const string of strings) {
        expect(source).not.toContain(string);
      }
    }
  });
});

describe("carousel stylesheet (R8, R13, R18)", () => {
  const css = readFileSync(
    join(repoRoot, "src/styles/projects-carousel.css"),
    "utf8",
  );

  it("snaps natively and hides the scrollbar", () => {
    expect(css).toContain("scroll-snap-type: x mandatory");
    expect(css).toContain("scroll-snap-align: start");
    expect(css).toContain("scroll-snap-stop: always");
    expect(css).toContain("scrollbar-width: none");
    expect(css).toContain("overflow-anchor: none");
  });

  it("wraps without scripting", () => {
    expect(css).toContain("@media (scripting: none)");
  });

  it("keeps a single 768 px breakpoint for the geometry", () => {
    expect(css).toContain("@media (min-width: 768px)");
  });
});
