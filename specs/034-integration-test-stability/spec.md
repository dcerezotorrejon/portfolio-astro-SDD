# Integration Test Stability

- **Spec ID**: `034-integration-test-stability`
- **Status**: done
- **Last updated**: 2026-11-05

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

> **Agreed, with reduced scope.** The maintainer's decisions are recorded below. The
> template has no status value for an agreed spec, so `Status` stays `draft` until a
> later transition is made by its authorized owner. This increment does not claim that
> the integration gate is stable.

## Context

`pnpm test:integration` runs as a step of `.github/workflows/deploy.yml`, before
the deploy steps, so a failure blocks deployment. The suite has 224 Playwright
tests, takes about 15 minutes on 2 workers, and `playwright.config.ts` sets no
`retries`, so a single intermittent failure fails the gate. The base revision is
`main` at `7ce4774`, on Astro 7.3.5 with `ClientRouter`. Astro stays at that version in
this increment, and Astro file and line references below are to it.

Four incidents were recorded. Quoted test titles contain `AC` labels that belong
to those existing tests; they are not this spec's criteria.

### Incident 1: carousel activation test exceeds its budget

`tests/integration/projects-carousel.spec.ts:163`, "AC7/AC10: ten activations
each way...", hit the 30 s test timeout at 767x1024 in CI.

- **Verified**: measured locally at 20.2-29.4 s across viewports, with no failing
  assertion. The test barely fits the budget.

### Incident 2: skipped view transition on a quick back navigation

`tests/integration/projects-return.spec.ts:252`, "AC37 ... restored through
back", failed at 1280x800 and 1920x1080 in CI with
`pageerror: Transition was skipped. skipTransition() called`. All position
assertions had passed; only the problems array failed.

- **Verified**: a script that clicks a card and goes back as soon as the URL
  changes reproduced the page error 10/10 at 1280x800, against 0/10 when it
  waited for the transition to finish.
- **Verified**: `abortAndRecreateMostRecentTransition` in
  `node_modules/astro/dist/transitions/router.js` calls `skipTransition()` on the
  running transition, and the router attaches no handler to `ready`. In the
  script, attaching a handler to `ready` removed the page error, and the promise
  was seen rejected 10/10.
- **Verified**: this is both a test race and a real uncaught rejection that a
  visitor can trigger in production by going back quickly. The observed functional
  impact is none: the position was restored correctly and only a console error
  appeared.
- **Reported in `plan.md`, not independently checked by the Spec Refiner**: Astro 7.4.3
  fixed this upstream by adding `ready.catch(() => {})` immediately before its own
  `skipTransition()`.
- **Reported in `plan.md`, limited evidence**: with Astro 7.4.5, one probe in Chromium went
  from 20 page errors in 20 runs to 0 in 20, on the quick back only. The full suite has
  not run on 7.4.5.

### Incident 3: no-movement test fails intermittently on a full-document traversal

`tests/integration/projects-return.spec.ts:293`, "AC39: no card, heading, arrow
or height moves on any entry", failed in the second local full run: at 768x1024
(no-preference), `full-document stop 2 ... h2[1]`, received 1508 against a limit
of 1, and at 1920x1080 (reduce), received 1420. It passed in CI and in the first
local full run.

- **Verified**: the reported failure is the `h2` top in the `full-document`
  scenario. The sampler's `rect()` uses `getBoundingClientRect`, which is
  viewport-relative, although its comment says "Page positions, as AC39 states
  them".
- **Verified limit of that evidence**: `expectStable` stops at the first failed
  assertion and checks `h2` before the arrows, so the arrows' values in the
  failing frame were never asserted. The failure does not establish that only the
  `h2` is displaced.
- **Unverified hypothesis**: on a full-document traversal, the first sampled
  frames occur before scroll is restored, so the jump is scroll rather than layout.
  If so, a visitor may see a real flash at the top of the page before the jump,
  which would be a product defect and not only a test issue.
- **No result established**: the diagnosis was stopped before reporting. The root cause,
  whether the failure predates the carried edits, and whether a frame is actually painted
  at the wrong scroll all remain unknown.

### Incident 4: axe-core reference error, unreproduced

`tests/integration/project-detail.spec.ts:85`, "767px: no horizontal scroll and
axe-clean", failed once locally with
`page.evaluate: ReferenceError: runRules is not defined`, from inside axe-core
4.13.0's injected source.

