# Tasks — Workflow Governance Update

- **Spec ID**: `009-workflow-governance`

> A task is only marked `[x]` with evidence from the applicable gates. State
> explicitly when a gate does not apply. Keep only the latest QA report for each
> task entry; replace it after re-verification rather than appending run history.

## Checklist

- [x] T1: Align cross-agent workflow safeguards, role-specific agent prompts,
      current-source precedence, Spec Refiner feasibility checks, and Dev Lead
      governance/configuration authority with R1–R6 and R9–R14. Update and verify
      agent consistency tests.
  - **Dependencies**: None. The maintainer-approved, task-scoped Dev Lead
    authority applies from the start of this task. Use it only for the named
    files below and the exclusions in R14; it does not authorize unrelated edits.
  - **File ownership**:
    - Dev Lead: `docs/constitution.md`, `AGENTS.md`, and
      `.opencode/agents/{spec-refiner,dev-lead,dev,qa}.md`.
    - QA: full ownership of assigned tests in `tests/unit/agents.test.ts`—QA may
      create, modify, or remove tests as needed—and this T1 evidence entry plus
      the evidence-backed acceptance checkboxes AC1–AC5 and AC8–AC12 in
      `specs/009-workflow-governance/spec.md`.
  - **Model**: Dev Lead uses its configured `openrouter/openai/gpt-6-luna#high`
    model for the governance and permission design. QA uses its configured
    `openrouter/openai/gpt-6-luna#medium` model for test updates and verification.
  - **Evidence (latest only)**: QA re-verification and approval on shared branch
    `spec/009-workflow-governance`, revision `cc124ae671a94d8f0155b2200d30dbebedf9bfff`
    plus uncommitted task changes. Scope: T1's `docs/constitution.md`, `AGENTS.md`,
    four `.opencode/agents/*.md` prompts, and QA-owned `tests/unit/agents.test.ts`,
    this evidence entry, and assigned AC1–AC5/AC8–AC12 checkboxes. This replaces
    the prior QA report. Dev Lead handoff formatter evidence: command
    `pnpm exec prettier --write docs/constitution.md AGENTS.md .opencode/agents/spec-refiner.md .opencode/agents/dev-lead.md .opencode/agents/dev.md .opencode/agents/qa.md specs/009-workflow-governance/plan.md`; all listed files reported unchanged after formatting, so PASS. The earlier pre-QA command also included `specs/009-workflow-governance/tasks.md`; QA subsequently edited its assigned evidence entry.
    Dev Lead removed the role/mode/description table from `AGENTS.md` and
    replaced it with a pointer to the corresponding agent prompts. The updated
    assertions at `tests/unit/agents.test.ts:484–504` verify the pointer, absence
    of duplicated agent procedures, shared-policy neutrality, and prompt-owned
    role-specific policy. The test suite also covers ordered effective edit
    permissions, representative governance/configuration paths, static tool
    capability versus task-named authority, merge permissions, QA latest-only
    reporting, Dev formatting, QA Markdown review boundaries, current-source
    precedence, Spec Refiner feasibility, and shared-branch/task-lifecycle
    boundaries. Evidence by criterion: AC1 passes—§5.1 in
    `docs/constitution.md:132–162` is role-neutral and retains the common workflow
    safeguards; the amendment updates version 1.5.0 to 1.6.0 and date to
    2026-10-06. AC2 passes—`.opencode/agents/dev-lead.md:111–118` requires a
    post-push affirmative approval before merge and prohibits deletion; Dev and QA
    prompts prohibit merge/commit/push, with corresponding shell denials tested.
    AC3 passes—`.opencode/agents/qa.md:71–77` requires replacement of prior
    reports, current scope/revision/results, and latest-only final-gate evidence;
    this T1 report contains that current evidence. AC4 passes—the revised
    `AGENTS.md:49–51` identifies the four prompts as the home of role procedures,
    and its role-description table is gone; shared guidance has no stale merge or
    history rule. AC5 passes—`tests/unit/agents.test.ts` verifies the updated
    shared policy, gated merge, QA evidence rule, Dev formatter handoff, QA
    Markdown-review boundary, and retained permission/workflow assertions; all
    137 unit tests pass. AC8 passes—`.opencode/agents/dev.md:86–88,100–101` and
    `.opencode/agents/qa.md:97–100` state the formatter/reporting and Markdown
    review boundaries while retaining content/gate verification. AC9 passes—the
    four prompts hold agent-specific procedures; the constitution §5.1 and
    `AGENTS.md` contain shared rules and point to those prompts, with tests
    asserting the non-duplication. AC10 passes—Constitution §5.1
    (`docs/constitution.md:156–162`) establishes current-source precedence and
    makes earlier specs non-normative. AC11 passes—
    `.opencode/agents/spec-refiner.md:39–48,68–69` requires unambiguous
    interpretation, AC/verification mapping, permissions/ownership feasibility,
    and pausing/escalation when blocked. AC12 passes—ordered static permissions
    and representative governance/configuration paths are tested in
    `tests/unit/agents.test.ts`; `.opencode/agents/dev-lead.md:122–141` limits
    actual edits to task-named files and excludes application implementation,
    tests, content, and feature specs. Static path capability is not treated as
    task authority or as semantic file classification. Current status: APPROVED.

    Latest gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 pages); `pnpm test:run` PASS (21 files, 137 tests);
    `pnpm test:a11y` PASS (4 files, 5 tests). SEO and rendered accessibility
    checks are N/A because T1 changes no page, route, or rendered markup; the
    required repository accessibility gate was run and passed.

