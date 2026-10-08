# Summary — Agent reasoning variants and permission integrity

- **Spec ID**: `023-agent-reasoning-variants`
- **Branch**: `spec/023-agent-reasoning-variants`
- **Closed**: 2026-10-08

## Files changed

- `.opencode/agents/spec-refiner.md` — `model: opencode-go/deepseek-v4.1-flash#high`;
  added `edit deny specs/_template/**` after the `specs/*/spec.md` allow.
- `.opencode/agents/dev-lead.md` — `model: ...#high`; removed the invalid
  `reasoningEffort: high` frontmatter field, which had also absorbed the
  permission list into `request.body`.
- `.opencode/agents/dev.md` — removed the redundant `edit deny **`; shell rules
  broadened to `git*branch*`/`git*checkout*`/`git*switch*`/`git*merge*`/
  `git*commit*`/`git*push*` with `git branch --show-current` re-allowed.
- `.opencode/agents/qa.md` — added `edit deny specs/_template/**`; same
  broadened shell rules.
- `AGENTS.md` — per-agent model selectors and the reasoning-variant note.
- `tests/unit/agents.test.ts` — updated model expectations, an invalid V2
  frontmatter-field guard, and effective-permission assertions.
- `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts` —
  reconciled with the intentional removal of the custom transition duration.
- `specs/023-agent-reasoning-variants/{spec,plan,tasks}.md` — increment
  artifacts.

## Outcome

- `spec-refiner` and `dev-lead` select the `high` reasoning variant; `dev` and
  `qa` select no variant.
- Every agent's ordered permission rules apply at the top level
  (`request.body` empty), restoring `dev-lead`'s restricted policy.
- The template-glob, `dev` rule-pair, and git shell-deny overlaps are closed.
- Final gate results (Constitution §§5–6, Lead-run on the frozen tree):
  `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, and
  `pnpm test:a11y` all pass; `pnpm test:integration` not applicable.
