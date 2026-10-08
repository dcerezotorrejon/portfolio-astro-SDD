# Tasks — Agent reasoning variants and permission integrity

- **Spec ID**: `023-agent-reasoning-variants`
- **Branch**: `spec/023-agent-reasoning-variants`

## T1 — Agent workflow Markdown alignment

- **Owner**: Dev Lead (direct; workflow Markdown).
- **Files**: `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, `.opencode/agents/qa.md`, `AGENTS.md`.
- **Covers**: R1, R2, R3, R5, R7, R8, R9.
- **Independent**: yes; no shared files with T2.

## T2 — Structural agent test update and guard

- **Owner**: Dev.
- **Files**: `tests/unit/agents.test.ts`.
- **Covers**: R6.
- **Depends on**: none (target state fixed by the spec); verify against T1 after
  it lands.
- **Independent**: yes; no shared files with T1.

## T3 — Independent verification

- **Owner**: QA.
- **Verifies**: T1, T2, and T4.
- **Evidence**: latest QA report in this `tasks.md`; verified acceptance
  checkbox markers in `spec.md`; `opencode debug agents` output; applicable
  Constitution §§5–6 gates.
- **Depends on**: T1, T2, and T4 complete.

## T4 — Reconcile stale transition-duration unit tests

- **Owner**: Dev.
- **Files**: `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`.
- **Covers**: R10.
- **Depends on**: none (scope widened by the R10 re-anchor).
- **Independent**: yes; no shared files with T1/T2.

## Status

- [x] T1 — Agent workflow Markdown alignment.
- [x] T2 — Structural agent test update and guard.
- [ ] T3 — Independent verification, evidence, and criterion markers.
- [x] T4 — Reconcile stale transition-duration unit tests.

### T1 evidence (Dev Lead)

- Files: `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, `.opencode/agents/qa.md`, `AGENTS.md`.
- `opencode debug agents` (resolved config): `spec-refiner` and `dev-lead` →
  `opencode-go/deepseek-v4.1-flash#high`; `dev` and `qa` → no variant; every
  agent `request.body` empty with custom rules applied (`dev-lead` restored to
  its full 14-rule restricted set).
- Effective-permission evaluation of the new rules passed for all AC5/AC6/AC7
  cases (template denies; `dev` allow/deny boundaries; aliased/compound git
  shell denies; `git branch --show-current` allow).

### QA evidence

- **Task/scope**: T1 (workflow Markdown), T2 (`tests/unit/agents.test.ts`), and
  T4 (`tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`) for
  the `023-agent-reasoning-variants` increment, plus the T3 criterion markers.
  Verified on the shared branch `spec/023-agent-reasoning-variants` at
  `8bb0ecb1865caa3fc5d60bb5422d2347f3a75ea7` (= `main`), with the task changes
  uncommitted.
- **Final gates (Dev Lead, complete frozen tree incl. `summary.md`)**: all pass.
  `pnpm lint` pass; `pnpm format:check` pass
  ("All matched files use Prettier code style!"); `pnpm build` pass (3 pages);
  `pnpm test:run` pass (25 files, 157 tests);
  `pnpm test:a11y` pass (4 files, 5 tests).
  `pnpm test:integration` and the SEO checks are **not applicable**: the changed
  set is agent configuration, workflow/planning Markdown, and unit tests only;
  no page rendering, routing, content, styles, client behavior, browser-complex
  components, or integration-suite/tooling change.
- **`opencode debug agents`**: `spec-refiner` `opencode-go/deepseek-v4.1-flash#high`
  (9 rules), `dev-lead` `...flash#high` (19 rules, full restricted set applied
  at top level), `dev` `...flash` (25 rules), `qa` `...flash` (20 rules);
  `request.body` is `{}` for all four, and `dev-lead`'s `request` is
  `{settings:{},headers:{},body:{}}`.
- **AC1–AC7 re-confirmation**: `tests/unit/agents.test.ts` passes 19/19; the
  model/`#high` expectations, invalid-key guard, template denies, `dev`
  rule-pair/boundary checks, and aliased/compound git shell denies all hold,
  and `opencode debug agents` confirms the resolved variants and top-level
  permission lists. Joint target run of `agents`/`design-assets`/`transitions`
  passes 39/39.
- **AC8 / T4 sufficiency**: `tests/unit/design-assets.test.ts` no longer lists
  `--transition-duration-control` among the required keys and no longer asserts
  the removed `@theme` entry, while still asserting the semantic
  `--control-transition-duration` resolves to `200ms` and that the `@theme`
  block does not re-declare the raw `--duration-control`.
  `tests/unit/transitions.test.ts` drops the removed `::view-transition-*`
  `animation-duration` pin and instead asserts no such override exists, keeps
  `--duration-control` = `200ms`, and keeps the reduced-motion reset for all
  four pseudo-elements (`animation: none`, no competing custom duration). The
  removed token/rule no longer appears in any assertion or in
  `src/styles/global.css`. No weakening found; no defects.
- **Approval**: T1, T2, and T4 approved; AC1–AC8 verified and marked. Final
  gates approved.

## Decision log

- **D1 — `format:check` on `spec.md`**: resolved. `plan.md` (Dev Lead) and
  `spec.md` (maintainer) are Prettier-clean; `pnpm format:check` passes.
- **D2 — `test:run` pre-existing failures**: resolved by widening the increment.
  The maintainer confirmed the custom transition duration removal (`8bb0ecb`)
  was intentional. Spec Refiner re-anchored `spec.md` with R10 and AC8, and T4
  reconciles the two stale test files (`design-assets`, `transitions`).
