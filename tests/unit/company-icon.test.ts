import { readFile } from "node:fs/promises";
import { getCollection, getEntry } from "astro:content";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import ExperienceHistory from "../../src/components/home/ExperienceHistory.astro";
import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import Home from "../../src/pages/index.astro";
import { resolveCompanyIcon } from "../../src/content/parsers/content";
import { experienceSchema } from "../../src/content/parsers/content-schema";
import { render } from "../helpers/render";

const RENDER_BASE = "/portfolio-astro-SDD";

const approvedIcon = {
  src: "/images/companies/babel.svg",
  alt: "Acme",
};

const replacementIcon = {
  src: "/images/companies/replacement.svg",
  alt: "Acme replacement",
};

function validExperience(icon = approvedIcon) {
  return {
    slug: "sample-role",
    role: "Software Engineer",
    company: "Acme Corp",
    companyIcon: icon,
    startDate: "2024-01-01",
    summary: "Sample summary for a generic role",
    technologies: ["Astro", "Tailwind CSS"],
    seo: {
      title: "Software Engineer | Portfolio profesional",
      description: "Sample description for a generic role",
    },
  };
}

type IconSourceEntry = {
  id?: string;
  data: { slug: string; companyIcon?: unknown };
  rendered?: { metadata: { frontmatter: Record<string, unknown> } };
};

/**
 * Builds the two shapes Astro can expose: the normalized `data` value and the
 * Markdown `rendered.metadata.frontmatter` copy. Either may be omitted.
 */
function iconSourceEntry({
  id = "sample-role.md",
  slug = "sample-role",
  normalized,
  frontmatter,
}: {
  id?: string;
  slug?: string;
  normalized?: unknown;
  frontmatter?: unknown;
}): IconSourceEntry {
  return {
    id,
    data: { slug, companyIcon: normalized },
    rendered: { metadata: { frontmatter: { companyIcon: frontmatter } } },
  };
}

function expectCompanyIconInHeader(
  header: Element | null,
  expectedIcon: { src: string; alt: string },
  expectedCompany: string,
): void {
  expect(header).not.toBeNull();
  const image = header?.querySelector("img.company-icon");
  const company = header?.querySelector(".company-name");

  expect(image?.getAttribute("src")).toBe(`${RENDER_BASE}${expectedIcon.src}`);
  expect(image?.getAttribute("alt")).toBe(expectedIcon.alt);
  expect(image?.getAttribute("alt")?.trim()).not.toBe("");
  expect(image?.getAttribute("width")).toBe("128");
  expect(image?.getAttribute("height")).toBe("128");
  expect(company?.textContent?.trim()).toBe(expectedCompany);
}

const expectedRealIcons: Record<string, { src: string; alt: string }> = {
  "babel-senior-frontend-engineer": {
    src: "/images/companies/babel.svg",
    alt: "Logotipo de Babel Sistemas de Información",
  },
  "nttdata-lead-engineer": {
    src: "/images/companies/nttdata.svg",
    alt: "Logotipo de NTTData Europe & LATAM",
  },
};

const expectedRealContent: Record<string, string> = {
  "babel-senior-frontend-engineer": "Liderazgo de Arquitectura Frontend",
  "nttdata-lead-engineer": "Progresión Técnica",
};

