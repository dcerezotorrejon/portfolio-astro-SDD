# Workflow Governance Update

- **Spec ID**: `009-workflow-governance`
- **Status**: draft
- **Last updated**: 2026-10-06

## Context

Constitution §5.1 currently combines project-wide workflow safeguards with
responsibilities assigned to specific agents. The agent prompts also prohibit the
Dev Lead from merging a feature branch, although the maintainer now wants the Lead
to perform that merge after receiving explicit approval. QA evidence has also been
kept in multiple standalone files and iterations rather than as one current report
in each task entry. The workflow guidance, agent prompts, consistency tests, and
the existing `004-portfolio-home` task evidence need to reflect the maintainer's
decisions without changing application behavior.

This is an amendment to the [project constitution](../../docs/constitution.md).
Its applicable rules remain subordinate to that constitution; the amendment must
follow its governance and versioning requirements.

## Goals

- Keep Constitution §5.1 focused on role-neutral, binding workflow principles and
  move agent-specific duties into the relevant agent prompts.
- Establish the corresponding-agent prompt as the source of truth for each
  custom-agent-specific rule, keeping `AGENTS.md` and the constitution focused on
  project-wide guidance.
- Establish current-source precedence for workflow rules and require the Spec
  Refiner to detect ambiguity and verify that each agreed requirement is
  implementable within current agent authority.
- Give the Dev Lead bounded, task-scoped edit authority for operational Markdown
  and repository configuration files.
- Allow the Dev Lead to merge a pushed feature branch into `main` only after
  explicitly requesting and receiving the maintainer's confirmation.
- Keep only the latest QA verification report/evidence for each task in
  `tasks.md`, replacing it after each re-verification instead of accumulating a
  run-by-run history.
- Consolidate the existing `004-portfolio-home` QA evidence into its task report
  and remove its standalone evidence-history files without changing its historical
  `spec.md`.
- Keep repository guidance and automated agent-consistency checks aligned with
  the amended constitution and agent prompts.
- Require Dev to format every file changed in the assigned task with Prettier
  before handoff, and limit QA's Markdown-specific file check to formatting.

## Non-goals

- Changing application code, portfolio content, or rendered behavior.
- Granting the Dev Lead unrestricted repository editing authority or permission
  to change tests, application implementation, content, or feature `spec.md`
  files outside existing role-specific authority.
- Allowing the Dev Lead to merge without a per-merge explicit maintainer approval,
  or to delete the feature branch.
- Changing the shared feature-branch, QA approval, commit/push, or quality-gate
  requirements except where this spec explicitly updates the merge authorization
  and QA evidence-retention behavior.
- Rewriting any earlier `spec.md`, including `specs/004-portfolio-home/spec.md`.
- Changing historical acceptance criteria or task completion status in
  `004-portfolio-home` as part of evidence consolidation.
- Creating separate QA evidence documents for future verification runs.

## Requirements

- **R1 — Role-neutral constitutional workflow:** Amend Constitution §5.1 so it
  states project-wide workflow safeguards without naming `Dev`, `QA`, `Dev Lead`,
  or another specific agent role, and without assigning duties to those roles.
  Keep the shared feature-branch convention, active-task/concurrency constraints,
  QA approval and evidence prerequisite for task closure, conflict and material
  decision escalation principles, quality-gated final commit/push, and the
  maintainer-approval requirement for base-branch integration. Put the
  role-specific procedures in the corresponding `.opencode/agents/` prompts.
  Increment the constitution version from its current value according to §11 and
  set `Last amended` to the actual amendment date.
- **R2 — Maintainer-authorized merge:** Update `.opencode/agents/dev-lead.md` so
  that after all task QA approvals/evidence and final quality gates pass, and the
  feature branch has been committed and pushed, the Dev Lead explicitly asks the
  maintainer for permission to merge that published `spec/[NNN]-[slug]` branch
  into `main`. The Lead MUST wait for an explicit affirmative confirmation before
  merging. Without that confirmation, the Lead MUST leave the branch unmerged.
  The Lead MUST NOT delete the feature branch. Dev and QA remain prohibited from
  merging, committing, or pushing.
