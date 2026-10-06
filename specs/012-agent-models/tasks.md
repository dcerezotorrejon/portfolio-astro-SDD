# Tasks

- **Spec ID**: `012-agent-models`
- **Last updated**: 2026-10-06
- **Shared branch**: `spec/012-agent-models`
- **Base revision**: `b135c8ea3034280657aa12132410872a7ce94dd7`
- **Execution status**: feature integrated; Spec Refiner metadata closure pending
- **Active tasks**: 0

## Coordination prerequisites

- [x] Maintainer confirms the current `plan.md` before implementation.
      Evidence: explicit affirmative confirmation on 2026-10-06, before T1.
- [x] Request Spec Refiner re-anchoring of bootstrap ownership to the maintainer's
      one-time Lead assignment; final role boundaries remain unchanged. Resolve
      the mismatch before closure; the Lead never edits `spec.md`.
      Evidence: Spec Refiner updated the current spec on 2026-10-06 to reflect
      Lead T1/T2 and transferred Dev T3/T4; requirements and AC1–AC8 are preserved.

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

- [x] All four tasks have QA approval and recorded evidence; active tasks are 0.
      Evidence: latest T1–T4 QA reports above, all approved.
- [x] Spec Refiner has resolved bootstrap ownership divergence and the current
      active-state metadata without changing completed directories.
      Evidence: the re-anchored spec has status `in progress` and records actual
      implementation ownership with all QA-backed criteria unchanged.
- [x] Lead creates the current `summary.md` with date and actual changed files.
      Evidence: `specs/012-agent-models/summary.md`, dated 2026-10-06.
- [x] Lead determines the complete feature changed-file set from the base revision
      and runs every applicable final gate.
      Evidence: renewed lint and format PASS after re-anchoring, complete ten-file
      Markdown-only scope reviewed; latest final report below.
- [x] QA records the latest final-gate results supplied by Lead below.
      Evidence: QA replaced the final report with renewed results and verified
      unchanged requirements/criteria hashes and actual implementation ownership.
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
- [ ] Spec Refiner performs the final `done` metadata transition when authorized
      closure is complete. The Lead cannot edit this field; status `in progress`
      means the directory remains active until that transition.

## Latest final-gate report

- **Status:** latest supplied final gates PASS after recording integration.
  Maintainer-approved integration is complete; the remaining coordination records
  are approved for gated commit/push on the shared feature branch. No unresolved
  ownership blocker remains.
- **Scope/revision:** complete increment on `spec/012-agent-models`, base
  `b135c8ea3034280657aa12132410872a7ce94dd7`, current shared HEAD
  `1d8dc1b5bc028c3dc54a0c74596fe2053776e139`. The full feature diff from the base
  contains `.opencode/agents/dev-lead.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`, `.opencode/agents/spec-refiner.md`, `AGENTS.md`,
  `docs/constitution.md`, and `specs/012-agent-models/plan.md`, `spec.md`,
  `summary.md`, and `tasks.md` (ten Markdown files, all outside
  `src/content/**`). The current unstaged diff is limited to `plan.md`, `tasks.md`,
  and `summary.md`; no staged or untracked paths remain.
- **Publication/integration:** feature commit
  `5494d9c3f120dbf9e27683c26cfd7086db0786eb` was pushed to
  `origin/spec/012-agent-models`. With the maintainer's explicit approval on
  2026-10-06, the Lead merged the feature into `main` as
  `65aabd11befbd06b402770964dd7dc102fd7ad9d` and successfully pushed
  `origin/main`. The published feature branch is retained.
- **Lead scope commands:** `git diff --name-only
b135c8ea3034280657aa12132410872a7ce94dd7` — ten paths listed above;
  `git diff --name-only` — current three planning/evidence/summary files;
  `git ls-files --others --exclude-standard` — no untracked files.
- **Ownership re-anchor confirmation:** current spec verification text assigns
  T1/T2 to the explicitly authorized Lead bootstrap and T3/T4 to Dev after the
  approved transfer, matching the task evidence and closed-task records. The
  re-anchor preserves all eight QA-backed acceptance markers. Independently
  recalculated SHA256 over the exact Requirements section (after
  `## Requirements` and before `## Acceptance criteria`) is
  `19c2de4ba2f1880fed047873106b06d8805f8a9194a47482f917e69842d65f56`; over the
  Acceptance criteria section (before `## Verification`) it is
  `e5c4144e2b4753047302c95cb9afbad9d043fcb8def54a69bfbf8c271704f3c4`. Both
  still match the pre-reanchor hashes. Spec status remains `in progress`.
- **Prettier:** Lead's `pnpm exec prettier --check
specs/012-agent-models/plan.md specs/012-agent-models/tasks.md
specs/012-agent-models/summary.md` — PASS.
- **Lint:** `pnpm lint` — PASS (exit 0).
- **Format:** `pnpm format:check` — PASS (exit 0).
- **Diff check:** `git diff --check` — PASS.
- **Build, unit, SEO, accessibility:** NOT RUN and not applicable under
  Constitution §§5–6 because the complete changed-file set consists only of
  Markdown files outside `src/content/**`.
- **Publication/closure:** final-gate results supplied by the Lead and the
  ownership/hash recheck are recorded. Final integration is complete under the
  same maintainer approval; the remaining coordination records are ready for
  gated commit/push on the shared feature branch. The spec remains `in progress`,
  and only the Spec Refiner may perform its eventual `done` transition.
