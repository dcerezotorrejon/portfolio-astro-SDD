# Summary — Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Last updated**: 2026-10-05

## Files changed

- `.opencode/agents/spec-refiner.md` — limits writes to the assigned current
  `spec.md` and documents the shared feature branch.
- `.opencode/agents/dev-lead.md` — orchestrates at most four active tasks on the
  shared spec branch, waits for QA/evidence, handles escalations, and owns final
  commit/push through the commit skill.
- `.opencode/agents/dev.md` — works on the shared branch without task branches or
  intermediate commits/pushes; contains the task-scoped operational-document
  exception for this feature.
- `.opencode/agents/qa.md` — verifies and records evidence on the shared branch,
  returns defects to the same Dev, and cannot change production code or commit/push.
- `docs/constitution.md` — amended to version `1.4.0` on `2026-10-05` with shared
  branch, four-task concurrency, QA/rework, escalation, final commit/push, and
  incremental-spec history rules.
- `AGENTS.md` — documents the shared feature branch, task cap, handoffs, pinned
  model assignments, and final gates.
- `specs/README.md` — documents the `spec/[NNN]-[slug]` branch convention and
  immutable historical `spec.md` files.
- `tests/unit/agents.test.ts` — validates model assignments/intents, agent
  permissions/prompts, shared-branch workflow, task cap, documentation consistency,
  and retained Auto Router variants.
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
