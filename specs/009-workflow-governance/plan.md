# Plan — Workflow Governance Update

- **Spec ID**: `009-workflow-governance`
- **Last updated**: 2026-10-06

## Approach

Implement the governance changes in three serialized, independently verifiable
tasks, with the Dev Lead owning the governance/configuration edits under R14 and
QA owning its assigned tests and verification:

1. Amend the constitution and shared guide with role-neutral, cross-agent
   safeguards and current-source precedence; update each applicable agent prompt
   with its role-specific procedure. The Dev Lead owns the expressly assigned
   governance Markdown and configuration files under R14. QA owns all changes to
   its assigned tests, including creating, modifying, or removing tests as needed,
   and records verification evidence. Cover R1–R6 and R9–R14, including the
   Dev Lead's approval-gated merge, latest-only QA reports, Dev's Prettier
   handoff, QA's Markdown-formatting boundary, Spec Refiner feasibility review,
   and the Dev Lead's task-scoped file authority.
2. After QA's narrowly scoped evidence-maintenance permission is in place and
   verified, have QA consolidate the existing `004-portfolio-home` evidence into
   its task report and remove the superseded standalone evidence files. The
   maintainer approved this one-time QA scope: editing the evidence in
   `specs/004-portfolio-home/tasks.md` and deleting only
   `specs/004-portfolio-home/evidence*.md`. The QA prompt and tests must make the
   exception explicit and keep it separate from ordinary QA authority.
3. After evidence reconciliation is approved, the Dev Lead updates this
   feature's summary and the `Related specs` records in affected earlier
   summaries. Earlier `spec.md` files remain untouched. Determine affected
   summaries from the actual changes and Constitution §4.2; historical specs are
   not authority for current workflow requirements.
4. After T2 approval, revoke the temporary QA edit permission for the legacy
   `004-portfolio-home/evidence*.md` files and remove the corresponding one-time
   authorization wording from the QA prompt. Update the agent tests to confirm
   QA retains its ordinary assigned-task evidence permission but no longer has
   permission to edit the deleted legacy evidence paths.

Tasks are serialized because task 2 relies on the QA prompt and permission/test
changes in task 1, while task 3 records the actual result of task 2. T2 owns only
the evidence reconciliation; summary updates belong to T3, after T2 is approved.
AC6 is verified only after both the task evidence and the 004 summary update are
complete. At most one task is active at a time. All delegated Dev and QA work
remains on the published `spec/009-workflow-governance` branch.

## Files to change

- `docs/constitution.md` — make §5.1 role-neutral while preserving shared branch,
  concurrency, task closure, escalation, and quality-gated integration
  safeguards; establish the current normative-source rule without allowing
  historical specs to define workflow; increment the current version (`1.5.0`)
  as required by §11 and use the actual amendment date. Section §11 does not
  specify which version component to increment, so the plan does not treat earlier
  spec/version history as authority for that choice.
- `AGENTS.md` — retain project-wide workflow guidance and links to the custom
  agent prompts; remove duplicated role-specific procedures and any stale merge
  or evidence-retention policy.
- `.opencode/agents/spec-refiner.md` — require ambiguity, acceptance/verification,
  and feasibility review against current agent permissions and named task scopes;
  require escalation and resolution before handoff when there is no authorized
  implementer or verifier. Earlier specs are not authority for current workflow.
- `.opencode/agents/dev-lead.md` — require post-push, explicit maintainer
  confirmation before merging the feature branch into `main`; preserve the
  no-delete rule; add R14's task-scoped operational-Markdown/configuration
  authority, its exact path/subject boundaries, and the distinction between
  tool-level edit capability and authorization to edit only task-named files.
  Explicitly authorize the required merge command if effective tool permissions
  otherwise block it.
- `.opencode/agents/dev.md` — require Prettier on every task-modified file before
  QA handoff and reporting the command, files, and result.
- `.opencode/agents/qa.md` — require replacement of prior QA reports with the
  latest result in the task entry; limit Markdown-specific review to formatting;
  record the one-time T2 scope as historical work, then revoke its temporary
  `004-portfolio-home/evidence*.md` edit permission and authorization wording.
- `tests/unit/agents.test.ts` — re-anchor assertions to role-neutral shared
  guidance and test agent-specific instructions, Lead merge authorization,
  QA's latest-only reporting and the revoked legacy-evidence permission, Dev's
  Prettier handoff, QA's Markdown-formatting boundary, current-source precedence,
  Spec Refiner feasibility obligations, and R14's representative
  governance-Markdown and configuration permission outcomes. Preserve existing
  branch, model, subagent, and role-boundary checks. Tests may verify static
  permission matches and prompt scope, but must not imply that static path globs
  can enforce task-specific assignment or identify a file's semantic purpose.
- `specs/004-portfolio-home/tasks.md` — retain only the latest relevant evidence
  per task and the latest complete final-gate result; remove standalone evidence
  links.
- `specs/004-portfolio-home/evidence*.md` — remove the 20 existing standalone
  evidence files after reconciling their latest relevant evidence into
  `tasks.md`.
- `specs/001-sdd-baseline/summary.md`, `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`,
  `specs/007-workflow-changes/summary.md`, and
  `specs/008-lib-reorganization/summary.md` — update dates and relationship
  records to reflect the actual amendment, workflow changes, or evidence cleanup.
- `specs/009-workflow-governance/plan.md` and `tasks.md` — planning and task
  evidence; create `summary.md` after implementation is complete.

No historical `spec.md` is in scope. The app source, content, routes, and rendered
markup are unchanged.

## Key decisions

