# Tasks

- **Spec ID**: `012-agent-models`
- **Last updated**: 2026-10-06
- **Shared branch**: `spec/012-agent-models`
- **Base revision**: `b135c8ea3034280657aa12132410872a7ce94dd7`
- **Execution status**: all seven tasks QA-approved; closure prerequisites verified
- **Active tasks**: 0

## Coordination prerequisites

- [x] Maintainer confirms the current `plan.md` before implementation.
      Evidence: explicit affirmative confirmation on 2026-10-06, before T1.
- [x] Request Spec Refiner re-anchoring of bootstrap ownership to the maintainer's
      one-time Lead assignment; final role boundaries remain unchanged. Resolve
      the mismatch before closure; the Lead edits no substantive spec content.
      Evidence: Spec Refiner updated the current spec on 2026-10-06 to reflect
      Lead T1/T2 and transferred Dev T3/T4; requirements and QA ownership are
      preserved.

The maintainer approved the constitutional amendment and explicitly assigned this
bootstrap's six operational files to the Lead under current authority. Resulting
rules contain no continuing Lead implementation exception. The plan records this
decision and the authority-transition safeguards.

All tasks run serially; each remains active through QA and rework until approval
and recorded evidence. QA evidence writes overlap in this file and are serialized.
No task branches, commits, or pushes are permitted.

## T1 — Dev delegation permissions

- [x] T1 complete with QA approval and evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Dependencies:** maintainer plan approval.
- **Implementer:** Dev Lead, explicit bootstrap assignment.
- **Production ownership:** `.opencode/agents/dev.md` only.
- **Scope:** Preserve `model: openrouter/openai/gpt-6-luna`; remove `Model intent`;
  explicitly document assigned workflow/configuration edits; repair ordered edit
  rules for README and permitted templates while denying every `spec.md`, tests,
  and feature planning/evidence/summary files. Preserve existing Dev Git/subagent
  restrictions, exact assignment, and historical immutability. Constitution
  changes require maintainer approval.
- **Acceptance coverage:** AC2 (Dev), AC3 (Dev), AC7; contributes to AC5.
- **QA ownership:** this T1 evidence entry; corresponding evidence-backed
  checkbox markers in `specs/012-agent-models/spec.md`; no test files.
- **Models:** Lead GPT-6.1 Sol for assigned governance implementation; QA's
  configured GPT-6 Luna, no override, for bounded content/permission verification.
- **Handoff:** report exact edits and targeted Prettier command/result for the
  owned file, then request independent QA on the shared branch.
