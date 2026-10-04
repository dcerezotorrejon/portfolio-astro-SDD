import axe from "axe-core";
import { JSDOM } from "jsdom";

export type AxeResults = Awaited<ReturnType<typeof axe.run>>;

/**
 * Runs axe-core accessibility checks against a static HTML string.
 *
 * The HTML is loaded into a JSDOM document and axe-core is evaluated inside that
 * window so it can inspect the DOM without a real browser.
 */
export async function runAxeOnHtml(html: string): Promise<AxeResults> {
  const dom = new JSDOM(html, { runScripts: "outside-only" });
  const { window } = dom;

  window.eval(axe.source);

  const axeInWindow = (window as unknown as { axe: typeof axe }).axe;

  return axeInWindow.run(window.document, {
    rules: {
      // A server-rendered fragment is not a full page landmark structure.
      region: { enabled: false },
    },
  });
}

/**
 * Formats axe violations into a readable list for test failure messages.
 */
export function formatViolations(results: AxeResults): string {
  return results.violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(" "));
      return `- [${violation.id}] ${violation.help} (${targets.join(", ")})`;
    })
    .join("\n");
}
