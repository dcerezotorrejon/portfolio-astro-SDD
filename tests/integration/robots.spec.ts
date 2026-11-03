import { expect, test } from "@playwright/test";
import { JSDOM } from "jsdom";
import { experiences, projects } from "./helpers/content";
import { withBase } from "./helpers/site";

const EXPECTED_ROBOTS =
  "User-agent: *\nAllow: /\n\nSitemap: https://portfolio.dcerezo.com/sitemap-index.xml\n";

test("robots.txt is served with the exact R6 body (AC6)", async ({
  request,
}) => {
  const response = await request.get(withBase("/robots.txt"));
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^text\/plain/);
  expect(await response.text()).toBe(EXPECTED_ROBOTS);
});

test("the sitemap index link resolves with status 200 (AC7)", async ({
  request,
}) => {
  const response = await request.get(withBase("/sitemap-index.xml"));
  expect(response.status()).toBe(200);
});

const pages = [
  "/",
  ...experiences.map((e) => `/experiencia/${e.slug}/`),
  ...projects.map((p) => `/proyectos/${p.slug}/`),
];

for (const path of pages) {
  test(`${path} links the sitemap index and ships no extra client code (AC7, AC8)`, async ({
    request,
  }) => {
    const response = await request.get(withBase(path));
    expect(response.status()).toBe(200);
    const html = await response.text();
    const { document } = new JSDOM(html).window;

    const links = document.querySelectorAll('link[rel="sitemap"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(withBase("/sitemap-index.xml"));
    expect((await request.get(links[0].getAttribute("href")!)).status()).toBe(
      200,
    );

    // AC8 baseline: the home page hydrates only the floating navigation island
    // and the projects carousel island (spec 033, R16) plus three inline scripts
    // (island runtime, `load` and `only` directives) plus the inline script that
    // restores the carousel on a full-document traversal (spec 033, R37);
    // detail and experience pages have no island and no inline script. Every
    // page loads exactly two modules: the router and the layout's module, which
    // applies the carousel position on router entries (R37) and sits outside
    // the island because the detail page may have loaded as a full document.
    const islands = document.querySelectorAll("astro-island");
    const inline = [...document.querySelectorAll("script:not([src])")];
    const external = [...document.querySelectorAll("script[src]")];
    expect(external.map((script) => script.getAttribute("src"))).toEqual([
      expect.stringContaining("ClientRouter"),
      expect.stringContaining("SiteLayout"),
    ]);
    if (path === "/") {
      expect(
        [...islands].map((island) => island.getAttribute("component-url")),
      ).toEqual([
        expect.stringContaining("ProjectsCarousel"),
        expect.stringContaining("FloatingNav"),
      ]);
      // Island runtime, the `load` and `only` hydration directives, and the
      // return-position script.
      expect(inline).toHaveLength(4);
      expect(
        inline.filter((script) =>
          script.textContent?.includes("projects-carousel-return"),
        ),
      ).toHaveLength(1);
    } else {
      expect(islands).toHaveLength(0);
      expect(inline).toHaveLength(0);
    }
  });
}
