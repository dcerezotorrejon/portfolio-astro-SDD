# Agent models and delegated implementation

- **Spec ID**: `012-agent-models`
- **Status**: in progress
- **Last updated**: 2026-10-06

## Context

This increment began with maintainer edits to only the `model` frontmatter field
in the four workflow agent definitions. Dev Lead moves from
`openrouter/openai/gpt-6-luna#high` to `openrouter/openai/gpt-6.1-sol`; Spec Refiner
moves from `openrouter/openai/gpt-6-luna#medium` to the same Sol reference. Dev and
QA keep `openrouter/openai/gpt-6-luna` but remove the `#medium` suffix.

At the start, the four prompts contained `Model intent` sections describing the
previous model references and reasoning levels. `AGENTS.md` also described those
previous references. The maintainer approved documenting the existing model-field
changes, removing all four `Model intent` sections, and synchronizing the agent
guide without imposing a reasoning variant. Those changes are now implemented
and have recorded independent QA approval.

The maintainer also requires Dev Lead to stop implementing changes directly.
The initial Lead prompt permitted direct operational Markdown and configuration
edits, while Dev's initial final `specs/**` edit denial overrode its earlier
allowance for `specs/README.md`. This increment removes the Lead's implementation
exception and makes delegation of workflow Markdown and configuration explicit
and feasible.
The Lead retains direct ownership only of the current increment's `plan.md`,
`tasks.md`, and `summary.md`.

