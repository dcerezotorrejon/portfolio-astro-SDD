# Technical plan

- **Spec ID**: `012-agent-models`
- **Status**: feature integrated; Spec Refiner metadata closure pending
- **Last updated**: 2026-10-06
- **Shared branch**: `spec/012-agent-models`
- **Base revision**: `b135c8ea3034280657aa12132410872a7ce94dd7`

## Approach

Preserve the maintainer's existing four model-field edits. Apply the model and
workflow changes as a Markdown-only governance increment, with small serialized
tasks and independent QA. No application, test, content, dependency, or
`opencode.json` changes are planned.

The shared branch was created from `main` at the recorded base and published to
`origin` before planning. After all task approvals and renewed applicable final
gates, the Lead used the commit skill to create and publish feature commit
`5494d9c3f120dbf9e27683c26cfd7086db0786eb`. All implementation, verification,
evidence, and final publication records remain on this branch. The maintainer
explicitly approved integration on 2026-10-06; the Lead merged and pushed `main`
with merge commit `65aabd11befbd06b402770964dd7dc102fd7ad9d`. The feature branch
is retained, and remaining integration bookkeeping is verified on that branch.

## Approved decisions and bootstrap authority

- The maintainer approved this plan and task checklist on 2026-10-06 before
  implementation began.
- After T2, effective permissions rejected the Lead's first T3 edit. The
  maintainer approved transfer of the unimplemented T3 and T4 scopes to Dev on
  2026-10-06. T1/T2 remain Lead-implemented and QA-approved; remaining production
  edits are delegated. The rejected patch changed no operational file.
- The maintainer approved Sol without a variant suffix for Lead and Spec Refiner,
  Luna without a variant suffix for Dev and QA, removal of all four `Model intent`
  sections, and synchronization of `AGENTS.md`.
- The maintainer approved constitution version `1.8.0`: the resulting Lead owns
  only the assigned current planning artifacts and delegates implementation to
  Dev, including workflow Markdown and tooling configuration. QA remains
  independent. All existing branch, gate, and integration rules are preserved.
- On 2026-10-06, the maintainer clarified that those are the intended future role
  boundaries and explicitly assigned this bootstrap's operational edits to the
  Lead under its currently effective governance-edit capability. Exact ownership
  is limited to the six operational paths listed below. This one-time execution
  decision does not authorize a standing exception in the resulting prompts or
  constitution, any application/test edits, or Lead edits to `spec.md`.
- The repository's current Dev definition declares edit permission for these six
  files. No runtime permission denial has been observed. The Lead implementation
  decision comes from the maintainer's explicit bootstrap assignment, not from
  a claim that the repository's Dev permissions deny these paths.
- Spec Refiner re-anchored the execution account on 2026-10-06: T1/T2 were
  explicitly authorized Lead bootstrap work, and T3/T4 were implemented by Dev
  after the approved transfer. Requirements and all eight QA-backed acceptance
  markers remained unchanged. The spec is `in progress` pending the remaining
  closure steps; only its authorized owner may change its status.

## Named ownership and sequence

1. **T1 — Dev delegation permissions:** Lead implements
   `.opencode/agents/dev.md`; QA verifies effective permission order, preserved
   restrictions, Luna default, and removal of `Model intent`.
2. **T2 — Lead planning-only boundaries:** Lead implements
   `.opencode/agents/dev-lead.md`; QA verifies planning-only edit families,
   template denials, delegation instructions, Sol default, and preserved
   orchestration/integration duties.
3. **T3 — Remaining agent model prose:** Dev implements
   `.opencode/agents/qa.md` and `.opencode/agents/spec-refiner.md`; QA verifies
   model values and removal of `Model intent`, with all other text and permissions
   unchanged in effect.
4. **T4 — Constitutional adoption and guide:** After T1–T3 have QA approval, Lead
   delegates implementation of `docs/constitution.md` and `AGENTS.md` to Dev;
   QA verifies the approved amendment, version/date, model guide, and consistency
   of all six files.

Tasks execute serially. QA owns only the assigned evidence entry in
`specs/012-agent-models/tasks.md` and the evidence-backed acceptance checkbox
markers in `specs/012-agent-models/spec.md`. No tests are assigned for modification.
The Lead owns this plan, task coordination, and the current summary created at
closure. Spec Refiner alone owns substantive current-spec re-anchoring and status.

## Permission implementation

### Lead