- **Latest QA report:** approved for T1 on `spec/012-agent-models` at HEAD
  `b135c8ea3034280657aa12132410872a7ce94dd7`; all task changes remain uncommitted.
  Verified T1's `.opencode/agents/dev.md` implementation and its AC7 coverage:
  the Luna frontmatter value is unsuffixed, `Model intent` is removed, and the
  prompt explicitly limits operational Markdown/configuration work to exact
  assigned paths, excludes feature planning/evidence/summaries and every
  `spec.md`, preserves historical immutability, requires §11 maintainer approval
  for constitution amendments, and retains Git/branch/merge/commit/push and
  subagent restrictions unchanged from base. Under OpenCode V2 whole-value `*`
  matching (including `/`) and last-matching-rule semantics, `specs/README.md`
  is allowed by its final matching allow; `specs/_template/plan.md`, `tasks.md`,
  and `summary.md` are allowed by the later template allow; `tests/**` remains
  denied by its later deny; `specs/012-agent-models/plan.md`, `tasks.md`, and
  `summary.md` remain denied by the later `specs/**` deny; template/nested
  `spec.md` paths are denied by the later `**/spec.md` deny, and root `spec.md`
  by the final `spec.md` deny. The permission families remain subject to exact
  task assignment; no forbidden write/probe was attempted. Content checks pass.
  Handoff formatter `pnpm exec prettier --write .opencode/agents/dev.md
specs/012-agent-models/plan.md specs/012-agent-models/tasks.md` — passed; per
  handoff, it left the owned operational file and Lead coordination artifacts
  unchanged. `pnpm lint` — passed; `pnpm format:check` — passed. The complete
  observed feature change set is Markdown-only and outside `src/content/**`;
  `pnpm build`,
  `pnpm test:run`, rendered-HTML SEO, and `pnpm test:a11y` are not applicable
  under Constitution §§5–6. No task defect found; AC7 is verified. Broader
  uncommitted feature paths at verification were `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, `.opencode/agents/qa.md`,
  `.opencode/agents/spec-refiner.md`, and this spec's `plan.md`, `spec.md`, and
  `tasks.md`; all are Markdown outside `src/content/**`. No tests were changed.

## T2 — Lead planning-only boundaries

- [x] T2 complete with QA approval and evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Dependencies:** T1 approval; serialized bootstrap execution.
- **Implementer:** Dev Lead, explicit bootstrap assignment.
- **Production ownership:** `.opencode/agents/dev-lead.md` only.
- **Scope:** Preserve `model: openrouter/openai/gpt-6.1-sol`; remove `Model intent`;
  restrict edit permissions to planning families with template/spec denials;
  remove operational/configuration implementation exceptions and `R14`
  references; require Dev implementation and independent QA, including workflow
  Markdown/configuration. Forbid indirect edit workarounds. Preserve all unrelated
  orchestration, model-override, Git, gate, and integration responsibilities.
- **Acceptance coverage:** AC1 (Lead), AC3 (Lead), AC6; contributes to AC5.
- **QA ownership:** this T2 evidence entry; corresponding evidence-backed
  checkbox markers in `specs/012-agent-models/spec.md`; no test files.
- **Models:** Lead GPT-6.1 Sol for assigned governance implementation; QA's
  configured GPT-6 Luna, no override, for bounded content/permission verification.
- **Handoff:** report exact edits and targeted Prettier command/result for the
  owned file. If the authority transition prevents further bootstrap work, stop
  and escalate; do not use stale permissions as a workaround.
- **Latest QA report:** approved for T2 on `spec/012-agent-models` at shared
  branch HEAD `b135c8ea3034280657aa12132410872a7ce94dd7`; the T2 production
  change and QA evidence remain uncommitted. Verified the sole T2 production
  file, `.opencode/agents/dev-lead.md`, against AC6 and its diff from the base.
  Its frontmatter preserves the unsuffixed Sol model and color/mode; the entire
  `Model intent` section and every `R14` reference are removed. The description
  and prompt limit direct edits to assigned current planning artifacts, direct
  every implementation task (including operational Markdown/configuration) to
  Dev with exact file ownership, and require independent QA. There is no direct
  or indirect implementation exception: the rules explicitly forbid shell,
  formatter, or other indirect writes outside the three assigned artifacts.
  Effective edit rules use OpenCode V2 last-matching-rule semantics and
  whole-value `*` matching (including `/`): the current feature's
  `specs/012-agent-models/plan.md`, `tasks.md`, and `summary.md` each match their
  corresponding `specs/*/{plan,tasks,summary}.md` allow after the default `**`
  deny; those families still do not authorize unassigned or completed artifacts.
  `AGENTS.md`, `docs/constitution.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`, `opencode.json`, `src/pages/index.astro`,
  `tests/permission-probe.test.ts`, and `specs/README.md` match only the default
  deny. `specs/_template/plan.md`, `tasks.md`, and `summary.md` match their
  planning allows but are denied by the later `specs/_template/**` rule. Both
  `specs/012-agent-models/spec.md` and `specs/_template/spec.md` are denied by
  `**/spec.md`; root `spec.md` matches its explicit final denial. No forbidden
  write or probe was attempted.
  Compared with the base, the model and delegation/permission changes are in
  scope; model-override policy,
  subagent permissions, branch workflow, task limits, QA loop, quality gates,
  commit/push sequence, and integration duties remain unchanged in effect.
  The implementer's targeted formatter command
  `pnpm exec prettier --write .opencode/agents/dev-lead.md
