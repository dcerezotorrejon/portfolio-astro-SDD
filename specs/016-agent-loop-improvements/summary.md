# Summary — Agent loop improvements

- **Date**: 2026-10-07

## Files changed

- `docs/constitution.md` — summarized and amended §5.1 with two §11 amendments:
  R3 (unit-test ownership: Dev writes/validates `tests/unit/**`, QA verifies
  sufficiency and owns seo/a11y/integration + gates) and R4 (workflow Markdown
  always implemented by the Dev Lead; Dev never edits it); version `1.11.0`,
  Last amended `2026-10-07`.
- `AGENTS.md` — rewritten as a minimal operational index; duplicated rule text
  replaced by links to the constitution.
- `.opencode/agents/dev.md` — gained `tests/unit/**` edit, lost workflow-Markdown
  edit, now writes and validates unit tests before handoff.
- `.opencode/agents/qa.md` — lost `tests/unit/**` edit, gained unit-test
  sufficiency review, keeps seo/a11y/integration tests + gates.
- `.opencode/agents/dev-lead.md` — gained workflow-Markdown edit ownership;
  responsibilities and rules updated for R3/R4.
- `specs/016-agent-loop-improvements/{spec,plan,tasks,summary}.md` — this
  increment's artifacts.

## Functions / components changed

- No application code, content, or repository configuration changed. This
  increment touches only workflow Markdown (`AGENTS.md`, `docs/constitution.md`,
  `.opencode/agents/**`) and its own planning artifacts.