On 2026-10-06, the maintainer approved the constitutional amendment described in
R8, including version `1.8.0`, under the
[amendment process](../../docs/constitution.md#11-governance-and-amendments).

The maintainer explicitly authorized the Lead to bootstrap T1/T2 under its
then-effective governance-edit authority. After T2 restricted the Lead's effective
permissions, its first T3 operational patch was rejected without changing the
owned files. The Lead stopped rather than bypassing the restriction. The
maintainer approved transferring T3/T4 to Dev, which implemented both tasks.
Independent QA approved all four tasks and recorded the supporting evidence in
the current [task checklist](./tasks.md).

This bootstrap account documents the actual authority transition; it does not
create an exception to the resulting rules in R6–R8. Those requirements and the
QA-verified acceptance criteria are unchanged. This increment remains active
pending the Lead's renewed final gates and closure following spec re-anchoring.

The governing constraints are defined in the
[constitution](../../docs/constitution.md), particularly
[workflow authority](../../docs/constitution.md#51-shared-feature-branch-workflow)
and [verification gates](../../docs/constitution.md#6-quality-gates).

## Goals

- Anchor the four existing model-field changes to explicit requirements.
- Make agent frontmatter the source of each agent's configured default model,
  without a separate prose requirement for a model or reasoning level.
- Keep the operational guide consistent with that configuration.
- Separate Lead orchestration, Dev implementation, and QA verification for
  workflow Markdown and repository configuration as well as application work.
- Align constitutional authority, agent instructions, and effective edit
  permissions with that separation.

## Non-goals

- Selecting or guaranteeing a particular reasoning effort when no variant is
  explicitly configured.
- Changing the Lead's existing task-specific model override policy.
- Changing `opencode.json`, including its Auto Router variant definitions.
- Changing application code, tests, content, dependencies, or tooling settings.
- Changing branch management, task concurrency, QA ownership, final gates,
  commits, pushes, or integration approval rules.
- Giving Dev ownership of feature specs or planning artifacts, or permitting
  edits to completed specification directories.
- Allowing edits to `specs/_template/spec.md`; all `spec.md` files remain outside
  Dev and Lead write authority.
- Benchmarking models or requiring live inference calls.

## Requirements

- **R1 — Primary agent defaults:** The `model` frontmatter field in
  `.opencode/agents/dev-lead.md` and `.opencode/agents/spec-refiner.md` must be
  exactly `openrouter/openai/gpt-6.1-sol`, without a variant suffix.
- **R2 — Subagent defaults:** The `model` frontmatter field in
  `.opencode/agents/dev.md` and `.opencode/agents/qa.md` must be exactly
  `openrouter/openai/gpt-6-luna`, without a variant suffix.
- **R3 — Remove duplicate model intent:** Remove the entire `Model intent`
  section from each of the four agent definitions. Do not replace it with another
  prose instruction that pins a model or reasoning level. The frontmatter fields
  specify configured defaults; this increment does not constrain the effective
  reasoning effort or alter the existing task-specific override policy.
- **R4 — Synchronize the guide:** Update the model-reference bullet in
  `AGENTS.md` to describe Sol as the configured default for Dev Lead and Spec
  Refiner and Luna as the configured default for Dev and QA, using the exact
  references in R1 and R2. Explain that the agent frontmatter defines those
  defaults and that no reasoning variant is explicitly selected there. Retain
  the statement that the Auto Router variants in `opencode.json` are unchanged.
  Also describe the Lead's planning-only write authority and delegation of
  implementation to Dev, with QA remaining the independent verifier, consistently
  with R6–R8.
- **R5 — Preserve unrelated behavior:** Operational changes are limited to the
  four named agent definitions, `AGENTS.md`, and `docs/constitution.md`, solely
  to satisfy R1–R4 and R6–R8 plus formatting. Preserve agent modes, colors, and
  all unrelated instructions and permissions. QA and Spec Refiner permissions
  remain unchanged. Do not modify `opencode.json` or other operational or
  application files for this feature. Current increment artifacts are maintained
  by their authorized owners.
- **R6 — Lead orchestrates without implementation edits:** Update the Lead's
  description, prompt, and ordered edit permissions so that its only permitted
  direct file edits are the assigned current increment's `plan.md`, `tasks.md`,
  and `summary.md`. Replace broad operational/configuration edit allowances with
  a default edit denial and allowances for those planning-file families; explicitly
  deny `specs/_template/**` so that templates cannot match those allowances. Remove
  every direct-implementation exception, including references to `R14`. Require
  delegation of application, operational Markdown, and configuration changes to
  Dev with exact file ownership, followed by independent QA. No explicit task
  assignment may authorize the Lead to implement changes itself. The prohibition
  also covers indirect file edits through shell commands or formatters outside
  its three assigned artifacts. Preserve its existing branch, gate, delegation,
  commit, push, and integration responsibilities.
- **R7 — Dev owns explicitly delegated implementation:** Update Dev's prompt
  and ordered edit permissions to explicitly support assigned operational
  Markdown under root-level `*.md`, `docs/**`, `.opencode/**`,
  `specs/README.md`, and `specs/_template/**` except every `spec.md` file.
  Assigned repository configuration may be at any path or extension when it
  configures package management, build/runtime tools, agents, lint/format/test
  tooling, or CI. These are permission families, not blanket task ownership;
  every edit still requires an exact assigned path. Keep Dev's existing
  application implementation authority. Resolve the ordered-rule blockage for
  `specs/README.md` and permitted template files without enabling feature
  planning/evidence/summary edits, tests, or any `spec.md`. Completed directories
  remain immutable and out of scope regardless of matching permission patterns.
  Constitution edits require maintainer approval under §11; a Lead assignment
  alone does not approve an amendment. Preserve the ban on Dev subagents and on
  Dev branch changes, merges, commits, and pushes.
- **R8 — Adopt the approved constitutional amendment:** Amend constitution
  §5.1 to make the Lead's direct write authority planning-only for the current
  increment and require delegation of implementation, including workflow
  Markdown and configuration, to Dev under explicit file ownership. Preserve
  independent QA, Spec Refiner ownership, and all other constitutional rules.
  Increment the version from `1.7.0` to `1.8.0` and set `Last amended` to the
  actual application date. Apply the dependent guidance changes in this same
  increment. This amendment is justified by the need to prevent the orchestration
  role from also acting as the implementer.

## Acceptance criteria

- [x] **AC1 (R1):** Dev Lead and Spec Refiner each have exactly
      `model: openrouter/openai/gpt-6.1-sol` in their YAML frontmatter, with no
      variant suffix.
- [x] **AC2 (R2):** Dev and QA each have exactly
      `model: openrouter/openai/gpt-6-luna` in their YAML frontmatter, with no
      variant suffix.
- [x] **AC3 (R3):** None of the four agent definitions contains a `Model intent`
      section or replacement prose pinning a model or reasoning effort. The
      Lead's existing task-specific model override policy remains unchanged.
- [x] **AC4 (R4):** The model-reference bullet in `AGENTS.md` matches all four
      configured defaults, identifies frontmatter as their source, states that
      no reasoning variant is explicitly selected there, and says that the Auto
      Router variants remain unchanged. It no longer describes the previous
      suffixed references as the current defaults. Its workflow guidance matches
      the planning-only Lead, delegated Dev implementation, and independent QA.
- [x] **AC5 (R5):** The complete feature diff contains no semantic changes to the
      six assigned operational files beyond this spec's requirements, no changes
      to other operational or application files, and no changes to
      `opencode.json`. QA and Spec Refiner permissions, agent modes, colors, and
      unrelated behavior are preserved.
      Applicable lint and format gates pass with recorded evidence.
- [x] **AC6 (R6):** The Lead's description and instructions contain no direct
      implementation exception or `R14` reference. Its effective edit rules deny
      operational files, configuration, application files, tests, and every
      `spec.md`, and allow only planning-file families. Its instructions limit
      those allowances to the three assigned current artifacts, deny template
      edits, forbid shell or formatter workarounds, and require Dev implementation
      followed by QA.
- [x] **AC7 (R7):** Dev's instructions explicitly cover the operational Markdown
      and configuration scope in R7 with exact assigned paths. Its effective edit
      rules allow `specs/README.md` and permitted template files, while denying
      tests, every `spec.md`, and feature planning/evidence/summary files.
      Historical immutability, amendment approval, and existing Dev Git and
      subagent restrictions remain explicit and unchanged in effect.
- [x] **AC8 (R8):** Constitution §5.1 establishes the approved role separation;
      version is `1.8.0` and the amendment date is the application date. The Lead
      prompt, Dev prompt, and `AGENTS.md` are consistent with the amendment in the
      same increment, without other constitutional changes.

## Verification

### Authorized ownership

Actual implementation ownership, as approved by the maintainer and recorded in
the current [plan](./plan.md) and [task checklist](./tasks.md), was:

- **T1 — Dev delegation permissions:** Dev Lead implemented
  `.opencode/agents/dev.md` under the explicitly authorized one-time bootstrap.
- **T2 — Lead planning-only boundaries:** Dev Lead implemented
  `.opencode/agents/dev-lead.md` under the same authorization and its
  then-effective governance-edit authority.
- **T3 — Remaining agent model prose:** After the Lead's first T3 patch was denied
  and the maintainer approved the ownership transfer, Dev implemented
  `.opencode/agents/qa.md` and `.opencode/agents/spec-refiner.md`.
- **T4 — Constitutional adoption and guide:** Following the same approved
  transfer and T1–T3 QA approvals, Dev implemented `docs/constitution.md` and
  `AGENTS.md`. The constitutional amendment had explicit maintainer approval
  before implementation, recorded in current planning.

The existing maintainer model-field edits were preserved as part of this
increment. The rejected Lead patch changed no operational files, and the
permission blocker was resolved by an approved ownership transfer, not by shell,
formatter, or stale-permission workarounds. The bootstrap authorization does not
survive as a standing implementation exception for the Lead.

The current Dev prompt and effective edit permissions allow assigned operational
work on these six paths. The current Lead prompt and effective edit permissions
allow only its assigned current planning artifacts. Before subsequent work relies
on the revised definitions, confirm that participating sessions use them; reload
or start fresh sessions if needed. Newly permitted README/template scope was
verified, but no edits to those files were required or made in this increment.

QA is the verifier. Its current prompt permits content-requirement verification
without production edits, assigned evidence updates in
`specs/012-agent-models/tasks.md`, and evidence-backed acceptance checkbox updates
in this current spec. QA independently verified T1–T4 and recorded its approvals
and acceptance-criterion evidence. Spec Refiner owns substantive current-spec
re-anchoring; the Lead owns the current planning and summary artifacts and final
gates. Current permissions provide an authorized path for those remaining actions
without any additional exception. This re-anchoring preserves all final-state
requirements and existing evidence-backed acceptance checkbox markers; it does
not claim a new QA approval or close the increment.

### Requirement-to-verification mapping

- **R1 → AC1:** Inspect both primary-agent frontmatter fields for the exact model
  values, without variant suffixes.
- **R2 → AC2:** Inspect both subagent frontmatter fields for the exact model
  values, without variant suffixes.
- **R3 → AC3:** Inspect all four prompt bodies and their diffs for complete
  removal of `Model intent`, no replacement pinning instruction, and preservation
  of the Lead's model override policy.
- **R4 → AC4:** Compare the guide against all four model fields and the approved
  role separation. Verify each explicit documentation statement in R4.
- **R5 → AC5:** Inspect the complete feature diff relative to its base revision,
  including uncommitted and untracked changes; compare unchanged fields and
  instructions and run applicable repository gates.
- **R6 → AC6:** Inspect all Lead description, responsibility, and rule sections
  for removal of direct implementation authority. Evaluate effective ordered
  edit rules against the permission cases below, and verify that its instructions
  restrict planning-family allowances to assigned current artifacts and prohibit
  indirect implementation edits.
- **R7 → AC7:** Inspect the Dev delegation and amendment-approval rules. Evaluate
  effective ordered edit rules against the permission cases below and compare
  Git/subagent restrictions with the feature base revision.
- **R8 → AC8:** Inspect the constitutional diff, version, and application date;
  confirm approval is recorded in current planning and compare all dependent
  guidance against the amendment.

### Permission cases

QA evaluates the effective rule order using OpenCode V2's last-matching-rule
semantics and whole-value wildcard matching, including any applicable loaded
configuration. Record the matching rules and resulting decisions in task
evidence; do not attempt forbidden writes or create probe files.

- **Lead allowed edit families:** `specs/012-agent-models/plan.md`,
  `specs/012-agent-models/tasks.md`, and `specs/012-agent-models/summary.md`.
- **Lead denied edits:** `AGENTS.md`, `docs/constitution.md`, each of the four
  agent definitions, `opencode.json`, `src/pages/index.astro`,
  `tests/permission-probe.test.ts`, `specs/README.md`,
  `specs/_template/plan.md`, and `specs/012-agent-models/spec.md`.
- **Dev allowed edit families:** All six assigned operational files,
  `opencode.json`, `specs/README.md`, `specs/_template/plan.md`,
  `specs/_template/tasks.md`, and `specs/_template/summary.md`. Allowing a family
  does not assign that file to this feature; `opencode.json` and the README/template
  files must remain unchanged here.
- **Dev denied edits:** `tests/permission-probe.test.ts`,
  `specs/012-agent-models/spec.md`, `specs/_template/spec.md`, and this feature's
  `plan.md`, `tasks.md`, and `summary.md`.
- **Assignment and historical boundaries:** Inspect instructions to confirm
  that matching families never authorize unassigned edits, unrelated planning,
  or edits to completed directories. No completed spec contents need to be read
  to verify this boundary.

QA records content-verification results and command evidence in the assigned task
entry. Content checks above verify specified requirements, not editorial style.
The feature is limited to Markdown outside `src/content/**`, so the applicable
task and final gates are `pnpm lint` and `pnpm format:check` under the linked
constitution. Record build, unit, SEO, and accessibility gates as not applicable
under that exception. No new automated test files or live model calls are needed
to verify these configuration and documentation requirements.

After this execution-description re-anchoring, the Lead must rerun the applicable
final gates against the complete increment, including the updated spec. QA records
the latest results supplied by the Lead. The Lead also updates its current
planning and summary to reflect that the ownership divergence is resolved before
completing the remaining closure steps. The `in progress` status keeps the current
directory editable for that work; this change does not set status `done` or
authorize a final commit, push, or merge by the Spec Refiner.