- **Role-specific policy lives with its agent.** Each custom-agent prompt is the
  source of truth for rules that apply specifically to that agent. Constitution
  §5.1 and `AGENTS.md` retain general or cross-agent guidance and may point to the
  relevant prompts, but do not duplicate agent procedures.
- **Merge requires approval for each feature.** The Dev Lead may merge the
  published feature branch into `main` only after final QA, evidence, gates,
  commit, and push, and after receiving an explicit affirmative maintainer
  confirmation. The Lead must not delete the branch. Dev and QA remain unable to
  merge, commit, or push.
- **QA evidence is current-state, not an execution log.** Re-verification
  replaces the previous task report, including when the latest run fails. The
  current `tasks.md` evidence must be sufficient to establish the latest state;
  superseded runs and standalone per-run reports are not retained.
- **Temporary QA evidence permission revoked.** The maintainer authorized QA to
  consolidate `004` evidence for T2 only. T2 passed, and its report retains the
  historical scope/evidence. The specific `evidence*.md` tool permission and
  one-time prompt exception have now been removed; QA retains only its ordinary
  assigned-test, assigned-task-evidence, and current-spec-checkbox permissions.
- **Markdown verification boundary.** Dev formats every task-modified file with
  Prettier before handoff. QA's file-specific review of `.md` files checks their
  Prettier format, not editorial style; QA still checks task requirements and
  runs applicable tests and gates.
- **Constitution version.** §11 requires an increment and an accurate amendment
  date but does not specify the semantic-version component. Increment from the
  version in effect when the amendment is made; do not treat historical specs or
  prior version changes as normative policy.
- **Current workflow authority.** Current workflow rules are governed by the
  current constitution and applicable current agent prompts, subject to the
  constitution's precedence rule and explicit maintainer decisions made through
  the applicable amendment/approval process. Historical specs are relationship
  or historical records, not sources of current permissions.
- **Task-scoped Lead authority.** R14 authorizes the Dev Lead to edit explicitly
  assigned operational Markdown under the paths named in the spec and
  configuration files whose project purpose is package management, build/runtime,
  agent, lint/format/test, or CI configuration. This capability does not expand
  authority over application implementation, tests, content, feature `spec.md`,
  or unassigned paths. Static edit globs are only tool capability; prompt/task
  instructions must continue to constrain actual changes to the named assignment.
- **Maintainer-approved Lead authority.** The maintainer has approved the Dev
  Lead's R14 task-scoped authority from the start of execution. T1 assigns the
  Lead the governance/configuration changes; no separate Dev exception is planned.
  The current checked-in Dev Lead prompt and permission list have not yet been
  updated to express that grant. At T1 start, reconcile the effective agent
  permissions with the approved scope and verify them before proceeding; do not
  treat the conversational approval as proof that the current static tool
  permissions have already changed.
- **Branch.** `spec/009-workflow-governance` has been created from `main` and
  published to `origin` for shared Dev/QA work. No feature commit or merge has
  been made.

## Risks

- **Historical QA permission could persist accidentally.** Verify the temporary
  `004` evidence grant is absent from the QA prompt and effective permission
  rules, while assigned current task evidence remains editable.
- **Evidence consolidation can lose unique verification details.** Review all 20
  source files and retain the latest still-relevant evidence per task, including
  the latest complete final-gate run, before deleting any source. Review the
  final diff and ensure no task or acceptance status is changed.
- **Existing agent tests encode the old policy.** Several assertions inspect
  exact constitutional wording and require the maintainer-only merge handoff.
  Update those assertions intentionally while retaining model, permission,
  concurrency, branch, and role-boundary coverage.
- **Constitution and operational guidance can drift.** Check all four custom
  prompts, `AGENTS.md`, and §5.1 together; test the intended rule ownership,
  precedence, and role-specific boundaries without duplicating specific
  procedures in shared documents.
- **Static permission patterns cannot enforce semantic/task assignment.** Verify
  both the effective path rules and the Lead's task-scoped instructions. Do not
  claim that a static `edit` glob distinguishes configuration from application
  code or dynamically enforces which files a task assigned.
- **Task reports can become stale after a failed retest.** QA must replace the
  previous result even on failure and leave the task active; do not preserve a
  previous passing report as the current status.

## Testing strategy

- **Agent/configuration and policy unit tests:** Update and run
  `tests/unit/agents.test.ts`. Verify QA is denied the deleted `004` evidence
  paths while retaining permission for its assigned task entry. Verify the Dev
  Lead's representative governance
  Markdown/configuration edit capability, its task-file limitation in the prompt,
  and the distinction between tool capability and task authority. Verify the
  Lead's merge allowance and Dev/QA's merge/commit/push denials. Test current
  normative-source statements and Spec Refiner feasibility checks.
- **QA report behavior:** Review/simulate a failed and passing re-verification
  sequence; ensure only the latest state appears in the assigned `tasks.md`
  entry and no per-run file is created.
- **Legacy evidence cleanup:** Manually reconcile all 20 `004` evidence files
  against the task entries, check final gates reflect the latest complete run,
  remove links to those files from `specs/004-portfolio-home/tasks.md`, and
  verify no standalone `evidence*.md` remains. Other historical files—including
  the protected `spec.md` and out-of-scope documents—remain unchanged. Compare
  `specs/004-portfolio-home/spec.md` to the base revision to confirm it is
  untouched.
- **Formatting:** Dev runs `pnpm exec prettier --write <all task-modified files>`
  before handing off. QA runs `pnpm format:check` and confirms Markdown changes
  are formatted; no editorial style review is added for Markdown files.
- **Quality gates:** QA runs `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y` for each task as required by the
  constitution. Final gates are re-run after all tasks. SEO and changes to
  rendered accessibility are not applicable because no routes or markup change;
  record that explicitly while running the applicable automated gates.
