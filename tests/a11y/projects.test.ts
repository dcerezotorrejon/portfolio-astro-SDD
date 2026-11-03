import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { render } from "../helpers/render";

/** 033-projects-section, T2: AC5 and AC20 over the server-rendered home. */
describe("home projects section accessibility", async () => {
  const html = await render(Home);
  const document = new JSDOM(html).window.document;
  const section = document.querySelector("#proyectos")!;

  it("has no axe violations in the section", async () => {
    const results = await runAxeOnHtml(html);

    expect(results.violations, formatViolations(results)).toEqual([]);
  });

  it("keeps one h1, one h2 and one h3 per project after the history", () => {
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(section.querySelectorAll("h2")).toHaveLength(1);
    expect(section.querySelectorAll("h3")).toHaveLength(5);
    expect(section.previousElementSibling?.id).toBe("trayectoria");
    expect(section.getAttribute("aria-labelledby")).toBe(
      section.querySelector("h2")?.id,
    );
  });

  it("gives every exposed link a unique name that starts with its label", () => {
    const names = [...section.querySelectorAll("a")].map(
      (link) => link.getAttribute("aria-label") ?? link.textContent?.trim(),
    );

    expect(names).toHaveLength(10);
    expect(new Set(names).size).toBe(10);
    for (const name of names) {
      expect(name).toMatch(/^(Más información|GitHub): .+/);
    }
  });

  it("names both arrows and keeps them disabled before hydration", () => {
    const arrows = [...section.querySelectorAll("button")];

    expect(arrows.map((arrow) => arrow.getAttribute("aria-label"))).toEqual([
      "Proyecto anterior",
      "Proyecto siguiente",
    ]);
    expect(arrows.every((arrow) => arrow.disabled)).toBe(true);
  });
});
