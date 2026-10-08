# Plan — Agent reasoning variants and permission integrity

- **Spec ID**: `023-agent-reasoning-variants`
- **Branch**: `spec/023-agent-reasoning-variants` (published to `origin`)

## Approach

Fix the agent configuration at its source and keep the structural test in sync.

1. **Reasoning effort = model variant.** OpenCode V2 selects reasoning effort
   through a model selector suffix (`provider/model#variant`), not through an
   agent frontmatter field. `spec-refiner` and `dev-lead` move to
   `opencode-go/deepseek-v4.1-flash#high`; `dev` and `qa` stay on
   `opencode-go/deepseek-v4.1-flash` with no variant. The invalid
   `reasoningEffort: high` scalar on `dev-lead` is removed.
2. **Permission integrity.** Removing `reasoningEffort` also restores the
   `dev-lead` `permissions:` block to the top-level ordered rule list (it was
   being absorbed into `request.body`).
3. **Boundary hardening.** Add `edit deny specs/_template/**` after the
   `specs/*/spec.md` / `specs/*/tasks.md` allows on `spec-refiner` and `qa`;
   remove the self-cancelling `deny **` + `allow **` pair on `dev`; and replace
   the literal `git <command> *` shell denies on `dev`/`qa` with
   `git*<subcommand>*` patterns that also catch aliased and compound forms.
4. **Docs + test.** Update `AGENTS.md` model/variant notes and update
   `tests/unit/agents.test.ts` with the new expectations plus an invalid-key
   guard.

## Files to change

- `.opencode/agents/spec-refiner.md` — model variant `#high`; add template deny.
- `.opencode/agents/dev-lead.md` — model variant `#high`; remove `reasoningEffort`.
- `.opencode/agents/dev.md` — remove redundant `deny **`; broaden shell denies.
- `.opencode/agents/qa.md` — add template deny; broaden shell denies.
- `AGENTS.md` — per-agent model selectors and variant note.
- `tests/unit/agents.test.ts` — model expectations, invalid-key guard, and
  effective-permission assertions (Dev-owned).

## Approved decisions

- **Numbering (`023`, not `021`)**: maintainer directed renaming the increment
  from `021-agent-reasoning-variants` to `023-agent-reasoning-variants` because
  `spec/021-cv-content` and `spec/022-experience-layout` already own those
  numbers. Slug and content are unchanged.
- **Variant scope**: only `spec-refiner` and `dev-lead` select `#high`; `dev` and
  `qa` select no variant (maintainer decision).
- **Mechanism**: use the model selector variant (maintainer decision).
- **Scope**: include the permission-overlap fixes (template glob, `dev` rule
  pair, shell denials) (maintainer decision).

## Trade-offs

- `git*<subcommand>*` is broader than the literal prefix form and can match
  read-only commands that merely mention the word (for example `git log
branch-x`). Accepted for robustness; `git branch --show-current` is re-allowed
  by a later, exact rule.
- `dev` keeps an explicit broad `allow **` (carve-outs below it) rather than an
  enumerated allow-list, preserving its delegated capability to edit arbitrary
  application/configuration paths. Only the redundant self-cancelling `deny **`
  is removed.

## Risks

- `opencode debug agents` depends on the background service and caches config;
  a service restart may be needed before the resolved output reflects the edits.
- The working-tree model edits already present on `main` are carried onto this
  branch and are superseded/extended here; they are not separately committed.
- Two increments use the `021` prefix on different branches (`021-cv-content` and
  this one prior to rename); after the rename only `023` is used here.

## Testing strategy

- `tests/unit/agents.test.ts`: assert per-agent `mode` and `model` (with
  `#high`), the invalid-key guard, effective `edit deny` on
  `specs/_template/**` for `spec-refiner`/`qa`, the `dev` rule-shape check, and
  `shell deny` for the aliased/compound git commands.
- Manual evidence: `opencode debug agents` showing top-level `permissions` and
  empty `request.body` for every agent, with `dev-lead` retaining its full set.
- Repository gates and integration applicability follow
  `docs/constitution.md` §§5–6.
