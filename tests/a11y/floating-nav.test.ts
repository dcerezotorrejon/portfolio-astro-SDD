import { describe, expect, it } from "vitest";

import FloatingNav from "../../src/components/FloatingNav";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { getContainer } from "../helpers/render";

describe("FloatingNav accessibility", () => {
  it("has no axe violations when server rendered with an accessible navigation name", async () => {
    const container = await getContainer();
    const nav = await container.renderToString(FloatingNav, {
      props: {
        sections: [
          { id: "inicio", label: "Inicio" },
          { id: "trayectoria", label: "Trayectoria" },
        ],
      },
    });
    const html = `<html lang="es"><head><title>Portfolio</title></head><body><main><h1>Portfolio</h1>${nav}</main></body></html>`;
    const results = await runAxeOnHtml(html);

    expect(results.violations, formatViolations(results)).toEqual([]);
  });
});
