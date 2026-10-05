# Workflow changes

- **Spec ID**: `007-workflow-changes`
- **Status**: draft
- **Last updated**: 2026-10-05

## Context

The current agent workflow defines refinement, planning, implementation, and QA,
but does not require per-spec and per-task branches, prescribe QA handoff on the
Dev's branch, or restrict the Spec Refiner and Dev Lead from writing outside
their respective deliverables. Merge ownership and escalation of conflicts or
technical decisions also need to be explicit. This spec updates that workflow
and makes its applicable rules binding through an amendment to the
[project constitution](../../docs/constitution.md).

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

- Isolate each feature and each Dev task on named Git branches with an explicit
  QA handoff and merge lifecycle.
- Make the Dev Lead the sole owner of integrating validated Dev branches into
  the feature's spec branch and cleaning up Dev branches.
- Define how conflicts and unresolved technical decisions are escalated.
- Restrict the Spec Refiner and Dev Lead to their agreed writing responsibilities.
- Pin the four workflow agents to the model assignments recorded above.

## Non-goals

- Merging the feature's `spec/[NNN]-[slug]` branch into the repository's base
  branch; that merge is outside this workflow change.
- Changing application behavior, agent roles/modes/permissions, or the existing
  quality gates.
- Changing or removing the Auto Router variant configuration in `opencode.json`;
  this spec changes the workflow agents' model references only.
- Introducing Git hosting, pull-request, or CI automation.

## Requirements

- **R1 — Feature branch:** After the spec is agreed and the Dev Lead begins
  planning, the Dev Lead creates a feature branch from the repository's base
  branch. Its name MUST be `spec/[NNN]-[slug]`, using the complete spec directory
  name (for example, `spec/007-workflow-changes`). This branch is the integration
  target for all task branches. This workflow does not merge or delete the
  feature branch.
- **R2 — Dev task branch:** Each Dev task MUST be implemented on its own branch
  created from that feature's spec branch. Its name MUST be
  `dev/[NNN]-[slug]/[task-id]`, where `[task-id]` is the task identifier from
  `tasks.md` (for example, `dev/007-workflow-changes/T1`). The Dev hands this
  branch to QA for verification.
- **R3 — QA and rework loop:** QA MUST verify the assigned task on the same Dev
  branch, may add or update tests and record task evidence there, and MUST NOT
  change production code or merge branches. QA reports either approval with
  verification evidence or defects. When defects are found, the same Dev updates
  that branch and returns it to QA; the task is not eligible for integration
  until QA approves it.
- **R4 — Integration and cleanup:** Only the Dev Lead may merge a Dev task branch
  into its spec branch, and only after QA has approved that task with evidence for
  all applicable gates. After a successful merge, the Dev Lead deletes that
  auxiliary branch locally and remotely. QA approval does not authorize QA or
  Dev to merge. The spec branch remains available for a later, separately
  managed merge to the repository's base branch.
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
  task evidence on the assigned Dev branch as required by R3.
- **R8 — Documentation and governance:** Update the agent instructions and
  `AGENTS.md` to describe the branch lifecycle, handoffs, escalation rules, and
  writing boundaries. Update `specs/README.md` to document the feature-branch
  naming convention. Amend `docs/constitution.md` to make these workflow rules
  binding, and increment its version and amendment date according to §11 using
  the version current when implementation occurs. Do not restate or weaken
  unrelated constitutional rules.
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

## Acceptance criteria

- [ ] **AC1 (R1–R2):** The documented workflow creates the feature branch from
  the project base branch using `spec/[NNN]-[slug]`; each task uses a separate
  branch from that spec branch with the exact
  `dev/[NNN]-[slug]/[task-id]` convention.
- [ ] **AC2 (R3):** QA receives the Dev task branch, performs verification and
  records tests/evidence on that same branch without changing production code or
  merging. A failed QA result returns the task to the same Dev for correction and
  subsequent QA revalidation; only an approved result makes it integration-ready.
- [ ] **AC3 (R4):** A workflow walkthrough confirms that only the Dev Lead
  integrates QA-approved Dev branches into the matching spec branch, then deletes
  each merged Dev branch both locally and remotely. The workflow does not merge
  or delete the spec branch.
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
- [ ] **AC10 (R1–R10):** All applicable constitutional verification gates pass and
  evidence is recorded before this spec is considered complete. SEO and
  accessibility are explicitly recorded as not applicable because this change
  adds no page, route, or rendered markup.

## Verification

- **AC1–AC3 — Git lifecycle:** Run a documented end-to-end workflow walkthrough
  in a disposable local Git repository with a bare remote: create the spec and
  task branches using the required names, hand the task branch through a passing
  and a failing/rework QA path, integrate only after approval, and verify local
  and remote Dev-branch deletion. Verify that the spec branch remains and no
  merge to the project base branch is performed.
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
- **AC10 — Quality gates:** Run `pnpm lint`, `pnpm format:check`, `pnpm build`,
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
