# Tasks — Integration Test Stability

- **Spec ID**: `034-integration-test-stability`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

Only T6 and T10 remain open. The diagnosis of incident 3 was cancelled when the maintainer reduced
the scope; nothing from it is evidence. Incident 4 stays unreproduced with unknown cause unless
evidence establishes one (R6).

## Execution rules

- Every command needs `PATH="$HOME/.local/share/pnpm/bin:$PATH"`. Full runs go in the background.
- Browser runs are serialized, because each needs port 4321 and shares `dist/`.
- No task commits, pushes, or creates a branch.
- The permission hook fails open (`plan.md`), so the Lead checks each task's changed files by hash
  against its ownership and records the result on the task.

## Checklist

- [x] T1: QA reviews the carried test edits (R1, R2, R3, R7; supports AC1, AC2, AC3, AC7).
  - Owner: QA. Files: `tests/integration/projects-carousel.spec.ts`,
    `tests/integration/projects-return.spec.ts`.
  - Model: `qa` default (`sonnet`).
  - Evidence (QA, latest report): shared branch `spec/034-integration-test-stability`, base
    `7ce4774`, Astro 7.3.5, uncommitted working tree. Scope: the two carried edits plus one
    QA line (below) in `tests/integration/projects-carousel.spec.ts` and
    `tests/integration/projects-return.spec.ts`; no production files touched.
    - R1: reviewed. `test.setTimeout(90_000)` added at the start of the carousel activation
      test (AC7/AC10); the diff against `7ce4774` is that line plus a comment, with no
      assertion removed or relaxed.
    - R2: reviewed against every navigation in `projects-return.spec.ts`. `transitionDone`
      waits for `html` to lose `data-astro-transition`. Verified from `router.js` (7.3.5) that
      the attribute is set at line 316 before `startViewTransition`, and `pushState` happens
      inside `updateDOM`, so a check made after the URL change or after the new page is
      visible cannot pass vacuously before the transition starts. It can fail: the web-first
      `expect` throws after the 5 s expect timeout if the attribute persists. Present in
      `onDetailPage`, `openFullCard`, `returnBy` and the experience history step (AC2's four).
      Same-page hash navigations (for example the navigator link at the end of AC42) take the
      `moveToLocation` path with no transition, so need no wait. Full-document `goto`,
      `reload`, and `goBack` under aborted fetches are not router transitions.
      One gap found and closed: in AC42 ("a full-document traversal restores ...") the loop's
      `page.goBack()` is followed by an arrow click and then `page.goForward()` without any
      wait for that back transition to end. QA added one line, `await transitionDone(page);`,
      after the `settled(page)` that follows that `goBack`
      (`projects-return.spec.ts`, about line 636). It is the existing helper, one line, and
      no other change was made. Lead to confirm it is acceptable.
    - R3: no masking found. No filtering of problems or `pageerror`, no skipped, deleted or
      `fixme` tests, no raised tolerance, no discarded frames, no retries, and no budget change
      beyond R1. `playwright.config.ts` is unmodified.
    - R5: the no-movement test sampler and assertions were not changed.
    - R7/AC7: both edits are present in the working tree and reviewed. They are uncommitted,
      so AC7 stays open until the final tree.
    - Commands (all after the QA line was added; `HEAD` `7ce4774`, Astro 7.3.5):
      `pnpm lint` passed; `pnpm format:check` passed; `pnpm build` passed (8 pages);
      `pnpm test:run` passed (41 files, 436 tests); `pnpm test:a11y` passed (5 files, 9 tests);
      `pnpm test:integration` one full run, 224 passed, 0 failed, 14.0 min.
    - The carousel activation test passed at all five viewports in that run (320x568 20.4 s,
      767x1024 29.2 s, 768x1024 22.1 s, 1280x800 28.0 s, 1920x1080 28.1 s); the "AC37 ...
      restored through back" test passed at all five viewports. This is one run, not an R8 run,
      so AC1, AC2 and AC8 stay open. The 767x1024 time is again close to the old 30 s default,
      which the 90 s budget covers. Incidents 3 and 4 did not recur in this run, which says
      nothing about their cause; incident 4 remains unreproduced with unknown cause.
    - Result: approved, no defects. Checkbox for T1 and all acceptance criteria left for the
      Lead.
    - Lead: QA's added line accepted as R2 coverage. Ownership check by file hash: only the two
      test files and this entry changed, all within QA's ownership.
- [x] T6: Dev adds the R14 upload step and the integration step's `id`; QA verifies AC16 and AC17.
  - Owner: Dev, then QA. Files: `.github/workflows/deploy.yml`,
    `tests/unit/deployment-workflow.test.ts`.
  - Model: `dev` and `qa` defaults (`sonnet`).
  - Evidence: QA, shared branch `spec/034-integration-test-stability`, base HEAD `7ce4774` plus uncommitted tree; scope: `.github/workflows/deploy.yml` and `tests/unit/deployment-workflow.test.ts`. Approved.
    - AC16: `git diff 7ce4774 -- .github/workflows/deploy.yml` shows one `id: integration-tests` added to the integration step (the only change to an existing step) and one new step right after it, "Upload Playwright output", `if: failure() && steps.integration-tests.outcome == 'failure'`, `actions/upload-artifact@v7`, name `playwright-output` (distinct from the Pages artifact), paths `playwright-report/` and `test-results/`. No other step, order, or condition changed; no retry added.
    - `pnpm format:check`: pass. `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('ok')"`: ok; parsed step order is Integration tests (id integration-tests), Upload Playwright output, Configure Pages, Upload Pages artifact, Deploy to GitHub Pages.
    - `pnpm test:run`: pass, 41 files, 437 tests. The ordered action list admits exactly `actions/upload-artifact@v7` between setup-node and configure-pages; a new test asserts the id, position right after the integration step, name, condition, both paths, and the artifact name differing from the Pages one. The reader's `|` block-scalar branch is sufficient to yield the two-line path.
    - Temporary failing test `tests/integration/tmp-t6-fail.spec.ts` (visit `/`, then failing assertion), run alone with `pnpm exec playwright test`: 1 failed as intended; `playwright-report/index.html` and `test-results/tmp-t6-fail-tmp-fail-chromium/trace.zip` exist. Test removed; `git status --short` shows under `tests/integration/` only the two modified carried files (the cancelled `tmp-r4-base-return.spec.ts` was byte-identical to the base `projects-return.spec.ts` and was removed).
    - Not shown: AC16 and AC17 do not show the upload working in CI; they show the step is correctly written and the local output paths exist.
    - Deferred to T10 (not skipped): `pnpm test:integration`, `pnpm test:a11y`, `pnpm build`.
    - Lead: ownership check by file hash: Dev changed only `deploy.yml` and the unit test; QA changed
      only this entry and the AC16 and AC17 markers, and removed its temporary files.
- [x] T10: Lead writes `summary.md` (R15, AC20) and confirms AC6; one full `pnpm test:integration`
      with the §6 gates on the final tree (R16, AC1, AC2, AC3, AC7, AC9). If everything passes, the
      Lead makes the closure transition, the final commit, and the push. Merging to `main` waits
      for explicit maintainer approval. If the full run fails, the increment stays active and the
      failure goes to the maintainer, with no retry or filter.
  - Owner: Lead, QA.
  - Depends on: T6.
  - `summary.md` authorship: the Lead drafted it, but the Lead's write tool refused the file as a
    report file. The maintainer authorized one exception, and the coordinating session wrote the
    draft unchanged.
  - Evidence: QA, shared branch `spec/034-integration-test-stability`, HEAD `7ce4774` plus uncommitted final tree. Approved, no defects. Results are Lead-supplied (`final-gates/results.txt`, `test-integration.log`); QA ran no suites in T10.
    - Gates on the final tree, all rc=0: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`. `pnpm test:integration` complete run: 224 passed, 0 failed, 14.0 min, rc=0.
    - An earlier `pnpm test:integration` attempt was killed by SIGTERM (rc=143) at 00:35:09 with 170 passed and no failure, when the cancelled T2 agent's cleanup killed Playwright processes by name. It finished no result and is not counted. The complete run above is the only completed run on the final tree. One passing run does not show the gate is stable.
    - AC1: `git diff 7ce4774` of `projects-carousel.spec.ts` is only `test.setTimeout(90_000)` plus a comment, no assertion removed or relaxed; the activation test passed at 320x568 (20.5 s), 767x1024 (29.1 s), 768x1024 (22.0 s), 1280x800 (28.0 s) and 1920x1080 (28.0 s).
    - AC2: `transitionDone` is called in `onDetailPage`, `openFullCard`, `returnBy`, the experience history step, and the back step of the AC42 loop; the "AC37 ... restored through back" test passed at all five viewports in the log.
    - AC3: the diff of `tests/integration` and `playwright.config.ts` against `7ce4774` covers only the two carried files, adds the wait helper and its calls and the timeout; `playwright.config.ts` is unchanged and the no-movement test's sampler and assertions are untouched.
    - AC6 and AC20: `plan.md` (line 15), `tasks.md` (lines 9, 64) and `summary.md` describe incident 4 as unreproduced with unknown cause; `summary.md` records incidents 2 and 3 as not fixed and deferred, states the accepted residual risk, and says it does not claim the gate is stable.
    - AC7: the carried edits are in the final tree and the T1 review is recorded in this file.
    - AC9: the gates above pass, including `test:a11y` and the one complete `test:integration` run; `git diff 7ce4774 --stat -- src` is empty.

## Gate summary

Applicable: all gates, because the increment changes the integration suite and the CI workflow. SEO
stays covered by existing tests, unchanged.

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`), one run