specs/012-agent-models/tasks.md` succeeded unchanged; `tasks.md` is a Lead
  coordination artifact, and no unrelated evidence was rewritten. No tests were
  assigned or changed. QA formatted only this assigned task evidence with
  `pnpm exec prettier --write specs/012-agent-models/tasks.md` — PASS (unchanged).
  The complete current feature change set, including
  uncommitted and untracked files, is Markdown-only and outside
  `src/content/**`: `pnpm lint` — PASS; `pnpm format:check` — PASS. `pnpm build`,
  `pnpm test:run`, rendered-HTML SEO checks, and `pnpm test:a11y` — NOT APPLICABLE
  under Constitution §§5–6. No T2 defect found; AC6 is verified. AC1, AC3, and
  AC5 remain unchecked because they have broader cross-task coverage.

## T3 — Remaining agent model prose

- [x] T3 complete with QA approval and evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Blocking evidence:** After T2 approval, the attempted patch to remove
  `Model intent` from the two owned agent files was rejected with
  `permission.rejected` / `Permission denied: edit`. Read-only inspection confirmed
  that both files still contain only the maintainer's original model-field diff.
  The shared branch remains `spec/012-agent-models`. No shell/formatter workaround
  was attempted. The maintainer then explicitly approved transfer of T3/T4 to
  Dev on 2026-10-06; this resolves the blocker without bypassing restrictions.
- **Dependencies:** T2 approval; serialized bootstrap execution.
- **Implementer:** Dev; maintainer-approved ownership transfer after T2.
- **Production ownership:** `.opencode/agents/qa.md` and
  `.opencode/agents/spec-refiner.md` only.
- **Scope:** Preserve QA's Luna and Spec Refiner's Sol references without
  variants; remove their entire `Model intent` sections. Preserve all other
  permissions, modes, descriptions, colors, and instructions in effect.
- **Acceptance coverage:** completes AC1, AC2, and AC3 with T1/T2 evidence;
  contributes to AC5.
- **QA ownership:** this T3 evidence entry; corresponding evidence-backed
  checkbox markers in `specs/012-agent-models/spec.md`; no test files.
- **Models:** Dev's configured GPT-6 Luna, no override, for bounded implementation;
  QA's configured GPT-6 Luna, no override, for exact-value and preservation checks.
- **Handoff:** report edits and targeted Prettier command/result for both owned
  files, then request independent QA on the shared branch.
- **Latest QA report:** QA verified T3 on shared branch `spec/012-agent-models` at
  HEAD `b135c8ea3034280657aa12132410872a7ce94dd7`; all task changes are
  uncommitted. T3's complete production scope is `.opencode/agents/qa.md` and
  `.opencode/agents/spec-refiner.md`. Against the base, QA has only the requested
  model-field changes and complete removal of each `Model intent` section:
  QA has exactly `openrouter/openai/gpt-6-luna`, and Spec Refiner has exactly
  `openrouter/openai/gpt-6.1-sol`, both without variant suffixes. Neither prompt
  contains a replacement section or prose instruction pinning a model or
  reasoning effort. Their respective `mode`, `color`, permissions, and all other
  instructions are unchanged from base. Cross-task evidence in the approved T1
  report verifies Dev's unsuffixed Luna default and removed intent section; the
  approved T2 report verifies Dev Lead's unsuffixed Sol default, removed intent
  section, and unchanged task-specific model-override policy. Inspection of all
  four current agent prompts confirms these exact defaults and no remaining
  `Model intent` section. Thus AC1, AC2, and AC3 are verified. No tests were
  assigned or changed. Dev's targeted formatter command
  `pnpm exec prettier --write .opencode/agents/qa.md
.opencode/agents/spec-refiner.md` succeeded unchanged. QA formatted the assigned
  evidence with `pnpm exec prettier --write specs/012-agent-models/tasks.md` —
  PASS. `pnpm lint` — PASS; `pnpm format:check` — PASS. Build, unit, rendered
  HTML SEO, and accessibility gates are not applicable under Constitution §§5–6:
  the complete feature change set observed at verification consists only of
  Markdown files outside `src/content/**`. No T3 defect identified; approved.

## T4 — Constitutional adoption and guide

- [x] T4 complete with QA approval and evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Dependencies:** T1, T2, and T3 QA approval and evidence.
- **Implementer:** Dev; maintainer-approved ownership transfer after T2.
- **Production ownership:** `docs/constitution.md` and `AGENTS.md` only.
- **Scope:** Apply the approved §5.1 amendment, version `1.8.0`, and actual
  application date. Synchronize the guide's model defaults and role boundaries;
  retain unchanged Auto Router variants. Verify cross-file consistency and leave
  all unrelated constitutional and operational rules unchanged.
- **Acceptance coverage:** AC4, AC8; completes AC5 after full-scope checks and
  applicable gates. Preserve evidence already supporting AC1–AC3 and AC6–AC7.
- **QA ownership:** this T4 evidence entry; corresponding evidence-backed
  checkbox markers in `specs/012-agent-models/spec.md`; no test files.
- **Models:** Dev's configured GPT-6 Luna, no override, for the bounded approved
  amendment; QA's configured GPT-6 Luna, no override, for constitutional
  consistency and complete-scope review.
- **Handoff:** report edits and targeted Prettier command/result for both owned
  files. After adoption, never assume bootstrap authority survives a conflicting
  effective rule; stop and escalate any blocked rework.
- **Latest QA report:** approved for T4 on `spec/012-agent-models`
  at shared-branch HEAD `b135c8ea3034280657aa12132410872a7ce94dd7`; all feature
  changes are uncommitted. T4's assigned production scope is exactly
  `docs/constitution.md` and `AGENTS.md`. The complete operational-file diff
  against the base consists of the four agent definitions, `AGENTS.md`, and
  `docs/constitution.md`; the complete feature working set also includes this
  increment's untracked `plan.md`, `spec.md`, and `tasks.md`. All changed files
  are Markdown outside `src/content/**`; no test, application/source, content,
  asset, or `opencode.json` file changed. No tests are assigned or needed for
  these documentation/governance requirements.

  R4 verified: the `AGENTS.md` model bullet names the exact unsuffixed Sol
  defaults for Dev Lead/Spec Refiner and Luna defaults for Dev/QA, identifies
  agent frontmatter as the source, says no reasoning variant is explicitly
  selected, and retains that Auto Router variants in `opencode.json` are
  unchanged. Its next bullet states that the Lead edits only assigned current
  planning artifacts, delegates all implementation (including operational
  Markdown and repository configuration) to Dev with exact file ownership, and
  leaves QA independent with assigned tests/evidence and no production edits.
  It no longer describes old suffixed defaults.

  R8 verified: `docs/constitution.md` is version `1.8.0`, gives the actual
  amendment date `2026-10-06`, and §5.1 makes the Lead planning-only, prohibits
  direct and indirect implementation, requires exact-path delegation of all
  implementation to Dev, preserves independent QA and Spec Refiner ownership,
  and retains the surrounding branch, evidence, conflict, final-gate, and
  integration rules. The only semantic constitution changes are the approved
  version/date and §5.1 role-separation addition. The current Lead and Dev
  prompts align with that amendment, and the guide aligns as well. The approved
  amendment is recorded in the current plan (lines 31–34) and task coordination
  notes (lines 18–21).

  AC5 full-scope review: all six operational files change only for the specified
  model/workflow requirements. All four model fields are exact unsuffixed
  references; the four `Model intent` sections are removed. The Lead description,
  prompt, and edit rules remove implementation authority and preserve orchestration
  duties. Dev gains the specified operational Markdown/configuration scope and
  ordered permission exceptions; Dev's mode/color and existing branch, merge,
  commit, push, subagent, test-ownership, exact-assignment, and history restrictions
  remain in effect. QA and Spec Refiner permissions are unchanged. All six
  frontmatter modes and colors match the base. The only changes to `AGENTS.md` and
  the constitution satisfy R4/R8. OpenCode V2 last-matching-rule evaluation of
  the spec's examples: for the Lead, current `specs/012-agent-models/{plan,tasks,
summary}.md` match their corresponding planning allow rules after the default
  `**` deny. `specs/_template/{plan,tasks,summary}.md` match those allows but are
  denied by the later `specs/_template/**` rule; template `spec.md` paths match
  that denial and the later `**/spec.md` denial. The six operational paths,
  `specs/README.md`, `opencode.json`, `src/pages/index.astro`, and
  `tests/permission-probe.test.ts` match only the default edit deny. Feature
  `spec.md` is denied by `**/spec.md` and root `spec.md` by its explicit denial.
  For Dev, the six assigned paths match their explicit allows after the default
  `**` deny and are also matched by the broad `**` allow; `opencode.json` matches
  the broad allow. `specs/README.md` and template plan/tasks/summary are allowed
  by their later rules, with template `spec.md` denied by subsequent spec rules.
  Tests are denied by the later `tests/**` rule; feature planning, tasks, and
  summary are denied by later `specs/**`; feature `spec.md` also matches the
  later `**/spec.md` denial, and root `spec.md` matches its explicit denial.
  These permission-family matches do not grant unassigned-file ownership, and
  completed directories remain prohibited. No forbidden-write probes were
  attempted. No paths outside the six operational files and current increment
  artifacts changed; `opencode.json` and all non-Markdown/content files are
  unchanged.

  Dev's reported formatter command, `pnpm exec prettier --write
