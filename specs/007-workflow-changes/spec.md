# Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Status**: draft
- **Last updated**: 2026-10-05

## Context

The current agent workflow defines refinement, planning, implementation, and QA,
but does not prescribe a shared feature branch for concurrent Dev/QA work, a
maximum number of active tasks, or final commit/push ownership. Escalation of
conflicts and technical decisions, along with agent writing boundaries, also need
to be explicit. This spec updates that workflow and makes its applicable rules
binding through an amendment to the [project constitution](../../docs/constitution.md).

The existing agent roles, verification gates, and spec-anchored development model
remain in force except where requirements below refine their responsibilities.

## Existing uncommitted changes included in scope

At refinement time, the working tree already contains the following uncommitted
agent model changes. They are part of this feature's scope and must be preserved
and verified alongside the workflow changes:

- `.opencode/agents/dev-lead.md`: model changes from
  `openrouter/openrouter/auto#high` to `openrouter/openai/gpt-6-luna#high`.
- `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev.md`, and
  `.opencode/agents/qa.md`: model changes from
  `openrouter/openrouter/auto#medium` to
  `openrouter/openai/gpt-6-luna#medium`.

## Goals

- Give each feature one shared spec branch for all Dev and QA work, enabling
  bounded parallel task execution without per-Dev branches.
- Make QA approval and recorded evidence prerequisites for final commits and push.
- Define how conflicts and unresolved technical decisions are escalated.
- Restrict the Spec Refiner and Dev Lead to their agreed writing responsibilities.
- Pin the four workflow agents to the model assignments recorded above.
- Limit the Dev Lead to at most four concurrently active tasks.

## Non-goals

- Merging the feature's `spec/[NNN]-[slug]` branch into the repository's base
  branch; that merge is outside this workflow change.
- Creating a separate `dev/...` branch for a task or developer.
- Changing application behavior, agent roles/modes, or the existing quality
  gates. The scoped permission changes required by R7 are in scope.
- Changing or removing the Auto Router variant configuration in `opencode.json`;
  this spec changes the workflow agents' model references only.
- Introducing Git hosting, pull-request, or CI automation.

## Requirements

- **R1 — Feature branch:** After the spec is agreed and the Dev Lead begins
  planning, the Dev Lead creates and publishes one feature branch from the
  repository's base branch. Its name MUST be `spec/[NNN]-[slug]`, using the
  complete spec directory name (for example, `spec/007-workflow-changes`). This
  is the only feature-work branch for the spec. Keep it available for a later,
  separately managed merge to the repository's base branch.
- **R2 — Shared task branch:** Every Dev and QA working on the feature MUST use
  the same `spec/[NNN]-[slug]` branch. No `dev/...` task/developer branches may be
  created. The Dev Lead assigns task ownership and independent file/scope
  boundaries so compatible tasks can proceed in parallel on that branch. Tasks
  that would edit overlapping files or depend on unfinished work MUST be
  scheduled sequentially. QA verifies its assigned task against the shared spec
  branch and may add/update tests and task evidence there; QA MUST NOT change
  production code.
- **R3 — QA and rework loop:** For each task, QA reports either approval with
  evidence for all applicable gates or specific defects. When defects are found,
  the same Dev corrects the work directly on the shared spec branch and returns
  it to QA. The task remains active until QA approves it and records evidence.
  QA and Dev do not create branches, merge branches, or push feature commits.
- **R4 — Final commit and push:** No per-task merge or per-task commit/push is
  performed. After all tasks have QA approval and evidence, the Dev Lead runs the
  final quality gates, then uses the repository's commit skill to create the
  feature commit(s) and push the shared `spec/[NNN]-[slug]` branch to `origin`.
  QA approval does not authorize Dev or QA to commit or push. Merging the spec
  branch into the repository's base branch remains outside this workflow.
- **R5 — Conflict escalation:** If an agent encounters a Git or change conflict,
  it MUST stop the affected operation and notify the Dev Lead with the conflicting
  branches/files and the blocking state. It MUST NOT overwrite another agent's
  work or resolve the conflict by guessing. The Dev Lead notifies the maintainer
  when resolving the conflict requires a decision, and work resumes only after
  the conflict has an agreed resolution.
- **R6 — Technical decisions:** If the Dev Lead identifies a material technical
  decision not determined by the spec, constitution, or established project
  conventions, the Dev Lead MUST present the decision and its options to the
  maintainer and wait for approval before planning or delegating the affected
  implementation. Examples include decisions that materially change architecture,
  dependencies, or interfaces. The Lead records the approved decision in the
  relevant planning artifact.
