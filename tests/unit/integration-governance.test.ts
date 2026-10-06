import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const normalized = (text: string) => text.replace(/\s+/g, " ");
const constitution = read("docs/constitution.md");
const agentsGuide = read("AGENTS.md");
const specsGuide = read("specs/README.md");
const qa = read(".opencode/agents/qa.md");
const lead = read(".opencode/agents/dev-lead.md");

describe("integration gate governance", () => {
  it("versions the approved amendment and defines when integration applies", () => {
    expect(constitution).toMatch(/\*\*Version\*\*: 1\.10\.0/);
    expect(constitution).toMatch(/\*\*Last amended\*\*: 2026-10-06/);
    expect(normalized(constitution)).toContain(
      "The integration gate applies to changes that affect page rendering, routing, content, styles, or client behavior; browser-complex components; and the integration suite or its tooling.",
    );
    expect(normalized(constitution)).toContain(
      "Other changes MUST explicitly record integration as not applicable.",
    );
  });

  it("preserves the Markdown-only exception and excludes integration from it", () => {
    expect(normalized(constitution)).toContain(
      "When a task's complete changed-file set consists exclusively of `.md` files outside `src/content/**`, the only applicable verification gates are lint and format.",
    );
    expect(normalized(constitution)).toContain(
      "The Markdown-only exception also excludes integration: do not run",
    );
    expect(normalized(constitution)).toContain(
      "`pnpm test:integration` for a task or final feature change set covered by that exception.",
    );
    expect(normalized(qa)).toContain(
      "The Markdown-only exception takes precedence",
    );
    expect(lead).toContain("Never run integration under the Markdown-only");
  });

  it("aligns QA ownership, Lead final-gate responsibility, and approved tools", () => {
    expect(qa).toContain(
      "**Integration** tests with Playwright Test and Chromium",
    );
    expect(qa).toContain("@axe-core/playwright");
    expect(qa).toContain("WCAG A/AA tags through 2.2");
    expect(qa).toContain("including integration test authoring");
    expect(qa).toContain("pnpm test:integration");
    expect(lead).toContain("Also run `pnpm test:integration`");
    expect(lead).toContain(
      "Run all final quality gates in Constitution §§5–6.",
    );
    expect(normalized(constitution)).toContain(
      "Keep Vitest `axe-core` accessibility tests",
    );
    expect(constitution).toContain("`@axe-core/playwright` audits");
    expect(agentsGuide).toContain("pnpm test:integration");
    expect(agentsGuide).toContain("Markdown-only");
    expect(normalized(specsGuide)).toContain(
      "Integration applicability and the Markdown-only exception follow Constitution §§5–6.",
    );
    expect(constitution).not.toMatch(/a11y-mcp|MCP server configured.*audit/i);
  });
});
