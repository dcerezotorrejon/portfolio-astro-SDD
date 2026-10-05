# Agent workflow

- **Spec ID**: `003-agent-workflow`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

`AGENTS.md` and `docs/constitution.md` define a spec-anchored workflow, but there
are no specialized agents to run it: every phase (clarifying a spec, planning,
implementing, verifying) falls on a single general-purpose agent. This spec adds
four custom agents that split the workflow, and makes the relationships between
specs explicit so changes can be traced across features.

## Goals

- Define four custom agents covering the full development flow: `spec-refiner`,
  `dev-lead`, `dev`, and `qa`.
- Give each agent a clear role, mode, model tier, and permission set.
- Codify **spec relationships** in the constitution and in every `summary.md`.
- Keep the agent definitions in the portable Markdown + YAML frontmatter format.

## Non-goals

- Changing the website's content, pages, or runtime behavior.
- Replacing the built-in `build`, `plan`, `explore`, or `general` agents.
- Providing automated inter-agent messaging: OpenCode V2 launches subagents from a
  parent session, so the primary-agent handoff stays manual.

## Requirements

- **R1 (Agent definitions)**: Exactly four agents exist under `.opencode/agents/`
  — `spec-refiner`, `dev-lead`, `dev`, `qa` — each a Markdown file with valid YAML
  frontmatter: `description`, `mode`, `model`, and `permissions`.
- **R2 (Spec Refiner)**: `spec-refiner` is a `primary` agent using a medium-cost,
  medium-reasoning model (`openrouter/openai/gpt-6.1-sol#medium`). It clarifies
  requirements with the maintainer, writes `spec.md`, and reviews existing specs to
  record the relationships that the final `summary.md` will consolidate.
- **R3 (Dev Lead)**: `dev-lead` is a `primary` agent using a medium-cost,
  high-reasoning model (`openrouter/openai/gpt-6.1-sol#high`). It reviews the spec
  and code, clarifies technical decisions with the maintainer, writes `plan.md`
  and `tasks.md` with self-contained and parallelizable tasks, and for each task
  launches a `dev` then a `qa` subagent, choosing the model per task to optimize
  cost.
- **R4 (Dev)**: `dev` is a `subagent` using a cost/intelligence-compromise model
  (`openrouter/openai/gpt-6-luna#medium`, overridable by the lead). It implements
  exactly one assigned task and does not validate its own work.
- **R5 (QA)**: `qa` is a `subagent` using a comparable model
  (`openrouter/openai/gpt-6-luna#medium`). It receives a completed dev task,
  writes and runs the quality tests (unit, SEO, accessibility) required by the
  constitution, and records evidence.
- **R6 (Handoff)**: The `spec-refiner` → `dev-lead` handoff is documented as a
  manual primary-agent switch; the `dev-lead` orchestrates `dev` → `qa` with the
  `subagent` tool.
- **R7 (Constitution amendment)**: `docs/constitution.md` is amended with a
  **Spec relationships** rule (§4.1 `summary.md` and new §4.2), bumping the version
  from `1.1.0` to `1.2.0` (§11).
- **R8 (Operational guide)**: `AGENTS.md` documents the agent workflow, the
  handoff, and the model tiers.
- **R9 (Spec convention)**: `specs/README.md` and `specs/_template/summary.md`
  include the `Related specs` section.
- **R10 (Format and language)**: Agents use Markdown + YAML frontmatter and are
  written in English (Constitution §9).

## Acceptance criteria

- [x] AC1: The four agent files exist with valid frontmatter (R1).
- [x] AC2: `spec-refiner` and `dev-lead` are `primary`; `dev` and `qa` are
      `subagent`, with the models in R2–R5 (R2–R5).
- [x] AC3: `dev-lead` is permitted to launch `dev` and `qa`; `dev` and `qa` cannot
      launch subagents (R3–R5).
- [x] AC4: Permissions are restricted by role: `dev` cannot edit `tests/`; `qa`
      cannot edit `src/` (R3–R5).
- [x] AC5: The constitution carries the Spec relationships rule and version
      `1.2.0` (R7).
- [x] AC6: `AGENTS.md`, `specs/README.md`, and `specs/_template/summary.md`
      document the workflow and the `Related specs` section (R8–R9).
- [x] AC7: A unit test validates the agent frontmatter and its consistency with
      `AGENTS.md` and the constitution.

## Verification

- **Lint / Format**: `pnpm lint` and `pnpm format:check`.
- **Build**: `pnpm build`.
- **Unit tests**: `pnpm test:run`, including `tests/unit/agents.test.ts`, which
  parses the agent frontmatter and asserts the consistency rules in AC1–AC5.
- **SEO**: Not applicable — no page, route, or rendered markup is added. Stated
  explicitly per Constitution §5.
- **Accessibility**: Not applicable — no page, route, or rendered markup is added.
  Stated explicitly per Constitution §5.
