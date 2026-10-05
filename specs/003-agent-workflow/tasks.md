# Tasks — Agent workflow

- **Spec ID**: `003-agent-workflow`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Amend `docs/constitution.md` with the Spec relationships rule (§4.1 and
      new §4.2) and bump the version to `1.2.0`.
  - Evidence: `tests/unit/agents.test.ts` asserts `**Version**: 1.2.0`,
    `### 4.2 Spec relationships`, and `Related specs`; `pnpm test:run` passes.
- [x] T2: Add `.opencode/agents/spec-refiner.md` (primary, medium reasoning).
  - Evidence: frontmatter asserted by `tests/unit/agents.test.ts`.
- [x] T3: Add `.opencode/agents/dev-lead.md` (primary, high reasoning;
      orchestrates `dev`/`qa`).
  - Evidence: frontmatter and subagent permissions asserted by the test.
- [x] T4: Add `.opencode/agents/dev.md` (subagent; no test edits, no subagents).
  - Evidence: frontmatter and `edit tests/**` deny asserted by the test.
- [x] T5: Add `.opencode/agents/qa.md` (subagent; no `src/` edits).
  - Evidence: frontmatter and `edit src/**` deny asserted by the test.
- [x] T6: Document the agent workflow in `AGENTS.md`.
  - Evidence: test asserts `AGENTS.md` mentions the four agent IDs.
- [x] T7: Add the `Related specs` section to `specs/README.md` and
      `specs/_template/summary.md`.
  - Evidence: test asserts both files contain `Related specs`.
- [x] T8: Backfill `Related specs` in the `001` and `002` summaries.
  - Evidence: `specs/001-sdd-baseline/summary.md`,
    `specs/002-front-extra-dependencies/summary.md`.
- [x] T9: Add `tests/unit/agents.test.ts` (frontmatter + consistency).
  - Evidence: `pnpm test:run` -> 6 files, 25 tests passed.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`) — 1 page built, `sitemap-index.xml` created
- [x] Unit tests (`pnpm test:run`) — 6 files, 25 tests passed (18 new)
- [x] Accessibility (`pnpm test:a11y`) — 2 files, 2 tests passed
  - No new a11y test is required: this spec adds no page, route, or rendered
    markup. The existing accessibility gate still runs green.
- SEO: **not applicable** — no page, route, or rendered markup is added (stated
  explicitly per Constitution §5).
