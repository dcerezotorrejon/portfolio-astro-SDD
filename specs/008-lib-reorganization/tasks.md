# Tasks — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`

> A task is only marked `[x]` with QA approval and evidence from the applicable
> gates. Dev owns assigned non-test/non-spec implementation files; QA owns test
> changes and the assigned evidence entry in this file.

**Execution state:** The initial Dev assignment was blocked before implementation
and resolved by T1. T1–T5 are QA-approved with evidence recorded. The original
implementation commit `156703f` is pushed. QA's T5 gates passed after R11; the
Lead's final integrated gates after the T5 and summary updates passed on
2026-10-06. No task is currently active.

## Checklist

- [x] **T1 — Align Dev and QA edit permissions.** Update the edit-tool rules in
      `.opencode/agents/dev.md` so Dev can edit assigned repository files except
      `tests/**` and `specs/**`. Update `.opencode/agents/qa.md` so QA can edit
      `tests/**` and assigned `specs/*/tasks.md` evidence only. Preserve all role
      instructions, file-scope rules, and branch/merge/commit/push/subagent
      restrictions. QA updates `tests/unit/agents.test.ts` to verify the effective
      allow/deny policy and unchanged workflow restrictions; QA records T1
      evidence in this task entry. **File ownership:** Dev owns only the two agent
      definitions; QA owns only `tests/unit/agents.test.ts` and this T1 evidence
      entry. **Dependencies:** none; complete and QA-approve this task before
      source implementation.
  - QA evidence (approved): Verified T1 on shared branch `spec/008-lib-reorganization`, HEAD `952637c`; changes were uncommitted during verification. Scope checked: ordered Dev/QA edit rules, representative effective path outcomes, role/file-scope instructions, and preserved shell/subagent restrictions. Dev allows representative source/docs paths and denies `tests/**` and `specs/**`; its instructions still confine edits to assigned scope and prohibit test/spec changes. QA allows test paths and `specs/008-lib-reorganization/tasks.md`, while source, docs, `spec.md`, `plan.md`, and `summary.md` are denied; its instructions confine actual edits to assigned tests and assigned task evidence. Both retain read-only branch inspection only, deny branch switching/creation, merge, commit, push, and subagent launch.
  - Unit: `pnpm test:run tests/unit/agents.test.ts` — PASS, 1 file / 29 tests. During test development, an initial run exposed the stale expected QA path (`specs/007-workflow-changes/tasks.md`), and a later draft used a slash-separated shell-command sample that did not match the test glob model. QA corrected the expected rule and representative samples; the final focused run passed.
  - SEO: No page, metadata, or rendered HTML changes are in T1 scope. `pnpm test:run` — PASS, 21 files / 149 tests, including existing rendered-HTML SEO suites for home and experience (`tests/seo/home.test.ts`, `tests/seo/experience.test.ts`); SEO behavior unchanged.
  - Accessibility: No markup or rendered behavior changes are in T1 scope. `pnpm test:a11y` — PASS, 4 files / 5 tests; no new axe assertion applies to this configuration-only task.
  - Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — PASS (the check initially flagged the in-progress test draft, which QA formatted); `pnpm build` — PASS (3 pages built and sitemap generated); `pnpm test:run` — PASS (21 files / 149 tests); `pnpm test:a11y` — PASS (4 files / 5 tests).
  - Model: Dev `openrouter/openai/gpt-6-luna#medium`; QA `openrouter/openai/gpt-6-luna#medium` — configured defaults; focused permission/config work does not warrant an override.

