# Agent model update to OpenCode Go

- **Spec ID**: `015-agent-model-update`
- **Status**: done
- **Last updated**: 2026-10-07

## Context

The four workflow agents currently pin OpenAI references in their frontmatter:
Spec Refiner and Dev Lead use `openai/gpt-6.1-sol`, while Dev and QA use
`openai/gpt-6-luna`. `AGENTS.md` documents these defaults and
`tests/unit/agents.test.ts` asserts them. The maintainer now wants to move the
agents to cheaper, role-appropriate models on the `opencode-go` (OpenCode Go)
provider.

The maintainer approved these assignments on 2026-10-07:

| Role         | Model                             | Shared cache                   |
| ------------ | --------------------------------- | ------------------------------ |
| Spec Refiner | `opencode-go/deepseek-v4-pro`     | Yes, same model as Dev Lead    |
| Dev Lead     | `opencode-go/deepseek-v4-pro`     | Yes, reuses Spec Refiner cache |
| Dev          | `opencode-go/kimi-k2.7-code`      | Own cache across iterations    |
| QA           | `opencode-go/deepseek-v4.1-flash` | Cheap cache inputs             |

"Shared cache" is a consequence of assigning the same model to both planning
agents; there is no separate frontmatter field for it. Agent frontmatter only
carries `model` (plus description, mode, color, and permissions). The provider
reuses prompt cache automatically when two agents share a model.

## Goals

- Replace the four agents' `model` frontmatter with the approved `opencode-go`
  references.
- Keep Spec Refiner and Dev Lead on the same model so they share prompt cache.
- Keep `AGENTS.md` model documentation consistent with the new assignments.
- Keep the structural agent test (`tests/unit/agents.test.ts`) aligned with the
  new models and passing.
- Preserve every other frontmatter field (description, mode, color, permissions)
  and the agents' procedural bodies unchanged.

## Non-goals

- Changing agent permissions, modes, roles, write boundaries, or procedures.
- Adding new frontmatter fields (for example a cache-sharing flag).
- Amending the [Constitution](../../docs/constitution.md): it does not pin agent
  models.
- Editing completed specification directories or referencing them.
- Changing `opencode.json` providers, the OpenRouter Auto Router variants, or
  any application code, content, or behavior.
- Introducing model variants or reasoning-effort suffixes.

## Requirements

- **R1 — Spec Refiner model:** Set `.opencode/agents/spec-refiner.md`
  `model:` to exactly `opencode-go/deepseek-v4-pro`.
- **R2 — Dev Lead model:** Set `.opencode/agents/dev-lead.md` `model:` to exactly
  `opencode-go/deepseek-v4-pro` (same model as Spec Refiner for shared cache).
- **R3 — Dev model:** Set `.opencode/agents/dev.md` `model:` to exactly
  `opencode-go/kimi-k2.7-code`.
- **R4 — QA model:** Set `.opencode/agents/qa.md` `model:` to exactly
  `opencode-go/deepseek-v4.1-flash`.
- **R5 — Documentation:** Update `AGENTS.md` so its model-defaults note states the
  new `opencode-go` assignments. If it mentions reasoning variants or Auto
  Router variants, keep that statement accurate without inventing new facts.
- **R6 — Test:** Update `tests/unit/agents.test.ts` so its expected
  model/per-mode tuples match the four new references, and keep the remaining
  structural assertions meaningful. Do not weaken unrelated safeguards.
- **R7 — No model variants:** Every new `model:` value is a plain reference with
  no variant suffix.

## Acceptance criteria

- [x] **AC1 (R1–R4):** Each of the four agent files has its assigned `model:` value verbatim, and no other frontmatter field changed.
- [x] **AC2 (R1–R2):** Spec Refiner and Dev Lead share `opencode-go/deepseek-v4-pro`; Dev and QA use their distinct assigned models.
- [x] **AC3 (R5):** `AGENTS.md` documents the four new models consistently with the frontmatter.
- [x] **AC4 (R6):** `tests/unit/agents.test.ts` asserts the four new models and the full suite passes.
- [x] **AC5 (R7):** No `model:` value carries a variant or reasoning suffix.

## Verification

### Ownership and feasibility

The current [Dev](../../.opencode/agents/dev.md),
[QA](../../.opencode/agents/qa.md), and
[Dev Lead](../../.opencode/agents/dev-lead.md) prompts permit this division:

- **Dev:** `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, `.opencode/agents/qa.md`, and `AGENTS.md`. Dev may
  edit only the `model` line in each agent's frontmatter and the model note in
  `AGENTS.md`; preserve all other content.
- **QA:** `tests/unit/agents.test.ts` and the task's evidence. QA does not edit
  agent definitions or production files.
- **Dev Lead:** planning, exact file ownership, applicable final-gate execution,
  and closure.

No new authority, permissions, dependencies, or historical-spec access is
needed.

### Criterion verification

| Criteria | Verification method                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| AC1      | QA compares each agent frontmatter `model:` to the approved value and confirms no other field changed (diff scope). |
| AC2      | QA reads the four `model:` values and confirms the two planning agents match and the other two are distinct.        |
| AC3      | QA reads `AGENTS.md` and confirms the model note matches the frontmatter.                                           |
| AC4      | QA runs `pnpm test:run` (which includes `tests/unit/agents.test.ts`) and confirms the model assertions pass.        |
| AC5      | QA greps the four `model:` lines for `#` or variant suffixes and confirms none exist.                               |

Run the ordinary quality gates under
[Constitution §6](../../docs/constitution.md#6-quality-gates). This change
touches non-Markdown files (a test), so lint, format, build, unit, and
accessibility gates apply. The integration gate does not apply: no page
rendering, routing, content, styles, client behavior, browser-complex
component, or integration-suite/tooling changes are involved; QA MUST record
integration as not applicable explicitly. This spec leaves all acceptance
markers pending for QA.
