# Technical plan — 015-agent-model-update

- **Status:** draft; awaiting maintainer confirmation before execution
- **Branch:** `spec/015-agent-model-update` (created from `main`; not merged)
- **Base revision:** `main` (post-014 unmerged; separate from `spec/014-playwright-integration`)
- **Model choice:** Subagents use configured defaults (`openai/gpt-6-luna` for Dev/QA; `openai/gpt-6.1-sol` for Lead/Refiner). No override; task scope is bounded (frontmatter + docs + test), so cost-efficiency favors staying with configured defaults rather than forcing the new OpenCode Go models into subagent execution.
- **Approach:** Update the four agent frontmatter files, `AGENTS.md`, and `tests/unit/agents.test.ts`. Do not touch application code, content, build/config, or completed spec directories.
- **Approved decisions (recorded from maintainer):**
  - Spec Refiner and Dev Lead → `opencode-go/deepseek-v4-pro` (shared cache via same model).
  - Dev → `opencode-go/kimi-k2.7-code` (own iteration cache).
  - QA → `opencode-go/deepseek-v4.1-flash` (cheap cache inputs).
  - No extra frontmatter fields; `model:` is the only change.
  - No constitutional amendment required (Constitution does not pin agent models).
- **Verification:** All applicable gates (`lint`, `format:check`, `build`, `test:run`, `test:a11y`). Integration gate **not applicable** (no page/render/content/style/client/integration changes); record as not applicable explicitly. SEO verified through existing `tests/seo`; sitemap not affected.
- **Risks:** Stale assertions in `tests/unit/agents.test.ts` must be updated to match new references without weakening safeguards; `AGENTS.md` must stay consistent with frontmatter.
