# Summary — Agent workflow

- **Spec ID**: `003-agent-workflow`
- **Last updated**: 2026-10-06

## Files changed

- `.opencode/agents/spec-refiner.md` — new `primary` agent: clarifies and writes
  `spec.md`, records spec relationships; model now
  `openrouter/openai/gpt-6-luna#medium` (`007-workflow-changes` supersedes the
  Auto Router assignment from `005-auto-router-agents`).
- `.opencode/agents/dev-lead.md` — new `primary` agent: writes `plan.md`/`tasks.md`
  and orchestrates `dev` then `qa`; the final workflow now explicitly requests
  the maintainer to merge the pushed branch without performing the merge; it now uses
  `openrouter/openai/gpt-6-luna#high` (`007-workflow-changes` supersedes the Auto
  Router assignment from `005-auto-router-agents`).
- `.opencode/agents/dev.md` — new `subagent`: implements one task, never
  self-validates.
- `.opencode/agents/qa.md` — new `subagent`: writes and runs the quality tests,
  records evidence, and may mark only evidence-backed acceptance checkboxes in
  its assigned current spec (`008-lib-reorganization`).
- `docs/constitution.md` — initially `1.1.0` → `1.2.0`; under
  `008-lib-reorganization`, §5.1 was condensed and amended to version `1.5.0` on
  `2026-10-06`, retaining workflow safeguards and requiring the final merge
  request.
- `specs/003-agent-workflow/{spec,plan,tasks,summary}.md` — re-anchored all four
  model preferences to OpenRouter Auto Router variants owned by spec 005.
- `AGENTS.md` — new `Agent workflow` section (the four agents, manual handoff,
  model tiers, portable format); now explicitly requires the Lead to ask the
  maintainer to merge after final push and documents QA's checkbox-only spec
  update authority (`008-lib-reorganization`).
- `specs/README.md` — `summary.md` describes `Related specs`; new section on
  relationships.
- `specs/_template/summary.md` — new `Related specs` section.
- `specs/001-sdd-baseline/summary.md`, `specs/002-front-extra-dependencies/summary.md`
  — backfilled `Related specs`.
- `tests/unit/agents.test.ts` — frontmatter and documentation consistency tests,
  including QA's checkbox-only boundary, constitutional workflow, and final
  handoff (`008-lib-reorganization`).
- `specs/003-agent-workflow/{spec,plan,tasks,summary}.md` — this spec.

## Functions / components changed

- New custom agents (configuration, not application code): `spec-refiner`,
  `dev-lead`, `dev`, `qa`.
- `parseAgent()` and `loadAgents()` (new, test-only) — parse and load the agent
  frontmatter in `tests/unit/agents.test.ts`.

## Related specs

- `005-auto-router-agents` — modified: moved the four agents from pinned
  `gpt-6-luna` models to the OpenRouter Auto Router with per-role reasoning
  variants (`#high` / `#medium`). Supersedes the model assignments in R2–R5 and
  re-anchors `tests/unit/agents.test.ts`; no agent role, mode, or permission
  changed.
- `004-portfolio-home` — the applied React-policy clarification (1.2.1) and
  global-design reference (1.3.0) amend the constitution; this spec establishes
  the workflow used by 004. Agent router configuration is owned by spec 005. No
  agent role or permission changed.
- `001-sdd-baseline` — this spec amends `docs/constitution.md` and the `summary.md`
  convention that spec established.
- `002-front-extra-dependencies` — earlier constitution amendment; shares the
  amendment lineage and had its summary's `Related specs` backfilled.
- `007-workflow-changes` — modifies the operational agent workflow: all agents
  use the shared feature branch, up to four independent tasks may be active, and
  QA/rework/evidence gate the final commit and push. The pinned GPT-6 Luna models
  supersede the Auto Router agent assignments; the Auto Router configuration
  remains unchanged. This summary is updated; the historical `spec.md` is not.
- `008-lib-reorganization` — modifies the agent workflow guidance and condenses
  Constitution §5.1 while preserving established roles; its final push workflow
  requires an explicit maintainer merge request and leaves the actual merge to
  the maintainer. It also authorizes QA to mark only verified acceptance
  checkboxes in its assigned current spec.
- `009-workflow-governance` — further amends role-specific agent procedures,
  constitution precedence, merge authorization, QA's latest-only evidence and
  Markdown-only task-gate selection, Dev Lead final-gate selection, and task-scoped
  governance/configuration authority; this summary records the relationship
  without changing this spec's historical requirements.

## Notes

- Agent definitions use Markdown + YAML frontmatter under `.opencode/agents/`,
  the OpenCode V2 format that is also portable to other agent tools (Claude Code
  uses `.claude/agents/`).
- The `spec-refiner` → `dev-lead` handoff is manual: OpenCode V2 has no direct
  primary-to-primary delegation. Only `dev-lead` may launch `dev`/`qa`.
- Models: the agents currently use pinned GPT-6 Luna references with `#high` for
  the Dev Lead and `#medium` for the other roles (`007-workflow-changes`). The
  Auto Router variants configured by `005-auto-router-agents` remain available in
  `opencode.json` but are no longer assigned to these agents.
