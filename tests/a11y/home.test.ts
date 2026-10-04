import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { render } from "../helpers/render";

describe("home page accessibility", () => {
  it("has no axe violations", async () => {
    const html = await render(Home);
    const results = await runAxeOnHtml(html);

    expect(results.violations, formatViolations(results)).toEqual([]);
  });
});
