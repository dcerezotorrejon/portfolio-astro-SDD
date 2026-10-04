import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("home page", () => {
  it("renders the page heading", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    expect(document.querySelector("h1")?.textContent).toBe("Astro");
  });
});