Retain a default edit denial. Allow the `plan.md`, `tasks.md`, and `summary.md`
feature families only; place explicit template and spec denials after matching
allowances. Remove all broad edit allowances and governance/configuration
implementation exceptions, including `R14` references. Instructions constrain
family permissions to the three assigned current artifacts and forbid indirect
operational edits through shell commands or formatters.

Retain the current subagent and Git/integration permissions. Preserve the existing
model override policy and every unrelated responsibility. A family allowance
must never be interpreted as permission to edit completed or unrelated artifacts.

### Dev

Preserve application implementation and tool-configuration authority under exact
task ownership. Keep feature directories denied, then provide narrow allowances
for `specs/README.md` and permitted operational template files. Place test and
all-`spec.md` denials after allowances so the template spec stays denied. Do not
permit feature planning, evidence, or summary writes. Account for V2 whole-value
wildcards and last-matching-rule semantics, not filesystem glob assumptions.

Explain the named operational families, configuration purposes, exact assignment
requirement, amendment approval requirement, and completed-directory prohibition.
Retain Dev's branch/merge/commit/push/subagent restrictions and QA test ownership.

## Risks and safeguards

- **Current state:** T1–T4 have QA approval and recorded evidence. The permission
  blocker was resolved through the approved Dev ownership transfer, not a bypass.
  Spec Refiner has resolved the bootstrap ownership divergence without changing
  final requirements or acceptance markers. The Lead reran the complete
  increment's applicable final gates after re-anchoring; lint and format passed,
  and QA recorded and approved the latest final report. Build, unit, SEO, and
  accessibility were not run under the Markdown-only exception.
- **Resolved blocker:** The first Lead T3 patch was rejected after the Lead
  definition changed; no operational file was modified by that attempt. The Lead
  stopped and obtained maintainer approval to transfer T3/T4 to Dev, which
  completed them under its own permissions. No workaround was used.
- **Self-modifying agent definitions:** File changes may not alter a running
  session's loaded permissions. Do not depend on old loaded permissions to
  circumvent new boundaries; confirm/reload definitions before subsequent work.
- **Authority transition:** Apply the constitution last, after agent tasks have
  QA approval. If new effective rules prevent a remaining edit or rework, stop
  and report the exact blocker for an authorized resolution; never bypass it
  using shell writes, stale session permissions, or an inferred exception.
- **Spec ownership:** Re-anchoring is complete. QA must not rewrite spec prose,
  and the Lead must not edit any `spec.md`, including status metadata. The
  increment remains active until its authorized owner sets status `done`; do not
  represent final publication or integration as that metadata transition.
- **Permission breadth:** Verify positive and negative examples from the spec,
  including README, templates, tests, configuration, and feature planning.
  Do not create probe files or attempt forbidden edits.
- **Existing formatting issues:** Run targeted Prettier only on files owned by
  the task. Report repository-wide failures without formatting unrelated files.
- **Git/change conflicts:** Stop the affected operation, collect blocking state,
  and obtain an agreed resolution without overwriting changes.

## Model choice

The T1/T2 bootstrap implementer used the Lead's configured GPT-6.1 Sol model;
T3/T4 use Dev's configured GPT-6 Luna model with no override for bounded Markdown
implementation. QA uses its configured GPT-6 Luna model, without an override,
because these bounded governance checks do not warrant added cost.
Do not impose a reasoning variant or retain `Model intent` prose.

## Verification and closure

For each task, the implementer runs targeted Prettier on its owned changed files
and reports the exact command and result. QA verifies content requirements and
effective ordered permissions, runs `pnpm lint` and `pnpm format:check`, and
replaces only that task's latest evidence report. Markdown QA is not an editorial
review. Criteria spanning tasks are marked only when all supporting verification
has passed. Defects return to the same implementer unless an authority transition
blocks correction; such a block requires escalation rather than unauthorized work.

Determine final gates from the complete increment relative to the recorded base,
including all committed, staged, unstaged, and untracked changes. For this planned
Markdown-only scope outside `src/content/**`, run lint and format and explicitly
record build, unit, SEO, and accessibility as not applicable under constitution
§§5–6. Any scope expansion invalidating that exception requires all five gates.

Only after all task approvals/evidence, spec re-anchoring, summary, and final gates
may the Lead use the commit skill and push final feature commits. Then ask for
explicit affirmative merge permission; without it, leave the published branch
unmerged and do not delete it.
