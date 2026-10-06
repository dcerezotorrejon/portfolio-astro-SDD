# Historical Specs

- **Spec ID**: `011-historical-specs`
- **Status**: done
- **Last updated**: 2026-10-06

## Context

As the project and its specification archive grow, loading old specifications
into agent context increases token use and execution time. Current governance
treats specifications as living artifacts, requires agents to inspect and link
related specifications, and allows updates to earlier summaries. This feature
defines a single, consistent policy that keeps the active increment anchored to
the code while treating completed specification directories as immutable change
history. The current constitution and agent prompts are the governing sources
for implementation and verification; earlier specification contents are not
consulted for this refinement.

## Goals

- Reduce routine context and token use by preventing default reads of completed
  specification directories.
- Make the read, write, and cross-reference rules for completed specifications
  consistent across the constitution, agent prompts, repository guidance, and
  new-spec template.
- Preserve spec-anchored development for the active increment while treating
  completed specifications as snapshots of past changes, not as a live source
  of behavior or workflow authority.

## Non-goals

- Rewriting, correcting, migrating, or otherwise changing any completed
  specification directory, including its `spec.md`, `plan.md`, `tasks.md`, or
  `summary.md`.
- Removing existing cross-references from completed specification directories.
- Changing application code, runtime behavior, or the general OpenCode
  configuration in `opencode.json`.
- Replacing spec-anchored development for an increment while that increment is
  active.

## Requirements

- R1: An increment's specification remains the active, code-anchored document
  while that increment is in progress. Once the increment is closed and its
  status is `done`, its entire specification directory is a historical snapshot:
  it MUST NOT be edited, and the code is the source of truth for current
  behavior. A later change MUST be recorded in a new increment rather than by
  rewriting a completed directory.
- R2: By default, agents MUST NOT read the contents of any completed
  specification directory. This prohibition includes opening, searching,
  indexing, summarizing, or quoting its `spec.md`, `plan.md`, `tasks.md`, or
  `summary.md`. A feature assignment alone does not authorize such a read.
- R3: The sole read exception is an explicit request from the maintainer or an
  agent whose current prompt declares `mode: primary`. Such a request may
  authorize any agents participating in that feature, including subagents, to
  consult completed specification content; it need not identify particular
  directories or state a purpose. Without such a request, the default
  prohibition in R2 applies to every participant.
- R4: Agents MUST NOT write to any completed specification directory, including
  when an R3 request authorizes reading it. The restriction covers every file in
  the directory, not only `spec.md`, and has no relationship-maintenance
  exception.
- R5: New increment artifacts MUST NOT identify, cite, or link to completed
  specifications by ID, path, or title. New specs and summaries MUST NOT include
  anticipated or resolved historical-spec relationship lists. The summary
  format and new-spec template MUST omit the `Related specs` section. Existing
  completed artifacts MUST remain unchanged, including any references they
  already contain.
- R6: The policy MUST be made consistent in `docs/constitution.md`, `AGENTS.md`,
  all four current agent prompts under `.opencode/agents/`, `specs/README.md`,
  and `specs/_template/spec.md`. `opencode.json` is outside this change because
  the required policy is expressed in the governing documentation and agent
  prompts, not in general OpenCode configuration.
- R7: The Spec Refiner, Dev Lead, Dev, and QA prompts MUST state the default
  prohibition, the R3 exception, and the no-write rule. Their workflow
  instructions MUST no longer require reading completed specifications,
  discovering or recording historical relationships, or editing earlier
  summaries. Current-increment reads and edits remain limited by each role's
  existing task ownership and permissions.
- R8: The Dev Lead owns the governance files in R6 except
  `specs/_template/spec.md`, which the maintainer edits directly because the
  Dev Lead role and effective tool permissions prohibit editing any `spec.md`.
  QA verifies all changes without editing governance guidance. All files are
  Markdown outside `src/content/**`, so the Markdown-only verification exception
  in [Constitution §§5–6](../../docs/constitution.md#5-task-lifecycle-and-verification-gates)
  applies.

## Acceptance criteria

- [x] AC1: The constitution distinguishes active increments from completed
      snapshots, defines completion as closure with status `done`, preserves the
      code as the source of truth for current behavior, and directs later changes to
      new increments.
- [x] AC2: The constitution and each of the four agent prompts prohibit default
      reads and all writes to completed specification directories, and state the
      explicit-request exception consistently: a request from the maintainer or a
      `mode: primary` agent can authorize all participants in that feature,
      including subagents, to read historical content.
- [x] AC3: The constitution, `AGENTS.md`, all four agent prompts, `specs/README.md`,
      and the new-spec template contain no instruction to inspect completed specs,
      update earlier summaries, or maintain historical spec relationships.
- [x] AC4: The constitution, README, and template no longer require or provide
      anticipated/resolved historical-spec relationship lists or a `Related specs`
      summary section. They explicitly leave already-completed directories and
      their existing references untouched.
- [x] AC5: The change set contains no edits to any completed specification
      directory and no edits to `opencode.json`.
- [x] AC6: The Dev Lead's implementation scope excludes
      `specs/_template/spec.md`; the maintainer edits that template directly, and QA
      can verify all named changes and required Markdown quality gates without
      needing write access to governance files.
- [x] AC7: The active-increment workflow remains spec-anchored through closure;
      completion makes the directory historical without making historical specs a
      source of current workflow rules, permissions, role boundaries, or behavior.

## Verification

- For AC1–AC4 and AC7, QA reviews `docs/constitution.md`, `AGENTS.md`, the four
  `.opencode/agents/*.md` prompts, `specs/README.md`, and
  `specs/_template/spec.md` against the requirement wording. The review confirms
  that the exception and its scope are stated consistently and that no historical
  relationship-list instructions remain.
- For AC5, QA reviews `git diff --name-only` and confirms that no path under a
  completed specification directory and no `opencode.json` path is changed. This
  path-only check does not require opening historical specification contents.
- For AC6, the Dev Lead checks the exact assigned file list against current edit
  permissions, and confirms `specs/_template/spec.md` is excluded from Dev Lead
  implementation. The maintainer's template change is reviewed on the shared
  branch. QA confirms its verification work is read-only for governance files
  and records the gate results.
- Run `pnpm lint` and `pnpm format:check`. Since the feature change set consists
  exclusively of Markdown files outside `src/content/**`, build, unit-test, SEO,
  and accessibility gates are not run and MUST be recorded as not applicable,
  in accordance with [Constitution §§5–6](../../docs/constitution.md#5-task-lifecycle-and-verification-gates).
