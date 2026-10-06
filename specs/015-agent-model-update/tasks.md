# Tasks — 015-agent-model-update

- **Updated:** 2026-10-07
- **Branch:** `spec/015-agent-model-update`
- **Status:** in progress (QA approved T1–T3; final gates pass)
- **Plan approval:** Confirmed by maintainer (models and assignments approved; new increment confirmed; 014 left frozen/unmerged then merged with explicit permission)
- **Execution:** Serial (small scope; no parallel needed; at most 2 active if split Dev/QA)
- **Models:** Approved `opencode-go` assignments (Dev Lead/Spec Refiner `deepseek-v4-pro`; Dev `kimi-k2.7-code`; QA `deepseek-v4.1-flash`). Dev edits were applied directly by the Lead due to subagent model unavailability; QA verified with `opencode-go/deepseek-v4.1-flash`.

## Checklist

- [x] **T1 — Agent frontmatter updates** (Dev)
  - Ownership: `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`, `.opencode/agents/dev.md`, `.opencode/agents/qa.md`
  - Change only the `model:` line in each; preserve description, mode, color, permissions
  - Format all edited files
- [x] **T2 — Documentation consistency** (Dev)
  - Ownership: `AGENTS.md`
  - Update model-defaults note to match new `opencode-go` assignments
- [x] **T3 — Agent-definition verification** (QA)
  - Ownership: `tests/unit/agents.test.ts`
  - Update expected model/per-mode tuples to new references; keep safeguards
  - Verify `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`
  - Integration gate **not applicable** — record explicitly; do not run
- [x] **T4 — Final closure (Lead)**
  - After T1–T3 approved with evidence
  - Final gates apply; update `tasks.md` and `spec.md` metadata (`Status`: `done`; `Last updated`: closure date); write `summary.md`
  - Push shared branch; ask maintainer for affirmative merge permission; merge after confirmation; never delete branch

## Verification evidence — T3 (QA)

- **Task/scope:** T3 — `tests/unit/agents.test.ts` model/mode assertions updated to the four approved `opencode-go` models with all other structural assertions preserved; QA evidence recorded in this `tasks.md`.
- **Shared branch revision:** `spec/015-agent-model-update` @ `ad68831` (= `main`) plus uncommitted task changes in `tests/unit/agents.test.ts` and this `tasks.md`.
- **Files changed by QA:** `tests/unit/agents.test.ts`.
- **Model used by QA:** `opencode-go/deepseek-v4.1-flash` (role default); provider routing is not separately observable from inside the session.
- **Acceptance checkpoints:** AC1–AC5 verified — per-agent `model:` values match the approved references and only the `model:` line changed; Spec Refiner/Dev Lead both use `opencode-go/deepseek-v4-pro` while Dev (`opencode-go/kimi-k2.7-code`) and QA (`opencode-go/deepseek-v4.1-flash`) are distinct; `AGENTS.md` note matches; the updated test asserts the four models (17 tests in `tests/unit/agents.test.ts`); no `model:` line carries a variant/`#` suffix.
- **Gate results (latest):**
  - `pnpm lint` — PASS (exit 0).
  - `pnpm format:check` — PASS (the out-of-scope `specs/014-playwright-integration/tasks.md` was formatted with explicit maintainer authorization; see final-gate report below).
  - `pnpm build` — PASS (3 pages, sitemap generated).
  - `pnpm test:run` — PASS (24 files, 149 tests; `tests/unit/agents.test.ts`: 17 tests).
  - `pnpm test:a11y` — PASS (4 files, 5 tests).
  - `pnpm test:integration` — NOT APPLICABLE (no page rendering, routing, content, styles, client behavior, browser-complex component, or integration-suite/tooling changes); not run.
- **Result:** All applicable gates pass. T3 approved.

## Final feature gates (Lead, 2026-10-07)

Complete feature change set for this increment: four `.opencode/agents/*.md`,
`AGENTS.md`, `tests/unit/agents.test.ts`, and this spec directory. Non-Markdown
(a test) is present, so lint, format, build, unit, and accessibility apply.
Integration is not applicable.

| Gate          | Command                 | Result                                                                                  |
| ------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| Lint          | `pnpm lint`             | PASS                                                                                    |
| Format        | `pnpm format:check`     | PASS — all matched files use Prettier code style                                        |
| Build         | `pnpm build`            | PASS — 3 pages, sitemap generated                                                       |
| Unit          | `pnpm test:run`         | PASS — 24 files, 149 tests                                                              |
| Accessibility | `pnpm test:a11y`        | PASS — 4 files, 5 tests                                                                 |
| Integration   | `pnpm test:integration` | NOT APPLICABLE — no page/render/content/style/client/integration-suite changes; not run |

A separate `fix(spec-014)` commit removed the a11y MCP from `.mcp.json` and
formatted the frozen `specs/014-playwright-integration/tasks.md`, both with
explicit maintainer authorization on 2026-10-07. That commit is 014 debt, not
015 scope.
