import { describe, expect, it } from "vitest";

import { withBase } from "../../src/lib/base-url";

describe("withBase", () => {
  it("prefixes site-root paths with the deployment base", () => {
    expect(withBase("/images/companies/babel.svg")).toBe(
      "/portfolio-astro-SDD/images/companies/babel.svg",
    );
    expect(withBase("/favicon.ico")).toBe("/portfolio-astro-SDD/favicon.ico");
  });

  it("preserves fragments and query strings", () => {
    expect(withBase("/icons/github.svg#icon")).toBe(
      "/portfolio-astro-SDD/icons/github.svg#icon",
    );
    expect(withBase("/experiencia/babel-senior-frontend-engineer/")).toBe(
      "/portfolio-astro-SDD/experiencia/babel-senior-frontend-engineer/",
    );
    expect(withBase("/#trayectoria")).toBe("/portfolio-astro-SDD/#trayectoria");
    expect(withBase("/sitemap.xml?v=1")).toBe(
      "/portfolio-astro-SDD/sitemap.xml?v=1",
    );
  });

  it("leaves external, protocol-relative, and relative references unchanged", () => {
    expect(withBase("https://github.com/dcerezotorrejon")).toBe(
      "https://github.com/dcerezotorrejon",
    );
    expect(withBase("//example.com/asset.png")).toBe("//example.com/asset.png");
    expect(withBase("images/local.png")).toBe("images/local.png");
    expect(withBase("#trayectoria")).toBe("#trayectoria");
  });
});