- [x] **T2 — Relocate FloatingNav and navigation helper.** After T1 QA approval,
      move `src/components/FloatingNav.tsx` to
      `src/components/FloatingNav/FloatingNav.tsx` and `src/lib/navigation.ts` to
      `src/components/FloatingNav/helpers/navigation.ts`. Update the component's
      helper import and the navigator import in `src/pages/index.astro`, preserving
      implementation, exports, behavior, and `client:load`. QA updates imports in
      `tests/unit/floating-nav.test.tsx`,
      `tests/unit/floating-nav-threshold.test.tsx`,
      `tests/a11y/floating-nav.test.ts`, and `tests/unit/navigation.test.ts`,
      preserving assertions, then records evidence here. **File ownership:** Dev
      owns the moved modules and `src/pages/index.astro`; QA owns only the four
      named tests and this T2 evidence entry. **Dependencies:** T1 QA approval.
  - QA evidence (approved): Verified on shared branch `spec/008-lib-reorganization`, HEAD `952637c302908eb16c5e74067d120ef1405b95ad`; Dev's T2 source changes were uncommitted at verification. Confirmed the component and helper are at their destination paths, the old files are absent, the component's default export and named prop/section interfaces remain, and the helper's four exports and signatures remain. The rename diff shows the component body preserved except its relative helper import; the navigation helper is a 100% content-preserving rename. `src/pages/index.astro` imports the new component path and retains `<FloatingNav ... client:load />`. QA changed only the four assigned test imports; behavioral assertions are unchanged. An active source/test import search found no references to the removed module paths; its sole textual old component-path occurrence is the T1 permission test's representative resource string in `tests/unit/agents.test.ts:279`, not an import, and was left untouched.
  - Focused unit/component: `pnpm test:run tests/unit/navigation.test.ts tests/unit/floating-nav.test.tsx tests/unit/floating-nav-threshold.test.tsx` — PASS, 3 files / 30 tests.
  - SEO: This path-only task changes no page metadata or rendered SEO content. `pnpm test:run` — PASS, 21 files / 149 tests, including rendered-HTML SEO suites `tests/seo/home.test.ts` and `tests/seo/experience.test.ts`; SEO behavior unchanged.
  - Accessibility: Component markup and interaction behavior are unchanged; `pnpm test:a11y` — PASS, 4 files / 5 tests, including the FloatingNav axe-core rendered-HTML check. No separate URL/MCP audit applies to this source-path-only refactor.
  - Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — PASS after formatting the in-progress evidence paragraph (the initial check flagged its wrapping); `pnpm build` — PASS (3 pages built and sitemap generated); `pnpm test:run` — PASS (21 files / 149 tests); `pnpm test:a11y` — PASS (4 files / 5 tests).
  - Model: Dev `openrouter/openai/gpt-6-luna#medium`; QA `openrouter/openai/gpt-6-luna#medium` — configured defaults; bounded relocation does not warrant an override.

- [x] **T3 — Relocate content parsers and update consumers.** After T2 QA
      approval, move `src/lib/content.ts` to `src/content/parsers/content.ts` and
      `src/lib/content-schema.ts` to
      `src/content/parsers/content-schema.ts`. Update internal and consumer
      imports in `src/content.config.ts`, `src/components/ExperienceHistory.astro`,
      `src/components/ProfileIntroduction.astro`,
      `src/pages/experiencia/[slug].astro`, and the content import in
      `src/pages/index.astro`. Update the schema path in `README.md`. QA updates
      imports in `tests/unit/content.test.ts`, `tests/unit/company-icon.test.ts`,
      and `tests/unit/experience.test.ts`, preserving assertions, then records
      evidence here. **File ownership:** Dev owns moved modules, listed source
      consumers, and `README.md`; QA owns only the three named tests and this T3
      evidence entry. **Dependencies:** T2 QA approval because both tasks update
      `src/pages/index.astro`.
  - QA evidence (approved after rework): Re-verified on shared branch `spec/008-lib-reorganization`, HEAD `952637c302908eb16c5e74067d120ef1405b95ad`; Dev's T3 changes and QA's assigned test-import updates remain uncommitted. Dev corrected the Prettier formatting in `src/components/ExperienceHistory.astro` and `src/content.config.ts`; the two multiline imports are now formatted correctly. Both relocated modules remain byte-identical to their originals at HEAD, both old `src/lib/` modules are absent, application consumers and the README use the new paths, and no old content-module paths remain in active `src/` or `tests/` references. Historical documentation mentions are descriptions, not imports. QA's changes remain limited to the three assigned test imports; assertions are unchanged.
  - Focused unit: `pnpm test:run tests/unit/content.test.ts tests/unit/company-icon.test.ts tests/unit/experience.test.ts` — PASS, 3 files / 20 tests.
  - SEO: T3 changes module paths and no page metadata or rendered SEO content. `pnpm test:run` — PASS, 21 files / 149 tests, including the existing rendered-HTML SEO suites for home and experience; SEO behavior unchanged.
  - Accessibility: T3 changes no markup or interaction behavior. `pnpm test:a11y` — PASS, 4 files / 5 tests, including the existing rendered-HTML axe-core checks; no separate URL/MCP audit applies to this path-only task.
  - Rework format check: `pnpm exec prettier --check src/components/ExperienceHistory.astro src/content.config.ts` — PASS; imports are formatted correctly.
  - Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — PASS; `pnpm build` — PASS (3 pages built and sitemap generated); `pnpm test:run` — PASS (21 files / 149 tests, including the home and experience rendered-HTML SEO suites); `pnpm test:a11y` — PASS (4 files / 5 tests, including axe-core checks). SEO is unchanged because this is a path-only relocation with no page metadata or rendered-content change. Accessibility markup and interaction behavior are unchanged; no separate URL/MCP audit applies. QA did not edit production files.
  - Model: Dev `openrouter/openai/gpt-6-luna#medium`; QA `openrouter/openai/gpt-6-luna#medium` — configured defaults; bounded relocation does not warrant an override.