- [x] T2: Consolidate the latest available `004-portfolio-home` QA evidence into
      its task report and remove the standalone evidence-history files.
  - **Dependencies**: T1 must pass QA first so the QA prompt and tests establish
    the one-time evidence-maintenance scope.
  - **File ownership**:
    - QA, under the maintainer-approved one-time evidence assignment:
      `specs/004-portfolio-home/tasks.md` and deletion of only
      `specs/004-portfolio-home/evidence*.md`; this T2 evidence entry in this
      file. QA may change no other historical spec, task, summary, criterion, or
      completion status in this assignment.
    - QA does not update `specs/004-portfolio-home/summary.md` in T2. T3 owns that
      relationship update; AC6 is verified only after T3 completes it.
  - **Model**: QA uses its configured `openrouter/openai/gpt-6-luna#medium`
    model; no override planned.
  - **Evidence (latest only)**: QA re-verification and approval on shared branch
    `spec/009-workflow-governance`, revision `cc124ae671a94d8f0155b2200d30dbebedf9bfff`
    plus uncommitted task changes. Scope: this T2 evidence entry and
    `specs/004-portfolio-home/tasks.md`; deletion of only the 20 inventoried
    `specs/004-portfolio-home/evidence*.md` files. The clarified T2 scope in the
    plan is satisfied: all 20 reports were reconciled into task entries, retaining
    latest evidence for T1–T14 and F1/F2, including unit/rendered/SEO/axe tests,
    browser measurements, token/contrast, company-icon fallback, section
    threshold/focus, and transition results. The latest complete 004 integrated
    report is recorded once in its Final gates section: all five gates pass
    (`pnpm lint`, `pnpm format:check`, `pnpm build` with 3 pages + sitemap,
    `pnpm test:run` with 19 files / 118 tests, and `pnpm test:a11y` with 4 files /
    5 tests); integrated browser/axe results are retained. All task-file links to
    deleted reports are removed, and the matching `evidence*.md` inventory is
    zero. The 004 task checklist statuses match HEAD exactly; the historical
    `spec.md` and every criterion/checkmark are byte-identical to HEAD (blob
    `6169a1ad7a1c23958528033d3d7f98a68a018c94`), and `summary.md` is unchanged.
    No 004 task or acceptance status was changed.

    Remaining references in `spec.md`, `browser-evidence.md`, `summary.md`, and
    `specs/005-auto-router-agents/tasks.md` are out-of-scope historical references
    and non-blocking under the Lead's clarification. QA did not edit those files.
    T2 is **APPROVED**. AC6 remains unmarked until T3 updates the 004 summary and
    QA verifies its full criterion.

    SEO and rendered accessibility are N/A because T2 changes no pages, routes,
    or rendered markup; the automated accessibility gate was run. Latest gates:
    `pnpm lint` PASS; `pnpm format:check` PASS; `pnpm build` PASS (3 pages);
    `pnpm test:run` PASS (21 files / 137 tests); `pnpm test:a11y` PASS (4 files /
    5 tests). `git diff --check` PASS. No other production/governance or summary
    files were changed; no commit or push was made.