- **R3 — Current-only QA evidence:** Update `.opencode/agents/qa.md` so each
  assigned task entry in `tasks.md` contains only the latest QA report/evidence
  for that task. When a task is re-verified, QA MUST replace the previous report
  with the new result, whether it passes or fails; it MUST NOT append a run-by-run
  history or create a separate evidence file for that run. The current report
  MUST identify the verified task/scope and shared-branch revision and state the
  applicable commands and their latest results, plus any current defects or
  approval. Evidence required to determine the present task/gate status MUST
  remain available in `tasks.md`; prior superseded QA results do not have to be
  retained. Final-gate reporting MUST likewise represent the latest run rather
  than accumulate repeated run history.
- **R4 — Agent-specific instructions:** Update all four workflow-agent prompts
  (`spec-refiner`, `dev-lead`, `dev`, and `qa`) so the role-specific rules removed
  from Constitution §5.1 are documented in the appropriate prompt. The prompts
  MUST remain consistent with the shared constitutional safeguards and preserve
  existing role, write-permission, task-scope, branch, and quality-gate boundaries,
  except for the explicit Dev Lead merge authorization in R2 and latest-only QA
  reporting in R3.
- **R5 — Operational guide consistency:** Update `AGENTS.md` to remove
  role-specific workflow rules that are relocated to agent prompts rather than
  restating them. Retain general workflow guidance and identify the agent prompts
  as the source for role-specific procedures. In particular, it MUST NOT say
  that the maintainer alone performs the merge or that the Dev Lead is forbidden
  from merging after approval; it MUST NOT contradict the latest-only QA evidence
  rule.
- **R6 — Agent consistency tests:** Update `tests/unit/agents.test.ts` to verify
  that Constitution §5.1 and `AGENTS.md` contain only shared guidance, agent
  prompts contain their applicable role-specific rules, the Dev Lead requires explicit maintainer
  approval before merging into `main` and cannot delete the branch, and QA reports
  only the latest task evidence without separate per-run history. Verify that the
  Dev prompt requires Prettier formatting of every task-modified file before
  handoff and that QA limits its Markdown-specific review to formatting while
  retaining content-requirement and applicable-gate verification. Preserve the
  existing tests for agent permissions and workflow boundaries.
- **R7 — Existing evidence consolidation:** Update `specs/004-portfolio-home/tasks.md`
  so each completed task retains only its latest available QA report/evidence and
  final-gate evidence represents the latest available complete run. Consolidate
  any still-relevant current evidence from the standalone files into the relevant
  task entries, remove links to standalone evidence documents, and delete the
  standalone `evidence*.md` files under `specs/004-portfolio-home/`. Do not change
  that spec's `spec.md`, acceptance criteria wording/checkmarks, or completed task
  statuses. Update its `summary.md` to record the evidence consolidation and
  relationship to this spec.
- **R8 — Verification:** Run all quality gates in Constitution §6 after the
  documentation, tests, and evidence changes. Explicitly record SEO and
  accessibility as not applicable to this non-rendered workflow change while
  running the repository's required test/accessibility gates.
- **R9 — Dev formatting before handoff:** Update `.opencode/agents/dev.md` so
  before handing an assigned task to QA, Dev runs the project's Prettier
  formatter on every file modified by Dev for that task. Dev reports the
  formatter command, the complete set of files formatted, and its result in the
  handoff. This does not replace QA's verification or repository quality gates.
- **R10 — QA Markdown formatting check:** Update `.opencode/agents/qa.md` so
  QA's file-specific review of modified `.md` files is limited to verifying
  Prettier formatting; QA does not perform additional editorial review of those
  files. QA still verifies the task's specified content requirements and runs
  all other applicable tests and quality gates, including the full repository
  format check where required.
- **R11 — Placement of custom-agent rules:** Make the corresponding custom-agent
  prompt the single source of truth for rules that apply specifically to that
  agent. A change to such a rule MUST be made in that agent's prompt. `AGENTS.md`
  and `docs/constitution.md` MUST contain only project-wide or cross-agent rules;
  they MUST NOT duplicate agent-specific procedures. They MAY link to or identify
  the relevant agent prompts as the location of those procedures.
