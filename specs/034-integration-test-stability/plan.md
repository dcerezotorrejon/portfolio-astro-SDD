# Plan — Integration Test Stability

- **Spec ID**: `034-integration-test-stability`
- **Last updated**: 2026-11-05
- **Plan status**: confirmed by the maintainer at the reduced scope.

## Approach

Work runs on the shared branch `spec/034-integration-test-stability`, published at `7ce4774`.
The increment keeps the test fixes for incidents 1 and 2 and adds the trace upload for CI
failures. It changes no site code and leaves Astro at 7.3.5.

Incidents 2 (production rejection) and 3 are not fixed and are deferred to a later spec. The
diagnosis of incident 3 was stopped before reporting, so none of its partial output is evidence.
Incident 4 stays unreproduced with unknown cause (R6). This increment does not claim that the
integration gate is stable.

## Files to change

| File                                                  | Owner | Purpose                                      |
| ----------------------------------------------------- | ----- | -------------------------------------------- |
| `tests/integration/projects-carousel.spec.ts`         | QA    | Carried edit (R1)                            |
| `tests/integration/projects-return.spec.ts`           | QA    | Carried edit and QA's added line (R2)        |
| `.github/workflows/deploy.yml`                        | Dev   | R14 upload step and the `id`                 |
| `tests/unit/deployment-workflow.test.ts`              | Dev   | Admits the new action, asserts the step      |
| `plan.md`, `tasks.md`, `summary.md` in this directory | Lead  | Planning artifacts; QA records task evidence |

## Key decisions

- **Reduced scope.** D1-D5 in `spec.md` replace all earlier scope decisions. D5 records the
  accepted residual risk.
- **R14 upload step.** One `id` key on the existing integration step, and one following step with
  `if: failure() && steps.integration-tests.outcome == 'failure'`. `failure()` alone would also
  fire after an earlier failure such as lint. It uses `actions/upload-artifact@v7` and the artifact
  name `playwright-output`, distinct from the Pages artifact.
- **Permission hook left failing open, by the maintainer's choice.** `.claude/settings.json` runs
  the hook as `node ...`, and `node` is not on the agents' `PATH`, so per-agent edit rules are not
  enforced. The environment and the hook stay unchanged. The Lead checks each task's changed files
  by hash against its ownership and records the result on the task.
- **Main checkout on the spec branch, no worktree, confirmed by the maintainer.** Run against the
  hook's `decide` function, a worktree inside the project misapplies the role rules, and a sibling
  worktree gets no decision. The closure step that removes extra worktrees has nothing to remove.

## Risks

- **Residual risk accepted in D5.** The no-movement test can still fail occasionally and block a
  deployment, and the console error stays in production.
- **The required full run may fail.** A failure is reported to the maintainer, is not retried or
  filtered, and leaves the increment active (R16).
- **Local and CI differ.** Local Node is 26.13.0 and CI uses 22, so a local pass does not prove a
  CI pass.
- **Shared integration resources.** Every Playwright run needs port 4321 and shares `dist/`, so
  browser runs are serialized.

## Testing strategy

- **Unit / component tests:** `tests/unit/deployment-workflow.test.ts`; QA reviews sufficiency.
- **SEO checks:** no site code or metadata changes; existing tests stay in force unchanged.
- **Accessibility checks:** `pnpm test:a11y` and the integration axe audits, unchanged.
- **Design criteria:** no visual change. The "Interaction and motion" criteria of
  [`docs/design.md`](../../docs/design.md) stay in force (R9).
- **Integration tests:** one full `pnpm test:integration` on the final tree (R16), with no repeat
  runs, `--repeat-each`, or CPU contention.
- **AC17:** a temporary failing test, not committed, shows that a failed local run produces both
  `playwright-report/` and a trace. PyYAML parses `deploy.yml`.
- **Limits:** the CI upload is not verifiable before closure, as the spec records.