- **R7 — Writing boundaries:** The Spec Refiner may write only the current
  feature's `spec.md`; other files may be read but not written. The Dev Lead MUST
  NOT write or modify `spec.md`, but remains responsible for `plan.md`,
  `tasks.md`, and `summary.md` as defined by the existing workflow. Dev and QA
  retain their existing role restrictions, with QA allowed to update tests and
  task evidence on the shared spec branch as required by R2–R3. For this workflow
  feature only, Dev may update the explicitly assigned operational guidance files
  (`docs/constitution.md`, `AGENTS.md`, and `specs/README.md`); Dev MUST NOT write
  any `spec.md`, other specs/plans/summaries, tests, or production code.
- **R8 — Documentation and governance:** Update the agent instructions and
  `AGENTS.md` to describe the branch lifecycle, handoffs, escalation rules, and
  writing boundaries, including the four-task concurrency cap. Update
  `specs/README.md` to document the single feature-branch convention. Amend
  `docs/constitution.md` to make these workflow rules binding, and increment its
  version and amendment date according to §11 using the version current when
  implementation occurs. Do not restate or weaken unrelated constitutional rules.
- **R9 — Agent model assignments:** The four workflow agent frontmatter model
  values MUST match the included working-tree changes: `dev-lead` uses
  `openrouter/openai/gpt-6-luna#high`; `spec-refiner`, `dev`, and `qa` use
  `openrouter/openai/gpt-6-luna#medium`. This requirement changes the agents'
  model references only; the Auto Router variant configuration in `opencode.json`
  is not changed by this spec.
- **R10 — Incremental spec history:** A new incremental spec MUST NOT rewrite or
  amend the `spec.md` files of earlier specs. It records anticipated relationships
  in its own `spec.md`; when implementation affects earlier features, only their
  `summary.md` relationship records are updated in the same change, in accordance
  with Constitution §4.2. Earlier requirements remain as the historical record
  of the behavior agreed for that increment.
- **R11 — Parallel-task limit:** The Dev Lead MUST NOT have more than four tasks
  active concurrently. A task becomes active when assigned to a Dev and remains
  active through QA verification, evidence recording, and any Dev rework. A task
  closes only when QA approves it and records evidence. The Lead MUST NOT launch
  a fifth task while four tasks are active. Parallel work is limited to tasks with
  independent scopes that do not overlap files or unresolved dependencies.

## Acceptance criteria

- [ ] **AC1 (R1–R2):** The workflow creates and publishes exactly one
      `spec/[NNN]-[slug]` branch for the feature; all Dev and QA work uses that branch,
      and no `dev/...` task/developer branch is created.
- [ ] **AC2 (R2–R3):** Dev tasks with independent file scopes can be assigned in
      parallel on the shared spec branch. QA verifies each assigned task there,
      records tests/evidence without editing production code, and returns defects to
      the same Dev for correction on that branch. A task is not closed until QA
      approves it and records evidence.
- [ ] **AC3 (R4):** A workflow walkthrough confirms there are no per-task
      commits/pushes or branch merges. After every task is QA-approved and all final
      gates pass, only the Dev Lead uses the commit skill to commit and push the spec
      branch to `origin`. The spec branch is not merged into or deleted with the
      project base branch as part of this spec.
- [ ] **AC4 (R5):** Agent instructions and operational documentation require an
      agent to stop and notify the Lead on a conflict, prohibit guessed overwrites or
      resolution, and require maintainer escalation when a decision is needed.
- [ ] **AC5 (R6):** Agent instructions require the Dev Lead to obtain maintainer
      approval for material technical decisions not resolved by the governing
      artifacts or conventions, before planning or delegating affected work, and to
      record the decision.
- [ ] **AC6 (R7):** The Spec Refiner's write permissions and instructions limit
      writes to the current `spec.md`; the Dev Lead is prevented from writing
      `spec.md` while retaining responsibility for `plan.md`, `tasks.md`, and
      `summary.md`. QA's permitted task-evidence and test updates do not grant
      production-code or merge authority.
- [ ] **AC7 (R8):** `AGENTS.md`, relevant `.opencode/agents/` instructions,
      `specs/README.md`, and `docs/constitution.md` consistently describe the approved
      workflow. The constitution version and amendment date comply with §11, and
      automated agent/documentation consistency checks pass.
