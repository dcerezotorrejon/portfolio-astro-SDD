import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("site layout client router", () => {
  it("emits the ClientRouter marker in the head", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    // SiteLayout is shared by every page, so layout-level ClientRouter
    // coverage applies to the whole site.
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="astro-view-transitions-enabled"]',
    );
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("true");
  });

  it("keeps the default ClientRouter prefetch behavior", () => {
    const config = readFileSync("astro.config.mjs", "utf8");
    expect(config).not.toMatch(/\bprefetch\b/);
  });
});