- **R12 — Normative workflow sources:** Amend the general workflow guidance in
  `docs/constitution.md` to state that current workflow requirements and agent
  authority are determined by the current constitution and the applicable current
  custom-agent prompts, together with the maintainer's explicit current decisions.
  Earlier specs are historical records and MUST NOT establish or override current
  workflow rules, role boundaries, or permissions. They MAY be consulted to
  identify anticipated relationships or understand history, but not as normative
  authority.
- **R13 — Spec ambiguity and feasibility review:** Update
  `.opencode/agents/spec-refiner.md` to require the Spec Refiner, before declaring
  a spec agreed or handing it off, to verify that each requirement has a single
  clear interpretation, maps to acceptance criteria and verification, and can
  be implemented and verified by agents authorized under the current constitution
  and current agent prompts. The Refiner MUST review relevant current agent file
  and tool permissions against the spec's file/task ownership. If any requirement
  is ambiguous, conflicts with current rules, lacks an authorized implementer or
  verifier, or depends on an unapproved exception, the Refiner MUST pause, surface
  the specific blocker to the maintainer, and resolve it before calling the spec
  agreed. Historical specs MUST NOT be used to infer workflow permissions or
  override current rules.
- **R14 — Dev Lead governance and configuration scope:** Update
  `.opencode/agents/dev-lead.md` so the Dev Lead has a general capability to edit
  operational Markdown and repository configuration files, but only when those
  files are explicitly assigned in the current task. Operational Markdown for
  this capability means root-level guidance Markdown (`/*.md`), Markdown under
  `docs/**` and `.opencode/**`, plus `specs/README.md` and
  `specs/_template/**`. It excludes content Markdown under `src/content/**` and
  `public/**`, and does not expand authority over feature `spec.md` files or
  feature plan/task/summary files beyond the Dev Lead's existing grants.
  Configuration files are files whose project purpose is configuring package
  management, build/runtime tools, agents, lint/format/test tooling, or CI, at
  any repository path or extension; they MUST be named in the assigned task.
  The Lead's prompt MUST restrict actual edits to files explicitly named in the
  assigned task; a broader path-family tool permission MUST NOT be presented as
  authority to edit unassigned files. This capability MUST NOT authorize
  application implementation, tests, content, or feature `spec.md` edits. The
  Lead remains responsible for obtaining maintainer approval for material
  technical decisions as required by the current workflow. Update
  `tests/unit/agents.test.ts` to verify effective permission outcomes for
  representative governance Markdown and configuration paths and the Lead's
  task-scoped file boundary, without weakening the existing role permissions.

## Acceptance criteria

- [x] **AC1 (R1):** Constitution §5.1 expresses the required shared-branch,
      concurrency, task-closure, escalation, final commit/push, and maintainer-approved
      base-integration safeguards without naming or assigning work to specific agent
      roles. Its version is incremented from the version in effect at implementation
      time, and its amendment date is accurate.
- [x] **AC2 (R2):** The Dev Lead prompt requires a post-push, explicit request for
      maintainer approval before merging the feature branch into `main`; it requires
      waiting for affirmative approval, leaves the branch unmerged if approval is not
      received, and prohibits branch deletion. Dev and QA remain prohibited from
      merging, committing, and pushing.
- [x] **AC3 (R3):** The QA prompt requires one latest report in the assigned
      `tasks.md` entry, replacing the prior report after each re-verification, and
      prohibits accumulating per-run history or creating separate per-run evidence
      files. The latest report contains sufficient information to establish the
      current task status, verified scope/revision, and latest applicable check
      results. Final-gate evidence also records only the latest run.
- [x] **AC4 (R4–R5):** All four agent prompts and `AGENTS.md` are consistent with
      the amended constitution. Agent-specific procedures are in the relevant agent
      prompts and are not redundantly restated in `AGENTS.md`; neither document says
      that the Lead cannot merge after explicit maintainer approval or that QA should
      retain a full verification history.
- [x] **AC5 (R6):** `tests/unit/agents.test.ts` asserts role-neutral constitutional
      and `AGENTS.md` guidance, the Dev Lead's approval-gated merge and no-delete boundary, and
      QA's latest-only task-evidence rule. It also asserts Dev's pre-handoff
      Prettier requirement and QA's Markdown-format-only file review without
      weakening content-requirement, applicable-gate, permission, or workflow
      assertions.