- [ ] **AC8 (R9):** Agent frontmatter assigns
      `openrouter/openai/gpt-6-luna#high` to `dev-lead` and
      `openrouter/openai/gpt-6-luna#medium` to `spec-refiner`, `dev`, and `qa`;
      agent consistency tests assert those values. `opencode.json` Auto Router
      variants are unchanged.
- [ ] **AC9 (R10):** No earlier spec's `spec.md` is modified by this increment.
      Anticipated relationships are recorded in this spec, and each affected earlier
      spec's `summary.md` is updated with the relationship to `007-workflow-changes`.
- [ ] **AC10 (R11):** The Dev Lead instructions explicitly limit work to four
      concurrently active tasks, define the active lifecycle through QA approval and
      evidence (including rework), and prohibit launching a fifth task while four are
      active. A workflow simulation confirms this cap and confirms that only
      independent, non-overlapping tasks are run in parallel.
- [ ] **AC11 (R1–R11):** All applicable constitutional verification gates pass and
      evidence is recorded before this spec is considered complete. SEO and
      accessibility are explicitly recorded as not applicable because this change
      adds no page, route, or rendered markup.

## Verification

- **AC1–AC3, AC10 — Shared-branch workflow:** Run a documented walkthrough in a
  disposable Git repository with a bare remote. Create/publish one spec branch;
  verify Dev and QA use that branch with no `dev/...` branch creation; exercise a
  passing QA path and a failing/rework path; simulate four active independent
  tasks and confirm a fifth is not launched; verify conflicting/overlapping tasks
  are serialized or escalated. Confirm no commits/pushes occur until all task QA
  evidence and final gates pass, then use the commit skill for final commit/push.
  Verify the spec branch remains and is not merged into the base branch.
- **AC4–AC7 — Documentation, permissions, and behavior:** Review the four agent
  definitions and `AGENTS.md`, verify the Spec Refiner and Dev Lead write
  permission boundaries, check the branch/conflict/approval wording against the
  acceptance criteria, and run the agent/documentation consistency unit tests.
  Review `specs/README.md` and `docs/constitution.md` for the branch convention,
  approved rules, current-version increment, and amendment date.
- **AC8 — Agent models:** Inspect the four agent frontmatter values, run the
  agent consistency unit tests, and compare `opencode.json` with its pre-change
  state to verify its Auto Router variants were not altered by this feature.
- **AC9 — Incremental spec history:** Review the change list to confirm no earlier
  `spec.md` changed; inspect the updated summaries for `Related specs` entries
  that point to `007-workflow-changes` and correctly describe each relationship.
- **AC11 — Quality gates:** Run `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y` as required by
  [Constitution §6](../../docs/constitution.md#6-quality-gates). Record SEO and
  accessibility as not applicable for this non-rendered workflow change.

## Anticipated spec relationships

Per [Constitution §4.2](../../docs/constitution.md#42-spec-relationships), the
Dev Lead must resolve the actual impacts in this spec's `summary.md` and update
affected summaries in the same change.

- [003-agent-workflow](../003-agent-workflow/spec.md): **modified**. This spec
  refines its agent responsibilities, QA handoff, branch orchestration, writing
  boundaries, and agent model assignments. Do not amend its historical
  `spec.md`; update only its `summary.md` to record its relationship to this
  incremental change.
- [001-sdd-baseline](../001-sdd-baseline/spec.md): **affected** by the amendment
  to the constitution that it established; leave its `spec.md` unchanged and
  refresh only its relationship record in `summary.md`.
- [002-front-extra-dependencies](../002-front-extra-dependencies/spec.md):
  **related through constitution governance**. Its frontend and dependency
  requirements are unchanged; leave its `spec.md` unchanged and record the
  relationship, if applicable, only in `summary.md`.
- [004-portfolio-home](../004-portfolio-home/spec.md) and
  [006-common-molecules](../006-common-molecules/spec.md): **affected through
  dependency on the existing agent workflow**. Their product and UI requirements
  remain unchanged; leave their `spec.md` files unchanged and refresh only their
  `summary.md` relationship records to identify this workflow update.
- [005-auto-router-agents](../005-auto-router-agents/spec.md): **modified through
  shared agent definitions**. This spec re-anchors the model assignments
  established by 005 to the pinned `gpt-6-luna` references in the included
  changes. The Auto Router variant configuration itself is not intended to
  change. Leave its historical `spec.md` unchanged and update only its
  `summary.md` to record this superseding model selection.
