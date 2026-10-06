# Summary — 015-agent-model-update

- **Last updated:** 2026-10-07
- **Status:** done

## Date

2026-10-07

## Files changed

- `.opencode/agents/spec-refiner.md` — `model:` → `opencode-go/deepseek-v4-pro`
- `.opencode/agents/dev-lead.md` — `model:` → `opencode-go/deepseek-v4-pro`
- `.opencode/agents/dev.md` — `model:` → `opencode-go/kimi-k2.7-code`
- `.opencode/agents/qa.md` — `model:` → `opencode-go/deepseek-v4.1-flash`
- `AGENTS.md` — model-defaults note updated to the new `opencode-go` assignments
- `tests/unit/agents.test.ts` — model/mode assertions updated to the four new references; test title updated
- `specs/015-agent-model-update/spec.md`, `plan.md`, `tasks.md`, `summary.md`

## Functions / components changed

- Agent frontmatter `model` assignments: moved the four workflow agents from the
  pinned OpenAI references to role-appropriate OpenCode Go models. Spec Refiner
  and Dev Lead share `opencode-go/deepseek-v4-pro` (shared prompt cache), Dev uses
  `opencode-go/kimi-k2.7-code`, and QA uses `opencode-go/deepseek-v4.1-flash`.
- Structural agent test updated to assert the new models; all other permission
  and role-boundary assertions preserved.

## Verification

All applicable gates pass: `pnpm lint`, `pnpm format:check`, `pnpm build`,
`pnpm test:run` (149 tests), `pnpm test:a11y`. Integration is not applicable
(no page/render/content/style/client/integration-suite changes) and was recorded
as such. A separate 014-debt commit removed the a11y MCP from `.mcp.json` and
formatted the frozen 014 `tasks.md` under explicit maintainer authorization.
