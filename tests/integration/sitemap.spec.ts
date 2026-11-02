import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { JSDOM } from "jsdom";
import { SITE } from "../../src/lib/base-url";
import { experiences } from "./helpers/content";
import { withBase } from "./helpers/site";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const origin = SITE.replace(/\/+$/, "");
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function parseXml(xml: string): Document {
  // Throws on malformed XML, which doubles as the well-formedness check.
  return new JSDOM(xml, { contentType: "text/xml" }).window.document;
}

async function fetchXml(request: APIRequestContext, path: string) {
  const response = await request.get(withBase(path));
  expect(response.status(), path).toBe(200);
  return { text: await response.text() };
}

async function readSitemap(request: APIRequestContext) {
  const { text } = await fetchXml(request, "/sitemap-0.xml");
  const doc = parseXml(text);
  const urls = [...doc.getElementsByTagName("url")].map((url) => {
    const child = (name: string) =>
      [...url.children].filter((el) => el.localName === name);
    return {
      loc: child("loc").map((el) => el.textContent ?? ""),
      lastmod: child("lastmod").map((el) => el.textContent ?? ""),
      forbidden: [...url.children]
        .map((el) => el.localName)
        .filter((name) => name === "changefreq" || name === "priority"),
    };
  });
  return urls;
}

const expectedLocs = [
  `${origin}/`,
  ...experiences.map((e) => `${origin}/experiencia/${e.slug}/`),
];

test.describe("sitemap files (AC1, AC4)", () => {
  test("both sitemap files are built and served (AC1)", async ({ request }) => {
    expect(existsSync(join(root, "dist", "sitemap-index.xml"))).toBe(true);
    expect(existsSync(join(root, "dist", "sitemap-0.xml"))).toBe(true);
    expect((await request.get(withBase("/sitemap-index.xml"))).status()).toBe(
      200,
    );
    expect((await request.get(withBase("/sitemap-0.xml"))).status()).toBe(200);
    const config = readFileSync(join(root, "astro.config.mjs"), "utf8");
    expect(config).toMatch(
      /import\s+sitemap\s+from\s+["']@astrojs\/sitemap["']/,
    );
    expect(config).toMatch(/sitemap\(/);
  });

  test("sitemap-index.xml references sitemap-0.xml once (AC4)", async ({
    request,
  }) => {
    const { text } = await fetchXml(request, "/sitemap-index.xml");
    const doc = parseXml(text);
    expect(doc.documentElement.localName).toBe("sitemapindex");
    expect(doc.documentElement.namespaceURI).toBe(SITEMAP_NS);
    const sitemaps = [...doc.getElementsByTagName("sitemap")];
    expect(sitemaps).toHaveLength(1);
    const locs = [...sitemaps[0].children].filter((e) => e.localName === "loc");
    expect(locs).toHaveLength(1);
    expect(locs[0].textContent).toBe(`${origin}/sitemap-0.xml`);
  });
});

test.describe("sitemap-0.xml URL set (AC2, AC3)", () => {
  test("lists exactly the home page and one URL per experience slug (AC2)", async ({
    request,
  }) => {
    const urls = await readSitemap(request);
    const locs = urls.flatMap((u) => u.loc);
    expect(urls.every((u) => u.loc.length === 1)).toBe(true);
    expect(new Set(locs).size).toBe(locs.length);
    expect([...locs].sort()).toEqual([...expectedLocs].sort());
    for (const loc of locs) {
      expect(loc).not.toMatch(/\.(xml|txt|svg|png|ico|js|css|woff2?)$/);
    }
  });

  test("every loc is a root URL equal to the served page canonical (AC3)", async ({
    request,
  }) => {
    const urls = await readSitemap(request);
    expect(urls.length).toBeGreaterThan(0);
    for (const { loc } of urls) {
      const url = loc[0];
      expect(url.startsWith(`${origin}/`), url).toBe(true);
      expect(new URL(url).pathname, url).not.toContain("//");
      expect(url).not.toContain("/portfolio-astro-SDD");

      const response = await request.get(withBase(new URL(url).pathname));
      expect(response.status(), url).toBe(200);
      const { document } = new JSDOM(await response.text()).window;
      const canonicals = document.querySelectorAll('link[rel="canonical"]');
      expect(canonicals, url).toHaveLength(1);
      expect(canonicals[0].getAttribute("href"), url).toBe(url);
    }
  });
});

test.describe("sitemap-0.xml entry elements (AC5)", () => {
  test("each url has one valid lastmod and no changefreq or priority", async ({
    request,
  }) => {
    const urls = await readSitemap(request);
    const todayUtc = new Date().toISOString().slice(0, 10);
    expect(urls.length).toBeGreaterThan(0);
    for (const { loc, lastmod, forbidden } of urls) {
      expect(lastmod, loc[0]).toHaveLength(1);
      expect(lastmod[0]).toMatch(/^\d{4}-\d{2}-\d{2}(T00:00:00\.000Z)?$/);
      const date = lastmod[0].slice(0, 10);
      const parsed = new Date(`${date}T00:00:00Z`);
      expect(Number.isNaN(parsed.getTime()), date).toBe(false);
      expect(parsed.toISOString().slice(0, 10), date).toBe(date);
      expect(date <= todayUtc, `${date} <= ${todayUtc}`).toBe(true);
      expect(forbidden, loc[0]).toEqual([]);
    }
  });
});

// AC13: dates are computed independently from committed history only.
function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function experienceFileFor(slug: string): string {
  const dir = join(root, "src", "content", "experience");
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(dir, name), "utf8");
    if (new RegExp(`^slug:\\s*["']?${slug}["']?\\s*$`, "m").test(text)) {
      return `src/content/experience/${name}`;
    }
  }
  throw new Error(`No experience file for slug ${slug}`);
}

function expectedDate(paths: string[]): string | undefined {
  const iso = git([
    "log",
    "-1",
    "--format=%cI",
    "--",
    ...paths.map((p) => `:(literal)${p}`),
  ]);
  return iso ? new Date(iso).toISOString().slice(0, 10) : undefined;
}

test("lastmod equals the latest commit date of the R5c source set (AC13)", async ({
  request,
}) => {
  const urls = await readSitemap(request);
  const shallow = git(["rev-parse", "--is-shallow-repository"]) === "true";
  if (shallow) {
    test.info().annotations.push({
      type: "AC13",
      description: "Shallow repository: R5c not exercised; only AC5 asserted.",
    });
    for (const { lastmod } of urls) {
      expect(lastmod[0]).toMatch(/^\d{4}-\d{2}-\d{2}(T00:00:00\.000Z)?$/);
    }
    return;
  }

  const layout = "src/layouts/SiteLayout.astro";
  const sources = new Map<string, string[]>([
    [
      `${origin}/`,
      [
        "src/pages/index.astro",
        layout,
        "src/content/profile/profile.md",
        "src/content/experience/",
      ],
    ],
    ...experiences.map((e): [string, string[]] => [
      `${origin}/experiencia/${e.slug}/`,
      ["src/pages/experiencia/[slug].astro", layout, experienceFileFor(e.slug)],
    ]),
  ]);

  const todayUtc = new Date().toISOString().slice(0, 10);
  expect(urls).toHaveLength(sources.size);
  for (const { loc, lastmod } of urls) {
    const paths = sources.get(loc[0]);
    expect(paths, loc[0]).toBeDefined();
    // Without any commit for the source set the build date is expected.
    const expected = expectedDate(paths!) ?? todayUtc;
    expect(lastmod[0].slice(0, 10), loc[0]).toBe(expected);
  }
});
