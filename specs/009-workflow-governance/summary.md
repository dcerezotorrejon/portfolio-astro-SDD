# Summary — Workflow Governance Update

- **Spec ID**: `009-workflow-governance`
- **Last updated**: 2026-10-06

## Files changed

- `docs/constitution.md` — amended §§5–6 with the role-neutral Markdown-only
  verification-gate exception; retained shared workflow safeguards and
  current-source precedence; incremented the constitution from `1.6.0` to `1.6.1`.
- `AGENTS.md` — points to constitution-defined gate applicability, including the
  Markdown-only exception, without duplicating agent-specific procedures.
- `.opencode/agents/spec-refiner.md` — requires ambiguity, acceptance/verification,
  and implementation-feasibility checks against current authority.
- `.opencode/agents/dev-lead.md` — adds task-scoped governance/configuration edit
  authority and explicit-approval-gated merge permission; selects final gates
  based on the complete feature change set and preserves the no-delete boundary.
- `.opencode/agents/dev.md` — requires Prettier on every task-modified file and a
  command/file/result handoff report.
- `.opencode/agents/qa.md` — requires latest-only evidence, formatting-only
  Markdown review, and the Markdown-only task-gate exception; the temporary 004
  evidence permission was revoked after T2.
- `tests/unit/agents.test.ts` — verifies current agent permissions, prompts,
  shared guidance, and workflow boundaries; its constitutional version/date
  expectations were updated to `1.6.1` and the actual amendment date.
- `specs/004-portfolio-home/tasks.md` — consolidates latest QA evidence; removed
  20 standalone `evidence*.md` files.
- `specs/{001-sdd-baseline,003-agent-workflow,004-portfolio-home,007-workflow-changes,008-lib-reorganization}/summary.md`
  — records actual relationships to this change.
- `specs/009-workflow-governance/{spec,plan,tasks,summary}.md` — current feature
  requirements, implementation plan, QA evidence, and this summary.

## Functions / components changed

- No application functions, components, content, routes, or rendered markup
  changed. Agent behavior, governance instructions, and consistency tests changed.

## Related specs

- `001-sdd-baseline` — affected: its constitution is further amended; its
  quality-gate policy now includes the Markdown-only exception; its historical
  `spec.md` remains unchanged.
- `003-agent-workflow` — modified: agent procedures and shared workflow safeguards
  are further clarified and updated, including task and final gate selection.
- `004-portfolio-home` — modified: its latest QA evidence is consolidated in
  `tasks.md`; product requirements and task statuses remain unchanged.
- `007-workflow-changes` — modified: the merge, evidence-retention, and agent
  permission rules are further refined, including the Markdown-only gate exception.
- `008-lib-reorganization` — modified: the current agent workflow further
  supersedes the earlier merge restriction, updates Dev Lead authority, and
  adopts the Markdown-only gate-selection policy.
