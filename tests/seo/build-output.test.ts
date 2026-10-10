import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { base, site } from "../../astro.config.mjs";

const canonicalBase = `${site}${base}`;
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

describe("built output base-prefixed URLs", () => {
  it.skipIf(!existsSync(homeFile))(
    "emits exactly one base-prefixed canonical per built page",
    async () => {
      for (const file of [homeFile, ...detailFiles]) {
        const html = await readFile(file, "utf8");
        const { document } = new JSDOM(html).window;
        const canonicals = document.querySelectorAll('link[rel="canonical"]');

        expect(canonicals, file).toHaveLength(1);
        expect(canonicals[0]?.getAttribute("href"), file).toMatch(
          new RegExp(`^${canonicalBase}/`),
        );
      }
    },
  );

  it.skipIf(!existsSync(homeFile))(
    "references every site-root asset through the configured base",
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
        expect(home, ref).toContain(`${base}${ref}`);
      }

      // 024 routes the profile image through astro:assets (hashed name under _astro).
      expect(home).toContain(`${base}/_astro/profile-photo`);

      // No root-absolute asset reference may omit the base on any built page.
      const htmlFiles = await collectHtmlFiles("dist");
      for (const file of htmlFiles) {
        const html = await readFile(file, "utf8");
        const rootRefs = [
          ...html.matchAll(/(?:href|src)="(\/[^/][^"]*)"/g),
        ].map((match) => match[1]);
        for (const ref of rootRefs) {
          expect(ref.startsWith(`${base}/`), `${file}: ${ref}`).toBe(true);
        }
      }

      // The experience-detail return link resolves under the base.
      const detail = await readFile(firstDetailFile, "utf8");
      expect(detail).toContain(`href="${base}/#trayectoria"`);
    },
  );

  it.skipIf(!existsSync("dist/sitemap-0.xml"))(
    "lists only base-prefixed page URLs in the sitemap",
    async () => {
      const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
      const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (match) => match[1],
      );

      expect(locs.length).toBeGreaterThan(0);
      for (const loc of locs) {
        expect(loc.startsWith(`${canonicalBase}/`), loc).toBe(true);
      }
      expect(sitemap).toContain(`<loc>${canonicalBase}/</loc>`);
    },
  );
});
