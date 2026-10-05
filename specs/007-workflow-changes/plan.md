# Plan — Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Last updated**: 2026-10-05

## Approach

1. Retain one feature branch, `spec/007-workflow-changes`, as the shared working
   branch for all Dev and QA sessions. Do not create task/developer branches.
2. Update the four custom agent prompts and permissions for shared-branch work,
   bounded parallel execution (maximum four active tasks), QA/rework on the same
   branch, conflict escalation, technical-decision approval, and final
   commit/push ownership. Preserve the pinned `gpt-6-luna` model references and
   align all `Model intent` sections. Leave Auto Router variants in `opencode.json`
   unchanged.
3. Re-anchor `tests/unit/agents.test.ts` to the exact model assignments, prompt
   and permission contracts, shared branch workflow, no per-task commits/pushes,
   four-task limit, and retained Auto Router variant configuration.
4. Amend `docs/constitution.md` from version `1.3.0` to `1.4.0`, dated
   `2026-10-05`. Make the shared branch, parallel-task cap, QA/rework, conflict
   escalation, final commit/push, writing boundaries, and immutable historical
   `spec.md` rules binding. Update `AGENTS.md` and `specs/README.md` consistently.
5. Keep earlier `spec.md` files unchanged. Resolve anticipated relationships by
   updating only the applicable prior `summary.md` files and creating this
   feature's `summary.md` after QA has verified the actual changes.
6. Verify the shared-branch flow and four-task cap in a disposable repository,
   run the quality gates, and only then invoke the commit skill to create final
   commit(s) and push the spec branch to `origin`.

## Files to change

- `.opencode/agents/spec-refiner.md` — limit writes to the assigned current
  `spec.md` and describe the shared branch workflow.
- `.opencode/agents/dev-lead.md` — orchestrate up to four active tasks on the
  shared spec branch; define task lifecycle, conflict/approval rules, and final
  commit/push responsibility; never write a `spec.md`.
- `.opencode/agents/dev.md` — use the shared spec branch; prohibit task branches,
  individual commits/pushes, tests, and unapproved docs; allow only the
  specifically authorized document paths for this feature.
- `.opencode/agents/qa.md` — verify tasks and record tests/evidence on the shared
  branch, return defects to the same Dev, and do not edit production code or
  commit/push.
- `docs/constitution.md` — binding workflow/history rules and version/date
  amendment.
- `AGENTS.md` — operational shared-branch workflow, four-task cap, pinned models,
  responsibilities, and gates.
- `specs/README.md` — one `spec/[NNN]-[slug]` branch per spec and incremental
  history convention.
- `tests/unit/agents.test.ts` — model, model intent, permissions, branch/QA/
  concurrency/commit prompts, documentation consistency, and Auto Router variant
  assertions.
- `specs/001-sdd-baseline/summary.md`,
  `specs/002-front-extra-dependencies/summary.md`,
  `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`,
  `specs/005-auto-router-agents/summary.md`, and
  `specs/006-common-molecules/summary.md` — only applicable `Related specs`
  entries; no historical `spec.md` edits.
- `specs/007-workflow-changes/summary.md` — actual files/functions and resolved
  `Related specs` after verification.
- `specs/007-workflow-changes/plan.md` and `tasks.md` — this revised plan and the
  execution evidence checklist.

`opencode.json`, application source, and all historical `spec.md` files are not
intended to change. The pre-existing `dev/007-workflow-changes/T1` branch was
created under the superseded workflow; it is not a basis for further work and
must not be merged. Reimplement/revalidate its useful changes on the shared spec
branch, then delete the obsolete branch after the replacement is verified.

## Key decisions and trade-offs

- **Single shared branch:** Dev and QA agents edit the same feature working tree
  and branch. This removes per-task branch creation and merge overhead, but makes
  file ownership and conflict escalation essential.
- **Concurrency cap:** A task is active from assignment until QA approval and
  evidence, including any rework. At most four tasks may be active. Parallelize
  only independent scopes with non-overlapping files and no unfinished dependency;
  serialize overlapping tasks.
- **QA and commit gating:** QA verifies on the spec branch and can request fixes
  there. No task-level commits or pushes are allowed. After all tasks are approved
  and final gates pass, the Dev Lead uses the commit skill to commit and push the
  spec branch. The later merge to the repository base branch remains out of scope.
- **Permission scope:** OpenCode permission rules are ordered and last-match wins.
  Use narrow path exceptions. Dynamic “assigned current spec/task” boundaries are
  reinforced in the prompts because static globs cannot bind to the current task.
- **Incremental history:** Prior `spec.md` files remain historical and immutable;
  actual relationships are maintained in summaries.
- **Models:** Keep the pending pinned GPT-6 Luna model IDs and matching prompt
  intent. Do not alter the Auto Router provider configuration in `opencode.json`.
- **Legacy branch:** Do not merge the old `dev/.../T1` branch. Recreate or reapply
  only its relevant changes on the spec branch, validate there, then remove the
  obsolete local and remote branch.

## Risks and mitigations

- **Shared-worktree overlap:** Concurrent agents can overwrite/conflict on shared
  files. Assign explicit disjoint file scopes, cap at four active tasks, serialize
  overlapping work, and stop/escalate any conflict rather than guessing.
- **QA observes concurrent changes:** Schedule QA when its task's implementation
  is stable; have QA state the shared-branch revision and task scope it verified.
  QA sessions are serialized when they would edit the same tests or `tasks.md`.
- **Permission-glob mistakes:** Unit-test ordered role edit rules and inspect
  allowed/denied paths; prompts further restrict assignment scope.
- **Stale prior summaries:** Update only summaries after actual impacts are known;
  inspect the final diff to prove historical `spec.md` files remain untouched.
- **Legacy branch loss:** Do not delete the old T1 branch until its relevant
  changes have been reimplemented and verified on the spec branch.
- **Model/docs drift:** Assert exact pinned model IDs, reasoning intent, and
  unchanged Auto Router variants in tests.

## Testing strategy

- **Unit:** `tests/unit/agents.test.ts` checks frontmatter, model intent,
  permission rules, branch and QA prompts, four-task lifecycle, final commit/push
  rule, and consistency with docs.
- **Workflow simulation:** In a disposable repository with a bare remote,
  simulate independent tasks on one feature branch, QA approval and rework, four
  active tasks with a fifth refused, and overlapping-file serialization/conflict
  escalation. Confirm no `dev/...` branch, task commit, or task push is created;
  confirm the final commit/push occurs only after QA and gates.
- **SEO:** Not applicable — no rendered page, route, metadata, or sitemap changes.
- **Accessibility:** No rendered markup is added; run `pnpm test:a11y` as a
  constitutional gate and record applicability explicitly.
- **Full gates:** `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y` on the shared spec branch.
