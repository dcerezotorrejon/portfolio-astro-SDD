# Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Status**: done
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
the assigned task-evidence file. Role responsibilities and per-task file scopes
remain binding.

The binding project constraints are in [the constitution](../../docs/constitution.md).

### Anticipated spec relationships

- [004-portfolio-home](../004-portfolio-home/spec.md): **modified**. Its
  content-related utilities and floating section navigator are relocated. The
  behavior established by that spec is not intended to change. The Dev Lead
  should update only its `summary.md` relationship record during implementation;
  its historical `spec.md` must remain unchanged.
- [007-workflow-changes](../007-workflow-changes/spec.md): **modified**. This
  increment reconfigures the Dev and QA agents' tool-level edit permissions so
  they can perform their assigned implementation, test, and task-evidence work.
  Their role boundaries, task scopes, and shared-branch/commit restrictions do
  not change. The Dev Lead should update only its `summary.md` relationship record;
  its historical `spec.md` must remain unchanged.
- [003-agent-workflow](../003-agent-workflow/spec.md): **depends on**. This
  feature follows the established spec refinement, planning, implementation, and
  QA workflow.
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
  `specs/*/tasks.md`. QA MUST remain unable to edit production files,
  `spec.md`, `plan.md`, or `summary.md`; it may update only the assigned task's
  evidence within `tasks.md`. Preserve the existing branch, merge, commit, push,
  and subagent restrictions.
- **R7 — Role and file-scope separation:** The implementation plan MUST assign
  application/source and other explicitly scoped non-test, non-spec files to
  Dev; assigned tests and the assigned task-evidence entry to QA; and planning,
  task orchestration, and summary updates to the Dev Lead. Dev MUST NOT edit
  tests or specs even though its tool permission covers other repository paths.
  QA MUST NOT edit production or planning/summary content even though it may edit
  the assigned `tasks.md` evidence file. The current task plan must not assign
  test-file edits to Dev.

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
- [x] **AC6 (R6):** Effective QA edit permissions allow `tests/**` and the
      assigned `specs/008-lib-reorganization/tasks.md` evidence file, but deny
      production files, `spec.md`, `plan.md`, and `summary.md`. QA instructions
      continue to restrict edits to assigned tests and assigned task evidence,
      and retain existing branch/commit/push restrictions.
- [x] **AC7 (R7):** `plan.md` and `tasks.md` assign source/non-test work to Dev,
      test changes and assigned task evidence to QA, and planning/summary updates
      to the Dev Lead. No task assigns test edits to Dev or production edits to
      QA.
- [x] **AC8 (R1–R7):** All quality gates required by
      [Constitution §6](../../docs/constitution.md#6-quality-gates) pass:
      `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, and
      `pnpm test:a11y`. SEO and accessibility behavior is unchanged; the existing
      suites remain green.

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
- **AC5–AC6 — Agent permissions:** Inspect the effective ordered edit permission
  rules in both agent definitions, following the configured permission matcher.
  Verify allowed and denied outcomes for representative Dev paths (source/docs
  allowed; `tests/**` and `specs/**` denied) and QA paths (tests and the assigned
  `tasks.md` evidence file allowed; source, `spec.md`, `plan.md`, and `summary.md`
  denied). Extend `tests/unit/agents.test.ts` to assert the intended permission
  rules and role-prompt boundaries without loosening existing git/subagent
  restrictions.
- **AC7 — Task ownership:** Review `plan.md` and `tasks.md` to confirm Dev does
  not own test edits, QA owns test changes and assigned task evidence only, and
  the Dev Lead owns planning and summary changes. Confirm T2's relationship
  updates do not rewrite earlier `spec.md` files.
- **AC8 — Quality gates:** Run and record `pnpm lint`, `pnpm format:check`,
  `pnpm build`, `pnpm test:run`, and `pnpm test:a11y` in accordance with
  [Constitution §6](../../docs/constitution.md#6-quality-gates). Record SEO and
  accessibility as unchanged in scope while verifying the existing automated
  suites.
