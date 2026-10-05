# Auto Router agents

- **Spec ID**: `005-auto-router-agents`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

Spec `003-agent-workflow` defined the four workflow agents (`spec-refiner`,
`dev-lead`, `dev`, `qa`) pinned to fixed concrete model IDs
(`openrouter/openai/gpt-6-luna#high|#medium`). Pinning a model forces a single
vendor and a fixed capability/cost point for every task.

This spec routes the four agents through OpenRouter's **Auto Router**
(`openrouter/auto`), which selects the model per task from the market's spend
share. To preserve each role's intent, the router is paired with custom model
**variants** that set the **reasoning effort** (high for `dev-lead`, medium for
`spec-refiner`, `dev`, `qa`), and each agent prompt documents that intent.

The distinction matters: on a concrete model `#high` is a reasoning-effort
variant, whereas the Auto Router's `cost_tier` is a **cost band**, not reasoning.
The variants therefore set `settings.reasoningEffort`, never `cost_tier`.

## Goals

- Route all four agents through the Auto Router (`openrouter/auto`).
- Express each role's reasoning intent as a reusable model variant in
  `opencode.json`.
- State the intended reasoning effort in each agent's prompt.
- Re-anchor the agent tests and the `003-agent-workflow` spec to the new setup.

## Non-goals

- Restricting the router with `allowed_models` or `excluded_models`.
- Biasing router selection with `cost_tier` (deliberately omitted).
- Changing agent roles, modes, permissions, or colors.
- Changing the website's content, pages, or runtime behavior.

## Requirements

- **R1 (Auto Router variants)**: `opencode.json` defines
  `providers.openrouter.models["openrouter/auto"]` with two variants:
  `high` (`settings.reasoningEffort: "high"`) and `medium`
  (`settings.reasoningEffort: "medium"`). The variants MUST NOT set `cost_tier`.
- **R2 (Agent routing)**: Each agent references
  `openrouter/openrouter/auto#<variant>`: `dev-lead` uses `#high`;
  `spec-refiner`, `dev`, and `qa` use `#medium`.
- **R3 (Prompt intent)**: Each agent body ends with a `## Model intent` section
  (in English) stating the routed reasoning effort and the kind of model the role
  needs.
- **R4 (Test re-anchoring)**: `tests/unit/agents.test.ts` asserts the new model
  references and validates the Auto Router variants (ids and reasoning effort,
  with no `cost_tier`).
- **R5 (Spec relationship)**: The `003-agent-workflow` spec is re-anchored in the
  same change (its `spec.md` and `summary.md` reference this spec).

## Acceptance criteria

- [x] AC1: `opencode.json` defines the `high` and `medium` Auto Router variants
      using `settings.reasoningEffort` and no `cost_tier` (R1).
- [x] AC2: `dev-lead` uses `openrouter/openrouter/auto#high`; `spec-refiner`,
      `dev`, and `qa` use `openrouter/openrouter/auto#medium` (R2).
- [x] AC3: All four agent bodies contain a `## Model intent` section (R3).
- [x] AC4: `pnpm test:run` passes, including the Auto Router variant assertions
      (R4).
- [x] AC5: `003-agent-workflow` references this spec and its date is refreshed
      (R5).

## Verification

- **Lint / Format**: `pnpm lint` and `pnpm format:check`.
- **Build**: `pnpm build`.
- **Unit tests**: `pnpm test:run`, including `tests/unit/agents.test.ts`, which
  asserts the agent model references (R2) and the Auto Router variants in
  `opencode.json` (R1).
- **SEO**: Not applicable — no page, route, or rendered markup is added. Stated
  explicitly per Constitution §5.
- **Accessibility**: Not applicable — no page, route, or rendered markup is
  added. Stated explicitly per Constitution §5.
