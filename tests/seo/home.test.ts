import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("home page SEO", () => {
  it("has a non-empty title and meta description", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    expect(document.title.trim()).not.toBe("");

    const description = document.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")?.trim()).not.toBe("");
  });

  it("declares an absolute canonical URL", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute("href")).toMatch(/^https?:\/\//);
  });
});
