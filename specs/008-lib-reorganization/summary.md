# Summary — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Last updated**: 2026-10-06

## Files changed

- `.opencode/agents/dev.md` — Dev edit-tool permission now allows assigned
  repository paths except `tests/**` and `specs/**`; branch and role restrictions
  remain.
- `.opencode/agents/qa.md` — QA edit-tool permission covers assigned tests,
  assigned `tasks.md` evidence, and the assigned current `spec.md` for verified
  `[ ]`→`[x]` acceptance-checkbox changes only. Spec wording, metadata/status,
  other sections, and unassigned specs remain outside QA's authority.
- `.opencode/agents/dev-lead.md` — final completion procedure now explicitly
  requests the maintainer to merge the pushed branch; Lead merge/deletion remains
  prohibited.
- `.opencode/agents/spec-refiner.md` and `.opencode/agents/dev.md` — reviewed for
  consistency and left unchanged because existing role-specific guidance remains
  correct.
- `docs/constitution.md` — §5.1 condensed while preserving its safeguards;
  version `1.4.0` → `1.5.0`, amended `2026-10-06`, with the post-push maintainer
  merge request added as a binding rule.
- `AGENTS.md` — retained operational workflow details, added the Lead's explicit
  post-push merge request, and documented QA's evidence-backed checkbox-only
  permission.
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
- `tests/unit/agents.test.ts` — asserted effective Dev/QA edit permissions,
  QA's checkbox-only scope, preserved role/Git restrictions, constitutional
  workflow policy, and the final merge handoff.
- `tests/unit/floating-nav.test.tsx`,
  `tests/unit/floating-nav-threshold.test.tsx`,
  `tests/a11y/floating-nav.test.ts`, and `tests/unit/navigation.test.ts` — QA
  updated imports to the relocated navigator and helpers; assertions remain.
- `tests/unit/content.test.ts`, `tests/unit/company-icon.test.ts`, and
  `tests/unit/experience.test.ts` — QA updated imports to the relocated content
  modules; assertions remain.
- `specs/001-sdd-baseline/summary.md`, `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`, and
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
- Dev/QA agent edit-tool configuration — aligned with assigned task duties; QA
  may update only evidence-backed acceptance checkboxes in its assigned current
  spec. Other role boundaries, test ownership, and Git restrictions remain.

## Verification status

- All five tasks received QA approval with evidence recorded in `tasks.md`.
- QA's T5 gates passed: `pnpm lint`, `pnpm format:check`, `pnpm build`
  (3 pages and sitemap), `pnpm test:run` (21 files / 153 tests), and
  `pnpm test:a11y` (4 files / 5 tests). The Lead reran all five gates on the final
  integrated tree after T5 and the summary updates; all passed on 2026-10-06.
- QA verified the unchanged SEO suites and accessibility checks; no page markup,
  metadata, interaction, or content behavior was intentionally changed.
- Dev and QA used the configured `openrouter/openai/gpt-6-luna#medium` model.
  No task-level commits or pushes were made.
- `.opencode/agents/spec-refiner.md` and `.opencode/agents/dev.md` were reviewed
  during T4 and required no changes.

## Related specs

- `001-sdd-baseline` — modified: Constitution §5.1 was further amended to
  version `1.5.0`, adding the explicit post-push maintainer merge request while
  keeping its safeguards; the baseline spec remains unchanged.
- `003-agent-workflow` — modified: operational guidance across the four agent
  roles was reviewed/aligned with the concise constitutional policy; the Dev Lead
  now requests maintainer merge after push, and QA may update only evidenced
  acceptance checkboxes in its assigned current spec. Existing role restrictions
  remain.
- `004-portfolio-home` — modified: relocated its floating navigator, navigation
  helper, content utilities, and schemas, with imports updated. No 004 behavior or
  requirement changed; its summary was updated and its historical `spec.md` was
  preserved.
- `007-workflow-changes` — modified: aligns the agents' tool-level edit
  permissions with their established Dev/QA roles, including QA's narrow
  acceptance-checkbox permission, and makes the post-push maintainer merge request
  explicit in the constitutional workflow. Role boundaries, shared-branch rules,
  and commit/push authority remain unchanged; its summary was updated and its
  historical `spec.md` was preserved.
