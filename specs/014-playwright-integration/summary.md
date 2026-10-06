# Summary — 014-playwright-integration

- **Last updated:** 2026-10-07
- **Status:** done (closure metadata transition only after all gates, approvals, evidence, substantive re-anchoring resolved, and directory artifacts finalized)
- **Branch:** spec/014-playwright-integration (published; never deleted; unmerged until affirmative maintainer confirmation after final push)
- **Base revision:** ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a

## What changed

- Added Playwright Test with Chromium (`playwright.config.ts`) and `@axe-core/playwright`, removed `a11y-mcp` dependency and project MCP server (`opencode.json`), added `test:integration` command.
- Added `tests/integration/` covering `/`, profile, experience list/detail/return, floating navigation, and axe audits through WCAG 2.2 A/AA.
- Adopted approved amendment in `docs/constitution.md` (v1.10.0, 2026-10-06): integration gate (§5–6), approved browser/axe stack (§10), QA/Lead roles, Markdown-only exception preserved.
- Updated `AGENTS.md`, `specs/README.md`, `.opencode/agents/qa.md`, `.opencode/agents/dev-lead.md`; new `tests/unit/agents.test.ts` and `tests/unit/integration-governance.test.ts` verified.
- Preserved maintainer's component grouping (`src/components/home/`) verified; `index.astro` stays `/`; no new route or entry renamed.
- Updated `tests/unit/transitions/company-icon/section-headings/button-design` imports; corrected stale `tests/unit/agents.test.ts`; no weakened assertions.

## Functions / components changed

- `tests/integration/pages.spec.ts`, `profile.spec.ts`, `experience.spec.ts`, `navigation.spec.ts`, `accessibility.spec.ts` — browser coverage.
- `tests/integration/helpers/content.ts` — derived routes/content expectations.
- `tests/unit/integration-tooling.test.ts`, `tests/unit/agents.test.ts` — governance/rule verification.
- `README.md` — setup/coverage documentation.
- `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `eslint.config.js`, `.gitignore`, `.prettierignore`, `opencode.json` — runner/config.

## Verification

All applicable final gates passed: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run` (149 tests), `pnpm test:a11y`, `pnpm test:integration` (5 Chromium), `pnpm exec vitest run tests/seo`, sitemap verified. Integration applies; Markdown-only exception not used. No substantive re-anchoring unresolved; AC7 evidence recorded by QA; AC5/6/9 backed. Actual Git commit/push/merge outcomes reported externally, not frozen.
