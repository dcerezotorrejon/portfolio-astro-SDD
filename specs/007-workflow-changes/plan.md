# Plan — Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Last updated**: 2026-10-05

## Approach

1. Implement the branch handoff and role rules in the four custom agent prompts.
   Tighten the Spec Refiner and Dev Lead edit permissions, specify the Dev → QA
   same-branch loop, require the Lead to merge only QA-approved work and delete
   local/remote Dev branches, and document conflict/technical-decision escalation.
2. Preserve the four uncommitted pinned model assignments (`gpt-6-luna#high` for
   `dev-lead`; `gpt-6-luna#medium` for the other agents) and update each
   `Model intent` section to match. Leave `opencode.json`'s Auto Router variants
   unchanged.
3. Re-anchor `tests/unit/agents.test.ts` to the pinned models, the revised prompt
   and permission contracts, and the still-configured Auto Router variants.
4. Amend `docs/constitution.md` from version `1.3.0` to `1.4.0`, dated
   `2026-10-05`. Put the branch/task/QA/merge and escalation rules in the task
   lifecycle section, and put the historical-spec immutability rule in the
   spec-anchored development/spec-relationships guidance. Update `AGENTS.md` and
   `specs/README.md` to mirror the operational workflow and branch naming.
5. Keep prior `spec.md` files untouched. After implementation, update only the
   relevant earlier `summary.md` relationship records and create this feature's
   `summary.md`, resolving the anticipated relationships in `spec.md`.
6. Verify the workflow in a disposable Git repository with a bare `origin`: create
   a spec branch and task branches, exercise QA pass/fail/rework, integrate only
   after approval, and confirm local/remote Dev-branch cleanup while retaining the
   spec branch. Then run all constitutional gates on the integrated spec branch.

## Files to change

- `.opencode/agents/spec-refiner.md` — write only assigned `spec.md` files; align
  prompt and edit permissions.
- `.opencode/agents/dev-lead.md` — specify branch creation/orchestration,
  maintainer approvals, conflict escalation, merge/cleanup duties, and prohibit
  spec-file edits while retaining planning/summary ownership.
- `.opencode/agents/dev.md` — require a per-task branch and QA handoff; preserve
  implementation-only duties. For this spec's explicitly authorized document
  task only, allow edits to `docs/constitution.md`, `AGENTS.md`, and
  `specs/README.md`; prohibit all other docs/spec files, tests, and production
  code as already scoped by the role.
- `.opencode/agents/qa.md` — verify the Dev's branch, write tests/evidence on that
  same branch, return defects to the same Dev, and never merge or edit production
  code.
- `docs/constitution.md` — version/date amendment and binding workflow/history
  rules.
- `AGENTS.md` — workflow sequence, branch naming, current pinned model assignments,
  responsibilities, and quality gates.
- `specs/README.md` — `spec/[NNN]-[slug]` branch convention and incremental-spec
  history rule.
- `tests/unit/agents.test.ts` — pinned model, model-intent, permissions, workflow
  prompt, constitution, and guide consistency assertions; retain Auto Router
  variant coverage.
- `specs/001-sdd-baseline/summary.md`,
  `specs/002-front-extra-dependencies/summary.md`,
  `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`,
  `specs/005-auto-router-agents/summary.md`, and
  `specs/006-common-molecules/summary.md` — add or refresh only applicable
  `Related specs` records; do not edit their `spec.md` files.
- `specs/007-workflow-changes/summary.md` — final changed-file/function record
  and resolved `Related specs`.
- `specs/007-workflow-changes/plan.md` and `tasks.md` — this plan and execution
  evidence checklist.

`opencode.json`, application source, and all historical `spec.md` files are not
intended to change.

## Key decisions and trade-offs

- **Branch convention:** Create `spec/007-workflow-changes` from the current
  project base (`main` in this checkout), publish it to `origin`, and create each
  `dev/007-workflow-changes/Tn` from the latest spec branch. Dev publishes its
  task branch for QA; QA uses the same branch. This makes the approved remote
  cleanup requirement actionable, at the cost of remote branch churn.
- **Sequential execution:** Use one active task branch at a time in this shared
  checkout. Although the work is separable, concurrent checkouts would risk
  changing the branch underneath Dev/QA and overlapping updates to `tasks.md`.
  Merge each validated task before creating the next task branch.
- **Permission scope:** OpenCode permissions are ordered glob rules and the last
  matching rule wins. Use narrow path exceptions and prompt-level limits. A static
  permission glob cannot bind dynamically to only the currently assigned spec;
  therefore Refiner/Lead prompts additionally restrict edits to the assigned
  current artifact. Dev's three documentation paths are a maintainer-authorized,
  one-feature exception; no historical `spec.md` is included.
- **Merge strategy:** Use a no-fast-forward merge for each QA-approved Dev branch
  to retain one visible integration boundary per task. The final feature-branch
  merge to `main` remains out of scope.
- **Incremental spec history:** Historical `spec.md` files remain immutable.
  Re-anchoring consists of adding relationship records to affected summaries and
  keeping the new spec accurate; it does not rewrite the previous agreement.
- **Model routing:** Keep the model references already present in the working tree
  and align prompt intent/tests. Do not remove or edit the now-unused Auto Router
  variants in `opencode.json`.

## Risks and mitigations

- **Permission-glob mistakes:** Unit-test the role-specific ordered edit rules
  and manually inspect the final rules for allowed and denied paths.
- **Stale prior summaries:** Review every anticipated relationship and update only
  the applicable summaries; verify by inspecting the final diff for any historical
  `spec.md` change.
- **Concurrent QA evidence conflicts:** Execute task branches sequentially and
  branch each new task from the latest integrated spec branch.
- **Remote branch cleanup failure:** Validate push, merge, and local/remote delete
  commands against a disposable bare remote before using them on `origin`.
- **Stale model intent or tests:** Assert all four exact pinned model identifiers,
  each matching intent level, and the retained Auto Router variant definitions.

## Testing strategy

- **Unit:** `tests/unit/agents.test.ts` validates frontmatter, model assignments,
  model intent, role permissions, workflow language, and consistency with
  `AGENTS.md` and the constitution.
- **Git lifecycle:** A QA-run walkthrough in a temporary repository with a bare
  remote verifies branch names, same-branch QA rework, merge gating, local/remote
  Dev-branch deletion, and retention of the spec branch. No live remote branches
  are created for this simulation.
- **SEO:** Not applicable — no rendered page, route, metadata, or sitemap behavior
  changes.
- **Accessibility:** No new rendered markup; still run `pnpm test:a11y` as a
  constitutional gate and record applicability explicitly.
- **Full gates:** `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y` on the integrated feature branch.