docs/constitution.md AGENTS.md`, passed and left both owned files unchanged.
  `pnpm lint` — PASS; `pnpm format:check` — PASS. Build, unit, rendered-HTML SEO,
  and accessibility are not run and are not applicable under Constitution §§5–6
  because the complete changed-file set is Markdown-only outside `src/content/**`.
  No T4 defect found. AC4, AC5, and AC8 are verified; T4 is approved with evidence.

## Closure checklist

- [x] All seven tasks have current QA approval and recorded evidence; active tasks are 0.
      T7 is reopened to independently verify the latest closure-state narrative and
      gates after the Lead's correction. T1–T6 remain approved.
- [x] Spec Refiner has resolved bootstrap ownership divergence and the current
      active-state metadata without changing completed directories.
      Evidence: the re-anchored spec has status `in progress` and records actual
      implementation ownership with all QA-backed criteria unchanged.
- [x] Lead creates the current `summary.md` with date and actual changed files.
      Evidence: `specs/012-agent-models/summary.md`, dated 2026-10-06.
- [x] Lead determines the complete feature changed-file set from the base revision
      and runs every applicable final gate.
      Evidence: final ten-path diff from the original base is Markdown-only outside
      content. `pnpm lint` and `pnpm format:check` passed after all Lead artifact
      updates; build/unit/SEO/accessibility are not applicable.
- [x] QA records the latest final-gate results supplied by Lead while still active.
      Evidence: the latest Lead results and QA's post-report lint/format reruns are
      recorded in the latest final-gate report below.
- [x] Lead uses the commit skill only after approvals, evidence, and passing gates,
      then pushes the shared feature branch.
      Evidence: `5494d9c3f120dbf9e27683c26cfd7086db0786eb`,
      `chore(spec-012): align agent models and delegate implementation`, pushed
      successfully to `origin/spec/012-agent-models` after renewed gates passed.
- [x] Maintainer grants explicit merge permission and Lead integrates the
      published branch. No merge without affirmative approval; retain the branch.
      Evidence: explicit affirmative maintainer approval on 2026-10-06; merge
      `65aabd11befbd06b402770964dd7dc102fd7ad9d` pushed successfully to
      `origin/main`. `spec/012-agent-models` remains available locally and remotely.
- [x] Finalize the current plan/checklist/summary before the QA final-gate report
      and the Lead's closure-metadata transition. Do not write the directory
      afterward or pre-record future Git operations as completed.
      Evidence: plan, checklist, and summary now reflect T1–T7 scope, AC1–AC9,
      the approved constitutional amendment, and actual prior Git outcomes. No
      further Lead planning/summary changes are expected before closure.
- [ ] After the final metadata freeze and successful final feature push, Lead asks
      for new explicit merge approval for this continuation. If not approved, leave
      it unmerged and retain the branch. Report actual outcomes externally.

The original publication/integration evidence above records completed operations
only. The continuation requires a new gated final commit/push and affirmative
integration approval; report those later outcomes externally after freezing.

## Autonomous-closure continuation

- [x] Maintainer approves the updated plan and version `1.9.0` amendment under §11
      before implementation. The requested scope is autonomous Lead metadata
      closure, not substantive spec or operational implementation authority.
      Evidence: explicit affirmative approval on 2026-10-06 before T5 assignment.

### T5 — Agent closure boundaries

- [x] T5 complete with independent QA approval and recorded evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Dependencies:** updated plan/amendment approval.
- **Implementer:** Dev.
- **Production ownership:** `.opencode/agents/dev-lead.md`,
  `.opencode/agents/spec-refiner.md`, and `.opencode/agents/qa.md` only.
- **Scope:** implement R6/R9 role instructions and the Lead's effective
  current-spec allowance with template/root-spec denials. Narrow spec authority
  to final `Status`/`Last updated`; preserve operational delegation and unrelated
  roles/models/permissions. Remove the status-only Refiner handoff; require QA
  evidence to finish before freeze and forbid later artifact bookkeeping.
- **Acceptance coverage:** AC6; contributes to AC8/AC9/AC5.
- **QA ownership:** this T5 latest report; evidence-backed AC6 marker in current
  spec; no production or test edits.
- **Models:** Dev and QA configured defaults, no overrides; bounded Markdown and
  independent permission/role verification do not require higher-cost models.
- **Handoff:** Dev formats exactly its three files and reports command/results;
  QA runs applicable lint/format and permission checks without real closure edits.
- **Latest QA report:** approved for T5 on shared branch `spec/012-agent-models` at
  HEAD `545fe78ee378fb7d3473a23a6a043092ba440765`; the assigned changes are
  uncommitted. Verified only the three T5 production files:
  `.opencode/agents/dev-lead.md`, `.opencode/agents/spec-refiner.md`, and
  `.opencode/agents/qa.md`. The feature working set relative to base
  `b135c8ea3034280657aa12132410872a7ce94dd7` has ten paths: those three plus
  `.opencode/agents/dev.md`, `AGENTS.md`, `docs/constitution.md`, and this
  increment's `plan.md`, `spec.md`, `summary.md`, and `tasks.md`. All are Markdown
  outside `src/content/**`; no untracked paths are present. The assigned scope
  contains no tests, and no test files were changed.

  **AC6 evidence:** The Lead description and instructions remove direct
  implementation authority and contain no `R14` reference. Its permissions use
  a default `**` edit denial, followed by planning-family allows for
  `specs/*/plan.md`, `specs/*/tasks.md`, and `specs/*/summary.md`, then an allow
  for `specs/*/spec.md`. Under OpenCode V2 whole-value `*` matching (including
  `/`) and last-matching-rule semantics, the current increment's plan, tasks,
  summary, and spec paths match those allows; no later blanket spec denial
  overrides them. `specs/_template/**` is denied by its later rule and root
  `spec.md` by its explicit later denial. The Lead's assigned prompt further
  limits the current-spec path allowance textually to only `Status` and
  `Last updated` for final closure, after the approved constitutional amendment
  is adopted and the updated definition is loaded. It prohibits substantive
  requirements, criterion wording, checkboxes, other metadata, unrelated or
  completed specs, and indirect write/formatter workarounds, and retains Dev
  implementation with exact ownership plus independent QA. This is a textual
  instruction limit, not field-level permission enforcement.

  For the AC6 denied-path cases, `AGENTS.md`, `docs/constitution.md`, all four
  agent definitions (including the three assigned files), `opencode.json`,
  `src/pages/index.astro`, `tests/permission-probe.test.ts`, and
  `specs/README.md` match the default edit denial; template plan/task/summary
  paths are overridden by the later template denial, template `spec.md` is also
  denied there, and root `spec.md` matches its explicit denial. The repository's
  applicable `opencode.json` contains MCP/provider configuration only and no
  permission override. No forbidden writes or probes were attempted.

  Closure instructions require every task's QA approval/evidence, every
  criterion's QA-backed completion, resolved substantive re-anchoring, finalized
  plan/checklist/summary/latest final-gate evidence, and passing applicable gates
  before closure. Failures leave the increment active; there is no status-only
  Refiner/maintainer handoff. All directory writes precede the final metadata
  edit; no artifact may be updated after `done`, and future Git operations are
  not pre-recorded. Spec Refiner retains substantive ownership; QA's evidence and
  criterion markers are explicitly pre-freeze. New affirmative maintainer merge
  permission is still required after publication and the branch is retained.
  The current constitution remains version `1.8.0` and does not yet authorize
  Lead spec-metadata edits: T5's prompt capability is conditional and was not
  exercised; constitutional adoption is T6. Thus this report verifies T5's
  desired target without representing it as already constitutionally effective.

  Dev reported `pnpm exec prettier --write .opencode/agents/dev-lead.md
.opencode/agents/spec-refiner.md .opencode/agents/qa.md` — PASS, all three
  formatted. QA `pnpm lint` — PASS; `pnpm format:check` — PASS. `git diff --check`
  — PASS. Build, unit tests, rendered-HTML SEO, and accessibility were not run and
  are not applicable under Constitution §§5–6 because the complete observed
  changed-file set is Markdown-only outside `src/content/**`. No T5 defect found;
  AC6 is verified. AC4, AC5, AC8, and AC9 remain pending their assigned later
  verification.

### T6 — Constitutional closure authority

- [x] T6 complete with independent QA approval and recorded evidence.
- **Status:** approved — closed; latest QA evidence below.
- **Dependencies:** T5 approval; recorded amendment approval.
- **Implementer:** Dev.
- **Production ownership:** `docs/constitution.md` and `AGENTS.md` only.
- **Scope:** implement R8 version `1.9.0` and application date, narrowly authorize
  Lead metadata closure, retain substantive Refiner/independent QA/Dev ownership,
  and document pre-freeze finalization/external Git outcomes. Guide must match
  the new authority and preserve all model and Auto Router statements.
- **Acceptance coverage:** AC4/AC8; contributes to AC5/AC9.
- **QA ownership:** this T6 latest report; evidence-backed AC4/AC8 markers in
  current spec; no production or test edits.
- **Models:** Dev and QA configured defaults, no overrides; bounded approved
  amendment and cross-file checks.
- **Handoff:** Dev formats exactly its two files and reports command/results;
  QA runs applicable lint/format and verifies scope and constitutional consistency.
- **Latest QA report:** approved for T6 on shared branch `spec/012-agent-models` at
  HEAD `545fe78ee378fb7d3473a23a6a043092ba440765`; T6 changes are uncommitted.
  Verified the assigned production scope only: `docs/constitution.md` and
  `AGENTS.md`. Their diff from the continuation HEAD contains only the approved
  constitution version/date and §5.1 closure-authority changes plus the matching
  guide update. The complete changed-file set from base
  `b135c8ea3034280657aa12132410872a7ce94dd7` is ten Markdown files, all outside
  `src/content/**`; no untracked paths are present.

  **AC4 evidence:** `AGENTS.md` retains the exact unsuffixed configured defaults
  (`openrouter/openai/gpt-6.1-sol` for Dev Lead/Spec Refiner and
  `openrouter/openai/gpt-6-luna` for Dev/QA), identifies frontmatter as their
  source, states no reasoning variant is explicitly selected, and says the
  `opencode.json` Auto Router variants remain unchanged (lines 61–64). Its
  workflow guidance now limits Lead writing to assigned current planning
  artifacts plus a single final edit of only `Status` and `Last updated` after
  the stated QA, criteria, re-anchoring, artifact, and gate prerequisites; it
  leaves substantive spec content with Spec Refiner and requires QA evidence and
  criterion markers before freeze, with no post-`done` directory edits or
  pre-recorded later Git outcomes (lines 65–78). This agrees with the current
  Lead, Spec Refiner, and QA prompts.

  **AC8 evidence:** `docs/constitution.md` is version `1.9.0` with actual
  application date `2026-10-06`. Section 5.1 conditions the Lead's sole final
  directory edit on adoption of the approved amendment and loaded prompt; limits
  it to `Status` and `Last updated`; requires all task approvals/evidence,
  QA-backed criteria, resolved substantive re-anchoring, finalized artifacts and
  latest gate evidence, and passing applicable gates; leaves the increment active
  if a prerequisite fails; and prohibits any post-transition directory edits or
  pre-recording subsequent Git outcomes. It preserves the ban on Lead
  implementation, indirect writes, and broadening authority by assignment; Dev
  retains exact-path implementation and QA remains independent. The Spec Refiner
  prompt retains substantive authorship and rejects a status-only handoff; the QA
  prompt requires evidence and verified markers before freeze. The plan records
  explicit maintainer approval of the updated plan and §11 amendment on
  2026-10-06 before T5 assignment (plan.md lines 61–68). The constitution diff is
  limited to version `1.9.0`, its amendment date, and the §5.1 amendment; all
  unrelated constitutional rules remain unchanged, including explicit
  affirmative merge approval and branch retention. Dev reported
  `pnpm exec prettier --write docs/constitution.md AGENTS.md` completed; the
  repository-wide format check below also passes.

  `pnpm lint` — PASS. `pnpm format:check` — PASS. Build, unit tests, rendered-HTML
  SEO, and accessibility were not run and are not applicable under Constitution
  §§5–6 because the complete changed-file set is Markdown-only and outside
  `src/content/**`; no test files or pages are in scope. No T6 defects found;
  AC8 is verified and its checkbox is marked. AC4 remains unchecked for the
  complete T7 verification; AC5 and AC9 also remain pending T7. T6 is approved
  with evidence.

### T7 — Complete autonomous-closure verification

- [x] T7 complete with independent QA approval and recorded evidence.
- **Status:** approved — latest closure-state narrative and refreshed final gates independently verified.
- **Dependencies:** T5 and T6 approval/evidence.
- **Owner:** QA, verification-only; no implementation or test writes assigned.
- **Read-only scope:** all six operational files, current spec/plan/task/summary,
  whole increment relative to the original base, and permission rules.
- **Evidence ownership:** this T7 latest report; evidence-backed AC5/AC9 markers
  in current spec. Preserve AC1–AC3/AC7; no criterion text/metadata edits.
- **Scope:** evaluate actual permission order and field limits; walk through
  successful and blocked closures using in-memory text. Include missing QA,
  missing evidence, failing gate, unresolved substantive re-anchoring, exact
  metadata diff, immutable post-close handling, truthful Git reporting, explicit
  merge approval, and branch retention. Do not close real specs or create probes.
- **Model:** QA configured default, no override; independent bounded governance
  verification with no additional dependencies.
- **Gates:** lint/format for the complete Markdown-only scope; build/unit/SEO/
  accessibility explicitly not applicable. Lead still runs final feature gates.
- **Latest QA report:** approved for reopened T7 on shared branch
  `spec/012-agent-models` at HEAD `545fe78ee378fb7d3473a23a6a043092ba440765`.
  Verified scope is the complete increment relative to original base
  `b135c8ea3034280657aa12132410872a7ce94dd7`, plus this T7 report and its assigned
  checklist updates. The ten changed paths from base are
  `.opencode/agents/dev-lead.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`, `.opencode/agents/spec-refiner.md`, `AGENTS.md`,
  `docs/constitution.md`, and `specs/012-agent-models/{plan,spec,summary,tasks}.md`.
  All ten are Markdown outside `src/content/**`; at verification start nine were
  uncommitted relative to HEAD, with `.opencode/agents/dev.md` already in the
  original-base history. No staged or untracked files existed. `opencode.json`,
  application/source/content/assets, and tests are unchanged; no test files are
  assigned or modified. QA made no production or spec edits.

  **Current closure narrative and approved content:** the current spec has status
  `In progress`; its approved R1–R9/AC1–AC9 content reflects the maintainer-approved
  1.9.0 amendment. The narrative correction does not change requirement or
  criterion wording. Constitution 1.9.0 is current; §5.1 and the four prompts
  agree that, once prerequisites pass, only the Lead performs the final `Status`
  and `Last updated` edit. The current spec's context and verification narrative
  accurately state AC1–AC9 as independently QA-verified, T1–T7 approvals, the
  adopted amendment, and the Lead's conditional closure authority. T1–T6 retain
  their recorded approvals; reopened T7 is approved by this report.

  **AC4:** `AGENTS.md` identifies frontmatter as the configured-default source,
  lists exact unsuffixed Sol defaults for Dev Lead/Spec Refiner and Luna defaults
  for Dev/QA, says no reasoning variant is explicitly selected, and says Auto
  Router variants in `opencode.json` remain unchanged. Its closure guidance agrees
  with Constitution §5.1 and the Lead, Spec Refiner, and QA prompts.

  **AC5 / whole-scope inspection:** compared all six operational files against
  the original base and reviewed the complete ten-path increment diff. Changes
  are limited to the specified model, delegation, permission, constitutional,
  guide, and active-increment documentation requirements. Agent modes/colors are
  unchanged; QA and Spec Refiner permission blocks are unchanged; Lead/Dev
  permission changes are limited to their specified rules. No other operational
  or application paths changed, and `opencode.json` is unchanged. Prior QA reports
  for T1–T6 remain approved with evidence.

  **Effective permission matrix (OpenCode V2 last-matching-rule and whole-value
  wildcard semantics):** Lead's default `edit ** deny` is overridden for assigned
  plan/tasks/summary by `specs/*/{plan,tasks,summary}.md` allows and for the active
  spec by `specs/*/spec.md` allow; the later `specs/_template/**` deny blocks
  templates and root `spec.md` matches its explicit deny. These path families
  also match unrelated/completed feature paths and do not enforce fields. The
  Lead prompt therefore limits actual edits to assigned current artifacts and
  permits only final `Status`/`Last updated` in the active spec, barring
  substantive, criterion, checkbox, other metadata, completed-spec, and indirect
  formatter/write changes. Constitution §§3–4.2 preserve historical
  immutability. Operational paths, `opencode.json`, `src/pages/index.astro`,
  `tests/permission-probe.test.ts`, and `specs/README.md` match the default deny.
  Dev's ordered rules allow the six assigned operational files, `opencode.json`,
  `specs/README.md`, and permitted template files; later rules deny tests,
  feature planning/evidence/summaries, every `spec.md`, and root `spec.md`.
  These family matches do not authorize unassigned files. Inspection of the
  repository `opencode.json` found no permission override. No forbidden-write
  probe was attempted.

  **AC9 in-memory closure walkthrough (no status edit/probe):** success requires
  adopted maintainer-approved §11 amendment and loaded updated Lead definition;
  QA approval/evidence for all tasks; QA-backed completion of every criterion;
  resolved substantive re-anchoring; finalized plan/checklist/summary and latest
  final-gate report while active; and passing applicable gates. Only then does the
  Lead make the exact two-field final edit: actual current `Status: In progress`
  → `Status: done` and `Last updated` → the actual closure date. It is not a
  whole-spec rewrite or format operation. Missing task approval, missing evidence,
  an incomplete criterion, a failing gate, or unresolved substantive re-anchoring
  each blocks the edit and leaves the increment active. All evidence and
  checkboxes precede freeze; no directory edits follow `done`. Subsequent
  publication/integration is not pre-recorded: only the Lead commits and pushes
  after approval/evidence/gates, then requests new explicit affirmative maintainer
  merge permission. Without approval it leaves the branch unmerged; after approved
  integration the branch remains retained. Later Git outcomes are reported
  externally. No T7 acceptance-criterion defect found; AC4, AC5, and AC9 are
  verified. The previously identified task-list header contradiction is resolved:
  line 7 now reports all seven tasks QA-approved and closure prerequisites
  verified, consistent with T7's approval and the active-task count of zero. The
  plan and summary also state that implementation and verification are complete
  and that the final metadata transition follows.

  **Latest final-gate evidence:** after the final plan/task/summary status edits,
  the Lead confirmed the complete ten-path increment remains Markdown-only outside
  `src/content/**`, with no staged or untracked paths. The Lead ran
  `pnpm exec prettier --write specs/012-agent-models/plan.md
specs/012-agent-models/tasks.md specs/012-agent-models/summary.md`,
  `pnpm lint` — PASS, `pnpm format:check` — PASS, and `git diff --check` — PASS.
  QA ran `pnpm exec prettier --write specs/012-agent-models/tasks.md` after
  recording this report/checklist, then reran `pnpm lint` — PASS and
  `pnpm format:check` — PASS, verifying the complete increment after QA edits.
  `git diff --check b135c8ea3034280657aa12132410872a7ce94dd7` also passes.
  Build, unit, rendered-HTML SEO, and accessibility are NOT RUN / NOT APPLICABLE
  under Constitution §§5–6 because every changed file is `.md` outside
  `src/content/**`. T7 is approved with evidence; the current spec remains active
  and only the Lead performs the final metadata transition.

## Latest final-gate report

- **Status:** approved — applicable gates pass, T1–T7 have QA approval/evidence,
  AC1–AC9 are QA-backed, and no closure bookkeeping contradiction remains. The
  plan, checklist, summary, and latest final-gate report are finalized while the
  increment remains active. The current spec remains `In progress`, ready for the
  Lead's final two-field metadata transition; no directory freeze has occurred.
- **Scope/revision:** complete increment on `spec/012-agent-models`, original
  base `b135c8ea3034280657aa12132410872a7ce94dd7`, shared HEAD
  `545fe78ee378fb7d3473a23a6a043092ba440765`. The ten paths from base are
  `.opencode/agents/dev-lead.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`, `.opencode/agents/spec-refiner.md`, `AGENTS.md`,
  `docs/constitution.md`, and `specs/012-agent-models/{plan,spec,summary,tasks}.md`.
  Every path is `.md` outside `src/content/**`. At verification start, nine paths
  were uncommitted relative to HEAD; `.opencode/agents/dev.md` is already in the
  original-base history. QA's assigned T7 report/checklist changes are additional
  unstaged edits to the existing `tasks.md` path. The latest inventory has no
  staged or untracked files.
- **Closure prerequisites:** T1–T7 have QA approval and recorded evidence; AC1–AC9
  are QA-backed and checked; substantive ownership re-anchoring is resolved. The
  plan and summary report implementation and verification complete. The current
  checklist and latest final-gate report are finalized while active. Constitution
  `1.9.0` is adopted and the updated Lead prompt is loaded. Only the Lead performs
  the final two-field edit, as the last directory edit.
- **Lead's latest complete-increment results:** after the final plan/task/summary
  edits, Lead confirmed the ten-path scope is Markdown-only and outside
  `src/content/**`, with staged and untracked sets empty. Lead ran
  `pnpm exec prettier --write specs/012-agent-models/plan.md
specs/012-agent-models/tasks.md specs/012-agent-models/summary.md` — PASS;
  `pnpm lint` — PASS; `pnpm format:check` — PASS; and `git diff --check` — PASS.
- **QA's post-report/checklist results:** after recording this T7 report and its
  assigned closure checklist markers, `pnpm exec prettier --write
specs/012-agent-models/tasks.md` — PASS, unchanged. QA's post-edit `pnpm lint`
  — PASS and `pnpm format:check` — PASS; the full repository format check thus
  verifies the latest task evidence. `git diff --check
b135c8ea3034280657aa12132410872a7ce94dd7` — PASS.
- **Build, unit, SEO, accessibility:** NOT RUN / NOT APPLICABLE under Constitution
  §§5–6 because every changed file is `.md` outside `src/content/**`.
- **Git outcomes:** prior feature publication/integration remain recorded only as
  actual earlier events. No continuation feature commit or push has occurred.
  New affirmative maintainer merge permission for the continuation has not been
  requested/granted and no continuation merge has occurred. Report later actual
  outcomes externally without changing the frozen directory.