- [x] T3: Resolve the actual spec relationships in summaries, verify AC6, and run
      final quality gates.
  - **Dependencies**: T1 and T2 must pass QA first. This task owns the `004`
    summary update, avoiding overlap with T2's evidence-only file scope.
  - **File ownership**:
    - Dev Lead: create `specs/009-workflow-governance/summary.md`; update
      relationship records and dates in
      `specs/{001-sdd-baseline,003-agent-workflow,004-portfolio-home,007-workflow-changes,008-lib-reorganization}/summary.md`.
      In `specs/004-portfolio-home/summary.md` only, also replace the verification
      references to deleted standalone reports with the consolidated evidence
      location in its `tasks.md`, update the `Files changed` description to
      reflect consolidation, and update the `Models` note to point to the current
      evidence in `tasks.md`. Do not otherwise rewrite earlier summaries.
    - QA: verify the summaries against the actual changes; this T3 evidence
      entry and the evidence-backed AC6 and AC7 checkboxes in
      `specs/009-workflow-governance/spec.md` after verification.
  - **Model**: Dev Lead uses its configured `openrouter/openai/gpt-6-luna#high`
    model for relationship resolution. QA uses its configured
    `openrouter/openai/gpt-6-luna#medium` model for verification and final gates.
  - **Evidence (latest only)**: QA re-verification and approval on shared branch
    `spec/009-workflow-governance`, revision `cc124ae671a94d8f0155b2200d30dbebedf9bfff`
    plus uncommitted changes. Scope: T3 relationship records in the new
    `specs/009-workflow-governance/summary.md` and summaries 001, 003, 004, 007,
    and 008; AC6 evidence consolidation/deleted-file check; this T3 evidence entry;
    and AC6/AC7 only. Lead formatter handoff: command
    `pnpm exec prettier --write specs/001-sdd-baseline/summary.md specs/003-agent-workflow/summary.md specs/004-portfolio-home/summary.md specs/007-workflow-changes/summary.md specs/008-lib-reorganization/summary.md specs/009-workflow-governance/summary.md specs/009-workflow-governance/plan.md specs/009-workflow-governance/tasks.md`; all listed files were unchanged after formatting. QA subsequently updated only this T3 evidence entry.

    Relationship review under Constitution §4.2 passes: the current summary
    records all five anticipated affected/modified features and their actual
    impacts—001 (constitutional amendment), 003 (agent/shared-workflow rules),
    004 (evidence consolidation without product/task/spec changes), 007 (further
    workflow/permission/merge changes), and 008 (merge policy and Dev Lead
    authority). Each affected summary has a current `Last updated` date and a
    specific `009-workflow-governance` relationship entry. The new 009 summary
    records date, changed files, behavior, and the same resolved relationships.
    Summary wording matches the actual constitution, prompts, 004 task evidence
    consolidation, and QA test changes. No earlier `spec.md` changed. AC6 passes:
    20 matching 004 evidence files are deleted, 004 `tasks.md` has no links to
    deleted reports and retains consolidated latest task evidence plus the
    latest complete final-gate report; its `summary.md` now points to `tasks.md`
    and updates Files changed/Models notes. The 004 spec remains byte-identical
    to HEAD (blob `6169a1ad7a1c23958528033d3d7f98a68a018c94`), its criteria and
    checkmarks are unchanged, and its task statuses match HEAD. External
    references in protected/out-of-scope historical files remain untouched and
    are non-blocking under the clarified T2 scope. AC6 is verified only with this
    T3 summary relationship update; AC6 and AC7 are now marked below.

    Latest gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 pages + sitemap); `pnpm test:run` PASS (21 files / 137
    tests); `pnpm test:a11y` PASS (4 files / 5 tests). SEO and rendered
    accessibility are N/A because T3 changes no route or markup; automated a11y
    was run and passed. Current report records only this verification; no summary,
    production, or test files were edited by QA. No commit or push was made.