- **Lead-owned relationship updates after implementation:** Refresh
  `specs/001-sdd-baseline/summary.md`, `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`, and
  `specs/007-workflow-changes/summary.md` for the constitutional, workflow, and
  module-relocation impacts. Refresh `specs/008-lib-reorganization/summary.md`.
  Do not edit historical spec files or evidence.

- [x] **T4 — Condense constitutional workflow policy and reconcile guidance.**
      Under the approved revised plan, amend
      `docs/constitution.md` §5.1: retain every binding safeguard concisely,
      require the Dev Lead to request maintainer merge after final push, prohibit
      Lead merge/deletion, bump version `1.4.0` to `1.5.0`, and set the actual
      amendment date. Preserve existing operational detail in `AGENTS.md` and the
      four agent prompts where it remains correct; update only inconsistencies
      and add the explicit final merge request to the Lead's prompt and shared
      guidance. QA updated `tests/unit/agents.test.ts` to verify the version,
      policy, role boundaries, and final handoff, then records T4 evidence here.
      **File ownership:** Dev owns only `docs/constitution.md`, `AGENTS.md`, and
      the four explicitly reviewed `.opencode/agents/*.md` files; this task is
      the maintainer-approved, task-specific exception for those operational
      docs. QA owns only `tests/unit/agents.test.ts` and the T4 evidence entry.
      The Lead owns planning and the related summary records. **Dependencies:**
      T1–T3 were already QA-approved; the revised plan was approved before T4.
  - Initial QA evidence (not approved; defects found): Verified T4 on shared branch
    `spec/008-lib-reorganization`, HEAD `156703f47ca4a95609c9789eb43a359c5099c10b`;
    T4 implementation and QA test changes were uncommitted. Scope reviewed:
    Constitution §5.1 against each previous safeguard, version/date, `AGENTS.md`,
    all four workflow-agent prompts, and the final handoff. Version `1.5.0` and
    date `2026-10-06` are correct. The operational guidance retains the role,
    file-scope, branch, and commit/push boundaries; the Lead handoff requests
    maintainer merge into `main` only after final QA, gates, commit, and push, and
    prohibits Lead merge/deletion. `spec-refiner` and `dev` were reviewed and
    correctly left unchanged. The amended §5.1 omits an explicit requirement for
    QA to verify on the shared branch; this was present in the previous policy
    and is required by R9. It also omits the previous explicit prohibition on Dev
    and QA creating branches; its narrower prohibition names only task and
    developer branches. Tests at `tests/unit/agents.test.ts:584` and `:597`
    catch the missing QA-verification and branch-creation rules. T4 remained open
    pending Dev rework at this initial verification.
  - Focused unit: `pnpm test:run tests/unit/agents.test.ts` — FAIL, 1 file / 33
    tests (31 passed, 2 failed). §5.1 lacks explicit QA shared-branch
    verification and a direct Dev/QA branch-creation prohibition; neither
    failure is a test setup issue.
  - SEO: No pages, metadata, or rendered HTML were changed by T4; SEO behavior
    is unchanged. `pnpm test:run tests/seo` — PASS, 2 files / 5 tests (home and
    experience rendered-HTML SEO checks). The full `pnpm test:run` also ran the
    SEO suites, but failed on the §5.1 policy assertions.
  - Accessibility: No markup or rendered behavior changed; no new axe assertion
    applies. `pnpm test:a11y` — PASS, 4 files / 5 tests.
  - Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — PASS after
    formatting the in-progress assigned test file (initial run flagged only that
    draft); `pnpm build` — PASS (3 pages built and sitemap generated);
    `pnpm test:run` — FAIL, 20 files passed and `tests/unit/agents.test.ts`
    failed (21 files total; 151 passed, 2 failed); `pnpm test:a11y` — PASS
    (4 files / 5 tests). The two failing assertions identify the missing
    constitutional safeguards. No task approval is given until Dev rework makes
    the focused and full unit suites pass.
  - Final QA re-verification (approved): Reverified T4 on shared branch
    `spec/008-lib-reorganization`, HEAD
    `156703f47ca4a95609c9789eb43a359c5099c10b`; Dev's constitutional rework and
    QA's test/evidence changes were uncommitted. Both initial defects are fixed:
    §5.1 now expressly requires QA to verify each task on the shared feature
    branch and prohibits Dev/QA from creating branches. Version `1.5.0`, date
    `2026-10-06`, all other concise §5.1 safeguards, four role boundaries, generic
    QA evidence path, and the post-push Lead request/no-merge-or-delete sequence
    were rechecked against R9–R10 and AC9–AC11. Operational guidance is consistent;
    `spec-refiner` and `dev` remain correctly unchanged. QA updated only the
    assigned agent tests and this T4 evidence.
  - Focused unit: `pnpm test:run tests/unit/agents.test.ts` — PASS, 1 file / 33
    tests.
  - SEO: No pages, metadata, or rendered HTML changed; SEO is unchanged and no
    SEO-specific T4 change applies. `pnpm test:run` — PASS, 21 files / 153 tests,
    including the existing rendered-HTML SEO suites.
  - Accessibility: No markup or rendered behavior changed; no new axe assertion
    applies. `pnpm test:a11y` — PASS, 4 files / 5 tests.
  - Final Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — PASS
    (the initial run flagged the in-progress assigned test edits; after
    formatting, the final check passed); `pnpm build` — PASS (3 pages and sitemap
    generated); `pnpm test:run` — PASS (21 files / 153 tests);
    `pnpm test:a11y` — PASS (4 files / 5 tests). No remaining T4 defects.
  - Model: Dev `openrouter/openai/gpt-6-luna#medium`; QA `openrouter/openai/gpt-6-luna#medium` — configured defaults; this bounded documentation/test reconciliation does not warrant an override.

