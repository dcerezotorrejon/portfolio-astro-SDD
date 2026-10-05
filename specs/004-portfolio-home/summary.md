# Summary — Portfolio home

- **Spec ID**: `004-portfolio-home`
- **Status**: done
- **Last updated**: 2026-10-05

## Files changed

- `src/content.config.ts`, `src/content/profile/profile.md`,
  `src/content/experience/*.md` — schema-validated Markdown profile, page metadata,
  navigation labels and two explicitly provisional employment entries.
- `src/lib/content-schema.ts`, `src/lib/content.ts` — schemas, newest-first sorting,
  Spanish date ranges, duplicate-slug rejection and validated company-icon resolver.
- `src/styles/global.css` — shared design tokens organized in primitive, semantic
  and component layers, plus responsive containers/cards, local font face,
  proximity snap, native MPA transitions, focus clearance and accessible
  primary-button colors.
- `public/fonts/open-sans-latin.woff2`, `public/fonts/OFL.txt` — self-hosted Open
  Sans and its distributed license.
- `public/images/profile-placeholder.svg`, `public/images/companies/astro.svg` —
  neutral profile placeholder and provisional company icon.
- `src/layouts/SiteLayout.astro` — shared Spanish HTML/metadata shell.
- `src/components/ProfileIntroduction.astro`, `ExperienceHistory.astro`,
  `TechnologyBadges.astro` — static, content-driven presentation.
- `src/components/FloatingNav.tsx`, `src/lib/navigation.ts` — the only hydrated
  React island, tracking section positions and keeping keyboard focus unobscured.
- `src/pages/index.astro`, `src/pages/experiencia/[slug].astro` — homepage and two
  generated detail pages, with all detail content inside one rounded card.
- `tests/unit/{home,experience,content,navigation,design-assets,company-icon,
transitions,button-design,section-headings}.test.ts`,
  `tests/unit/floating-nav.test.tsx`, `tests/unit/floating-nav-threshold.test.tsx`
  — QA-owned content, asset, style-contract, rendering and interactive-state checks.
- `tests/helpers/css-tokens.ts` — recursive custom-property resolver used by the
  style-contract tests.
- `tests/fixtures/heading-fixture.{md,astro}` — test-only Markdown heading fixture.
- `tests/seo/{home,experience}.test.ts`, `tests/a11y/{experience,floating-nav}.test.ts`
  — page metadata, sitemap/build output and axe coverage. Existing home/React axe
  suites remain part of verification.
- `tests/unit/agents.test.ts` — constitutional version/design consistency; later
  Auto Router expectations are maintained under related spec 005.
- `docs/constitution.md`, `docs/design.md`, `AGENTS.md` — explicit React island
  permission, constitutional global-design reference and shared design document.
- Related summaries under specs 001–003 — relationship maintenance.
- `specs/004-portfolio-home/*` — living requirements, plan, tasks and QA evidence.

## Functions / components changed

- `profileSchema`, `experienceSchema`, `companyIconSchema` — validated content.
- `sortExperiences()`, `formatDateRange()`, `assertUniqueExperienceSlugs()` — content
  ordering, date display and collision prevention.
- `resolveCompanyIcon()` — validates normalized icon data or the same Markdown
  entry's rendered-frontmatter metadata when Astro's persisted store omits it.
  A present but invalid normalized value is rejected rather than overridden.
- `getActiveSectionIndex()` / `FloatingNav` — select the last DOM-order section
  whose top reaches the 16 px inset (1 px tolerance), reverse on upward scroll, and
  expose the current section via `aria-current="location"`. The island also hides
  itself while a keyboard-focused main control would be obscured. Only the
  navigator is hydrated; all content remains static.
- `SiteLayout`, `ProfileIntroduction`, `ExperienceHistory`, `TechnologyBadges` —
  static presentation; employment detail `getStaticPaths()` generates routes.

## Verification status

- Final integrated QA on the latest source (`evidence-final2.md`): all five
  constitutional gates pass — lint, format, build (three routes + sitemap),
  `pnpm test:run` (19 files / 118 tests) and `pnpm test:a11y` (4 files / 5 tests).
- Browser: active navigator label white on `#0C7ABF` and inactive dark ink, with
  the indicator settling exactly on the active link in both directions; section
  headings computed at 24/32 px, weight 700, line-height 1.25, 24 px gap with no
  overflow; real native full-card transitions sampled at 200 ms both directions;
  reduced motion disables transition animation while navigation still works. MCP
  axe reported 0 violations on all three routes.
- Unchanged areas (six-width layout, fonts/fallback, company icons, JS-disabled
  navigation, SEO/sitemap, focus clearance, anchor inset, unsupported-transition
  fallback) are cited as reused from their recorded source state.
- Earlier bounded scopes: T7b icon fallback (32 tests + a11y), T8 threshold
  selection (23 navigation tests + axe), T9 button contrast, T10 token refactor
  with zero computed-style differences.

## Models

Initial implementation/QA tasks used their configured Luna medium defaults.
Later assignments used the current Auto Router medium default without model
reference overrides; the router's chosen concrete model is not inferred when
unreported. Evidence files record model claims and exact command results.

## Related specs

- `001-sdd-baseline` — modified: replaces the starter homepage and its smoke
  expectations; preserves the test/build/SEO/accessibility stack and site origin.
- `002-front-extra-dependencies` — depends on: uses Tailwind v4 and React only for
  an explicit `client:load` island. Constitution versions 1.2.1/1.3.0 clarify the
  island policy and reference global design without changing approved tooling.
- `003-agent-workflow` — depends on: follows Dev/QA handoffs and evidence rules;
  updates governance consistency checks and related-summary bookkeeping.
- `005-auto-router-agents` — concurrent configuration: owns the current agent
  router/model variant setup. Portfolio work does not change that configuration.

## Notes and remaining limits

- Content and imagery are deliberately provisional; employer labels must not imply
  the sample employment is with Astro.
- `https://example.com` remains the configured site origin; no production-domain
  or deployment decision is included.
- Unsupported transition behavior was emulated in a supporting Chromium browser;
  physical nonzero safe-area insets were not independently measured.
- The maintainer explicitly deferred updating the agent-model cost paragraph in
  `AGENTS.md`; it still describes the original model tiers. Current agent routing
  is documented by spec 005. This documentation discrepancy remains visible.
- All constitutional gates pass and this spec is closed; changes are not yet
  committed.
