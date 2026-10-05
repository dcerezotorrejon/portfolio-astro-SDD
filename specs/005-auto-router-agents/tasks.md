# Tasks — Auto Router agents

- **Spec ID**: `005-auto-router-agents`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Add the `high` and `medium` reasoning variants of `openrouter/auto` to
      `opencode.json` (`settings.reasoningEffort`, no `cost_tier`).
  - Evidence: `tests/unit/agents.test.ts` → "auto router model variants" asserts
    the variant ids and effort, and rejects `cost_tier`; `pnpm test:run` passes.
- [x] T2: Point the four agents at `openrouter/openrouter/auto#<variant>`
      (`dev-lead` `#high`; `spec-refiner`, `dev`, `qa` `#medium`).
  - Evidence: `tests/unit/agents.test.ts` → "uses the expected mode and model"
    and "$id routes through the Auto Router".
- [x] T3: Append a `## Model intent` section to each agent body.
  - Evidence: `tests/unit/agents.test.ts` → "$id documents its reasoning intent".
- [x] T4: Re-anchor `tests/unit/agents.test.ts` (model references plus Auto
      Router variant assertions).
  - Evidence: `pnpm test:run tests/unit/agents.test.ts` → 29 tests passed.
- [x] T5: Re-anchor `specs/003-agent-workflow` (`spec.md` and `summary.md`) to
      reference this spec and refresh the date.
  - Evidence: `specs/003-agent-workflow/spec.md` R2–R5 and trailing note;
    `specs/003-agent-workflow/summary.md` → `Related specs`.

## Gate summary

- [x] Lint (`pnpm lint`) — passed.
- [x] Format (`pnpm format:check`) — the files changed by this spec pass
      Prettier (`prettier --check` over the changed files → clean). The
      repository-wide run is blocked by untracked work outside this spec's
      scope: `specs/004-portfolio-home/evidence-t6.md` (the whole
      `specs/004-portfolio-home/` directory is untracked and was already failing
      before this change).
- [x] Build (`pnpm build`) — 3 pages built, `sitemap-index.xml` created.
- [x] Unit tests (`pnpm test:run`) — 16 files, 88 tests passed.
- [x] Accessibility (`pnpm test:a11y`) — 4 files, 5 tests passed.
  - No new a11y test is required: this spec adds no page, route, or rendered
    markup. The existing accessibility gate still runs green.
- SEO: **not applicable** — no page, route, or rendered markup is added (stated
  explicitly per Constitution §5).
