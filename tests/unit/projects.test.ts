import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "astro/zod";

import { projectSchema } from "../../src/content/parsers/content-schema";
import {
  assertUniqueProjects,
  sortProjects,
} from "../../src/content/parsers/content";

const repoRoot = join(import.meta.dirname, "..", "..");
const projectsDir = join(repoRoot, "src", "content", "projects");

// Same faithful mock of Astro's `image()` helper used in content.test.ts.
const imageMock = () => z.string().min(1);
const schema = projectSchema(imageMock);

const validProject = {
  slug: "sample-project",
  name: "Sample project",
  summary: "Un resumen breve.",
  technologies: ["TypeScript"],
  repositoryUrl: "https://github.com/example/sample",
  archived: false,
  order: 1,
  seo: { title: "Sample", description: "Descripción breve." },
};

describe("projectSchema (AC1)", () => {
  it("accepts a minimal valid project", () => {
    expect(schema.safeParse(validProject).success).toBe(true);
  });

  it("accepts optional license and image with alt", () => {
    const result = schema.safeParse({
      ...validProject,
      license: "GPL-3.0",
      image: { src: "./icon.svg", alt: "Icono" },
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ["a non-kebab-case slug", { slug: "Not Kebab" }],
    ["an empty name", { name: " " }],
    ["an empty summary", { summary: "" }],
    ["an empty technologies list", { technologies: [] }],
    ["a non-HTTP repository URL", { repositoryUrl: "ftp://example.com/x" }],
    ["a malformed repository URL", { repositoryUrl: "not a url" }],
    ["a non-boolean archived", { archived: "yes" }],
    [
      "a non-HTTP repository URL scheme",
      { repositoryUrl: "javascript:alert(1)" },
    ],
    ["a non-integer order", { order: 1.5 }],
    ["a missing order", { order: undefined }],
    [
      "an seo description over 160 characters",
      { seo: { title: "T", description: "x".repeat(161) } },
    ],
    ["an image without alt", { image: { src: "./icon.svg" } }],
    ["an image with empty alt", { image: { src: "./icon.svg", alt: " " } }],
  ])("rejects %s", (_label, override) => {
    expect(schema.safeParse({ ...validProject, ...override }).success).toBe(
      false,
    );
  });
});

describe("assertUniqueProjects (AC1)", () => {
  const entry = (id: string, slug: string, order: number) => ({
    id,
    data: { slug, order },
  });

  it("accepts unique slugs and orders", () => {
    expect(() =>
      assertUniqueProjects([entry("a", "a", 1), entry("b", "b", 2)]),
    ).not.toThrow();
  });

  it("rejects a duplicate slug", () => {
    expect(() =>
      assertUniqueProjects([entry("a", "same", 1), entry("b", "same", 2)]),
    ).toThrow(/Duplicate project slug "same".*"a".*"b"/);
  });

  it("rejects a duplicate order", () => {
    expect(() =>
      assertUniqueProjects([entry("a", "a", 3), entry("b", "b", 3)]),
    ).toThrow(/Duplicate project order 3.*"a".*"b"/);
  });
});

describe("sortProjects", () => {
  it("sorts ascending by order without mutating the input", () => {
    const input = [
      { data: { slug: "c", order: 3 } },
      { data: { slug: "a", order: 1 } },
      { data: { slug: "b", order: 2 } },
    ];
    const snapshot = [...input];
    expect(sortProjects(input).map((project) => project.data.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(input).toEqual(snapshot);
  });
});

/** Read top-level scalars and image.src from a project's frontmatter. */
function readFrontmatter(file: string) {
  const text = readFileSync(join(projectsDir, file), "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const scalars = new Map<string, string>();
  let imageSrc: string | undefined;
  let imageAlt: string | undefined;
  for (const line of match[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (top) scalars.set(top[1], top[2].trim());
    const nested = line.match(/^ {2}(src|alt):\s*(.*)$/);
    if (nested?.[1] === "src" && scalars.has("image")) imageSrc = nested[2];
    if (nested?.[1] === "alt" && scalars.has("image")) imageAlt = nested[2];
  }
  return { scalars, imageSrc, imageAlt };
}

const expected = {
  portfolio: {
    repositoryUrl: "https://github.com/dcerezotorrejon/portfolio-astro-SDD",
    archived: "false",
    license: undefined,
    imageSrc: undefined,
    order: "1",
  },
  openrazer: {
    repositoryUrl:
      "https://github.com/dcerezotorrejon/LinuxOpenRazerDeviceConfig",
    archived: "false",
    license: "GPL-3.0",
    imageSrc: undefined,
    order: "2",
  },
  "hassio-pacman": {
    repositoryUrl: "https://github.com/dcerezotorrejon/Hassio-pacman-cherry",
    archived: "true",
    license: undefined,
    imageSrc: "./hassio-pacman-icon.svg",
    order: "3",
  },
  "custom-aur": {
    repositoryUrl: "https://github.com/dcerezotorrejon/custom-AUR",
    archived: "true",
    license: undefined,
    imageSrc: undefined,
    order: "4",
  },
  "zot-quarantine-proxy": {
    repositoryUrl: "https://github.com/dcerezotorrejon/zot-quarantine-proxy",
    archived: "true",
    license: undefined,
    imageSrc: undefined,
    order: "5",
  },
} as const;

describe("projects collection content (AC2)", () => {
  const files = readdirSync(projectsDir).filter((file) => file.endsWith(".md"));

  it("contains exactly the five R3 entries", () => {
    expect(files.sort()).toEqual(
      Object.keys(expected)
        .map((slug) => `${slug}.md`)
        .sort(),
    );
  });

  it.each(Object.entries(expected))("%s matches R3 exactly", (slug, want) => {
    const { scalars, imageSrc, imageAlt } = readFrontmatter(`${slug}.md`);
    expect(scalars.get("slug")).toBe(slug);
    expect(scalars.get("repositoryUrl")).toBe(want.repositoryUrl);
    expect(scalars.get("archived")).toBe(want.archived);
    expect(scalars.get("license")).toBe(want.license);
    expect(scalars.get("order")).toBe(want.order);
    expect(imageSrc).toBe(want.imageSrc);
    if (want.imageSrc) expect(imageAlt?.length).toBeGreaterThan(0);
  });

  it("orders the entries portfolio, openrazer, hassio-pacman, custom-aur, zot-quarantine-proxy", () => {
    const entries = Object.keys(expected).map((slug) => ({
      data: {
        slug,
        order: Number(readFrontmatter(`${slug}.md`).scalars.get("order")),
      },
    }));
    expect(sortProjects(entries).map((entry) => entry.data.slug)).toEqual([
      "portfolio",
      "openrazer",
      "hassio-pacman",
      "custom-aur",
      "zot-quarantine-proxy",
    ]);
    expect(() => assertUniqueProjects(entries)).not.toThrow();
  });

  it("uses unique seo titles and descriptions of at most 160 characters", () => {
    const titles = new Set<string>();
    for (const slug of Object.keys(expected)) {
      const text = readFileSync(join(projectsDir, `${slug}.md`), "utf8");
      const title = text.match(/^ {2}title:\s*(.+)$/m)?.[1];
      const description = text
        .match(/^ {2}description:\s*(.+)$/m)?.[1]
        ?.replace(/^"|"$/g, "");
      expect(title).toBeTruthy();
      expect(description!.length).toBeLessThanOrEqual(160);
      titles.add(title!);
    }
    expect(titles.size).toBe(5);
  });
});
