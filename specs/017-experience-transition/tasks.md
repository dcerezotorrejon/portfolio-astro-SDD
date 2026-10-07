# Tasks: Experience transition (017)

Two tasks. Task 2 depends on Task 1 (serialized).

## Task 1 — Unit-test coverage for the per-slug transition identity (AC1/AC2) and detail spacing (AC3)

- [x] T1: In `tests/unit/transitions.test.ts`, replace the stale inline-style AC1
      assertions with a source-contract assertion (both `.astro` sources declare
      `transition:name={`experience-transition-${slug}`}`), keep the AC2
      `data-astro-transition-scope` assertion and the AC4 assertions (native MPA +
      reduced motion); keep the AC3 `my-8` assertion in `tests/unit/experience.test.ts`.

  - **Owner**: Dev
  - **Files**: `tests/unit/transitions.test.ts`, `tests/unit/experience.test.ts`
  - **Depends on**: —
  - **Acceptance**: AC1–AC4 have meaningful unit assertions matching the
    re-anchored spec; `pnpm exec vitest run tests/unit/transitions.test.ts
tests/unit/experience.test.ts` passes; Prettier run on the two files with a
    handoff report.
  - **Evidence**: Dev implemented AC1 (source-contract), AC2
    (`data-astro-transition-scope`), AC3 (`my-8`) and kept AC4; `pnpm exec vitest run
tests/unit/transitions.test.ts tests/unit/experience.test.ts` → 10/10 pass. QA
    reviewed sufficiency against AC1–AC4 (see Task 2).

## Task 2 — Verify increment against all gates and acceptance criteria

- [x] T2: Review Task 1's unit tests for sufficiency against AC1–AC4; run the full
      gate set and record evidence; mark verified acceptance checkboxes `[x]`.

  - **Owner**: QA
  - **Files**: gate runs (lint, format:check, build, test:run, test:a11y,
    test:integration); evidence in this `tasks.md`; verified `[ ]`→`[x]` checkboxes
    in `specs/017-experience-transition/spec.md`.
  - **Depends on**: Task 1
  - **Acceptance**: all applicable gates pass; AC1–AC4 backed by evidence and
    checkboxes marked; defects (if any) returned to the same Dev.
  - **Evidence** (QA verification on shared branch `spec/017-experience-transition`,
    revision `0a3be1b`, with the task's uncommitted changes):
    - **Scope verified**: `src/components/home/ExperienceHistory.astro`,
      `src/pages/experiencia/[slug].astro`, `tests/unit/transitions.test.ts`,
      `tests/unit/experience.test.ts`.
    - **Gates** (non-Markdown change; the Markdown-only exception does not apply):
      - `pnpm lint` — PASS.
      - `pnpm format:check` — PASS.
      - `pnpm build` — PASS (3 pages).
      - `pnpm test:run` — **FAIL**: 9 failed / 142 passed. All 9 failures are in
        `tests/unit/agents.test.ts` (7) and
        `tests/unit/integration-governance.test.ts` (2); they read committed
        workflow files and assert the pre-spec-016 state (e.g.
        `tests/unit/integration-governance.test.ts:18-19` expects constitution
        `**Version**: 1.10.0` / `**Last amended**: 2026-10-06`, but the repository
        is v1.11.2 / 2026-10-07 after spec-016;
        `tests/unit/agents.test.ts:392,458,471,550` expect removed workflow
        phrases). They already fail on `origin/main` = `HEAD` (`0a3be1b`) and are
        untouched by this task's changed files.
      - `pnpm test:a11y` — PASS (5/5).
      - `pnpm test:integration` — PASS (5/5, Chromium).
      - Task-scoped unit files `pnpm exec vitest run tests/unit/transitions.test.ts
tests/unit/experience.test.ts` — PASS (10/10).
    - **SEO**: no title/meta/canonical change (only the two `.astro` bodies
      changed; `SiteLayout` and `<head>` metadata untouched). `tests/seo/**` pass
      under `pnpm test:run` (`tests/seo/home.test.ts`,
      `tests/seo/experience.test.ts`).
    - **AC1** — source contract: both `.astro` files declare
      ``transition:name={`experience-transition-${slug}`}`` and contain no inline
      `view-transition-name`; build output pairs the names:
      `index.html` `[data-astro-transition-scope="astro-vkyf7jyr-1"]`
      → `experience-transition-puesto-ejemplo-2024` and `…-2` → `…-2022`;
      details `[data-astro-transition-scope="astro-hcx5hi2j-1"]`
      → `experience-transition-puesto-ejemplo-2024` / `…-2022`.
    - **AC2** — rendered cards carry `data-astro-transition-scope`; compiled CSS
      maps each scope to its per-slug `view-transition-name` (above).
    - **AC3** — rendered detail `<main class="site-container my-8">`.
    - **AC4** — `@view-transition{navigation:auto}` in the compiled CSS; reduced
      motion still disables animation via the global stylesheet
      (`@media (prefers-reduced-motion:reduce){…::view-transition-*{animation:none}}`)
      and Astro's injected reset (`animation:none!important` on the transition
      scope); no `ClientRouter` / `astro:transitions` anywhere in `dist/`.
    - **Blocker (out of task scope, escalated to the Lead)**: the repository-wide
      `pnpm test:run` gate is red because `tests/unit/agents.test.ts` and
      `tests/unit/integration-governance.test.ts` assert stale workflow content.
      §6 requires this gate to pass, so Task 2 approval is withheld until the Lead
      resolves it (new fix task or maintainer guidance); it is not a defect of this
      task's changed files.
    - **Minor (non-blocking)**: AC4's "no client-side transition script /
      `<ClientRouter />`" clause is not asserted directly by the new unit tests; it
      is covered here from build output plus the existing island assertions in
      `tests/unit/home.test.ts:188` and `tests/unit/experience.test.ts:102`.
    - **Result**: AC1–AC4 verified and their checkboxes marked. The repository-wide
      `pnpm test:run` shows 9 pre-existing failures in the governance tests above;
      the maintainer confirmed these are **out of scope for this increment** and are
      being handled in a separate branch. Task 2 is therefore approved for 017's
      scope; the pre-existing failures remain tracked separately.
