import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Playwright/Vitest separation and managed browser runner", () => {
  it("runs only isolated Chromium against a fresh managed loopback preview", () => {
    const config = readFileSync(
      new URL("../../playwright.config.ts", import.meta.url),
      "utf8",
    );
    const vitest = readFileSync(
      new URL("../../vitest.config.ts", import.meta.url),
      "utf8",
    );
    expect(config).toContain('name: "chromium"');
    expect(config).toContain("reuseExistingServer: false");
    expect(config).toContain("--strictPort");
    expect(config).toContain(
      'baseURL: "http://127.0.0.1:4321/portfolio-astro-SDD"',
    );
    expect(config).toContain(
      'url: "http://127.0.0.1:4321/portfolio-astro-SDD"',
    );
    expect(config).toContain('ASTRO_PREVIEW_BACKGROUND: "1"');
    expect(config).toContain('signal: "SIGTERM"');
    expect(config).toContain("timeout: 5_000");
    expect(vitest).toContain('include: ["tests/**/*.test.{ts,tsx}"]');
    expect(vitest).toContain('exclude: ["tests/integration/**"]');
  });

  it("ignores generated reports and results", () => {
    const ignore = readFileSync(
      new URL("../../.gitignore", import.meta.url),
      "utf8",
    );
    expect(ignore).toMatch(/^playwright-report\/$/m);
    expect(ignore).toMatch(/^test-results\/$/m);
  });
});
