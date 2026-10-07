# Agent loop improvements

- **Spec ID**: `016-agent-loop-improvements`
- **Status**: done
- **Last updated**: 2026-10-07

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The agent loop reads `docs/constitution.md`, `AGENTS.md`, and the agent prompts
under `.opencode/agents/` on every task. `AGENTS.md` currently restates a large
amount of rule text that already lives (authoritatively) in the constitution,
which inflates token cost without adding information. Separately, the current
role split is expensive: Dev writes production code but is forbidden from
writing any tests, while QA owns all tests including the unit/component tests
that are most tightly coupled to the implementation.

This increment does two things. First, it removes the duplication and tightens
both documents so every rule is stated once and only once. Second, it amends the
constitution to rebalance test ownership: Dev writes and validates the task's
unit tests before handing the task to QA, and QA verifies that those tests
sufficiently cover the acceptance criteria and keeps the remaining tests
(SEO, accessibility, integration) and gates as before.

The maintainer has also decided that **workflow Markdown is always owned by the
Dev Lead**: from now on the Lead — not Dev — directly implements changes to
`AGENTS.md`, `docs/constitution.md`, and `.opencode/agents/`. Because this
increment's changed files are exactly those workflow-Markdown files, the Lead
performs all edits directly and delegates only the **validation** to QA. To make
that legal, §5.1 is amended with a permanent ownership rule assigning workflow
Markdown to the Lead. The maintainer approved both §11 amendments in this
increment: (1) the unit-test ownership shift, and (2) the permanent Lead
ownership of workflow Markdown. These amendments are the authoritative source;
the dependent guidance (`AGENTS.md`, `dev.md`, `qa.md`, `dev-lead.md`, and
only-if-stale `spec-refiner.md` / `specs/README.md`) is updated in the same
change.

## Goals

1. Eliminate duplication between `AGENTS.md` and `docs/constitution.md`: every
   rule or procedure is stated once (in the constitution) and referenced, not
   restated, from `AGENTS.md`.
2. Summarize `docs/constitution.md` without dropping any declared rule or
   functionality across §1–§11.
3. Amend the constitution (§11) so that, per task, Dev writes and validates the
   unit/component tests under `tests/unit/**`, and QA verifies their sufficiency
   against the acceptance criteria and owns the remaining tests and gates.
4. Amend the constitution (§11) so that workflow Markdown (`AGENTS.md`,
   `docs/constitution.md`, `.opencode/agents/**`) is always owned and implemented
   by the Dev Lead, who delegates only verification; Dev never edits those files.
5. Reflect both amendments consistently in `AGENTS.md`, `dev.md`, `qa.md`, and
   `dev-lead.md`.

## Non-goals

- No change to production source, content, assets, or application behavior.
- No change to the quality-gate commands, the Markdown-only exception, or the
  gate applicability rules themselves; only the ownership of unit tests changes.
- No new test framework, dependency, or `package.json` script (Dev validates
  unit tests with an existing Vitest invocation such as
  `pnpm exec vitest run tests/unit`), keeping the change set Markdown-only.
- No modification of any completed `specs/` directory.
- No change to the top-level §1–§11 structure of the constitution; subsections
  may be tightened or merged only if no rule is lost.
- No Dev subagent performs implementation in this increment.

## Requirements

- **R1 (deduplication).** After the change, `AGENTS.md` contains no text that
  restates a rule or procedure already present in `docs/constitution.md`; such
  content is replaced by links to the constitution. `AGENTS.md` retains only
  operational content not in the constitution: the `astro dev` background-mode
  commands, the Astro documentation links, the per-agent model defaults, the
  `.opencode/agents/` file location, and the `CLAUDE.md` symlink note, plus the
  statement that the constitution is authoritative.
- **R2 (constitution completeness).** The summarized `docs/constitution.md`
  preserves every rule and constraint currently in §1–§11, including: precedence
  (§1); project nature and interactivity policy (§2); global design reference
  (§2.1); spec-anchored model and conflict resolution (§3); spec structure,
  naming, and `summary.md` rules (§4, §4.1); historical access and immutability
  (§4.2); task lifecycle and verification gates (§5); shared feature-branch
  workflow (§5.1); the quality-gate table and the Markdown-only exception (§6);
  accessibility (§7); SEO (§8); content/i18n and the language policy (§9);
  tooling (§10); governance and amendments (§11). The command column of the §6
  gate table is preserved verbatim.
- **R3 (unit-test ownership amendment).** The constitution is amended so that,
  for each task: Dev implements its assigned production files and also writes
  and validates the task's unit/component tests under `tests/unit/**`, running
  them (e.g. `pnpm exec vitest run tests/unit`) before handing the task to QA;
  QA verifies that those unit tests sufficiently cover the task's acceptance
  criteria, returns specific defects to the same Dev when coverage is
  insufficient, and owns and runs the remaining tests (`tests/seo/**`,
  `tests/a11y/**`, `tests/integration/**`) and all applicable gates as before.
  QA does not edit `tests/unit/**`.
- **R4 (workflow-Markdown ownership).** §5.1 is amended so that workflow
  Markdown — `AGENTS.md`, `docs/constitution.md`, and the agent definitions
  (`.opencode/agents/**`) — is always implemented directly by the Dev Lead, who
  delegates only verification to QA. Dev never edits these files, in this or any
  future increment; no per-increment maintainer authorization is required.
- **R5 (version bump).** `docs/constitution.md` version is incremented
  (`1.10.0` → `1.11.0`) and its **Last amended** date updated to the amendment
  date, covering both R3 and R4.
