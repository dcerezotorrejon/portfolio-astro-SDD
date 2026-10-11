import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { base, site } from "../../astro.config.mjs";

describe("Astro site configuration", () => {
  it("targets the custom-domain origin with the root base path", () => {
    expect(site).toBe("https://portfolio.dcerezo.work");
    expect(base).toBe("/");
  });

  it("removes the example.com placeholder and its TODO comment", () => {
    const config = readFileSync("astro.config.mjs", "utf8");

    expect(config).not.toContain("example.com");
    expect(config).not.toMatch(/TODO/);
  });

  it("commits no CNAME file at the repository root or under public/", () => {
    expect(existsSync("CNAME")).toBe(false);
    expect(existsSync("public/CNAME")).toBe(false);
  });
});