- [x] **T5 — Allow evidence-backed QA acceptance-checkbox updates.** Under the
      approved revised plan, update `.opencode/agents/qa.md` to
      allow edit permission for the assigned current `spec.md` and narrowly
      authorize QA to change only verified acceptance checkboxes from `[ ]` to
      `[x]`, after evidence is recorded in the assigned task entry. The QA prompt
      must prohibit edits to criterion wording, spec status/metadata, all other
      spec content, and unassigned specs. Update `AGENTS.md` to describe this
      narrow authority. Do not change `docs/constitution.md` or
      `.opencode/agents/dev-lead.md`: both were reviewed and remain consistent;
      the Lead must continue to have no spec-edit authority. QA updates
      `tests/unit/agents.test.ts` to verify the effective assigned-spec permission,
      checkbox-only prompt boundaries, retained Dev Lead denial, and unchanged
      branch/commit/push/subagent restrictions. QA verifies and marks only
      evidenced acceptance checkboxes in the assigned current spec, including
      AC6–AC12 as applicable. QA acts before final commit/push; no post-push QA
      task is introduced. **File ownership:** Dev owns only `.opencode/agents/qa.md`
      and `AGENTS.md`; this is the maintainer-approved task-specific exception to the Dev
      prompt's existing `007`-only operational-document allowance and applies
      only to these two named files. QA owns only `tests/unit/agents.test.ts`, its
      T5 evidence entry here, and authorized acceptance-checkbox markers in
      `specs/008-lib-reorganization/spec.md`. QA must not edit any other spec
      content. The Lead owns planning, task orchestration, and summary updates.
      **Dependencies:** T4 QA approval and maintainer approval of the revised
      plan/this named-file exception. **Model:** Dev and QA use their configured
      `openrouter/openai/gpt-6-luna#medium` defaults; this bounded prompt/test task
      does not warrant an override.
  - QA evidence (not approved; one gate defect remains): Verified T5 on shared
    branch `spec/008-lib-reorganization`, HEAD
    `156703f47ca4a95609c9789eb43a359c5099c10b`; the branch has uncommitted
    changes, including T5's QA-agent/guidance and assigned test updates plus
    earlier T4 and Lead-owned spec/planning changes. T5 scope reviewed: ordered
    QA edit permissions, assigned-task prompt boundaries, retained workflow
    restrictions, `AGENTS.md` workflow, and the already-amended Constitution and
    Dev Lead prompt for consistency. The ordered rules deny `specs/**/spec.md`
    before allowing `specs/*/spec.md`; the effective matcher therefore allows
    the assigned current spec as well as any same-depth spec path, while denying
    nested specs, plans, summaries, and production paths. QA's instructions
    explicitly limit actual spec edits to the assigned current spec and to
    evidence-backed `[ ]`→`[x]` checkbox changes only, after evidence is in the
    assigned task entry; criterion wording, status/metadata, other content, and
    unassigned specs remain out of scope. The task-evidence permission is generic
    by path but the prompt limits edits to this assigned task entry. The Lead
    still has an effective deny for the current `spec.md`. Branch inspection is
    read-only; branch creation/switching, merge, commit, push, and subagent launch
    remain denied. `AGENTS.md` and the Dev Lead prompt sequence final QA evidence
    and gates before the Lead's final commit/push, followed by the Lead's merge
    request; no post-push QA task is introduced. Constitution §5.1 remains
    consistent, and the Dev Lead retains its no-spec-edit boundary.
  - Focused unit: `pnpm test:run tests/unit/agents.test.ts` — PASS, 1 file / 33
    tests. The final assertions cover ordered/effective QA permission outcomes,
    the assigned current spec, deny outcomes for plans/summaries/production and
    nested specs, the broader sibling-path match paired with the prompt's
    assignment restriction, checkbox-only/evidence-first boundaries, Lead spec
    denial, and existing branch/Git/subagent restrictions. Two intermediate
    runs during assertion alignment failed (2 failures, then 1); the corrected
    final focused run passes.
  - SEO: No pages, metadata, or rendered HTML changed in T5; SEO behavior is
    unchanged and no new SEO assertion applies. `pnpm test:run` — PASS, 21 files /
    153 tests, including the existing rendered-HTML home and experience SEO
    suites.
  - Accessibility: No markup or rendered behavior changed in T5; no new axe
    assertion applies. `pnpm test:a11y` — PASS, 4 files / 5 tests.
  - Constitution §6 gates: `pnpm lint` — PASS; `pnpm format:check` — FAIL because
    Prettier reports `AGENTS.md` (the updated QA role makes its Markdown table
    require formatting); `pnpm build` — PASS (3 pages and sitemap generated);
    `pnpm test:run` — PASS (21 files / 153 tests, including SEO);
    `pnpm test:a11y` — PASS (4 files / 5 tests). The initial chained run stopped
    at the format failure after lint passed; build, unit, and accessibility gates
    were then run independently and passed. T5 is not approved until the same Dev
    corrects the named-file formatting defect and QA reruns the formatting gate.
  - Acceptance evidence: AC6, AC7, and AC9–AC12 are verified and supported by the
    permission/prompt tests, this scope review, the task ownership records, and
    the workflow/constitutional consistency review above. AC8 is not supported:
    the required format gate currently fails. Only AC6, AC7, and AC9–AC12 are
    marked in the current spec; AC8 and task T5 remain open pending rework.
  - Model: Dev `openrouter/openai/gpt-6-luna#medium`; QA
    `openrouter/openai/gpt-6-luna#medium` — configured defaults.
  - QA re-verification after Dev's formatting rework (not approved): On shared
    branch `spec/008-lib-reorganization`, HEAD
    `156703f47ca4a95609c9789eb43a359c5099c10b` (uncommitted changes), confirmed
    the QA role row in `AGENTS.md` is shortened as reported. The detailed QA
    checkbox-only permission boundaries and QA-before-final-push/no-post-push-QA
    workflow below it remain intact. `pnpm test:run tests/unit/agents.test.ts`
    — PASS, 1 file / 33 tests. `pnpm format:check` — FAIL; Prettier still reports
    `AGENTS.md`. `pnpm exec prettier AGENTS.md | diff -u AGENTS.md -` identifies
    the remaining issue at line 57: Prettier expects the shortened QA row's
    closing table-cell padding to align with the other rows (add the required
    spaces before the final `|`). T5 remains open for the same Dev to correct
    this formatting defect and return it to QA; no spec criterion checkbox was
    changed during this re-verification.
  - Final QA re-verification (approved): On shared branch
    `spec/008-lib-reorganization`, HEAD
    `156703f47ca4a95609c9789eb43a359c5099c10b` (uncommitted changes), confirmed
    Dev's final AGENTS.md rework only adds Prettier-required padding to the QA
    role-table row; the row's meaning and the detailed T5 permission and
    QA-before-push rules are unchanged. QA reruns: `pnpm format:check` — PASS
    (output: “All matched files use Prettier code style!”);
    `pnpm test:run tests/unit/agents.test.ts` — PASS (1 file / 33 tests). The
    previously recorded T5 results remain PASS
    for `pnpm lint`, `pnpm build` (3 pages and sitemap), `pnpm test:run` (21
    files / 153 tests, including rendered-HTML SEO suites), and `pnpm test:a11y`
    (4 files / 5 tests); the formatting-only rework does not alter application
    code, rendered pages, or accessibility behavior. SEO remains unchanged; no
    page/metadata/HTML changes or new SEO assertion apply. No accessibility
    markup or interaction changes or new axe assertion apply. All five
    Constitution §6 gates are now evidenced PASS; no T5 defects remain. AC6,
    AC7, and AC9–AC12 remain evidence-backed; AC8 is supported by the completed
    gate results. After recording this evidence, QA changed only AC8's `[ ]`→`[x]`
    marker; the previously evidenced AC6, AC7, and AC9–AC12 markers remain
    unchanged. T5 is QA-approved. Model: Dev and QA
    `openrouter/openai/gpt-6-luna#medium` (configured defaults).

## Gate summary

- [x] Lint (`pnpm lint`) — PASS on the final integrated tree after T5 and summary
      updates (2026-10-06).
- [x] Format (`pnpm format:check`) — PASS on the final integrated tree after T5
      and summary updates (2026-10-06).
- [x] Build (`pnpm build`) — PASS on the final integrated tree after T5 and
      summary updates; 3 pages and sitemap generated (2026-10-06).
- [x] Unit tests (`pnpm test:run`) — PASS on the final integrated tree after T5
      and summary updates; 21 files / 153 tests, including SEO (2026-10-06).
- [x] Accessibility (`pnpm test:a11y`) — PASS on the final integrated tree after
      T5 and summary updates; 4 files / 5 tests (2026-10-06).