- **R6 (prompt sync).** `dev.md`, `qa.md`, and `dev-lead.md` are updated to
  match R3 and R4. `spec-refiner.md` and `specs/README.md` are updated only if
  they retain stale references to the old test-ownership split.
- **R7 (permission boundaries).** (a) Dev gains edit access to `tests/unit/**`
  and keeps the prohibition on editing `tests/seo/**`, `tests/a11y/**`,
  `tests/integration/**`, shared `tests/helpers|fixtures|types/**` (read-only),
  and production code. (b) QA loses edit access to `tests/unit/**` while keeping
  it for `tests/seo/**`, `tests/a11y/**`, `tests/integration/**`, and shared test
  helpers it needs, and keeps the prohibition on editing production code.
  (c) `dev-lead.md` grants the Lead edit access to `AGENTS.md`,
  `docs/constitution.md`, and `.opencode/agents/*.md` (permanent ownership,
  reflecting R4), while preserving the Lead's existing planning-artifact and
  closure-metadata-only authority. `dev.md` removes its edit permissions for
  those same three paths; Dev retains edit access only for its assigned
  production files, `tests/unit/**`, and other operational Markdown/repository
  configuration delegated by the Lead. Neither Dev nor QA nor the Lead gains
  commit/push or branch authority beyond the existing rules.
- **R8 (execution by the Lead).** Under R4, the Dev Lead performs all edits in
  this increment directly (every changed file is workflow Markdown or a
  Lead-owned planning artifact) and delegates only validation to QA; no Dev
  subagent edits any file.
- **R9 (language).** All committed artifacts remain in English; conversation
  with the maintainer remains in Spanish (Constitution §9).

## Acceptance criteria

- [x] AC1: `AGENTS.md` contains no sentence that restates a constitution rule or
      procedure; all duplicated content is replaced by links, and only the unique
      operational items listed in R1 remain.
- [x] AC2: A rule-by-rule review confirms the summarized `docs/constitution.md`
      retains every rule from the pre-change §1–§11, and the §6 gate-table command
      column is unchanged.
- [x] AC3: The constitution states the R3 ownership split (Dev writes and
      validates `tests/unit/**`; QA verifies sufficiency and owns seo/a11y/integration),
      and its version is `1.11.0` with an updated **Last amended** date.
- [x] AC4: §5.1 of the constitution states that workflow Markdown (`AGENTS.md`,
      `docs/constitution.md`, `.opencode/agents/**`) is always implemented by the
      Dev Lead and that Dev never edits it.
- [x] AC5: `dev.md` grants edit access to `tests/unit/**`, requires Dev to write
      and validate the unit tests before handoff, and still forbids editing
      seo/a11y/integration tests, production code, and committing/pushing.
- [x] AC6: `qa.md` requires QA to review Dev's unit tests for sufficiency against
      the acceptance criteria, return defects to Dev when insufficient, own and run
      the seo/a11y/integration tests and applicable gates, and not edit
      `tests/unit/**` or production code.
- [x] AC7: `dev-lead.md` reflects R3/R4 (no stale "QA owns all test changes"
      language) and grants the Lead edit access to `AGENTS.md`,
      `docs/constitution.md`, and `.opencode/agents/*.md`, while preserving
      closure-metadata-only authority over `spec.md`. `dev.md` removes edit
      permissions for those three paths. Any stale `spec-refiner.md` /
      `specs/README.md` reference is likewise updated.
- [x] AC8: The increment's task evidence identifies the Dev Lead as the
      implementer and QA as the validator; no Dev subagent edited any file in this
      increment.
- [x] AC9: `pnpm lint` and `pnpm format:check` pass on the full change set; build,
      unit, SEO, accessibility, and integration are recorded as not run under the
      Constitution §§5–6 Markdown-only exception.
- [x] AC10: `CLAUDE.md` remains a symlink to `AGENTS.md`, and no file under any
      completed `specs/` directory is modified.

## Verification

This increment's complete changed-file set consists exclusively of `.md` files
outside `src/content/**` (`docs/constitution.md`, `AGENTS.md`,
`.opencode/agents/*.md`, optionally `specs/README.md`, and the new spec-directory
files). The Constitution §§5–6 Markdown-only exception therefore applies.

Execution model: the **Dev Lead** performs all edits directly (R4 workflow-
Markdown ownership) and writes `plan.md`, `tasks.md`, and `summary.md`; **QA**
validates only. Automated gates and the structural review below are recorded as
QA evidence in `tasks.md`.

- **Automated gates (only):** `pnpm lint` and `pnpm format:check`. Build, unit,
  SEO, accessibility, and integration are recorded as not run (AC9).
- **Structural review (manual, recorded as task evidence):**
  - AC1: side-by-side diff of `AGENTS.md` against `docs/constitution.md`
    confirming no duplicated rule text and correct links.
  - AC2: rule-by-rule checklist of §1–§11 against the pre-change constitution,
    including a verbatim comparison of the §6 gate-table command column.
  - AC3, AC4: read the amended constitution to confirm the R3 ownership split,
    the R4 workflow-Markdown ownership rule, and the version/date.
  - AC5, AC6, AC7: read `dev.md`, `qa.md`, and `dev-lead.md` to confirm the
    responsibilities and permission boundaries match R3/R4/R6/R7.
  - AC8: review `tasks.md` evidence confirming the Lead implemented and QA
    validated, with no Dev edits.
  - AC10: `readlink CLAUDE.md` resolves to `AGENTS.md`, and `git status` shows no
    change inside any completed `specs/` directory.
