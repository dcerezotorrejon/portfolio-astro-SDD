# Summary — Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Last updated**: 2026-10-06

## Files changed

- `.opencode/agents/spec-refiner.md` — limits writes to the assigned current
  `spec.md` and documents the shared feature branch.
- `.opencode/agents/dev-lead.md` — orchestrates at most four active tasks on the
  shared spec branch, waits for QA/evidence, handles escalations, owns final
  commit/push through the commit skill, and requests maintainer merge after push
  without merging or deleting the branch (`008-lib-reorganization`).
- `.opencode/agents/dev.md` — works on the shared branch without task branches or
  intermediate commits/pushes; tool edit permission now covers assigned
  repository paths except `tests/**` and `specs/**` (`008-lib-reorganization`).
  The task-scoped operational-document exception for this feature remains.
- `.opencode/agents/qa.md` — verifies and records evidence on the shared branch,
  returns defects to the same Dev, and cannot change production code or commit/push;
  tool edit permission now includes any assigned `specs/*/tasks.md` evidence file
  and the assigned current `spec.md` for evidence-backed acceptance-checkbox
  changes only (`008-lib-reorganization`).
- `docs/constitution.md` — amended to version `1.4.0` on `2026-10-05` with shared
  branch, four-task concurrency, QA/rework, escalation, final commit/push, and
  incremental-spec history rules; further condensed and amended by
  `008-lib-reorganization` to version `1.5.0` on `2026-10-06`, retaining those
  safeguards and requiring a final maintainer merge request.
- `AGENTS.md` — documents the shared feature branch, task cap, handoffs, pinned
  model assignments, final gates, QA's bounded acceptance-checkbox permission,
  and the Lead's post-push request for maintainer merge (`008-lib-reorganization`).
- `specs/README.md` — documents the `spec/[NNN]-[slug]` branch convention and
  immutable historical `spec.md` files.
- `tests/unit/agents.test.ts` — validates model assignments/intents, agent
  permission outcomes/prompts, shared-branch workflow, task cap, documentation
  consistency, retained Auto Router variants, QA's checkbox-only boundary, and
  final merge handoff (`008-lib-reorganization`).
- `specs/001-sdd-baseline/summary.md`,
  `specs/002-front-extra-dependencies/summary.md`,
  `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`,
  `specs/005-auto-router-agents/summary.md`,
  `specs/006-common-molecules/summary.md` — updated relationship records only;
  no historical `spec.md` was modified.
- `specs/007-workflow-changes/{spec,plan,tasks,summary}.md` — requirements,
  technical plan, QA evidence, and this summary.

## Functions / components changed

- Workflow agent configuration only; no application functions or UI components
  changed.
- `parseAgent()` / `loadAgents()` in `tests/unit/agents.test.ts` remain test helpers;
  their assertions were re-anchored to current agent configuration and workflow.

## Commits

- `3fac60b` — `feat(spec-007): adopt shared-branch workflow`.

## Related specs

- `001-sdd-baseline` — affected: established the constitution amended by this
  workflow change; its `summary.md` records the relationship.
- `002-front-extra-dependencies` — related through constitution governance; its
  frontend/tooling requirements remain unchanged.
- `003-agent-workflow` — modified: its agents and orchestration now use one shared
  feature branch, at most four active tasks, and QA/evidence-gated final commits.
  Its historical `spec.md` remains unchanged.
- `004-portfolio-home` — affected through its dependency on the agent workflow;
  product and UI requirements remain unchanged.
- `005-auto-router-agents` — affected: its model assignments for the four agents
  are superseded by pinned GPT-6 Luna references; its Auto Router configuration
  remains unchanged.
- `006-common-molecules` — affected through its dependency on the existing
  workflow; component requirements remain unchanged.
- `008-lib-reorganization` — modifies the Dev/QA tool-level edit permissions while
  preserving their role boundaries and shared-branch/commit restrictions, with QA
  permitted to mark only evidenced acceptance checkboxes in its assigned current
  spec; further condenses Constitution §5.1 and requires the Lead to request
  maintainer merge after push without executing it. The portfolio module
  relocations do not change the workflow requirements here.
- `009-workflow-governance` — further amends shared and agent-specific workflow
  guidance, permits the Dev Lead to merge only after explicit maintainer approval,
  replaces QA's accumulated run history with current evidence, and defines
  Markdown-only task and final gate selection. This summary records the later
  change; this spec's historical `spec.md` remains unchanged.