describe("resolveCompanyIcon helper", () => {
  it("prefers a valid normalized data icon over the rendered frontmatter copy", () => {
    expect(
      resolveCompanyIcon(
        iconSourceEntry({
          normalized: approvedIcon,
          frontmatter: replacementIcon,
        }),
      ),
    ).toEqual(approvedIcon);
  });

  it("falls back to the Markdown rendered frontmatter when normalized data is absent", () => {
    expect(
      resolveCompanyIcon(
        iconSourceEntry({
          normalized: undefined,
          frontmatter: approvedIcon,
        }),
      ),
    ).toEqual(approvedIcon);
  });

  it("throws a descriptive error naming the entry id and slug when neither source provides an icon", () => {
    let caught: unknown;
    try {
      resolveCompanyIcon(
        iconSourceEntry({
          id: "role-without-icon.md",
          slug: "role-without-icon",
          normalized: undefined,
          frontmatter: undefined,
        }),
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain(
      'entry id "role-without-icon.md"',
    );
    expect((caught as Error).message).toContain('slug "role-without-icon"');
  });

  it("rejects a malformed normalized icon instead of falling back to the rendered copy", () => {
    let caught: unknown;
    try {
      resolveCompanyIcon(
        iconSourceEntry({
          normalized: { src: "https://example.com/company.svg", alt: "X" },
          frontmatter: approvedIcon,
        }),
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain("Invalid companyIcon");
    expect((caught as Error).message).toContain("entry id");
  });
});

describe("Markdown-configurable company icons", () => {
  it("resolves the real collection entries to their configured icons", async () => {
    const entries = await getCollection("experience");

    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      const expectedIcon = expectedRealIcons[entry.data.slug];
      expect(expectedIcon).toBeDefined();
      expect(resolveCompanyIcon(entry)).toEqual(expectedIcon);
    }
  });

  it("renders the same resolved Markdown icon beside the company name on home and its complete detail card", async () => {
    const entries = await getCollection("experience");
    const profile = await getEntry("profile", "profile");
    if (!profile) throw new Error("Missing approved profile collection entry");

    const homeHtml = await render(Home);
    const { document: homeDocument } = new JSDOM(homeHtml).window;
    const cards = Array.from(
      homeDocument.querySelectorAll<HTMLElement>(
        "#trayectoria .experience-card",
      ),
    );

    expect(entries).toHaveLength(2);
    expect(cards).toHaveLength(entries.length);

    for (const entry of entries) {
      const resolvedIcon = resolveCompanyIcon(entry);
      const expectedIcon = expectedRealIcons[entry.data.slug];
      expect(resolvedIcon).toEqual(expectedIcon);

      const card = cards.find(
        (candidate) =>
          candidate.querySelector("a")?.getAttribute("href") ===
          `/portfolio-astro-SDD/experiencia/${entry.data.slug}/`,
      );

      expect(card).toBeDefined();
      expectCompanyIconInHeader(
        card?.querySelector(".experience-card-header") ?? null,
        resolvedIcon,
        entry.data.company,
      );

      const detailHtml = await render(ExperienceDetail, {
        experience: entry,
        profile: profile.data,
      });
      const { document: detailDocument } = new JSDOM(detailHtml).window;
      const detailCard = detailDocument.querySelector(
        "article.experience-detail-card",
      );

      expect(detailCard).not.toBeNull();
      expectCompanyIconInHeader(
        detailCard?.querySelector(".experience-detail-header") ?? null,
        resolvedIcon,
        entry.data.company,
      );
      expect(
        detailCard?.querySelector(".detail-content")?.textContent,
      ).toContain(expectedRealContent[entry.data.slug]);
    }
  });

  it("allows a replacement local SVG path and alt to flow through both views without component edits", async () => {
    const entries = await getCollection("experience");
    const profile = await getEntry("profile", "profile");
    if (!profile) throw new Error("Missing approved profile collection entry");
    const babelEntry = entries.find(
      (entry) => entry.data.slug === "babel-senior-frontend-engineer",
    );
    if (!babelEntry)
      throw new Error("Missing babel experience collection entry");
    const replacedEntry = {
      ...babelEntry,
      data: { ...babelEntry.data, companyIcon: replacementIcon },
    };

    expect(
      experienceSchema.safeParse(validExperience(replacementIcon)).success,
    ).toBe(true);
    expect(resolveCompanyIcon(replacedEntry)).toEqual(replacementIcon);

    const historyHtml = await render(ExperienceHistory, {
      experiences: [replacedEntry],
      profile: profile.data,
    });
    const { document: historyDocument } = new JSDOM(historyHtml).window;
    const replacedCard = Array.from(
      historyDocument.querySelectorAll(".experience-card"),
    ).find((card) =>
      card
        .querySelector("a")
        ?.getAttribute("href")
        ?.includes("babel-senior-frontend-engineer"),
    );

    expectCompanyIconInHeader(
      replacedCard?.querySelector(".experience-card-header") ?? null,
      replacementIcon,
      babelEntry.data.company,
    );

    const detailHtml = await render(ExperienceDetail, {
      experience: replacedEntry,
      profile: profile.data,
    });
    const { document: detailDocument } = new JSDOM(detailHtml).window;

    expectCompanyIconInHeader(
      detailDocument.querySelector(
        ".experience-detail-card .experience-detail-header",
      ),
      replacementIcon,
      babelEntry.data.company,
    );
  });

  it("rejects remote, protocol, traversal, and otherwise unsafe icon paths and blank alt text", () => {
    for (const src of [
      "https://example.com/company.svg",
      "//example.com/company.svg",
      "javascript:alert(1)",
      "/images/companies/../../profile-placeholder.svg",
      "/images/company/astro.svg",
      "/images/companies/astro.png",
      "images/companies/astro.svg",
      "/images/companies/astro.svg?download=1",
    ]) {
      expect(
        experienceSchema.safeParse(validExperience({ ...approvedIcon, src }))
          .success,
        `Expected unsafe company icon path to be rejected: ${src}`,
      ).toBe(false);
    }

    for (const alt of ["", "   "]) {
      expect(
        experienceSchema.safeParse(validExperience({ ...approvedIcon, alt }))
          .success,
        `Expected blank alternative text to be rejected: ${JSON.stringify(alt)}`,
      ).toBe(false);
    }

    const missingAlt = validExperience();
    Reflect.deleteProperty(missingAlt.companyIcon, "alt");
    expect(experienceSchema.safeParse(missingAlt).success).toBe(false);
  });

  it("ships parseable local company SVGs and preserves icon sizing/aspect ratio through utility classes", async () => {
    const svg = await readFile("public/images/companies/babel.svg", "utf8");
    const { document } = new JSDOM(svg, { contentType: "image/svg+xml" })
      .window;
    const root = document.documentElement;

    expect(root.localName).toBe("svg");
    expect(root.getAttribute("viewBox")).toMatch(
      /^0 0 \d+(\.\d+)? \d+(\.\d+)?$/,
    );
    expect(root.querySelectorAll("path").length).toBeGreaterThan(0);

    // The icon and header geometry are now expressed as Tailwind utilities
    // on the rendered markup instead of global CSS rules.
    const profile = await getEntry("profile", "profile");
    if (!profile) throw new Error("Missing approved profile collection entry");
    const entries = await getCollection("experience");
    const html = await render(ExperienceHistory, {
      experiences: entries,
      profile: profile.data,
    });
    const { document: historyDocument } = new JSDOM(html).window;
    const card = historyDocument.querySelector(".experience-card");
    const icon = card?.querySelector(".company-icon");
    const header = card?.querySelector(".experience-card-header");

    expect(icon?.className).toContain("min-[601px]:size-32");
    expect(icon?.className).toContain("min-[601px]:aspect-square");
    expect(icon?.className).toContain("object-contain");
    expect(icon?.className).toContain("w-full");
    expect(icon?.className).toContain("h-auto");
    expect(icon?.getAttribute("width")).toBe("128");
    expect(icon?.getAttribute("height")).toBe("128");
    expect(header?.classList.contains("flex")).toBe(true);
    expect(header?.classList.contains("flex-col")).toBe(true);
    expect(header?.className).toContain("min-[601px]:flex-row");
    expect(header?.classList.contains("gap-4")).toBe(true);
  });
});
