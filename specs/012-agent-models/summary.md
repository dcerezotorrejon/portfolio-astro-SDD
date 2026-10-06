# Implementation summary

- **Spec ID**: `012-agent-models`
- **Last updated**: 2026-10-06
- **Status**: feature published; integration and spec metadata closure pending
- **Shared branch**: `spec/012-agent-models`

## Changes

- Primary agents use `openrouter/openai/gpt-6.1-sol`; Dev and QA use
  `openrouter/openai/gpt-6-luna`. All four references omit a reasoning variant.
- Removed the four `Model intent` sections; frontmatter defines model defaults
  without additional prose pinning a model or reasoning effort.
- Restricted Lead edit permissions and instructions to assigned current
  planning artifacts. All implementation, including workflow Markdown and
  tooling configuration, is delegated to Dev with independent QA.
- Explicitly authorized Dev's assigned operational/configuration scope and
  corrected permission ordering for README and permitted template files.
  Feature planning, evidence, summaries, tests, and every `spec.md` remain
  outside Dev edit authority; completed directories remain immutable.
- Adopted the approved constitutional role separation in version `1.8.0`,
  with application date 2026-10-06; synchronized the operational guide.

## Files changed

- `.opencode/agents/dev-lead.md`: Sol default, planning-only permissions and
  instructions, delegation responsibilities, removal of `Model intent`.
- `.opencode/agents/dev.md`: unsuffixed Luna default, explicit assigned workflow
  and configuration implementation, corrected permissions, amendment approval
  requirement, removal of `Model intent`.
- `.opencode/agents/qa.md`: unsuffixed Luna default and removal of `Model intent`;
  other instructions and permissions preserved.
- `.opencode/agents/spec-refiner.md`: Sol default and removal of `Model intent`;
  other instructions and permissions preserved.
- `docs/constitution.md`: version and approved §5.1 role separation.
- `AGENTS.md`: current model defaults and implementation/verification boundaries.
- `specs/012-agent-models/spec.md`: current requirements, acceptance criteria,
  verification, and QA-backed criterion markers; Spec Refiner re-anchored the
  execution account to the actual Lead bootstrap and approved Dev transfer.
- `specs/012-agent-models/plan.md`: technical approach, approved bootstrap and
  ownership-transfer decisions, scope, permission strategy, safeguards, gates.
- `specs/012-agent-models/tasks.md`: task ownership, status, latest independent QA
  evidence, and closure tracking.
- `specs/012-agent-models/summary.md`: actual implementation summary and status.

## Functions and components

No application functions or components changed. No code, content, test,
dependency, or `opencode.json` edits were made.

## Implementation and verification

The maintainer authorized a one-time Lead bootstrap: T1/T2 were implemented by
the Lead using its configured Sol model. After T2, an attempted T3 edit was
rejected by effective permissions and changed no operational files. The
maintainer approved transferring T3/T4 to Dev, which implemented those tasks
using its configured Luna model. No shell/formatter bypass was used.

All four tasks have independent QA approval and recorded evidence. QA used its
configured Luna model without an override; task lint and format gates passed.
Build, unit, SEO, and accessibility were not run under the constitution's
Markdown-only exception. Final-gate results are recorded in the current task
file's latest final-gate report. The Lead's final lint and repository format
checks passed for the complete ten-file Markdown-only increment; QA recorded
those results. Re-run applicable gates after any subsequent spec re-anchoring.

## Closure state

Spec Refiner resolved the execution ownership divergence on 2026-10-06: T1/T2
were explicitly authorized Lead bootstrap tasks, and T3/T4 were implemented by
Dev after the approved transfer. Requirements and all eight verified acceptance
criteria remain unchanged. The spec has status `in progress` so the authorized
owners can finish current coordination and verification without editing a frozen
directory.

The Lead renewed lint and format gates on the complete re-anchored increment;
both passed, and QA recorded the latest results and independently confirmed
unchanged requirements and criteria. Using the commit skill, the Lead created
feature commit `5494d9c3f120dbf9e27683c26cfd7086db0786eb`,
`chore(spec-012): align agent models and delegate implementation`, and pushed it
successfully to `origin/spec/012-agent-models`. This final publication record
is included in a follow-up feature bookkeeping commit after applicable gates.

Integration into `main` remains pending explicit affirmative maintainer approval;
the published feature branch is retained. Spec Refiner retains the final `done`
metadata transition; publication/integration does not authorize the Lead to edit
spec prose or status. The current spec remains `in progress` until that transition.
