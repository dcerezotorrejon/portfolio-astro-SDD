import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { site } from "../../astro.config.mjs";

// The site is served from the custom-domain root, so the canonical origin is
// `site` with a single trailing slash. Never join `site` with `base` (which is
// `/`) and then append another slash: that yields a `//` path.
const siteOrigin = site.replace(/\/+$/, "");
const siteRoot = `${siteOrigin}/`;
const homeFile = "dist/index.html";
const detailFiles = [
  "dist/experiencia/babel-senior-frontend-engineer/index.html",
  "dist/experiencia/nttdata-lead-engineer/index.html",
];
const firstDetailFile =
  "dist/experiencia/babel-senior-frontend-engineer/index.html";

async function collectHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectHtmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return nested.flat();
}

describe("built output root-resolved URLs", () => {
  it.skipIf(!existsSync(homeFile))(
    "emits exactly one canonical under the custom-domain origin per built page",
    async () => {
      for (const file of [homeFile, ...detailFiles]) {
        const html = await readFile(file, "utf8");
        const { document } = new JSDOM(html).window;
        const canonicals = document.querySelectorAll('link[rel="canonical"]');

        expect(canonicals, file).toHaveLength(1);
        const href = canonicals[0]?.getAttribute("href") ?? "";
        expect(href, file).toMatch(/^https:\/\//);
        expect(href.startsWith(siteRoot), href).toBe(true);
      }
    },
  );

  it.skipIf(!existsSync(homeFile))(
    "references every site-root asset at the domain root",
    async () => {
      const home = await readFile(homeFile, "utf8");
      const requiredHomeRefs = [
        "/favicon.svg",
        "/favicon.ico",
        "/fonts/open-sans-latin.woff2",
        "/icons/github.svg#icon",
        "/icons/linkedin.svg#icon",
        "/images/companies/babel.svg",
        "/images/companies/nttdata.svg",
      ];

      for (const ref of requiredHomeRefs) {
        expect(home, ref).toContain(ref);
      }

      // 024 routes the profile image through astro:assets (hashed name under _astro).
      expect(home).toContain("/_astro/profile-photo");

      // Every root-absolute asset reference resolves at the domain root: it
      // starts with a single `/` and never carries the removed deployment prefix.
      const htmlFiles = await collectHtmlFiles("dist");
      for (const file of htmlFiles) {
        const html = await readFile(file, "utf8");
        const rootRefs = [
          ...html.matchAll(/(?:href|src)="(\/[^/][^"]*)"/g),
        ].map((match) => match[1]);
        for (const ref of rootRefs) {
          expect(
            ref.startsWith("/") && !ref.startsWith("//"),
            `${file}: ${ref}`,
          ).toBe(true);
        }
      }

      // The experience-detail return link resolves at the root.
      const detail = await readFile(firstDetailFile, "utf8");
      expect(detail).toContain('href="/#trayectoria"');
    },
  );

  it.skipIf(!existsSync(homeFile))(
    "contains no former project-site subpath in any built HTML file",
    async () => {
      const htmlFiles = await collectHtmlFiles("dist");
      for (const file of htmlFiles) {
        const html = await readFile(file, "utf8");
        expect(html, file).not.toContain("/portfolio-astro-SDD");
      }
    },
  );

  it.skipIf(!existsSync("dist/sitemap-0.xml"))(
    "lists only root URLs under the custom-domain origin in the sitemap",
    async () => {
      const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (match) => match[1],
      );

      expect(locs.length).toBeGreaterThan(0);
      for (const loc of locs) {
        expect(loc.startsWith(siteRoot), loc).toBe(true);
      }
      expect(sitemap).toContain(`<loc>${siteRoot}</loc>`);
      expect(sitemap).not.toContain("/portfolio-astro-SDD");
    },
  );

  it("commits no CNAME file into the build output", () => {
    expect(existsSync("dist/CNAME")).toBe(false);
  });
});
