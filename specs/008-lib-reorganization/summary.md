# Summary — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Last updated**: 2026-10-06

## Files changed

- `.opencode/agents/dev.md` — Dev edit-tool permission now allows assigned
  repository paths except `tests/**` and `specs/**`; branch and role restrictions
  remain.
- `.opencode/agents/qa.md` — QA edit-tool permission covers `tests/**` and
  assigned `specs/*/tasks.md` evidence; production and other spec artifacts remain
  denied.
- `src/components/FloatingNav.tsx` →
  `src/components/FloatingNav/FloatingNav.tsx` — moved the React component without
  changing behavior or exports.
- `src/lib/navigation.ts` →
  `src/components/FloatingNav/helpers/navigation.ts` — moved the navigation
  helpers without changing behavior or exports.
- `src/lib/content.ts` → `src/content/parsers/content.ts` and
  `src/lib/content-schema.ts` → `src/content/parsers/content-schema.ts` — moved
  content utilities, schemas, and types without changing behavior.
- `src/pages/index.astro`, `src/content.config.ts`,
  `src/components/ExperienceHistory.astro`,
  `src/components/ProfileIntroduction.astro`, and
  `src/pages/experiencia/[slug].astro` — updated imports to the relocated modules;
  the homepage retains the explicit `client:load` directive.
- `README.md` — updated the content schema path.
- `tests/unit/agents.test.ts` — asserted effective Dev/QA edit permissions and
  preserved role/Git restrictions.
- `tests/unit/floating-nav.test.tsx`,
  `tests/unit/floating-nav-threshold.test.tsx`,
  `tests/a11y/floating-nav.test.ts`, and `tests/unit/navigation.test.ts` — QA
  updated imports to the relocated navigator and helpers; assertions remain.
- `tests/unit/content.test.ts`, `tests/unit/company-icon.test.ts`, and
  `tests/unit/experience.test.ts` — QA updated imports to the relocated content
  modules; assertions remain.
- `specs/004-portfolio-home/summary.md` and
  `specs/007-workflow-changes/summary.md` — refreshed dates and relationship
  records; historical specs and evidence were not modified.
- `specs/008-lib-reorganization/spec.md`, `plan.md`, `tasks.md`, and `summary.md`
  — current feature specification, approved plan, task/evidence record, and this
  summary.

## Functions / components changed

- `FloatingNav` — relocated under its own directory; component behavior, props,
  exports, and hydration remain unchanged.
- `prefersReducedMotion()`, `scrollToSection()`, and
  `getActiveSectionIndex()` — relocated to the navigator's `helpers/` directory
  without behavior changes.
- `profileSchema`, `experienceSchema`, `companyIconSchema`, `resolveCompanyIcon()`,
  `sortExperiences()`, `assertUniqueExperienceSlugs()`, and `formatDateRange()` —
  relocated under `src/content/parsers/` without behavior or validation changes.
- Dev/QA agent edit-tool configuration — aligned with assigned task duties;
  role boundaries, test ownership, and Git restrictions remain unchanged.

## Verification status

- All three tasks received QA approval with evidence recorded in `tasks.md`.
- Final integrated gates passed on 2026-10-06: `pnpm lint`,
  `pnpm format:check`, `pnpm build` (3 pages and sitemap), `pnpm test:run`
  (21 files / 149 tests), and `pnpm test:a11y` (4 files / 5 tests).
- QA verified the unchanged SEO suites and accessibility checks; no page markup,
  metadata, interaction, or content behavior was intentionally changed.
- Dev and QA used the configured `openrouter/openai/gpt-6-luna#medium` model.
  No task-level commits or pushes were made.

## Related specs

- `003-agent-workflow` — depends on: follows its established planning,
  implementation, shared-branch, QA, and evidence workflow.
- `004-portfolio-home` — modified: relocated its floating navigator, navigation
  helper, content utilities, and schemas, with imports updated. No 004 behavior or
  requirement changed; its summary was updated and its historical `spec.md` was
  preserved.
- `007-workflow-changes` — modified: aligns the agents' tool-level edit
  permissions with their established Dev/QA roles. Role boundaries, shared-branch
  rules, and commit/push authority remain unchanged; its summary was updated and
  its historical `spec.md` was preserved.