- [x] T4: Revoke the temporary QA permission for the deleted 004 standalone
      evidence paths, remove the one-time exception from the QA prompt, and
      update consistency tests to verify the resulting permission boundary.
  - **Dependencies**: T2 is approved; the temporary evidence-maintenance work is
    complete and its historical report remains recorded in T2.
  - **File ownership**:
    - Dev Lead: `.opencode/agents/qa.md`, `specs/009-workflow-governance/plan.md`,
      and this T4 definition.
    - QA: full ownership of the assigned checks in `tests/unit/agents.test.ts`
      and this T4 evidence entry plus the five gate-summary checkboxes in this
      file. No current `spec.md` acceptance checkbox is assigned to T4.
  - **Model**: Dev Lead uses `openrouter/openai/gpt-6-luna#high` for the prompt
    permission change; QA uses `openrouter/openai/gpt-6-luna#medium` for tests
    and verification.
  - **Evidence (latest only)**: QA verification and approval on shared branch
    `spec/009-workflow-governance`, revision `cc124ae671a94d8f0155b2200d30dbebedf9bfff`
    plus uncommitted changes. Scope: assigned assertions in
    `tests/unit/agents.test.ts`, this T4 evidence entry, and the five gate-summary
    checkboxes only. The current QA prompt has no `specs/004-portfolio-home/evidence*.md`
    edit rule or one-time evidence-exception text. Effective ordered permissions
    deny edits to `specs/004-portfolio-home/evidence-t1.md` and
    `evidence-f2.md`, while allowing `specs/004-portfolio-home/tasks.md`, the
    assigned `tests/unit/agents.test.ts`, and the current spec checkbox path
    `specs/009-workflow-governance/spec.md`. The tests also assert QA prompt text
    no longer mentions the exception, while retaining assigned-test/task/current-
    spec boundaries, no-production/no-git-write restrictions, latest-only reports,
    and Markdown-format-only review. Focused result: `pnpm exec vitest run
tests/unit/agents.test.ts` PASS (1 file / 17 tests).

    Latest gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 pages + sitemap); `pnpm test:run` PASS (21 files / 137
    tests); `pnpm test:a11y` PASS (4 files / 5 tests). SEO and rendered
    accessibility are N/A because T4 changes no routes or markup; the required
    automated accessibility gate was run and passed. Current T4 status: APPROVED.

