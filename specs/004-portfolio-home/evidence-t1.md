# T1 QA evidence

- **Task**: T1 — Markdown collections and validated helpers.
- **Date**: 2026-10-05.
- **Dev model reported**: configured `openrouter/openai/gpt-6-luna#medium` default.
- **QA model**: GPT-6 Luna (`openrouter/openai/gpt-6-luna`), configured medium default.

## Tests added

- `tests/unit/content.test.ts` covers the approved provisional profile and both
  experience records against their schemas; replaceable profile/social values;
  rejected empty required values and unsafe/malformed URLs; required/optional and
  reversed dates; adding and sorting a dated entry without input mutation; duplicate
  route slugs with distinct filename-derived loader IDs; both accepted slug-record
  shapes; and Spanish date/current-role formatting.
- `tests/unit/agents.test.ts` retains the existing agent and spec-relationship
  assertions, updates the constitutional version assertion to `1.3.0`, and checks
  the global-design reference and its subordination to constitutional accessibility
  requirements.

## Commands and results

| Command                                                                           | Result                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run tests/unit/content.test.ts tests/unit/agents.test.ts`       | **PASS** — 2 files, 27 tests.                                                                                                                                                                                                                                        |
| `pnpm exec eslint tests/unit/content.test.ts tests/unit/agents.test.ts`           | **PASS**.                                                                                                                                                                                                                                                            |
| `pnpm exec prettier --check tests/unit/content.test.ts tests/unit/agents.test.ts` | **PASS** after formatting only these owned test files.                                                                                                                                                                                                               |
| `pnpm lint`                                                                       | **PASS**.                                                                                                                                                                                                                                                            |
| `pnpm format:check`                                                               | **FAIL** — reports formatting in 12 files, including T1-owned `src/content.config.ts`, both `src/lib/content*.ts` files, and both experience Markdown files. It also reports files owned by other concurrent tasks. QA did not format production or unrelated files. |
| `pnpm build`                                                                      | **PASS** — Astro synchronized content and built `/`; at this point the build reported one page. T4/T5 route integration is not established by this T1 result.                                                                                                        |
| `pnpm test:run`                                                                   | **FAIL** — 4 failures in homepage unit/SEO/a11y rendering tests: Astro Container reports `The required "profile/profile" content entry is missing.` at `src/pages/index.astro:10`. The T1 unit suite itself passes.                                                  |
| `pnpm test:a11y`                                                                  | **FAIL** — the homepage axe test has the same missing collection entry during rendering (`src/pages/index.astro:10`); the other two a11y tests pass.                                                                                                                 |

## Applicability and outstanding integration

- Rendered SEO and axe checks are **N/A for T1 content infrastructure**; the task
  checklist assigns those rendered-page checks to T4/T5. The current full-suite
  rendering failure is recorded above and must be resolved in integration; it is
  not evidence that SEO or accessibility passes for the completed pages.
- Responsive/browser review is **N/A for T1** because it adds no rendered UI.
- The build confirms Astro can synchronize and validate the content collections,
  but does not substitute for the assigned T4/T5 rendered-page checks.
- T1 should remain pending until the Dev owner resolves the format-gate findings in
  the T1-owned source/content files. Do not mark the task complete based on this
  evidence while its applicable gates are failing.
