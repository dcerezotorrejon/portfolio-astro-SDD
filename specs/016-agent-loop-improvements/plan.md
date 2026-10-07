# Plan — Agent loop improvements

- **Spec ID**: `016-agent-loop-improvements`
- **Status**: draft

## Approach

This increment changes only workflow Markdown (`docs/constitution.md`, `AGENTS.md`,
and `.opencode/agents/*.md`) plus its own planning artifacts. It is executed by
the **Dev Lead directly** (per R4: workflow Markdown is permanently owned by the
Lead), with **QA validating only**; no Dev subagent edits any file.

The work has two strands:

1. **Deduplicate and summarize** the governing documents: `AGENTS.md` becomes a
   minimal operational index that links to the constitution instead of restating
   its rules; `docs/constitution.md` is tightened but preserves every rule in
   §1–§11.
2. **Two constitutional amendments (§11)** in §5.1 (with any consequential
   wording in §5/§6/§10), applied as one version bump:
   - **R3 — unit-test ownership**: Dev writes and validates `tests/unit/**`
     before handoff; QA verifies sufficiency against the ACs and owns
     `tests/seo|a11y|integration` plus all gates. QA no longer edits
     `tests/unit/**`.
   - **R4 — workflow-Markdown ownership**: `AGENTS.md`, `docs/constitution.md`,
     and `.opencode/agents/**` are always implemented by the Dev Lead, who
     delegates only verification; Dev never edits them.

## Files to change

| File                                                        | Change                                                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `docs/constitution.md`                                      | Summarize; amend §5.1 for R3 + R4; bump `1.10.0 → 1.11.0`; update **Last amended**      |
| `AGENTS.md`                                                 | Rewrite as minimal operational index (R1); `CLAUDE.md` symlink follows automatically    |
| `.opencode/agents/dev.md`                                   | Gain edit on `tests/unit/**`; lose edit on workflow Markdown; update responsibilities   |
| `.opencode/agents/qa.md`                                    | Lose edit on `tests/unit/**`; add unit-test sufficiency review; update responsibilities |
| `.opencode/agents/dev-lead.md`                              | Gain edit on workflow Markdown; update responsibilities/rules to reflect R3/R4          |
| `.opencode/agents/spec-refiner.md`                          | Only if it retains a stale test-ownership reference                                     |
| `specs/README.md`                                           | Only if it retains a stale test-ownership reference                                     |
| `specs/016-agent-loop-improvements/{plan,tasks,summary}.md` | This increment's artifacts                                                              |

## Approved decisions (maintainer, 2026-10-07)

The maintainer approved, in conversation, both §11 amendments:

1. **Unit-test ownership shift (R3).** Dev writes and validates `tests/unit/**`
   before handing the task to QA; QA verifies sufficiency against the acceptance
   criteria (returning defects to Dev when insufficient) and owns/runs the
   remaining tests (SEO, accessibility, integration) and gates as before.
2. **Permanent workflow-Markdown ownership (R4).** `AGENTS.md`,
   `docs/constitution.md`, and `.opencode/agents/**` are always implemented by
   the Dev Lead; Dev never edits them. This is unconditional (no per-increment
   authorization), and this increment is executed under it.

Supporting decisions:

- **No new `package.json` script.** Dev validates unit tests with an existing
  invocation (`pnpm exec vitest run tests/unit`), keeping the change set
  Markdown-only so only lint + format apply (Constitution §6).
- **Scope of workflow Markdown** is exactly the three paths named in R4.
  `docs/design.md`, `specs/README.md`, `specs/_template/**`, and repository
  configuration remain delegated to Dev (unchanged).
- **Shared test helpers** (`tests/helpers|fixtures|types`) remain QA-owned; Dev
  reads them only. A new shared helper needed by a unit test is a cross-boundary
  coordination point for the Lead.

## Trade-offs

- **Summarization vs. ambiguity.** Tightening the constitution risks dropping or
  blurring a rule. Mitigated by the AC2 rule-by-rule checklist and the verbatim
  §6 gate-table command column.
- **Bootstrap ordering.** R4's authority — and the Lead's edit permission on
  workflow Markdown — are produced by this very increment. `dev-lead.md` is
  updated early (before the other agent prompts and the constitution edits) so
  the Lead's workflow-Markdown authority is in place for the remaining edits.
  This increment executes under the maintainer's explicit authorization; once
  closed, the rule is self-sustaining.
- **Unit-test ownership rebalance.** Moving unit tests to Dev reduces QA token
  cost but makes QA's sufficiency review a hard requirement; QA must not silently
  accept trivial tests. Encoded in qa.md.

## Risks

- **Rule loss during summarization.** Highest risk. The rule-by-rule review
  (AC2) is mandatory before closure.
- **Permission drift.** If the three prompts' frontmatter edits are inconsistent
  with the constitution, future tasks will be mis-scoped. QA verifies AC5–AC7.
- **Cross-boundary test helpers.** Dev may need a shared helper it cannot edit.
  Lead serializes/coordinates; no agent edits outside its named scope.

## Testing strategy

Markdown-only change set (all `.md`, none under `src/content/**`): only
`pnpm lint` and `pnpm format:check` run. Build, unit, SEO, accessibility, and
integration are recorded as **not run** (Constitution §§5–6). The substantive
requirements are verified by QA's structural review of AC1–AC8 and AC10,
recorded as task evidence in `tasks.md`.
