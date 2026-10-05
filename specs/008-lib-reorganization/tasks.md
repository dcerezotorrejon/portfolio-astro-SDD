# Tasks — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`

> A task is only marked `[x]` with QA approval and evidence from the applicable
> gates. Dev owns assigned non-test/non-spec implementation files; QA owns test
> changes and the assigned evidence entry in this file.

**Execution state:** The initial Dev assignment was blocked before implementation
and resolved by T1. T1, T2, and T3 are QA-approved with evidence recorded, and the
final integrated quality gates passed on 2026-10-06. No task remains active.

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
  `specs/004-portfolio-home/summary.md` for relocated 004 modules and
  `specs/007-workflow-changes/summary.md` for the agent permission update; create
  `specs/008-lib-reorganization/summary.md`. Do not edit historical spec files
  or evidence.

## Gate summary

- [x] Lint (`pnpm lint`) — PASS on the final integrated tree (2026-10-06).
- [x] Format (`pnpm format:check`) — PASS on the final integrated tree
      (2026-10-06). The first Lead run flagged formatting in the updated
      `004-portfolio-home/summary.md`; it was formatted and the full check passed.
- [x] Build (`pnpm build`) — PASS (3 pages and sitemap generated; 2026-10-06).
- [x] Unit tests (`pnpm test:run`) — PASS (21 files / 149 tests; 2026-10-06),
      including existing SEO tests.
- [x] Accessibility (`pnpm test:a11y`) — PASS (4 files / 5 tests; 2026-10-06).
