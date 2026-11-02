import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { GET } from "../../src/pages/robots.txt";
import { SITE, withBase } from "../../src/lib/base-url";

// The endpoint ignores its context; a minimal cast keeps the call typed.
const callGet = () =>
  GET({} as Parameters<typeof GET>[0]) as Promise<Response> | Response;

describe("robots.txt endpoint", () => {
  it("returns the exact R6 body including the trailing newline", async () => {
    const response = await callGet();
    expect(await response.text()).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://portfolio.dcerezo.com/sitemap-index.xml\n",
    );
  });

  it("serves plain text as UTF-8", async () => {
    const response = await callGet();
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("builds the Sitemap URL from the configured site and base", async () => {
    const response = await callGet();
    const body = await response.text();
    const expected = new URL(withBase("/sitemap-index.xml"), SITE).href;
    expect(body).toContain(`Sitemap: ${expected}\n`);
  });

  it("does not hardcode the origin in the source", () => {
    const source = readFileSync("src/pages/robots.txt.ts", "utf8");
    expect(source).not.toContain("https://portfolio.dcerezo.com");
  });
});
