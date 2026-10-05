# Tasks — Workflow changes

- **Spec ID**: `007-workflow-changes`

> All work stays on `spec/007-workflow-changes`; no task/developer branches or
> task-level commits/pushes. Up to four independent tasks may be active at once.
> QA approval and evidence are required before a task closes. The final commit and
> push use the commit skill after all gates pass. Historical `spec.md` files stay
> unchanged.

## Checklist

- [x] **T1 — Agent workflow and tests** (Dev → QA; shared spec branch)
  - Dev updates the four `.opencode/agents/*.md` prompts/configuration for one
    shared branch, no task branches or interim commits/pushes, the four-active-task
    ceiling, conflict/technical approval rules, write boundaries, QA/rework, and
    pinned model intent.
  - QA updates `tests/unit/agents.test.ts` for the new behavior and retained Auto
    Router configuration. QA records the task's evidence here on the same branch.
  - **Evidence:** QA verified on `spec/007-workflow-changes` at shared-branch
    revision `963edc9`, with the four assigned agent files and other feature work
    present as uncommitted changes. The Dev's T1 changes in
    `.opencode/agents/{spec-refiner,dev-lead,dev,qa}.md` satisfy the assigned
    shared-branch, role-scope, QA/rework, concurrency, escalation/approval, and
    final-commit requirements. Models and `Model intent` sections match the
    pinned GPT-6 Luna references; `opencode.json` remains unchanged. Updated
    `tests/unit/agents.test.ts` checks exact models/intents, ordered permissions
    and role scopes, prompt workflow semantics, and retained Auto Router variants.
    `pnpm exec vitest run tests/unit/agents.test.ts`: passed (28 tests).
    `pnpm lint`: passed. `pnpm format:check`: passed. `pnpm build`: passed
    (3 pages; sitemap generated). `pnpm test:run`: passed (21 files, 148 tests).
    `pnpm test:a11y`: passed (4 files, 5 tests). SEO: not applicable; T1 changes
    no rendered page, route, metadata, canonical, or sitemap inputs. Accessibility:
    no markup changes; the required a11y gate passed.
  - **Depends on:** None.
- [x] **T2 — Binding workflow documentation** (Dev → QA; shared spec branch)
  - Dev updates `docs/constitution.md`, `AGENTS.md`, and `specs/README.md`. The
    constitution amendment must include one shared spec branch, the concurrency
    cap and task lifecycle, QA/rework, conflicts/technical approvals, end-only
    commit/push, and immutable historical specs; increment version to `1.4.0`
    and set the amendment date to `2026-10-05`.
  - QA reviews consistency with the agent instructions/spec and records evidence
    here on the same branch.
  - **Evidence:** QA verified on `spec/007-workflow-changes` at shared-branch
    revision `963edc9`, with the T2 documentation and feature changes present as
    uncommitted changes. Reviewed the constitutional amendment (`1.4.0`, dated
    `2026-10-05`) and confirmed its shared feature branch, four-task lifecycle,
    QA/rework, conflict and technical-decision escalation, final commit-skill
    gating, and historical `spec.md` immutability rules are consistent with
    `AGENTS.md`, `specs/README.md`, the current spec, and the four agent prompts.
    Added T2 documentation-consistency assertions to
    `tests/unit/agents.test.ts`; targeted test passed (29 tests). A disposable
    repository with a bare remote simulated publication and use of one shared
    `spec/007-workflow-changes` branch, QA failure/rework/pass on that branch,
    four active independent tasks with a fifth refused, serialization of
    overlapping scopes and unfinished dependencies, and no `dev/...` branch or
    task commit/push. The simulation withheld its sandbox final commit/push until
    every task had QA approval/evidence and all gates passed; afterward the
    sandbox commit/push succeeded on the shared spec branch, which remained
    unmerged. Simulation output: `/tmp/opencode/t2-workflow-sim-1791230491/result.txt`.
    `git diff --check`: passed. `pnpm lint`: passed. `pnpm format:check`: passed.
    `pnpm build`: passed (3 pages; sitemap generated). `pnpm test:run`: passed
    (21 files, 149 tests). `pnpm test:a11y`: passed (4 files, 5 tests). SEO: not
    applicable; T2 changes guidance only and does not affect pages, routes,
    metadata, canonical URLs, or sitemap inputs. Accessibility: no rendered
    markup changed; the required a11y gate passed. The only changed `spec.md` is
    the current feature's `specs/007-workflow-changes/spec.md`; no historical
    `spec.md` was changed. The pre-existing
    `dev/007-workflow-changes/T1` branch remains untouched and was not deleted.
  - **Depends on:** T1's scoped Dev documentation permission must be established
    before Dev edits the three assigned guidance files. Once that permission is
    available, T1 and T2 implementation may overlap because their file scopes are
    disjoint. Run QA serially where tests or task evidence would overlap.
