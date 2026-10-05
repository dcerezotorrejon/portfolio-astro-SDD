# Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Status**: in progress
- **Last updated**: 2026-10-06

## Context

Content-related schemas and utilities currently live in `src/lib/`, alongside
the section-navigation utility. The `FloatingNav` React component is a standalone
file in `src/components/`. This layout does not keep content parsers with the
content directory or keep the navigation helper next to the component that uses
it. This feature reorganizes those modules into their intended locations and
updates their consumers without changing their behavior or public exports.

The current Dev agent edit permissions deny implementation files, preventing it
from carrying out an assigned code task. The QA agent can edit tests but its task
evidence permission is hard-coded to an earlier feature. This increment also
aligns those tool-level permissions with the established Dev/QA responsibilities:
Dev may edit assigned files except tests and specs, while QA may edit tests and
the assigned task-evidence file. The maintainer has additionally approved QA
marking a verified acceptance criterion in its assigned current spec by changing
only its checkbox from `[ ]` to `[x]` after recording evidence. QA may not edit the
criterion wording, spec status or metadata, or any other part of a spec. Role
responsibilities and per-task file scopes remain binding.

The maintainer has also clarified the feature-branch handoff: after final QA,
quality gates, commit, and push, the Dev Lead must explicitly request that the
maintainer merge the published feature branch into `main`. The Lead still does
not perform the merge or delete the branch.

Constitution §5.1 currently reserves base-branch integration for a separately
managed process but does not require the Dev Lead to request that integration.
The maintainer requires this handoff to be an explicit constitutional workflow
rule, rather than only an agent-prompt convention. The maintainer also wants
§5.1 to retain concise binding safeguards while moving repeated operational
sequence details into `AGENTS.md` and the four workflow-agent prompts.

The binding project constraints are in [the constitution](../../docs/constitution.md).

### Anticipated spec relationships

- [001-sdd-baseline](../001-sdd-baseline/spec.md): **modified**. This increment
  amends the constitution established by the baseline. Update only its
  `summary.md` relationship record; do not change its historical `spec.md`.
- [004-portfolio-home](../004-portfolio-home/spec.md): **modified**. Its
  content-related utilities and floating section navigator are relocated. The
  behavior established by that spec is not intended to change. The Dev Lead
  should update only its `summary.md` relationship record during implementation;
  its historical `spec.md` must remain unchanged.
- [007-workflow-changes](../007-workflow-changes/spec.md): **modified**. This
  increment reconfigures the Dev and QA agents' tool-level edit permissions so
  they can perform their assigned implementation, test, task-evidence, and
  evidence-backed acceptance-checkbox work. It also requires an explicit final
  request to the maintainer to merge the published feature branch. Their role
  boundaries, task scopes, and shared-branch/commit restrictions do not change.
  The Dev Lead should update only its `summary.md` relationship record; its
  historical `spec.md` must remain unchanged.
- [003-agent-workflow](../003-agent-workflow/spec.md): **modified**. This
  increment redistributes operational workflow details among the four agent
  prompts while retaining their established roles, including QA's narrow
  authority to mark verified acceptance criteria. Update only its `summary.md`
  relationship record; do not change its historical `spec.md`.
- No other spec is expected to be affected.