- **Verified**: `function runRules` is declared in the same closure at
  `node_modules/axe-core/axe.js:30012` and referenced at line 30593.
- **Verified**: not reproduced in 80 further runs, 75 of them on two CPU-contended
  cores.
- **Unknown**: the cause.
- **Verified from configuration**: at the base revision, `playwright.config.ts` sets
  `trace: "retain-on-failure"`, but `deploy.yml` has no step that uploads the
  report or traces, so a CI recurrence would leave only the log.

### Carried test edits

The working tree holds these uncommitted test edits:

- `tests/integration/projects-return.spec.ts` adds a `transitionDone(page)` helper
  that waits until `html` has no `data-astro-transition`. It is called in
  `onDetailPage`, `openFullCard`, the end of `returnBy`, and before the experience
  `goBack`. QA added one more call to the back step in the loop of the "AC42" test.
- `tests/integration/projects-carousel.spec.ts` adds `test.setTimeout(90_000)` to
  the carousel activation test.

With the two original edits, the original 3 CI failures did not recur in two full local
runs, but those runs produced incidents 3 and 4. `tasks.md` reports one further full run
with QA's line included: 224 passed, 0 failed. That run says nothing about the cause of
incidents 3 or 4.

## Goals

- Remove the test causes of incidents 1 and 2 without weakening what the tests detect.
- Make a CI recurrence of an integration failure diagnosable.
- Record plainly what is not fixed, and keep verified facts, unverified hypotheses, and
  unknowns distinct in every artifact of this increment.

## Non-goals

- Fixing the production rejection of incident 2, including any Astro upgrade.
- Diagnosing or fixing incident 3, or changing the no-movement test.
- Claiming that the integration gate is stable, or running a stability bar.
- Playwright retries of any kind, general or targeted.
- Creating the later spec that the deferred work belongs to.
- Claiming incident 4 fixed without an established cause.

## Maintainer decisions

Relayed by the coordinating session. The reduced scope was chosen on 2026-11-05 because the
planned verification would take too long, and it replaces all earlier scope decisions.

- **D1 (scope)**: Keep the test fixes and the trace upload. Time estimate given: 30-40
  minutes.
- **D2 (incident 2 deferred)**: The production rejection is not fixed here. It is deferred
  to a separate later spec, which this increment does not create.
- **D3 (incident 3 deferred)**: The no-movement test's intermittent `h2` jump is not
  diagnosed or fixed here. It is a known issue, deferred to a separate later spec. Its cause
  is still an unverified hypothesis.
- **D4 (incident 4)**: Record it as unreproduced with unknown cause, and upload the
  Playwright report and traces from `deploy.yml` on failure.
- **D5 (accepted residual risk)**: The no-movement test can still fail occasionally and block
  a deployment, and the console error stays in production. At least one of the three full
  local runs with the carried edits had an incident 3 or incident 4 failure.

## Requirements

Identifiers are stable; R4, R4a, R4b, R5, R8, and R10-R13 are not used.

- R1: The carousel activation test MUST have an explicit budget of 90 s, about
  three times its slowest measured run, and MUST keep all its existing assertions.
- R2: In `projects-return.spec.ts`, a test MUST wait for the running view transition to end
  before starting another navigation. The wait MUST be based on the router's
  `data-astro-transition` attribute, not on the URL.
- R3: The carried edits MUST NOT make the gate pass by masking: no filtering of the
  skipped-transition error or any other error from the problem tracking, no skipped,
  deleted, or `fixme` tests, no raised movement tolerance, no discarded leading frames, no
  Playwright retries of any kind, and no budget change beyond R1. The no-movement test's
  sampler and assertions MUST stay unchanged.
- R6: Every artifact of this increment MUST describe incident 4 as unreproduced with
  unknown cause unless evidence establishes a cause.
- R7: The carried test edits, including QA's added line, MUST reach the shared branch
  intact in the final commit, with QA's review recorded.
- R9: This increment changes no site code. Carousel position restoration, return links,
  view transitions, reduced-motion behavior, and accessibility MUST NOT regress.
- R14: `deploy.yml` MUST upload `playwright-report/` and `test-results/`, the output
  paths set in `playwright.config.ts`, when the integration test step fails. The existing
  integration step MUST gain an `id`, and the upload condition MUST read that step's
  outcome, so the upload does not run after an earlier failure such as lint. The upload
  MUST use an artifact name distinct from the Pages artifact, and MUST NOT change the
  outcome of the job: a failed integration step still blocks the deploy steps.
  `tests/unit/deployment-workflow.test.ts:264` pins the exact ordered list of actions, so
  it MUST be updated to admit exactly the new upload action, with the rest of the list and
  its order unchanged. The new `id` does not affect that test, which finds steps by `run`.
