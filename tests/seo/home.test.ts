import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { site } from "../../astro.config.mjs";
import { render } from "../helpers/render";

// Build the root route from a single leading slash so the root base (`/`) never
// produces a `//` path (`new URL(`${base}/`, site)` would throw at the root).
const homeUrl = new URL("/", site);

describe("home page SEO", () => {
  it("uses the approved Spanish title and meta description", async () => {
    const html = await render(Home, {}, new Request(homeUrl));
    const { document } = new JSDOM(html).window;

    expect(document.documentElement.lang).toBe("es");
    expect(document.title).toBe(
      "Daniel Cerezo Torrejón | Senior Frontend Engineer | Portfolio profesional",
    );

    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")).toBe(
      "Presentación y trayectoria profesional de Daniel Cerezo Torrejón, Senior Frontend Engineer & Software Architect.",
    );
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(
      1,
    );
  });

  it("declares the unique absolute canonical URL for the home route", async () => {
    const html = await render(Home, {}, new Request(homeUrl));
    const { document } = new JSDOM(html).window;

    const canonicals = document.querySelectorAll('link[rel="canonical"]');
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]?.getAttribute("href")).toBe(
      "https://portfolio.dcerezo.work/",
    );
  });
});
