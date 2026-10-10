import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { base, site } from "../../astro.config.mjs";

describe("Astro site configuration", () => {
  it("targets the GitHub Pages project site origin and base path", () => {
    expect(site).toBe("https://dcerezotorrejon.github.io");
    expect(base).toBe("/portfolio-astro-SDD");
  });

  it("removes the example.com placeholder and its TODO comment", () => {
    const config = readFileSync("astro.config.mjs", "utf8");

    expect(config).not.toContain("example.com");
    expect(config).not.toMatch(/TODO/);
  });
});
