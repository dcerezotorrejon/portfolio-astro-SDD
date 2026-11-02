import { expect, test } from "@playwright/test";
import { JSDOM } from "jsdom";
import { experiences } from "./helpers/content";
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

const pages = ["/", ...experiences.map((e) => `/experiencia/${e.slug}/`)];

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

    // AC8 baseline (unchanged by this increment): the home page hydrates only
    // the floating navigation island plus two inline scripts; detail pages have
    // no island and no inline script. Every page loads only the router module.
    const islands = document.querySelectorAll("astro-island");
    const inline = [...document.querySelectorAll("script:not([src])")];
    const external = [...document.querySelectorAll("script[src]")];
    expect(external).toHaveLength(1);
    expect(external[0].getAttribute("src")).toContain("ClientRouter");
    if (path === "/") {
      expect(islands).toHaveLength(1);
      expect(islands[0].getAttribute("component-url")).toContain("FloatingNav");
      expect(inline).toHaveLength(2);
    } else {
      expect(islands).toHaveLength(0);
      expect(inline).toHaveLength(0);
    }
  });
}