- [x] **AC6 (R7):** Each completed task in `specs/004-portfolio-home/tasks.md`
      has one current QA evidence/report entry; repeated historical evidence is not
      accumulated; relevant latest evidence formerly held in standalone files is
      retained in the task report; final-gate evidence reflects the latest available
      complete run; all standalone `evidence*.md` files in that directory and their
      task-file links are removed. Its historical `spec.md` and acceptance criteria
      remain unchanged, and its `summary.md` records this relationship/update.
- [x] **AC7 (R8):** `pnpm lint`, `pnpm format:check`, `pnpm build`,
      `pnpm test:run`, and `pnpm test:a11y` pass. SEO and accessibility are explicitly
      recorded as not applicable to changed rendered behavior, not silently omitted.
- [x] **AC8 (R9–R10):** The Dev prompt requires formatting every file modified
      for the assigned task with Prettier before handoff and reporting the command,
      formatted file list, and result. The QA prompt limits its file-specific review
      of `.md` files to Prettier formatting without editorial review, while preserving
      task-content verification and all applicable tests and quality gates.
- [x] **AC9 (R11):** Each custom-agent-specific rule is maintained in the
      corresponding agent prompt as its source of truth. Constitution and `AGENTS.md`
      contain only project-wide/cross-agent rules, do not duplicate agent-specific
      procedures, and may point readers to the relevant prompt.
- [x] **AC10 (R12):** The constitution states that current workflow rules and
      agent authority come from current normative guidance and explicit current
      maintainer decisions; earlier specs are historical context/relationship records
      only and cannot establish or override workflow rules, permissions, or role
      boundaries.
- [x] **AC11 (R13):** The Spec Refiner prompt requires an ambiguity, acceptance/
      verification mapping, and feasibility review against current agent permissions
      and assigned file scopes before handoff. It requires the Refiner to stop and
      obtain resolution for an ambiguous requirement, missing authorized owner or
      verifier, policy conflict, or unapproved exception, and prohibits treating
      historical specs as authority for current workflow rules.
- [x] **AC12 (R14):** Dev Lead instructions and effective permissions allow
      explicitly assigned operational Markdown within the specified paths and
      explicitly assigned repository configuration files regardless of path or
      extension. The Lead prompt limits actual edits to task-named files and does not
      treat any broader path-family permission as authority to edit unassigned files.
      Application implementation, tests, content, and feature `spec.md` files remain
      outside this capability; existing plan/task/summary ownership remains unchanged.

## Verification

- **AC1 — Constitutional amendment:** Review Constitution §5.1 and confirm it
  contains each specified general safeguard but no agent role names or assigned
  agent duties. Verify the version increment and actual amendment date against
  §11.
- **AC2 — Merge authorization:** Review `.opencode/agents/dev-lead.md` and
  `AGENTS.md`; walk through the final workflow with approval granted and withheld.
  Confirm merge is allowed only after explicit maintainer confirmation following
  final QA, gates, commit, and push; confirm no confirmation leaves the feature
  branch unmerged and no flow deletes it. Inspect Dev and QA prompts/tests to
  confirm their merge/commit/push prohibitions remain.
- **AC3 — Latest-only QA report:** Review `.opencode/agents/qa.md` and
  `tasks.md` instructions, then simulate a failing QA run followed by a passing
  re-verification (and the reverse). Confirm the task entry is replaced with the
  most recent result, has enough current status/revision/command evidence, and
  contains no run history or separate per-run evidence document. Confirm the
  final-gate section is also latest-only.
- **AC4–AC5 — Guidance and tests:** Compare Constitution §5.1, each of the four
  agent prompts, and `AGENTS.md` for role-boundary and policy consistency. Run
  the relevant `tests/unit/agents.test.ts` assertions and confirm they cover the
  new merge and QA reporting rules without weakening existing tests.
- **AC6 — Legacy evidence cleanup:** Compare the revised
  `specs/004-portfolio-home/tasks.md` with its previous task report and linked
  evidence documents. Confirm the latest still-relevant evidence for each task
  and the latest complete final-gate result are retained, no stale evidence links
  remain, all standalone `evidence*.md` files in that directory are removed, and
  `specs/004-portfolio-home/spec.md` is unchanged. Confirm its `summary.md` records
  the relationship to this spec.
