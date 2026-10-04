import { describe, expect, it } from "vitest";

import Counter from "../fixtures/Counter";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { getContainer } from "../helpers/render";

describe("React fixture accessibility", () => {
  it("has no axe violations when server rendered", async () => {
    const container = await getContainer();
    const html = await container.renderToString(Counter, {
      props: { initial: 1 },
    });
    const document = `<html lang="en"><head><title>Counter fixture</title></head><body>${html}</body></html>`;
    const results = await runAxeOnHtml(document);

    expect(results.violations, formatViolations(results)).toEqual([]);
  });
});
