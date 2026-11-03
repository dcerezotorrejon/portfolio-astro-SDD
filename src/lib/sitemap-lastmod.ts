/**
 * Build-time resolver for sitemap `<lastmod>` values. Each URL maps to the UTC
 * calendar date of the latest Git commit touching its source set, falling back
 * to the build date (UTC date of the injected clock) whenever that cannot be
 * resolved. Resolution never throws.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BASE } from "./base-url.ts";

export interface GitReader {
  /** Whether the repository is shallow. May throw if Git fails. */
  isShallow(): boolean;
  /** Latest committer timestamp (ISO 8601) touching `paths`, or undefined. */
  lastCommitDate(paths: string[]): string | undefined;
}

/** Finds the repo-relative experience file whose frontmatter `slug` matches. */
export type ExperienceReader = (slug: string) => string | undefined;

/** Finds the repo-relative project file whose frontmatter `slug` matches. */
export type ProjectReader = (slug: string) => string | undefined;

export interface LastmodDeps {
  now: () => Date;
  git: GitReader;
  readExperience: ExperienceReader;
  readProject: ProjectReader;
  base: string;
}

function resolveRepoRoot(): string {
  try {
    return fileURLToPath(new URL("../../", import.meta.url));
  } catch {
    // Non-file module URL (e.g. a DOM test environment): builds run from root.
    return `${process.cwd()}/`;
  }
}

const repoRoot = resolveRepoRoot();
const EXPERIENCE_DIR = "src/content/experience/";
const PROJECTS_DIR = "src/content/projects/";
const LAYOUT = "src/layouts/SiteLayout.astro";

export function createGitReader(cwd: string = repoRoot): GitReader {
  const run = (args: string[]) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  return {
    isShallow: () => run(["rev-parse", "--is-shallow-repository"]) === "true",
    lastCommitDate: (paths) =>
      run(["log", "-1", "--format=%cI", "--", ...paths]) || undefined,
  };
}

function createSlugReader(dir: string, cwd: string) {
  return (slug: string): string | undefined => {
    for (const name of readdirSync(`${cwd}${dir}`).sort()) {
      if (!name.endsWith(".md")) continue;
      const text = readFileSync(`${cwd}${dir}${name}`, "utf8");
      const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "";
      const match = /^slug:\s*["']?([^"'\r\n]+?)["']?\s*$/m.exec(front);
      if (match?.[1] === slug) return `${dir}${name}`;
    }
    return undefined;
  };
}

export function createExperienceReader(
  cwd: string = repoRoot,
): ExperienceReader {
  return createSlugReader(EXPERIENCE_DIR, cwd);
}

export function createProjectReader(cwd: string = repoRoot): ProjectReader {
  return createSlugReader(PROJECTS_DIR, cwd);
}

const utcDate = (date: Date) => date.toISOString().slice(0, 10);

function stripBase(pathname: string, base: string): string {
  const prefix = base === "/" ? "" : base.replace(/\/+$/, "");
  return prefix && pathname.startsWith(prefix)
    ? pathname.slice(prefix.length) || "/"
    : pathname;
}

export function createLastmodResolver(
  overrides: Partial<LastmodDeps> = {},
): (url: string) => string {
  const deps: LastmodDeps = {
    now: () => new Date(),
    git: createGitReader(),
    readExperience: createExperienceReader(),
    readProject: createProjectReader(),
    base: BASE,
    ...overrides,
  };
  let shallow: boolean | undefined;
  const cache = new Map<string, string>();

  const isShallow = () => {
    if (shallow === undefined) {
      try {
        shallow = deps.git.isShallow();
      } catch {
        shallow = true;
      }
    }
    return shallow;
  };

  const sourceSet = (path: string): string[] | undefined => {
    if (path === "/") {
      return [
        "src/pages/index.astro",
        LAYOUT,
        "src/content/profile/profile.md",
        EXPERIENCE_DIR,
        PROJECTS_DIR,
      ];
    }
    const match = /^\/(experiencia|proyectos)\/([^/]+)\/?$/.exec(path);
    if (!match) return undefined;
    const slug = decodeURIComponent(match[2]);
    if (match[1] === "proyectos") {
      const file = deps.readProject(slug);
      return file
        ? ["src/pages/proyectos/[slug].astro", LAYOUT, file]
        : undefined;
    }
    const file = deps.readExperience(slug);
    return file
      ? ["src/pages/experiencia/[slug].astro", LAYOUT, file]
      : undefined;
  };

  const resolve = (url: string): string => {
    const buildDate = utcDate(deps.now());
    try {
      if (isShallow()) return buildDate;
      const paths = sourceSet(stripBase(new URL(url).pathname, deps.base));
      if (!paths) return buildDate;
      const iso = deps.git.lastCommitDate(paths);
      if (!iso) return buildDate;
      const date = new Date(iso);
      return Number.isNaN(date.getTime()) ? buildDate : utcDate(date);
    } catch {
      return buildDate;
    }
  };

  return (url) => {
    let value = cache.get(url);
    if (value === undefined) {
      value = resolve(url);
      cache.set(url, value);
    }
    return value;
  };
}

/** Builds the `serialize` option for `sitemap()`; preserves all other fields. */
export function createSitemapSerializer(
  resolve: (url: string) => string = createLastmodResolver(),
) {
  return <T extends { url: string }>(item: T): T => ({
    ...item,
    lastmod: resolve(item.url),
  });
}
