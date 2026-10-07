# Tasks — Agent loop improvements

**Execution model:** the Dev Lead implements all changes directly (R4: workflow
Markdown is permanently Lead-owned); QA validates only. No Dev subagent edits any
file in this increment. Evidence is recorded by QA next to each task, and QA
ticks the corresponding acceptance checkboxes in `spec.md` before the Lead's
final metadata transition.

## Task list

- [x] **T1 — Amend and summarize `docs/constitution.md`**
  - Owner: Dev Lead (implement) → QA (validate)
  - Files: `docs/constitution.md`
  - Covers: R2 (preserve §1–§11, verbatim §6 command column), R3 (unit-test
    ownership), R4 (workflow-Markdown ownership), R5 (version `1.11.0` + date)
  - Verifies: AC2, AC3, AC4
  - Depends on: —
  - Evidence: QA on `spec/016-agent-loop-improvements` @ `ef94db4` + uncommitted
    changes. `pnpm lint` pass; `pnpm format:check` pass; build/unit/SEO/a11y/
    integration not run — Markdown-only exception (Constitution §§5–6).
    Structural review: only the header and §5.1 changed (tail §6–§11 byte-identical
    to pre-change); version `1.11.0`, Last amended `2026-10-07`; §5.1 states the R3
    split (Dev writes/validates `tests/unit/**`; QA verifies sufficiency and owns
    seo/a11y/integration + gates) and the R4 rule (workflow Markdown always
    Lead-implemented; Dev never edits); every pre-change §5.1 rule retained; §6
    gate-table command column verbatim unchanged. Approved — AC2/AC3/AC4 ticked.

- [x] **T2 — Rewrite `AGENTS.md` as a minimal operational index**
  - Owner: Dev Lead (implement) → QA (validate)
  - Files: `AGENTS.md` (`CLAUDE.md` symlink follows automatically)
  - Covers: R1 (no duplicated rule text; keep `astro dev` commands, Astro doc
    links, model defaults, `.opencode/agents/` location, `CLAUDE.md` note)
  - Verifies: AC1, AC10 (symlink)
  - Depends on: T1 (stable § anchors)
  - Evidence: `pnpm lint`/`pnpm format:check` pass (full change set). Structural
    review: `AGENTS.md` reduced to the R1-only operational items (`astro dev`
    commands, Astro doc links, per-agent model defaults, `.opencode/agents/`
    location, `CLAUDE.md` symlink note, constitution-authoritative statement);
    old restatements of §2/§2.1/§3/§4/§5.1/§6/§9 removed and replaced by links.
    AC10: `readlink CLAUDE.md` → `AGENTS.md`. Approved — AC1/AC10 ticked.

- [x] **T3 — Update `.opencode/agents/dev.md`**
  - Owner: Dev Lead (implement) → QA (validate)
  - Files: `.opencode/agents/dev.md`
  - Covers: R6, R7 (gain `tests/unit/**`; lose workflow Markdown; keep
    production/seo/a11y/integration/shared-helper/commit-push denials)
  - Verifies: AC5
  - Depends on: T1 (role definitions)
  - Evidence: `pnpm lint`/`pnpm format:check` pass. Structural review of
    `.opencode/agents/dev.md`: grants edit on `tests/unit/**` (allow after
    `tests/**` deny); denies `AGENTS.md`, `docs/constitution.md`,
    `.opencode/agents/**`, and commit/push; body requires writing and validating
    unit tests before handoff and forbids seo/a11y/integration + shared-helper
    edits. Production scope per R7c (assigned files only). Approved — AC5 ticked.

- [x] **T4 — Update `.opencode/agents/qa.md`**
  - Owner: Dev Lead (implement) → QA (validate)
  - Files: `.opencode/agents/qa.md`
  - Covers: R6, R7 (lose `tests/unit/**`; add unit-test sufficiency review;
    keep seo/a11y/integration + shared helpers)
  - Verifies: AC6
  - Depends on: T1 (role definitions)
  - Evidence: `pnpm lint`/`pnpm format:check` pass. Structural review of
    `.opencode/agents/qa.md`: `tests/unit/**` deny follows the `tests/**` allow;
    body requires reviewing Dev's unit tests for sufficiency and returning
    defects, owns/runs seo/a11y/integration + applicable gates, and forbids
    editing `tests/unit/**` and production. Approved — AC6 ticked.

- [x] **T5 — Update `.opencode/agents/dev-lead.md`**
  - Owner: Dev Lead (implement) → QA (validate)
  - Files: `.opencode/agents/dev-lead.md`
  - Covers: R6, R7 (gain workflow Markdown edit; reflect R3/R4 responsibilities;
    preserve planning-artifact + closure-metadata-only authority)
  - Verifies: AC7
  - Depends on: T1 (role definitions)
  - Note: perform first among T3–T5 to activate the Lead's workflow-Markdown
    edit authority for the remaining edits (bootstrap ordering).
  - Evidence: `pnpm lint`/`pnpm format:check` pass. Structural review of
    `.opencode/agents/dev-lead.md`: adds edit allow for `AGENTS.md`,
    `docs/constitution.md`, `.opencode/agents/*.md`; preserves the
    `Status`/`Last updated`-only authority over `spec.md`; R3/R4 language
    present with no stale "QA owns all test changes"; `dev.md` removes the three
    edit permissions; `spec-refiner.md`/`specs/README.md` stale-reference scan
    clean. Approved — AC7 ticked.

- [x] **T6 — QA validation and evidence**
  - Owner: QA
  - Files: this `tasks.md` (evidence), `spec.md` (verified `[ ]`→`[x]` markers)
  - Covers: run `pnpm lint` and `pnpm format:check`; structural review of
    AC1–AC8 and AC10; record build/unit/SEO/a11y/integration as not run
    (Markdown-only exception)
  - Verifies: AC1–AC8, AC9, AC10
  - Depends on: T1–T5
  - Evidence: QA validation on `spec/016-agent-loop-improvements` @ `ef94db4` +
    uncommitted changes (five modified `.md` workflow files + untracked
    `specs/016-agent-loop-improvements/`; no completed `specs/` directory
    modified). `pnpm lint` pass; `pnpm format:check` pass; build/unit/SEO/a11y/
    integration not run — Markdown-only exception (AC9). Structural review of
    AC1–AC8 and AC10 all approved (see T1–T5 evidence); AC8: Dev Lead is the
    implementer and QA the validator, with no Dev subagent edits. AC1–AC10
    ticked. Approved.

- [x] **T7 — Final gates, summary, closure**
  - Owner: Dev Lead (run final `pnpm lint` + `pnpm format:check`) → QA (record
    latest final-gate report) → Dev Lead (write `summary.md`, set `Status: done`
    - `Last updated`)
  - Files: `summary.md`, `spec.md` (metadata only)
  - Verifies: AC9 (final), AC10 (final)
  - Depends on: T6
  - Evidence: Final-gate report recorded by QA (Dev Lead runs the gates):
    `pnpm lint` pass; `pnpm format:check` pass; build/unit/SEO/a11y/integration
    not run — Markdown-only exception (Constitution §§5–6). No defects.

## Notes

- All changed files are `.md` outside `src/content/**`; the Constitution §6
  Markdown-only exception applies throughout (lint + format only).
- No task-level commit/push. Final feature commit(s)/push occur only after all
  tasks have QA approval and evidence and all final gates pass, and base-branch
  integration requires explicit maintainer approval.
