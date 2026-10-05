# Tasks — Workflow changes

- **Spec ID**: `007-workflow-changes`

> Tasks are integrated sequentially because Dev, QA, and the Lead share this
> checkout. A task is complete only after applicable gates and evidence are
> recorded. Historical `spec.md` files must remain unchanged.

## Checklist

- [ ] **T1 — Agent workflow and tests** (Dev → QA; branch
  `dev/007-workflow-changes/T1`)
  - Dev updates the four agent prompts/configuration: role-specific branch
    handoff, conflict/technical approval rules, Spec Refiner/Lead write
    boundaries, QA same-branch verification loop, pinned GPT-6 Luna model intent,
    and the narrowly authorized documentation paths for T2.
  - QA re-anchors `tests/unit/agents.test.ts` to the final model references,
    intent text, permissions, and workflow prompts, while retaining assertions for
    the unchanged Auto Router variants. QA runs applicable quality gates and
    records evidence here on T1's branch.
  - **Evidence:** Pending Dev and QA reports. SEO: not applicable (no page or
    rendered HTML). Accessibility: no new markup; `pnpm test:a11y` still runs as
    a constitutional gate.
  - **Depends on:** None.
- [ ] **T2 — Binding workflow documentation** (Dev → QA; branch
  `dev/007-workflow-changes/T2`; created after T1 is merged)
  - Dev applies the maintainer-authorized, task-scoped edits to
    `docs/constitution.md`, `AGENTS.md`, and `specs/README.md`. The constitution
    amendment must include the historical-`spec.md` immutability rule, branch
    lifecycle, QA/merge ownership, escalation, writing boundaries, version `1.4.0`,
    and amendment date `2026-10-05`.
  - QA reviews the docs and performs the disposable bare-remote branch walkthrough
    including QA failure/rework, successful approval, merge, deletion of local and
    remote Dev branches, and retention of the spec branch. QA records results here
    on T2's branch.
  - **Evidence:** Pending Dev and QA reports. SEO: not applicable. Accessibility:
    no rendered markup; `pnpm test:a11y` still runs as a constitutional gate.
  - **Depends on:** T1 (agent permissions and prompts establish the scoped task
    exception needed for this documentation task).
- [ ] **T3 — Relationship summaries and integrated verification** (Dev Lead
  integration; QA verifies on the spec branch)
  - After T2 passes QA and is merged, update this feature's `summary.md` and only
    the applicable `Related specs` sections in summaries 001–006. Do not modify
    any earlier `spec.md`.
  - Run the full constitutional gates on the integrated
    `spec/007-workflow-changes` branch and inspect the final diff/branch state.
  - **Evidence:** Pending integrated QA report. SEO: not applicable. Accessibility:
    no rendered markup; `pnpm test:a11y` must pass.
  - **Depends on:** T1 and T2.

## Gate summary

- Lint (`pnpm lint`): pending.
- Format (`pnpm format:check`): pending.
- Build (`pnpm build`): pending.
- Unit tests (`pnpm test:run`): pending.
- Accessibility (`pnpm test:a11y`): pending; no new page or rendered markup.
- SEO: not applicable — no page, route, metadata, canonical, or sitemap changes.
