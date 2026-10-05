# Plan — Agent workflow

- **Spec ID**: `003-agent-workflow`
- **Last updated**: 2026-10-05

## Approach

1. Add the four agent definitions as Markdown files under `.opencode/agents/`,
   each with YAML frontmatter (`description`, `mode`, `model`, `permissions`,
   `color`) and an English system prompt in the body.
2. Amend `docs/constitution.md`: extend §4.1 `summary.md` with a `Related specs`
   requirement, add §4.2 `Spec relationships`, and bump the version to `1.2.0`.
3. Update `AGENTS.md` with the agent workflow, the manual handoff, and the model
   tiers; a note records that the format is portable across agent tools.
4. Update `specs/README.md` and `specs/_template/summary.md` with the
   `Related specs` section.
5. Add `tests/unit/agents.test.ts` to verify the agent frontmatter and its
   consistency with the docs.
6. Backfill `Related specs` in the `001` and `002` summaries, since this change
   amends the constitution they established/amended.

## Files to change

- `.opencode/agents/spec-refiner.md` — new primary agent.
- `.opencode/agents/dev-lead.md` — new primary agent and orchestrator.
- `.opencode/agents/dev.md` — new subagent.
- `.opencode/agents/qa.md` — new subagent.
- `docs/constitution.md` — §4.1 + §4.2 and version bump.
- `AGENTS.md` — agent workflow section.
- `specs/README.md`, `specs/_template/summary.md` — `Related specs` convention.
- `specs/001-sdd-baseline/summary.md`, `specs/002-front-extra-dependencies/summary.md`
  — `Related specs` sections.
- `tests/unit/agents.test.ts` — frontmatter/consistency test.
- `specs/003-agent-workflow/{spec,plan,tasks,summary}.md` — this spec.

## Key decisions

- **Markdown + YAML frontmatter in `.opencode/agents/`**: the native, portable
  OpenCode V2 format, also understood by other agent tools (Claude Code uses
  `.claude/agents/`). Avoids duplicating definitions in `opencode.json`.
- **Primary vs subagent split**: `spec-refiner` and `dev-lead` need to converse
  with the maintainer, so they are `primary`; `dev` and `qa` are launched by the
  lead, so they are `subagent`. The primary handoff is manual because V2 has no
  direct primary-to-primary delegation.
- **Model tiers**: `gpt-6.1-sol` (medium cost) at `#medium`/`#high` reasoning for
  the two primary agents; `gpt-6-luna` for `dev`/`qa`, with the lead allowed to
  override the subagent's model per task to escalate harder work without moving
  the whole session to an expensive model.
- **Permission by role**: agents only edit what their role owns (`specs`/`docs`
  vs `src` vs `tests`), and only `dev-lead` may launch subagents.
- **No new dependencies**: the frontmatter test uses a small local parser instead
  of adding a YAML library, so Constitution §10 does not change.

## Risks

- **Frontmatter drift**: a hand-rolled parser is less general than a YAML library.
  Mitigation: the test targets the small, stable subset used by these agents and
  asserts exact field values.
- **OpenCode discovery**: agents are only discovered in `.opencode/agents/`; if the
  format changes in a future version, the frontmatter is small enough to migrate.
- **Natural-language prompts**: agent behavior cannot be fully unit-tested; the
  test covers structure and wiring, and behavior is validated by using the agents.

## Testing strategy

- Unit: `tests/unit/agents.test.ts` parses each `.opencode/agents/*.md`,
  asserts mode/model/permission wiring, and checks `AGENTS.md` and the
  constitution for the expected references and version.
- SEO / Accessibility: not applicable (no rendered markup); declared explicitly.
