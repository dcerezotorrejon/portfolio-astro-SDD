import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("home page SEO", () => {
  it("uses the approved Spanish title and meta description", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    expect(document.documentElement.lang).toBe("es");
    expect(document.title).toBe("Nombre Apellidos | Portfolio profesional");

    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")).toBe(
      "Presentación y trayectoria profesional de Nombre Apellidos. Contenido provisional de ejemplo",
    );
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(
      1,
    );
  });

  it("declares the unique absolute canonical URL for the home route", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    const canonicals = document.querySelectorAll('link[rel="canonical"]');
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0]?.getAttribute("href")).toBe("https://example.com/");
  });
});