- [x] T5: Implement the Markdown-only QA gate exception, align the constitutional
      and agent guidance, update the approved constitutional version/date test
      expectations, resolve affected summary relationships, and verify the full
      increment.
  - **Dependencies**: T1–T4 are complete and QA-approved. This follow-up scope is
    maintainer-approved; the existing published `spec/009-workflow-governance`
    branch is the shared branch. The constitution amendment version `1.6.1` is
    approved; use the actual amendment date when editing the Constitution and its
    corresponding test expectation.
  - **File ownership**:
    - Dev Lead: `docs/constitution.md`, `AGENTS.md`,
      `.opencode/agents/qa.md`, `.opencode/agents/dev-lead.md`,
      `specs/009-workflow-governance/plan.md`, the T5 definition in
      `specs/009-workflow-governance/tasks.md`,
      `specs/009-workflow-governance/summary.md`, and
      `specs/{001-sdd-baseline,003-agent-workflow,007-workflow-changes,008-lib-reorganization}/summary.md`.
      Update only the affected summaries' relationship records and dates; do not
      rewrite any earlier `spec.md`. `specs/004-portfolio-home` is not newly
      affected by this follow-up and is not in scope.
    - QA: only the constitutional-version and amendment-date expectations in
      `tests/unit/agents.test.ts`; the T5 evidence entry in
      `specs/009-workflow-governance/tasks.md`; and the evidence-backed AC13–AC16
      checkboxes in `specs/009-workflow-governance/spec.md`. Do not change any
      other test assertion or add tests.
  - **Model**: Dev Lead uses its configured
    `openrouter/openai/gpt-6-luna#high` model for the governance and relationship
    updates. QA uses its configured `openrouter/openai/gpt-6-luna#medium` model
    for the two test-literal updates and verification.
  - **QA gates**: This change set includes `tests/unit/agents.test.ts`, so it is
    ineligible for the Markdown-only exception. QA must run `pnpm lint`,
    `pnpm format:check`, `pnpm build`, `pnpm test:run`, and `pnpm test:a11y` and
    record each result. SEO and rendered accessibility are N/A because no page,
    route, or markup changes; the automated accessibility gate still runs.
  - **Final gates**: After T5 QA approval, the Dev Lead reruns all five commands
    on the complete feature increment. QA records the Lead's latest final-gate
    results here, replacing the prior final-gate report. The `.ts` change means
    the feature increment is not eligible for the Markdown-only exception.
  - **Evidence (latest only)**: QA re-verification and approval on the shared
    branch `spec/009-workflow-governance`, revision
    `a24033484fdde177763a04c93b323442cb90aa97` plus uncommitted task changes.
    Scope: T5's Constitution, `AGENTS.md`, QA and Dev Lead prompts, current plan
    and summary, relationship records in summaries 001/003/007/008, QA-owned test
    expectation in `tests/unit/agents.test.ts`, this T5 evidence entry, and AC13–
    AC16. Constitution version `1.6.1` and amendment date `2026-10-06` match the
    approved increment and actual date under §11. The exact test diff changes only
    the version expectation from `1.6.0` to `1.6.1`; the existing date expectation
    `2026-10-06` is correct and unchanged. No other test assertion or test file
    changed. The full unit suite passes, including every existing prompt-fragment
    assertion.

    Eligibility review passes: an assigned-task set consisting only of `.md`
    files outside `src/content/**` requires only lint and format, with build, unit,
    SEO, and accessibility recorded as not run under the exception. Any non-
    Markdown file or any `src/content/**` file requires all five gates. The final
    closure rule uses the complete feature increment against its base revision,
    including committed, staged, unstaged, and untracked changes. T5 includes
    `tests/unit/agents.test.ts`, so its complete changed-file set is ineligible
    and all five task gates were run. SEO and rendered accessibility are N/A
    because no page, route, or markup changed; the automated accessibility gate
    still ran.

    Constitution §§5–6 state the role-neutral task and final-closure exceptions.
    `.opencode/agents/qa.md` applies task-level classification, retains content
    verification and Markdown-formatting-only review, and records Lead-supplied
    final-gate results rather than owning their execution. The corrected
    `.opencode/agents/dev-lead.md` classifies the complete feature increment and
    retains the exact tested phrase “Only when all pass, use the repository's
    commit skill.” `AGENTS.md` points to constitutional applicability without
    unconditional gate claims or duplicated role procedures. The updated current
    summary and affected summaries 001/003/007/008 accurately record the gate-policy
    relationship; no earlier `spec.md` changed. Dev Lead Prettier handoff for the
    corrected prompt (`pnpm exec prettier --write .opencode/agents/dev-lead.md`)
    passed with the file unchanged; handoff `git diff --check` passed.

    Latest task gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 pages + sitemap); `pnpm test:run` PASS (21 files / 137
    tests); `pnpm test:a11y` PASS (4 files / 5 tests). T5 is **APPROVED**.

    Latest final feature gates, supplied by the Dev Lead: branch
    `spec/009-workflow-governance`, revision
    `a24033484fdde177763a04c93b323442cb90aa97` plus the complete uncommitted T5
    increment. The complete feature change set includes
    `tests/unit/agents.test.ts`, so all five gates apply. `pnpm lint` PASS
    (`eslint .`); `pnpm format:check` PASS (all matched files); `pnpm build` PASS
    (3 pages and sitemap); `pnpm test:run` PASS (21 files / 137 tests);
    `pnpm test:a11y` PASS (4 files / 5 tests). SEO and rendered accessibility
    are N/A because no pages, routes, or markup changed; automated a11y ran and
    passed. `git diff --check` PASS. Latest final-gate status: **PASS**. No
    commit or push was made.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)

SEO and rendered accessibility are not applicable to this workflow/documentation
change because it changes no page, route, or rendered markup. The repository's
automated accessibility gate remains part of the required verification. The
checked gate summary reflects the latest Dev Lead final-gate report recorded in
the T5 evidence above.
