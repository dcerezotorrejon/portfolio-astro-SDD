# Agent reasoning variants and permission integrity

- **Spec ID**: `023-agent-reasoning-variants`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The four workflow agents (`spec-refiner`, `dev-lead`, `dev`, `qa`) are defined
as Markdown files under `.opencode/agents/`, each selecting an `opencode-go`
model in frontmatter. The maintainer set all four agents to
`opencode-go/deepseek-v4.1-flash` and added `reasoningEffort: high` to
`dev-lead` to request more reasoning.

In the current OpenCode V2 runtime, `reasoningEffort` is not a valid agent
frontmatter field. Reasoning effort is chosen through a model _variant_ using
the `#variant` selector suffix, for example
`opencode-go/deepseek-v4.1-flash#high`. The unrecognized field has two effects,
both confirmed with `opencode debug agents`:

1. The requested effort is not applied; `dev-lead` resolves with no variant and
   the value is parked in an inert `request.body`.
2. The `permissions:` block that follows the unknown field is parsed into
   `request.body` instead of the agent's permission list, so `dev-lead` runs
   with the permissive default policy rather than its restricted rule set.

The current permission lists also contain overlaps that loosen the declared
boundaries: the `specs/*/spec.md` (and, for QA, `specs/*/tasks.md`) rules also
match the `specs/_template/` files; `dev` declares a broad `deny **` immediately
cancelled by an `allow **`; and the literal `git <command> *` shell denials for
`dev` and `qa` do not cover aliased or compound invocations.

## Goals

- Select the intended reasoning effort for `spec-refiner` and `dev-lead` using a
  valid V2 model variant.
- Restore full enforcement of every agent's ordered permission rules.
- Keep `AGENTS.md` and the structural agent test aligned with the configuration.
- Close the identified permission overlaps so the declared boundaries hold.

## Non-goals

- Changing production application code, content, or styles.
- Changing the model family: all four agents stay on
  `opencode-go/deepseek-v4.1-flash`.
- Adding, removing, or renaming agents, or changing their modes, descriptions,
  or colors.
- Adding a reasoning variant to `dev` or `qa`.
- Redefining task ownership, branch workflow, or the quality gates in
  `docs/constitution.md`.

## Requirements

- R1: `spec-refiner` and `dev-lead` MUST select the `high` variant with
  `model: opencode-go/deepseek-v4.1-flash#high`.
- R2: `dev` and `qa` MUST keep `model: opencode-go/deepseek-v4.1-flash` with no
  variant.
- R3: No agent frontmatter may contain a field that is not a valid V2 agent
  field; `reasoningEffort` MUST be removed and MUST NOT return.
- R4: Every agent's `permissions:` block MUST be applied as the agent's
  top-level ordered permission list, not absorbed into `request.body`.
- R5: `AGENTS.md` MUST list the exact model selector for each of the four agents
  and MUST state which agents select a reasoning variant.
- R6: `tests/unit/agents.test.ts` MUST assert the final model selector (including
  `#high` where applicable) for all four agents and MUST add a guard that fails
  when a top-level frontmatter key is not a valid V2 agent field, so an absorbed
  `permissions` block cannot recur unnoticed.
- R7: `spec-refiner` and `qa` MUST be denied on `specs/_template/**`, so their
  `specs/*/spec.md` and `specs/*/tasks.md` rules cannot reach template files.
  The existing `dev` allowance for non-`spec.md` template files and `dev-lead`'s
  template denial stay unchanged.
- R8: `dev`'s ordered rules MUST NOT contain a broad `deny` immediately cancelled
  by an equal broad `allow`; the effective policy MUST still allow application
  and configuration paths and deny workflow Markdown, every `spec.md`, the specs
  tree, and non-unit tests.
- R9: `dev` and `qa` MUST deny git commands that commit, push, merge, or switch
  branches, including aliased and compound forms, not only the literal
  `git <command> *` prefix.
- R10: `tests/unit/design-assets.test.ts` and `tests/unit/transitions.test.ts`
  MUST reflect the intentional removal of the custom transition duration in
  `8bb0ecb`: they MUST NOT assert the removed `--transition-duration-control`
  theme token or the removed `::view-transition-*` `animation-duration` rule,
  and MUST keep asserting the remaining intended behavior of those files.

## Acceptance criteria

- [x] AC1 (R1, R2): `spec-refiner` and `dev-lead` select
      `opencode-go/deepseek-v4.1-flash` variant `high`; `dev` and `qa` select the
      same model with no variant.
- [x] AC2 (R3, R4): `opencode debug agents` reports each agent's custom
      permission rules at top level with an empty `request.body`, and `dev-lead`
      keeps its full restricted rule set.
- [x] AC3 (R5): `AGENTS.md` states the model selector for all four agents and
      identifies `spec-refiner` and `dev-lead` as selecting the `high` variant.
- [x] AC4 (R6): `tests/unit/agents.test.ts` passes and includes a guard that
      fails when a top-level frontmatter key is not a valid V2 agent field.
- [x] AC5 (R7): Effective `edit` permission on `specs/_template/spec.md` is
      `deny` for `spec-refiner` and `qa`; effective `edit` on
      `specs/_template/tasks.md` is `deny` for `qa`.
- [x] AC6 (R8): `dev`'s ordered rules contain no `deny **` immediately followed
      by `allow **`, and effective `edit` checks still return `allow` for an
      application path and `deny` for workflow Markdown, any `spec.md`, the specs
      tree, and non-unit tests.
- [x] AC7 (R9): Effective `shell` permission is `deny` for `dev` and `qa` on
      `git -C . commit -m x`, `git  commit -m x`, `git push origin main`,
      `git merge main`, `git switch other`, `git checkout other`, and
      `git branch new`.
- [x] AC8 (R10): `pnpm test:run` passes with no failures in
      `tests/unit/design-assets.test.ts` or `tests/unit/transitions.test.ts`.

## Verification

- AC1, AC4, AC5, AC6, AC7: assertions in `tests/unit/agents.test.ts` that parse
  the frontmatter and evaluate the ordered rules, including the new
  invalid-key guard.
- AC2: manual inspection of `opencode debug agents`, recorded as task evidence,
  because it depends on the running service.
- AC3: assertion over `AGENTS.md` in the same test file.
- Repository gates and integration applicability follow
  `docs/constitution.md` §§5–6.