- **AC7 — Quality gates:** Run `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y` as required by
  [Constitution §6](../../docs/constitution.md#6-quality-gates). Record SEO and
  accessibility as not applicable because this increment changes no page, route,
  or rendered markup.
- **AC8 — Dev and QA formatting responsibilities:** Inspect `.opencode/agents/dev.md`
  and `.opencode/agents/qa.md`. Walk through a Dev handoff and confirm the report
  records the Prettier command, every task-modified file, and the formatter result.
  For a task modifying Markdown, confirm QA checks Prettier formatting without
  editorial review, while still verifying the specified content requirements and
  running applicable tests and gates, including `pnpm format:check`.
- **AC9 — Rule ownership and placement:** Compare all four custom-agent prompts
  with `AGENTS.md` and Constitution §5.1. Confirm every role-specific rule is
  stated in its corresponding agent prompt, while the two shared guidance
  documents contain only cross-agent/project-wide principles and links or
  pointers rather than duplicated agent procedures.
- **AC10 — Current normative sources:** Inspect the amended constitution and
  confirm it identifies current constitutional rules, applicable current agent
  prompts, and explicit current maintainer decisions as workflow authority, while
  treating historical specs only as history/relationship context. Review the
  policy wording to ensure it neither lets an earlier spec override current rules
  nor changes the requirement to record spec relationships under §4.2.
- **AC11 — Spec Refiner feasibility:** Inspect `.opencode/agents/spec-refiner.md`
  and walk through a proposed requirement that conflicts with a current agent's
  write permissions. Confirm the Refiner identifies the blocked owner/scope,
  pauses handoff, and asks the maintainer to resolve it rather than assuming an
  exception or using an earlier spec as authorization. Also verify each
  requirement must have unambiguous acceptance criteria and a verification method.
- **AC12 — Dev Lead authority:** Inspect the Dev Lead frontmatter permission order
  and prompt. Verify edit access for representative Markdown paths (`AGENTS.md`,
  `docs/constitution.md`, `.opencode/agents/dev-lead.md`,
  `specs/README.md`, and `specs/_template/plan.md`) and representative
  configuration files at different paths/extensions (`package.json`,
  `astro.config.mjs`, `opencode.json`, a lint/test configuration, and
  `src/content.config.ts`). Verify that the Lead prompt restricts work to the
  exact assigned paths even where a tool-level path glob is broader, and does not
  authorize application implementation, tests, content Markdown, feature
  `spec.md`, or unassigned paths. Confirm an explicitly assigned
  `src/content.config.ts` qualifies as configuration, but
  `src/components/FloatingNav.tsx` does not.
  Run the expanded Dev Lead permission/unit tests and preserve its existing
  plan/task/summary and current-spec write boundaries.

## Anticipated spec relationships

Per [Constitution §4.2](../../docs/constitution.md#42-spec-relationships), the
Dev Lead must resolve actual relationships in this spec's `summary.md` and update
affected earlier summaries in the same change. Earlier `spec.md` files must
remain unchanged.

- [001-sdd-baseline](../001-sdd-baseline/spec.md): **affected** because this
  increment further amends the constitution established by the baseline. Update
  only its `summary.md` relationship record.
- [003-agent-workflow](../003-agent-workflow/spec.md): **modified** because this
  increment changes the operational responsibilities and reporting rules of the
  established workflow agents. Update only its `summary.md` relationship record.
- [004-portfolio-home](../004-portfolio-home/spec.md): **modified** because its
  existing task evidence is consolidated under the latest-only reporting rule.
  Update `tasks.md` and `summary.md`; do not rewrite its historical `spec.md`.
- [007-workflow-changes](../007-workflow-changes/spec.md): **modified** because
  its agent workflow's maintainer-only merge handoff is superseded by a Dev Lead
  merge permitted after explicit maintainer approval, and its QA evidence policy
  is refined. Update only its `summary.md` relationship record.
- [008-lib-reorganization](../008-lib-reorganization/spec.md): **modified** because
  its handoff currently prohibits the Dev Lead from merging and makes base-branch
  integration maintainer-managed; this increment supersedes that restriction
  while preserving explicit maintainer confirmation and the no-delete rule.
  Update only its `summary.md` relationship record.
