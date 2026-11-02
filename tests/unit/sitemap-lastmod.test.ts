import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLastmodResolver,
  createSitemapSerializer,
  type GitReader,
} from "../../src/lib/sitemap-lastmod";

// 2026-03-10T23:30:00-05:00 is 2026-03-11 UTC; the UTC date is what counts.
const NOW = new Date("2026-03-11T04:30:00.000Z");
const BUILD = "2026-03-11";
const SITE = "https://portfolio.dcerezo.com";

function fakeGit(overrides: Partial<GitReader> = {}) {
  const lastCommitDate = vi.fn(
    () => "2026-01-05T10:00:00+00:00" as string | undefined,
  );
  const isShallow = vi.fn(() => false);
  return { isShallow, lastCommitDate, ...overrides } as GitReader & {
    isShallow: ReturnType<typeof vi.fn>;
    lastCommitDate: ReturnType<typeof vi.fn>;
  };
}

const readExperience = (slug: string) =>
  slug === "my-slug" ? "src/content/experience/different-name.md" : undefined;

function make(git: GitReader, exp = readExperience) {
  return createLastmodResolver({
    now: () => NOW,
    git,
    readExperience: exp,
    base: "/",
  });
}

describe("createLastmodResolver", () => {
  let git: ReturnType<typeof fakeGit>;
  beforeEach(() => {
    git = fakeGit();
  });

  it("queries the exact home source set", () => {
    expect(make(git)(`${SITE}/`)).toBe("2026-01-05");
    expect(git.lastCommitDate).toHaveBeenCalledWith([
      "src/pages/index.astro",
      "src/layouts/SiteLayout.astro",
      "src/content/profile/profile.md",
      "src/content/experience/",
    ]);
  });

  it("queries the detail source set, matching the slug by frontmatter", () => {
    expect(make(git)(`${SITE}/experiencia/my-slug/`)).toBe("2026-01-05");
    expect(git.lastCommitDate).toHaveBeenCalledWith([
      "src/pages/experiencia/[slug].astro",
      "src/layouts/SiteLayout.astro",
      "src/content/experience/different-name.md",
    ]);
  });

  it("strips a non-root base before matching routes", () => {
    const resolve = createLastmodResolver({
      now: () => NOW,
      git,
      readExperience,
      base: "/portfolio/",
    });
    resolve(`${SITE}/portfolio/experiencia/my-slug/`);
    expect(git.lastCommitDate.mock.calls[0][0][2]).toBe(
      "src/content/experience/different-name.md",
    );
  });

  it("converts committer offsets to the UTC date", () => {
    git.lastCommitDate.mockReturnValue("2026-01-01T23:30:00-02:00");
    expect(make(git)(`${SITE}/`)).toBe("2026-01-02");
  });

  it("uses the UTC date of the clock, not the local date, as build date", () => {
    git.lastCommitDate.mockReturnValue(undefined);
    expect(make(git)(`${SITE}/`)).toBe(BUILD);
  });

  it("falls back when a Git command throws", () => {
    git.lastCommitDate.mockImplementation(() => {
      throw new Error("not a git repository");
    });
    expect(make(git)(`${SITE}/`)).toBe(BUILD);
  });

  it("falls back when the shallow check throws", () => {
    git.isShallow.mockImplementation(() => {
      throw new Error("git not found");
    });
    expect(make(git)(`${SITE}/`)).toBe(BUILD);
    expect(git.lastCommitDate).not.toHaveBeenCalled();
  });

  it("falls back for every URL in a shallow repository, checking once", () => {
    git.isShallow.mockReturnValue(true);
    const resolve = make(git);
    expect(resolve(`${SITE}/`)).toBe(BUILD);
    expect(resolve(`${SITE}/experiencia/my-slug/`)).toBe(BUILD);
    expect(git.lastCommitDate).not.toHaveBeenCalled();
    expect(git.isShallow).toHaveBeenCalledTimes(1);
  });

  it("falls back when no commit touches the source set", () => {
    git.lastCommitDate.mockReturnValue("");
    expect(make(git)(`${SITE}/`)).toBe(BUILD);
  });

  it("falls back for unknown routes without querying Git", () => {
    expect(make(git)(`${SITE}/futura/`)).toBe(BUILD);
    expect(git.lastCommitDate).not.toHaveBeenCalled();
  });

  it("falls back for unknown slugs and failing experience readers", () => {
    expect(make(git)(`${SITE}/experiencia/nope/`)).toBe(BUILD);
    const throwing = make(git, () => {
      throw new Error("fs");
    });
    expect(throwing(`${SITE}/experiencia/my-slug/`)).toBe(BUILD);
    expect(git.lastCommitDate).not.toHaveBeenCalled();
  });

  it("caches results per URL", () => {
    const resolve = make(git);
    resolve(`${SITE}/`);
    resolve(`${SITE}/`);
    expect(git.lastCommitDate).toHaveBeenCalledTimes(1);
  });
});

describe("createSitemapSerializer", () => {
  it("sets lastmod, preserves fields, adds no changefreq/priority", () => {
    const out = createSitemapSerializer(() => "2026-02-02")({
      url: `${SITE}/`,
      extra: 1,
    });
    expect(out).toEqual({ url: `${SITE}/`, extra: 1, lastmod: "2026-02-02" });
    expect(out).not.toHaveProperty("changefreq");
    expect(out).not.toHaveProperty("priority");
  });
});

describe("astro.config.mjs wiring", () => {
  it("passes a serialize that uses the resolver, without Git or real clock", async () => {
    vi.resetModules();
    const resolver = vi.fn((url: string) => `stub:${url}`);
    vi.doMock("../../src/lib/sitemap-lastmod.ts", async () => {
      const actual = await vi.importActual<
        typeof import("../../src/lib/sitemap-lastmod")
      >("../../src/lib/sitemap-lastmod.ts");
      return {
        ...actual,
        createSitemapSerializer: () => actual.createSitemapSerializer(resolver),
      };
    });
    const sitemapOpts = vi.fn();
    vi.doMock("@astrojs/sitemap", () => ({
      default: (opts: unknown) => {
        sitemapOpts(opts);
        return { name: "sitemap", hooks: {} };
      },
    }));
    await import("../../astro.config.mjs");
    const { serialize } = sitemapOpts.mock.calls[0][0];
    expect(serialize({ url: `${SITE}/`, foo: "bar" })).toEqual({
      url: `${SITE}/`,
      foo: "bar",
      lastmod: `stub:${SITE}/`,
    });
    expect(resolver).toHaveBeenCalledWith(`${SITE}/`);
    vi.doUnmock("../../src/lib/sitemap-lastmod.ts");
    vi.doUnmock("@astrojs/sitemap");
  });
});
