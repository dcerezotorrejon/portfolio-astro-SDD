# Plan — Auto Router agents

- **Spec ID**: `005-auto-router-agents`
- **Last updated**: 2026-10-05

## Approach

1. Declare two variants of `openrouter/auto` in `opencode.json` under
   `providers.openrouter.models`, each setting `settings.reasoningEffort`
   (`high` / `medium`).
2. Point the four agent frontmatter `model` fields at
   `openrouter/openrouter/auto#<variant>`, keeping the existing role tiers:
   `dev-lead` → `high`; `spec-refiner`, `dev`, `qa` → `medium`.
3. Append a `## Model intent` section to each agent body documenting the routed
   reasoning effort.
4. Re-anchor `tests/unit/agents.test.ts`: update the expected model references and
   add assertions over the Auto Router variants in `opencode.json`.
5. Re-anchor `specs/003-agent-workflow` (`spec.md` and `summary.md`) to reference
   this spec.

## Files to change

- `opencode.json` — Auto Router `high` / `medium` reasoning variants.
- `.opencode/agents/dev-lead.md` — model `#high` plus `## Model intent`.
- `.opencode/agents/spec-refiner.md` — model `#medium` plus `## Model intent`.
- `.opencode/agents/dev.md` — model `#medium` plus `## Model intent`.
- `.opencode/agents/qa.md` — model `#medium` plus `## Model intent`.
- `tests/unit/agents.test.ts` — new model references and variant assertions.
- `specs/003-agent-workflow/spec.md`, `specs/003-agent-workflow/summary.md` —
  re-anchored relationship to this spec.
- `specs/005-auto-router-agents/{spec,plan,tasks,summary}.md` — this spec.

## Key decisions

- **Auto Router over a pinned model**: lets the router pick the model per task
  while keeping one configuration for all agents.
- **`settings.reasoningEffort`, not `cost_tier`**: `cost_tier` selects a cost
  band, which is orthogonal to reasoning. The maintainer asked for high reasoning,
  so the variants set the reasoning effort only. Verified that OpenCode forwards
  it to OpenRouter and that reasoning tokens are returned.
- **Per-role variants**: preserve the existing tiers (`dev-lead` high, the rest
  medium) as named variants (`#high`, `#medium`) so the agent frontmatter stays
  readable and unchanged in shape.
- **No model restrictions**: `allowed_models`/`excluded_models` were declined, so
  the router keeps the full account-eligible pool.
- **Prompt intent**: the `## Model intent` section makes the requirement
  reviewable in the prompt; the enforceable control remains the variant setting.

## Risks

- **Model support**: the Auto Router may pick a model that does not support an
  effort level; OpenRouter then ignores or maps it. Mitigation: the reasoning
  intent is still expressed and applied whenever the selected model supports it.
- **Router drift over time**: the router follows market spend, so the concrete
  model behind a variant can change without a repo change. Mitigation: this is the
  intended behavior; the spec anchors intent, not a specific model.
- **Config/agent drift**: the `model` strings must match the variant ids.
  Mitigation: `tests/unit/agents.test.ts` asserts both sides.

## Testing strategy

- Unit: `tests/unit/agents.test.ts` parses `.opencode/agents/*.md`, asserts the
  `openrouter/openrouter/auto#<variant>` references, and validates the Auto Router
  variants in `opencode.json` (ids and `reasoningEffort`, no `cost_tier`).
- SEO / Accessibility: not applicable (no rendered markup); declared explicitly.
