import { describe, expect, it } from "vitest";

import { withBase } from "../../src/lib/base-url";

describe("withBase", () => {
  it("leaves site-root paths unchanged under the root base", () => {
    expect(withBase("/images/companies/babel.svg")).toBe(
      "/images/companies/babel.svg",
    );
    expect(withBase("/favicon.ico")).toBe("/favicon.ico");
  });

  it("preserves fragments and query strings", () => {
    expect(withBase("/icons/github.svg#icon")).toBe("/icons/github.svg#icon");
    expect(withBase("/experiencia/babel-senior-frontend-engineer/")).toBe(
      "/experiencia/babel-senior-frontend-engineer/",
    );
    expect(withBase("/#trayectoria")).toBe("/#trayectoria");
    expect(withBase("/sitemap.xml?v=1")).toBe("/sitemap.xml?v=1");
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
