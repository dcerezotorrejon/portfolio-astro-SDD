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

const approvedIcon = {
  src: "/images/companies/astro.svg",
  alt: "Icono provisional de Astro para Empresa de ejemplo",
};

const replacementIcon = {
  src: "/images/companies/replacement.svg",
  alt: "Icono provisional reemplazable de Empresa de ejemplo",
};

function validExperience(icon = approvedIcon) {
  return {
    slug: "puesto-ejemplo-2024",
    role: "Puesto de ejemplo",
    company: "Empresa de ejemplo",
    companyIcon: icon,
    startDate: "2024-01-01",
    summary: "Descripción de ejemplo de las responsabilidades del puesto",
    technologies: ["Astro", "Tailwind CSS"],
    seo: {
      title: "Puesto de ejemplo | Portfolio profesional",
      description: "Descripción provisional de ejemplo",
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
  id = "puesto-ejemplo-2024.md",
  slug = "puesto-ejemplo-2024",
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

function expectCompanyIconNearCompany(
  identity: Element | null,
  expectedIcon: { src: string; alt: string },
): void {
  expect(identity).not.toBeNull();
  const image = identity?.querySelector("img");
  const company = identity?.querySelector("span");

  expect(image?.getAttribute("src")).toBe(expectedIcon.src);
  expect(image?.getAttribute("alt")).toBe(expectedIcon.alt);
  expect(image?.getAttribute("alt")?.trim()).not.toBe("");
  expect(image?.getAttribute("width")).toBe("40");
  expect(image?.getAttribute("height")).toBe("40");
  expect(company?.textContent?.trim()).toBe("Empresa de ejemplo");
  expect(image?.parentElement).toBe(company?.parentElement);
}

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
          id: "puesto-sin-icono.md",
          slug: "puesto-sin-icono",
          normalized: undefined,
          frontmatter: undefined,
        }),
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain(
      'entry id "puesto-sin-icono.md"',
    );
    expect((caught as Error).message).toContain('slug "puesto-sin-icono"');
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
  it("resolves the real collection entries when persisted normalized data omits the icon", async () => {
    const entries = await getCollection("experience");

    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      const rendered = (
        entry as unknown as {
          rendered?: {
            metadata?: { frontmatter?: { companyIcon?: unknown } };
          };
        }
      ).rendered;
      const renderedIcon = rendered?.metadata?.frontmatter?.companyIcon;

      if (entry.data.companyIcon === undefined) {
        expect(renderedIcon).toEqual(approvedIcon);
      }
      expect(resolveCompanyIcon(entry)).toEqual(approvedIcon);
    }
  });

  it("renders the same resolved Markdown icon beside the unchanged company name on home and its complete detail card", async () => {
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
      // The helper resolves the icon from normalized data or the Markdown
      // rendered frontmatter, so the stale store's missing `data.companyIcon`
      // no longer blocks rendering.
      const resolvedIcon = resolveCompanyIcon(entry);
      expect(resolvedIcon).toEqual(approvedIcon);

      const card = cards.find(
        (candidate) =>
          candidate.querySelector("a")?.getAttribute("href") ===
          `/experiencia/${entry.data.slug}/`,
      );

      expect(card).toBeDefined();
      expectCompanyIconNearCompany(
        card?.querySelector(".company-identity") ?? null,
        resolvedIcon,
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
      expectCompanyIconNearCompany(
        detailCard?.querySelector(".company-identity") ?? null,
        resolvedIcon,
      );
      expect(
        detailCard?.contains(
          detailCard?.querySelector(".company-identity") ?? null,
        ),
      ).toBe(true);
      expect(
        detailCard?.querySelector(".detail-content")?.textContent,
      ).toContain("Información ampliada de ejemplo");
    }
  });

  it("allows a replacement local SVG path and alt to flow through both views without component edits", async () => {
    const entries = await getCollection("experience");
    const profile = await getEntry("profile", "profile");
    if (!profile) throw new Error("Missing approved profile collection entry");
    const recentEntry = entries.find(
      (entry) => entry.data.slug === "puesto-ejemplo-2024",
    );
    if (!recentEntry)
      throw new Error("Missing recent experience collection entry");
    const replacedEntry = {
      ...recentEntry,
      data: { ...recentEntry.data, companyIcon: replacementIcon },
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
        ?.includes("puesto-ejemplo-2024"),
    );

    expectCompanyIconNearCompany(
      replacedCard?.querySelector(".company-identity") ?? null,
      replacementIcon,
    );

    const detailHtml = await render(ExperienceDetail, {
      experience: replacedEntry,
      profile: profile.data,
    });
    const { document: detailDocument } = new JSDOM(detailHtml).window;

    expectCompanyIconNearCompany(
      detailDocument.querySelector(".experience-detail-card .company-identity"),
      replacementIcon,
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

  it("ships a parseable local Astro SVG and preserves icon sizing/aspect ratio through utility classes", async () => {
    const svg = await readFile("public/images/companies/astro.svg", "utf8");
    const { document } = new JSDOM(svg, { contentType: "image/svg+xml" })
      .window;
    const root = document.documentElement;

    expect(root.localName).toBe("svg");
    expect(root.getAttribute("viewBox")).toBe("0 0 64 64");
    expect(root.querySelectorAll("path").length).toBeGreaterThan(0);

    // The icon and identity geometry are now expressed as Tailwind utilities
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
    const identity = card?.querySelector(".company-identity");

    expect(icon?.classList.contains("size-10")).toBe(true);
    expect(icon?.classList.contains("shrink-0")).toBe(true);
    expect(icon?.classList.contains("object-contain")).toBe(true);
    expect(icon?.getAttribute("width")).toBe("40");
    expect(icon?.getAttribute("height")).toBe("40");
    expect(identity?.classList.contains("flex")).toBe(true);
    expect(identity?.classList.contains("min-w-0")).toBe(true);
    expect(identity?.classList.contains("items-center")).toBe(true);
    expect(identity?.classList.contains("gap-3")).toBe(true);
  });
});
