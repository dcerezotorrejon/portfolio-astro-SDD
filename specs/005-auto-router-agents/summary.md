# Summary — Auto Router agents

- **Spec ID**: `005-auto-router-agents`
- **Last updated**: 2026-10-05

## Files changed

- `opencode.json` — added `providers.openrouter.models["openrouter/auto"]` with
  `high` (`settings.reasoningEffort: "high"`) and `medium`
  (`settings.reasoningEffort: "medium"`) variants.
- `.opencode/agents/dev-lead.md` — `model` now
  `openrouter/openrouter/auto#high`; added a `## Model intent` section.
- `.opencode/agents/spec-refiner.md` — `model` now
  `openrouter/openrouter/auto#medium`; added a `## Model intent` section.
- `.opencode/agents/dev.md` — `model` now `openrouter/openrouter/auto#medium`;
  added a `## Model intent` section.
- `.opencode/agents/qa.md` — `model` now `openrouter/openrouter/auto#medium`;
  added a `## Model intent` section.
- `tests/unit/agents.test.ts` — re-anchored expected model references, added the
  `openrouter/openrouter/auto#*` invariant, the `## Model intent` assertions, and
  a new `auto router model variants` suite over `opencode.json`.
- `specs/003-agent-workflow/spec.md`, `specs/003-agent-workflow/summary.md` —
  re-anchored R2–R5, the trailing note, and `Related specs` to this spec.
- `specs/005-auto-router-agents/{spec,plan,tasks,summary}.md` — this spec.

## Functions / components changed

- Agent configuration only (no application code): `spec-refiner`, `dev-lead`,
  `dev`, `qa` now route through the Auto Router with a reasoning-effort variant.
- Test helpers unchanged; the `loadAgents()` / `parseAgent()` expectations in
  `tests/unit/agents.test.ts` were updated and a new `auto router model variants`
  describe block was added.

## Related specs

- `003-agent-workflow` — modified: it defined the four agents with pinned
  `gpt-6-luna` models. This spec supersedes those model assignments; `003` is
  re-anchored to point here.
- `001-sdd-baseline` — depends on: this spec follows the spec-anchored workflow
  and `summary.md` conventions it established.
- `004-portfolio-home` — no direct relationship; both amend agent/tooling
  configuration but touch different areas.
- `007-workflow-changes` — supersedes this spec's assignment of the four agents to
  Auto Router models by pinning them to GPT-6 Luna (`#high` for `dev-lead`,
  `#medium` for the others). The Auto Router model/variant configuration in
  `opencode.json` remains unchanged; this summary records the later relationship
  without editing the historical `spec.md`.

## Notes

- `#high` / `#medium` on the Auto Router variants set **reasoning effort**
  (`settings.reasoningEffort`), not cost. `cost_tier` was deliberately not used,
  as agreed with the maintainer.
- OpenCode forwards the variant's reasoning effort to OpenRouter; verified that
  `openrouter/openrouter/auto#high` returns reasoning tokens.
- The router picks the concrete model per task; the variant only fixes how hard
  the selected model reasons. `allowed_models` / `excluded_models` were declined,
  so the full account-eligible pool stays available.