The Dev Lead must resolve actual relationships in this spec's `summary.md` and
update any affected earlier summary in the same change, as required by
[Constitution §4.2](../../docs/constitution.md#42-spec-relationships).

## Goals

- Place content parsers, schemas, and their related content utility exports under
  `src/content/parsers/`.
- Place `FloatingNav` and its navigation helper under a dedicated
  `src/components/FloatingNav/` directory.
- Update application and test imports to use the relocated modules, with no
  compatibility modules left at the old `src/lib/` paths.
- Update the README's reference to the relocated content schema.
- Align the Dev and QA agents' tool-level edit permissions with their established
  task responsibilities, without broadening their role authority.
- Allow QA to mark verified acceptance criteria in its assigned current spec by
  changing only their checkbox markers, without granting spec-authoring authority.
- Require the Dev Lead's final feature handoff to request maintainer integration
  of the pushed feature branch into `main`, and make this requirement binding in
  Constitution §5.1.
- Keep constitutional workflow safeguards concise and authoritative while
  aligning `AGENTS.md` and all four workflow-agent prompts with the operational
  details.
- Preserve existing runtime behavior, exported names, function signatures, and
  UI behavior.

## Non-goals

- Changing content schemas, validation rules, content collection behavior, or
  content utility algorithms.
- Changing the `FloatingNav` props, rendering, hydration directive, interaction,
  styles, or accessibility behavior.
- Introducing dependencies, aliases, new abstractions, or compatibility
  re-exports for the old module paths.
- Changing Dev/QA role responsibilities, task ownership, branch restrictions, or
  commit/push authority; this increment changes edit-tool permissions only.
- Allowing QA to rewrite acceptance criteria, change spec status or metadata, or
  edit any other spec content; only evidence-backed acceptance-checkbox changes
  in its assigned current spec are allowed.
- Having the Dev Lead perform the merge into `main` or delete the feature branch;
  these remain separately managed by the maintainer.
- Reorganizing unrelated files in `src/lib/` or `src/components/`.
- Rewriting historical spec files or evidence documents to update their recorded
  paths.

## Requirements

- **R1 — FloatingNav component location:** Move the existing React component to
  `src/components/FloatingNav/FloatingNav.tsx`. Preserve its default export,
  exported prop and section types, and all runtime behavior. Update its
  application and test imports to resolve to the new module. Keep the homepage's
  existing explicit `client:load` directive.
- **R2 — Navigation helper location:** Move all exports from
  `src/lib/navigation.ts` to
  `src/components/FloatingNav/helpers/navigation.ts`. Preserve the exported
  names, types, signatures, and behavior, and update the component and test
  imports. Do not leave `src/lib/navigation.ts` or a compatibility re-export at
  that location.
- **R3 — Content parser locations:** Move `src/lib/content.ts` to
  `src/content/parsers/content.ts` and `src/lib/content-schema.ts` to
  `src/content/parsers/content-schema.ts`. Preserve all existing exports,
  signatures, schemas, validation rules, and behavior. Update all application and
  test imports, including the schema import in `src/content.config.ts`. Do not
  leave the old `src/lib` modules or compatibility re-exports at those paths.
- **R4 — References and regression coverage:** Update the content-schema path in
  `README.md` to `src/content/parsers/content-schema.ts`. Update all active source
  and test imports that refer to the relocated modules. Existing tests for the
  content helpers and schemas, navigation helper, and floating navigator must
  continue to verify the existing contracts without weakening their assertions.
  No user-visible behavior or rendered output is intentionally changed.
- **R5 — Dev edit-tool permissions:** Configure `.opencode/agents/dev.md` so the
  Dev agent has effective edit permission for assigned files throughout the
  repository except files under `tests/**` and `specs/**`. Preserve its existing
  restrictions on task scope, test/spec ownership, branch operations, merges,
  commits, pushes, and launching subagents. The broader tool permission MUST NOT
  be presented as authority to edit files outside the task assigned by the Lead.
- **R6 — QA edit-tool permissions:** Configure `.opencode/agents/qa.md` so QA may
  edit `tests/**` and an assigned feature task-evidence file matching
  `specs/*/tasks.md`, and permit updates to acceptance status in its assigned
  current `spec.md`. QA MUST remain unable to edit production files, plans,
  summaries, or unassigned specs. In the assigned current spec, QA MUST only
  change an acceptance checkbox from `[ ]` to `[x]` after verifying that criterion
  and recording supporting evidence. QA MUST NOT edit criterion wording, spec
  status or metadata, or any other spec section. Preserve the existing branch,
  merge, commit, push, and subagent restrictions.
- **R7 — Role and file-scope separation:** The implementation plan MUST assign
  application/source and other explicitly scoped non-test, non-spec files to
  Dev; assigned tests, task evidence, and evidence-backed acceptance-checkbox
  updates in the assigned current spec to QA; spec wording/status authoring to the
  Spec Refiner; and planning, task orchestration, and summary updates to the Dev
  Lead. Dev MUST NOT edit tests or specs even though its tool permission covers
  other repository paths. QA MUST NOT edit production, planning/summary content,
  or spec wording/metadata. The current task plan must not assign test-file edits
  to Dev or spec-content edits to QA.
- **R8 — Final maintainer merge request:** After all tasks have QA approval and
  evidence, all final quality gates pass, and the Dev Lead has committed and
  pushed the shared `spec/[NNN]-[slug]` branch, the Lead's final handoff MUST
  explicitly ask the maintainer to merge that published branch into `main`.
  The Lead MUST NOT perform the merge or delete the branch; those actions remain
  separately managed by the maintainer.
- **R9 — Concise constitutional workflow policy:** Amend `docs/constitution.md`
  §5.1 to state the binding safeguards concisely: one shared feature branch;
  a maximum of four concurrently active tasks and parallel work only for
  independent, disjoint, dependency-free scopes; QA approval and evidence before
  task closure; conflict escalation and maintainer approval for material
  decisions; final commit/push by the Dev Lead only after all tasks and gates
  pass; no merge or branch deletion by the Lead; and an explicit post-push
  request for the maintainer to merge the published branch into `main`. Keep the
  constitutional section authoritative, but move step-by-step handoff and
  task-lifecycle detail to operational guidance rather than duplicating it in
  §5.1. Preserve all safeguards; do not weaken or omit them while condensing.
  Increment the current constitution version from `1.4.0` to `1.5.0` and set
  `Last amended` to the actual amendment date, following §11.
- **R10 — Operational guidance alignment:** Update `AGENTS.md` and all four
  workflow-agent prompts (`spec-refiner`, `dev-lead`, `dev`, `qa`) to document
  their applicable operational steps consistently with amended §5.1. The Dev
  Lead prompt MUST end its successful feature workflow by explicitly requesting
  maintainer merge after commit/push; it MUST NOT merge or delete the branch.
  Preserve all existing role, edit-permission, task-scope, QA, shared-branch, and
  commit/push boundaries. Update `tests/unit/agents.test.ts` to verify the
  current constitution version, concise normative safeguards, all four agent
  boundaries, and the final merge-request handoff.
- **R11 — QA acceptance-status updates:** Configure QA instructions and edit
  permissions to allow QA, after verifying a criterion and recording its
  evidence in the assigned task's `tasks.md` entry, to change only that
  criterion's `[ ]` marker to `[x]` in the assigned current spec. QA MUST NOT
  change acceptance-criterion text, spec status or metadata, other sections, or
  another spec. A path-family edit permission does not authorize edits to
  unassigned specs. The Spec Refiner remains the owner of spec wording and
  status/metadata; the Dev Lead remains the owner of planning and summaries.
  Update `tests/unit/agents.test.ts` to verify this permission and role boundary
  without weakening existing tests.

## Acceptance criteria

- [x] **AC1 (R1):** `src/components/FloatingNav/FloatingNav.tsx` exists with the
      existing default component export and named types; the old
      `src/components/FloatingNav.tsx` file is absent. The homepage still renders
      the navigator with `client:load`, and application/test imports resolve to
      the new path.
- [x] **AC2 (R2):** `src/components/FloatingNav/helpers/navigation.ts` contains
      the existing navigation helper exports with their original signatures and
      behavior; `src/lib/navigation.ts` and any compatibility re-export at that
      path are absent. The component and navigation tests import the new helper.
- [x] **AC3 (R3):** `src/content/parsers/content.ts` and
      `src/content/parsers/content-schema.ts` contain the respective existing
      exports and validation behavior; `src/lib/content.ts` and
      `src/lib/content-schema.ts`, including compatibility re-exports at those
      paths, are absent. Content collection configuration, application modules,
      and tests resolve imports from the new paths.
- [x] **AC4 (R4):** `README.md` names the new content schema path, and no stale
      import of the old locations remains in active files under `src/` or
      `tests/`. Existing focused tests for content parsing/schema validation,
      content utilities, navigation helpers, and `FloatingNav` pass with their
      existing behavioral assertions intact.
- [x] **AC5 (R5):** Effective Dev edit permissions allow representative assigned
      implementation and documentation paths, and deny paths under `tests/**`
      and `specs/**`. The Dev instructions still limit edits to assigned task
      scope and still prohibit test/spec edits, task/developer branches, merges,
      commits, pushes, and subagent launches.
- [x] **AC6 (R6):** Effective QA edit permissions allow `tests/**`, the assigned
      task-evidence file, and the assigned current `spec.md`; production files,
      plans, and summaries remain denied. QA instructions and tests confirm that
      its actual spec-write scope is limited to the assigned current spec and to
      evidence-backed `[ ]`→`[x]` acceptance-checkbox changes, with no edits to
      wording, status/metadata, other sections, or unassigned specs. Existing
      branch/commit/push restrictions remain.
- [x] **AC7 (R7):** `plan.md` and `tasks.md` assign source/non-test work to Dev,
      test changes, task evidence, and verified acceptance-checkbox updates to QA,
      spec wording/status authoring to the Spec Refiner, and planning/summary
      updates to the Dev Lead. No task assigns test edits to Dev or production or
      spec-content edits to QA.
- [x] **AC8 (R1–R11):** All quality gates required by
      [Constitution §6](../../docs/constitution.md#6-quality-gates) pass:
      `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, and
      `pnpm test:a11y`. SEO and accessibility behavior is unchanged; the existing
      suites remain green.
- [x] **AC9 (R8):** Review `.opencode/agents/dev-lead.md` and `AGENTS.md` to
      confirm the final handoff explicitly asks the maintainer to merge the
      pushed `spec/[NNN]-[slug]` branch into `main`. A workflow walkthrough
      confirms the request occurs only after final QA evidence, all gates, commit,
      and push; the Dev Lead does not merge or delete the branch. QA verifies the
      documented procedure before the Lead's final commit/push; the actual merge
      request is sent by the Lead after that push.
- [x] **AC10 (R9):** `docs/constitution.md` §5.1 states all specified binding
      safeguards concisely, including a required maintainer merge request after
      the final push and the prohibition on Lead merge/deletion. It does not
      duplicate the step-by-step task/handoff sequence moved to operational
      guidance. Its version is `1.5.0` and `Last amended` reflects the actual
      amendment date.
- [x] **AC11 (R10):** `AGENTS.md` and all four workflow-agent prompts provide
      consistent operational details for their respective roles. The Dev Lead
      instructions require an explicit merge request after commit/push and still
      prohibit executing the merge or deleting the branch. `tests/unit/agents.test.ts`
      verifies the constitution version, binding safeguards, agent role/edit
      boundaries, and final handoff without weakening existing workflow tests.
- [x] **AC12 (R11):** QA instructions, effective edit permissions, and tests
      permit QA to change only an evidence-backed acceptance checkbox from `[ ]`
      to `[x]` in its assigned current spec. The Spec Refiner retains ownership
      of spec wording and status/metadata, and the Dev Lead retains ownership of
      planning and summaries. QA cannot edit criterion wording, spec
      status/metadata, other spec sections, or an unassigned spec; its assigned
      task evidence is recorded before changing the checkbox.

## Verification

- **AC1–AC3 — Relocation and import integrity:** Inspect the resulting paths and
  confirm the old modules and compatibility re-exports are absent. Search active
  source and test files for references to the removed paths. Run the production
  build and TypeScript-aware test suites to detect unresolved imports. Review the
  diff to confirm that module bodies and exports were relocated rather than
  behaviorally rewritten.
- **AC1, AC4 — Floating navigator:** Run the existing `FloatingNav` unit and
  accessibility tests, including the threshold and interaction coverage. Inspect
  `src/pages/index.astro` to confirm the new component import and unchanged
  `client:load` directive.
- **AC2 — Navigation helpers:** Run `tests/unit/navigation.test.ts` and the
  existing `FloatingNav` tests; verify their imports target
  `src/components/FloatingNav/helpers/navigation.ts` and existing assertions are
  preserved.
- **AC3–AC4 — Content parsers:** Run the existing content, company-icon, and
  experience unit tests. Inspect `src/content.config.ts`, its consumers, and test
  imports for the new `src/content/parsers/` paths. Confirm the README points to
  `src/content/parsers/content-schema.ts`.
- **AC5–AC6, AC12 — Agent permissions:** Inspect the effective ordered edit
  permission rules in both agent definitions, following the configured permission
  matcher. Verify allowed and denied outcomes for representative Dev paths
  (source/docs allowed; `tests/**` and `specs/**` denied) and QA paths (tests, the
  assigned `tasks.md`, and the assigned `spec.md` allowed; source, plans, and
  summaries denied). Review QA's prompt and tests to confirm that, despite any
  path-family edit permission, actual assigned-spec edits are limited to
  evidence-backed acceptance-checkbox changes and unassigned specs are out of
  scope. Extend `tests/unit/agents.test.ts` to assert the permission and role
  boundaries without loosening existing git/subagent restrictions.
- **AC7 — Task ownership:** Review `plan.md` and `tasks.md` to confirm Dev does
  not own test edits; QA owns assigned test changes, task evidence, and verified
  acceptance-checkbox updates only; the Spec Refiner owns spec wording and
  status/metadata; and the Dev Lead owns planning and summary changes. Confirm
  earlier `spec.md` files are not rewritten.
- **AC8 — Quality gates:** Since R8–R11 update the Dev Lead's completion behavior,
  Constitution, operational guidance, and QA edit permissions,
  rerun all gates after its implementation: `pnpm lint`, `pnpm format:check`,
  `pnpm build`, `pnpm test:run`, and `pnpm test:a11y` in accordance with
  [Constitution §6](../../docs/constitution.md#6-quality-gates). Record SEO and
  accessibility as unchanged in scope while verifying the existing automated
  suites.
- **AC9 — Final handoff:** Inspect the Dev Lead prompt and shared guidance, run
  the relevant `tests/unit/agents.test.ts` assertions, and walk through the
  documented final handoff sequence to confirm the Lead requests maintainer merge
  into `main` only after final QA evidence, gates, commit, and push. Confirm the
  Lead does not perform or imply that the merge or branch deletion has occurred.
  QA verifies this documented procedure before the final commit/push; the Lead
  performs the actual request after the push.
- **AC10 — Constitution amendment:** Review §5.1 for concise retention of each
  binding safeguard and the required final merge request, with procedural detail
  placed in operational guidance. Verify version/date under Constitution §11.
- **AC11 — Operational guidance:** Review `AGENTS.md` and each of the four agent
  prompts for role-specific instructions consistent with §5.1; run
  `tests/unit/agents.test.ts` and a final workflow walkthrough to confirm the
  Dev Lead requests maintainer merge after push without merging or deleting the
  branch.
- **AC12 — QA acceptance status:** Inspect the effective QA write rules and
  relevant tests for checkbox-only edits in the assigned current spec. Review a
  QA verification diff to confirm that a criterion was verified, supporting
  evidence was recorded, and only its `[ ]`→`[x]` marker changed; wording,
  status/metadata, and all other spec content remain untouched.