- [x] **T3 — Relationship summaries and integrated verification** (Dev Lead
      ownership; QA verifies on the shared spec branch)
  - Update this feature's `summary.md` and only the applicable `Related specs`
    sections in summaries 001–006. Do not modify earlier `spec.md` files.
  - Reimplement/revalidate relevant T1 work on the shared branch, inspect the
    final diff and verify the old `dev/007-workflow-changes/T1` branch can be
    deleted without losing required changes. Run all constitutional gates.
  - Only after T1–T3 QA evidence and every gate pass, use the commit skill for the
    final feature commit(s) and push to `origin`; delete the obsolete Dev branch
    only after the verified replacement is safely present on the spec branch.
  - **Evidence:** QA verified on `spec/007-workflow-changes` at shared-branch
    revision `963edc9`; all feature work remains uncommitted. Reviewed this
    feature's `summary.md` and the `Related specs` sections in summaries 001–006.
    The six affected summaries identify the constitution/workflow/model
    relationships consistently with this spec; the feature summary records the
    changed agent/docs/test/spec files, test helpers, and all six relationships.
    `git diff --name-only -- 'specs/**/spec.md'` reports only the current
    `specs/007-workflow-changes/spec.md`; no earlier historical `spec.md` changed.
    Revalidated T1 with `pnpm exec vitest run tests/unit/agents.test.ts` (1 file,
    29 tests passed). Legacy-branch review: `dev/007-workflow-changes/T1` has
    three branch-only commits; its net file list against the shared-branch HEAD is
    the four agent prompts, `tests/unit/agents.test.ts`, and this feature's
    `tasks.md`. The current shared worktree contains the reimplemented agent and
    test changes plus the approved T1 evidence. Therefore the legacy branch can
    be safely cleaned up only after the Lead commits and successfully publishes
    the verified shared-branch replacement, then confirms those paths on the
    published branch. QA did not delete or otherwise modify the legacy branch.
    `git diff --check`: passed. `pnpm lint`: passed. `pnpm format:check`: passed.
    `pnpm build`: passed (3 pages; sitemap generated). `pnpm test:run`: passed
    (21 files, 149 tests). `pnpm test:a11y`: passed (4 files, 5 tests). SEO: not
    applicable; this workflow/documentation change adds or alters no page, route,
    metadata, canonical URL, or sitemap input. Accessibility: no rendered markup
    changed; the required a11y gate passed. No feature commit or push was made.
    The Lead reran final gates after summary updates: lint, format, build (3 pages;
    sitemap generated), unit tests (21 files, 149 tests), accessibility (4 files,
    5 tests), and `git diff --check` all passed. SEO remains not applicable and no
    rendered markup changed. After QA approval, the Lead used the commit skill to
    create `3fac60b feat(spec-007): adopt shared-branch workflow` and pushed it to
    `origin/spec/007-workflow-changes`. Verified the published branch contains the
    approved agent, test, guidance, summary, and planning changes. Deleted the
    superseded local and remote `dev/007-workflow-changes/T1` branch without
    merging it; retained `spec/007-workflow-changes` and did not merge it to base.
  - **Depends on:** T1 and T2.

## Gate summary

- [x] Lint (`pnpm lint`) — passed on the final shared-branch working tree.
- [x] Format (`pnpm format:check`) — passed on the final shared-branch working tree.
- [x] Build (`pnpm build`) — passed; 3 pages and sitemap generated.
- [x] Unit tests (`pnpm test:run`) — passed; 21 files, 149 tests.
- [x] Accessibility (`pnpm test:a11y`) — passed; 4 files, 5 tests. No new markup.
- SEO: not applicable — no page, route, metadata, canonical, or sitemap changes.
- `git diff --check` — passed.
