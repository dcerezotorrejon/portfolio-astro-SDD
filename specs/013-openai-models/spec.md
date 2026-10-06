# Direct OpenAI agent models

- **Spec ID**: `013-openai-models`
- **Status**: done
- **Last updated**: 2026-10-06

## Context

The maintainer confirmed switching all four workflow agents from the OpenRouter
provider to the built-in OpenAI provider, keeping their existing model identities
and role allocation. The approved references are `openai/gpt-6.1-sol` for Dev Lead
and Spec Refiner and `openai/gpt-6-luna` for Dev and QA, without variant suffixes.

The working tree already contains these substitutions in the four agent
definitions and the model-default bullet in `AGENTS.md`. They remain uncommitted;
their presence does not constitute independent QA approval. OpenCode's model
catalog lists both exact OpenAI references as active. Catalog availability does
not establish that the maintainer's account is authenticated or entitled to use
them, or that a live request has succeeded.

This increment concerns repository model selection, not account authentication.
OpenCode uses a connected provider account for requests; sign-in and credentials
remain outside repository artifacts. Governing constraints are defined in the
[constitution](../../docs/constitution.md). Provider-reference semantics are
documented in the [OpenCode V2 provider guide](https://opencode.ai/v2/docs/providers).

## Goals

- Select the same agent models directly through the `openai` provider.
- Keep the guide consistent with the four configured defaults.
- Preserve reasoning-variant selection, agent behavior, and unrelated providers.

## Non-goals

- Connecting accounts, choosing API-key versus account-login authentication,
  storing credentials, or changing account billing and entitlements.
- Guaranteeing successful inference, pricing, or a particular reasoning effort.
- Changing `opencode.json`, removing OpenRouter, or modifying Auto Router variants.
- Changing agent roles, permissions, model-override policy, workflow rules,
  application code, tests, dependencies, or portfolio content.

## Requirements

- **R1 — Primary-agent defaults:** The YAML frontmatter `model` value in
  `.opencode/agents/dev-lead.md` and `.opencode/agents/spec-refiner.md` must be
  exactly `openai/gpt-6.1-sol`.
- **R2 — Subagent defaults:** The YAML frontmatter `model` value in
  `.opencode/agents/dev.md` and `.opencode/agents/qa.md` must be exactly
  `openai/gpt-6-luna`.
- **R3 — Guide consistency:** The model-default bullet in `AGENTS.md` must match
  R1 and R2, retain frontmatter as the source of configured defaults, and retain
  its statements that no reasoning variant is explicitly selected and that Auto
  Router variants remain unchanged. None of the four defaults may include a
  variant suffix or substitute a different model identity.
- **R4 — Bounded change:** Production changes are limited to the four `model`
  frontmatter values and the corresponding references in the guide's
  model-default bullet, plus formatting of those five files. Preserve every other
  frontmatter field, permission, prompt instruction, and guide statement.
  `opencode.json` and all other operational and application files remain unchanged.
  No credentials or account-specific authentication settings may be added.
- **R5 — Resolvable references:** Both exact OpenAI model references must be
  listed by the OpenCode model catalog. If either is unavailable during QA,
  report the blocker rather than inventing an alias or silently substituting a
  model or provider. Verification must distinguish catalog resolution from
  account authentication and live inference; no live request is required.

## Acceptance criteria

- [x] **AC1 (R1):** Both primary-agent definitions contain exactly
      `model: openai/gpt-6.1-sol` in frontmatter.
- [x] **AC2 (R2):** Both subagent definitions contain exactly
      `model: openai/gpt-6-luna` in frontmatter.
- [x] **AC3 (R3):** The guide names the exact defaults for each role, identifies
      frontmatter as their source, and retains the unchanged-variant and Auto
      Router statements. All four references have no variant suffix.
- [x] **AC4 (R4):** The complete production diff contains only the specified
      substitutions and any formatting in the five named files; other behavior,
      `opencode.json`, and other operational/application files are unchanged.
      No credentials or authentication configuration are introduced. Applicable
      lint and format gates pass with QA evidence.
- [x] **AC5 (R5):** QA records catalog results listing both exact `openai/`
      references and explicitly states that authentication, entitlements, and
      live inference were not verified. Missing catalog entries block approval.

## Verification

### Authorized ownership and handoff

Spec Refiner owns substantive content only in this assigned current `spec.md`.
The Dev Lead owns the current planning artifacts and final closure metadata under
the [constitutional workflow](../../docs/constitution.md#51-shared-feature-branch-workflow).
The Lead creates and publishes `spec/013-openai-models` for subsequent work and
accounts for the existing uncommitted substitutions without treating them as QA
evidence or overwriting unrelated work.

The proposed Dev-owned production task covers exactly `AGENTS.md` and
`.opencode/agents/{dev-lead,spec-refiner,dev,qa}.md`. Dev's current instructions and
effective permissions support those assigned operational paths. Dev reviews the
existing substitutions and performs any necessary correction within that scope;
Spec Refiner and Lead do not implement production changes.

QA independently verifies that task, records evidence in the assigned current
`tasks.md`, and updates only verified acceptance checkbox markers in this spec.
Its current permissions support both evidence paths; no production edit is
required for verification. The Lead finalizes artifacts and applicable final-gate
evidence before its final metadata transition. No criterion is completed by this
authoring step.

### Requirement-to-verification mapping

- **R1 → AC1:** Inspect the two primary-agent frontmatter values.
- **R2 → AC2:** Inspect the two subagent frontmatter values.
- **R3 → AC3:** Compare the guide's model-default bullet with all four agent
  definitions and check exact references and absence of suffixes.
- **R4 → AC4:** Inspect the complete increment diff against the Lead-recorded
  base, including staged, unstaged, and untracked changes. Confirm preservation
  of unrelated content and absence of credentials or authentication additions.
  Run applicable lint and format gates and record results.
- **R5 → AC5:** Use OpenCode's model-catalog tool filtered to provider `openai`,
  or its model-selection catalog, to confirm both exact identifiers. Record the
  returned identifiers and the limits of this verification, without invoking
  inference or exposing account credentials.

For the bounded Markdown-only change set outside `src/content/**`, run
`pnpm lint` and `pnpm format:check`. Record build, unit, SEO, and accessibility as
not run and not applicable under
[Constitution §§5–6](../../docs/constitution.md#6-quality-gates). Determine final
gates from the complete increment rather than assuming this exception still
applies after an unapproved scope expansion.