- R15: `summary.md` MUST record incidents 2 and 3 as not fixed and deferred, state the D5
  residual risk, and not claim that the gate is stable.
- R16: One full `pnpm test:integration` run on the final tree is required under
  Constitution §6. A failure in it, including the no-movement test, MUST be reported to the
  maintainer and MUST NOT be retried or filtered. Under Constitution §5.1 the increment
  stays active until the maintainer decides how to proceed.

## Acceptance criteria

Identifiers are stable; AC4, AC5, AC8, AC10-AC15, AC18, and AC19 are not used.

- [x] AC1: The carousel activation test sets a 90 s budget, a diff against the base
      revision shows no removed or relaxed assertion, and it passes at every viewport
      it runs at in the R16 run.
- [x] AC2: In `projects-return.spec.ts`, `onDetailPage`, `openFullCard`, `returnBy`,
      the experience history step, and the back step in the "AC42" test's loop wait for
      `data-astro-transition` to be absent before the next navigation, and the
      "AC37 ... restored through back" test passes with an empty problems array at all five
      viewports in the R16 run.
- [x] AC3: A diff against the base revision of the integration tests and
      `playwright.config.ts` shows none of the changes that R3 prohibits.
- [x] AC6: `plan.md`, `tasks.md`, and `summary.md` do not claim a cause or fix for
      incident 4 beyond the evidence, and they describe it as unreproduced with unknown
      cause unless evidence establishes one.
- [x] AC7: The final tree contains the carried edits, and QA's evidence records its review.
- [x] AC9: All applicable Constitution §6 gates pass on the final tree, including
      `pnpm test:a11y` and the one `pnpm test:integration` run that R16 requires, and no site
      code changed.
- [x] AC16: Review of the `deploy.yml` diff shows one added step after the integration
      test step that uploads both `playwright-report/` and `test-results/`, runs only
      when the integration step's outcome is failure, and uses an artifact name other than
      the Pages artifact's. The only change to an existing step is one added `id` key on
      the integration step. No other step, order, or condition is changed and no retry is
      added.
- [x] AC17: `pnpm format:check` passes with the changed `deploy.yml`, and the file parses
      as YAML using a tool already available, with the command recorded.
      `pnpm test:run` passes with the list at `tests/unit/deployment-workflow.test.ts:264`
      admitting exactly the new action, and that file also asserts the new step's condition
      and paths. A temporary failing test, not committed, shows that a failed local
      Playwright run produces both `playwright-report/` and a trace under `test-results/`.
- [x] AC20: `summary.md` contains the record that R15 requires.

## Verification

Applicable gates: lint, format, build, unit tests, accessibility, and integration, since
this increment changes the integration suite and the CI workflow. No site code or page
metadata changes, so existing SEO tests stay in force unchanged.

Ownership under Constitution §5.1:

- QA owns `tests/integration/**` and the evidence in `tasks.md`.
- Dev owns the `deploy.yml` change (R14) and `tests/unit/deployment-workflow.test.ts`.
- The Dev Lead owns `plan.md`, `tasks.md`, and `summary.md`.

How each criterion is verified:

- AC1, AC2: the R16 run, plus diff review.
- AC3: diff review against `7ce4774`.
- AC6, AC20: artifact review (`.md` only).
- AC7: branch inspection and QA evidence.
- AC9: the Constitution §6 commands.
- AC16: review of the workflow diff.
- AC17: the recorded local commands and the temporary failing test.

### Limits of what can be verified before closure

`deploy.yml` runs only on pushes to `main`, and final commit and integration happen after
this directory is frozen. So:

- A CI run of the deploy workflow is not an acceptance criterion. Its outcome after final
  integration is reported externally by the Dev Lead, not recorded in this directory.
- AC16 and AC17 show that the step is correctly written and that the paths it names exist
  after a local failure. They do not show that the upload works in CI.
- A passing CI run skips the upload step, so it does not prove the upload either. The
  upload is first exercised by a real CI failure. No failure is to be provoked on `main`
  to test it.
- One passing run does not show that the gate is stable, and a local pass does not prove a
  CI pass.
