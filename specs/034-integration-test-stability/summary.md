# Summary — Integration Test Stability

- **Spec ID**: `034-integration-test-stability`
- **Last updated**: 2026-11-05

## Files changed

- `tests/integration/projects-carousel.spec.ts` — the carousel activation test has a 90 s budget.
- `tests/integration/projects-return.spec.ts` — navigations wait for the running view transition
  to end, based on `data-astro-transition`.
- `.github/workflows/deploy.yml` — `id` on the integration step, and a new step that uploads the
  Playwright report and traces when that step fails.
- `tests/unit/deployment-workflow.test.ts` — admits the new action and asserts the new step.
- `specs/034-integration-test-stability/` — spec, plan, tasks, and this summary.

No site code changed, and Astro stays at 7.3.5.

## Functions / components changed

- `transitionDone` (`projects-return.spec.ts`) — new helper, called from `onDetailPage`,
  `openFullCard`, `returnBy`, the experience history step, and the back step in the "AC42" test's
  loop.
- `parseBlock` (`deployment-workflow.test.ts`) — the test's YAML reader now supports `|` block
  scalars.
- `Integration tests` and `Upload Playwright output` (`deploy.yml`) — the changed and the new
  workflow steps.

## Notes

This increment does not claim that the integration gate is stable.

- **Incident 1 (carousel budget):** addressed by the 90 s budget.
- **Incident 2 (skipped view transition):** the test race is addressed. **The production uncaught
  rejection is not fixed** and is deferred to a later spec. Reported from a limited probe: Astro
  7.4.3 added a catch upstream, and on 7.4.5 the quick back went from 20 page errors in 20 runs to
  0 in 20, in Chromium. The full suite has not run on 7.4.5.
- **Incident 3 (no-movement test):** **not diagnosed and not fixed**; deferred to a later spec. The
  test's sampler and assertions are unchanged. That the jump is scroll rather than layout is an
  unverified hypothesis. Its root cause, whether it predates the carried edits, and whether a frame
  is painted at the wrong scroll all remain unknown.
- **Incident 4 (axe `runRules` error):** unreproduced, with unknown cause. It is not fixed. The
  upload only makes a CI recurrence diagnosable.

**Accepted residual risk.** The no-movement test can still fail occasionally and block a
deployment, and the console error stays in production. At least one of the three full local runs
with the carried edits had an incident 3 or incident 4 failure.

The upload step has not run in CI. It is first exercised by a real CI failure.
