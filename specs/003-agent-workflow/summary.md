# Summary — Agent workflow

- **Spec ID**: `003-agent-workflow`
- **Last updated**: 2026-10-05

## Files changed

- `.opencode/agents/spec-refiner.md` — new `primary` agent: clarifies and writes
  `spec.md`, records spec relationships.
- `.opencode/agents/dev-lead.md` — new `primary` agent: writes `plan.md`/`tasks.md`
  and orchestrates `dev` then `qa`, choosing the model per task.
- `.opencode/agents/dev.md` — new `subagent`: implements one task, never
  self-validates.
- `.opencode/agents/qa.md` — new `subagent`: writes and runs the quality tests and
  records evidence.
- `docs/constitution.md` — `1.1.0` → `1.2.0`; §4.1 `summary.md` adds `Related
specs`; new §4.2 `Spec relationships`.
- `AGENTS.md` — new `Agent workflow` section (the four agents, manual handoff,
  model tiers, portable format).
- `specs/README.md` — `summary.md` describes `Related specs`; new section on
  relationships.
- `specs/_template/summary.md` — new `Related specs` section.
- `specs/001-sdd-baseline/summary.md`, `specs/002-front-extra-dependencies/summary.md`
  — backfilled `Related specs`.
- `tests/unit/agents.test.ts` — frontmatter + documentation consistency test.
- `specs/003-agent-workflow/{spec,plan,tasks,summary}.md` — this spec.

## Functions / components changed

- New custom agents (configuration, not application code): `spec-refiner`,
  `dev-lead`, `dev`, `qa`.
- `parseAgent()` and `loadAgents()` (new, test-only) — parse and load the agent
  frontmatter in `tests/unit/agents.test.ts`.

## Related specs

- `001-sdd-baseline` — this spec amends `docs/constitution.md` and the `summary.md`
  convention that spec established.
- `002-front-extra-dependencies` — earlier constitution amendment; shares the
  amendment lineage and had its summary's `Related specs` backfilled.

## Notes

- Agent definitions use Markdown + YAML frontmatter under `.opencode/agents/`,
  the OpenCode V2 format that is also portable to other agent tools (Claude Code
  uses `.claude/agents/`).
- The `spec-refiner` → `dev-lead` handoff is manual: OpenCode V2 has no direct
  primary-to-primary delegation. Only `dev-lead` may launch `dev`/`qa`.
- Model tiers: `gpt-6.1-sol` (`#medium`/`#high`) for the primary agents,
  `gpt-6-luna` for `dev`/`qa`, escalable by the lead per task.
