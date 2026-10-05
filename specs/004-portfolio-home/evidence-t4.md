# T4 QA evidence — Homepage and shared layout

- **Date:** 2026-10-05
- **Scope:** `src/layouts/SiteLayout.astro`, homepage, static profile/history
  components and their render contracts (R1–R8); verifies the homepage's page
  metadata and accessible rendered structure. `AGENTS.md` was checked for its
  shared-design reference. No separate T4 Dev report was present in the spec
  artifacts; verification was performed against the supplied handoff and current
  source.
- **Browser evidence:** Responsive measurements/screenshots, JavaScript-disabled
  browser review and manual keyboard/focus inspection were not run in this bounded
  task. Per the handoff, those checks are deferred to final T6 integration; the
  HTML-level assertions and axe test below do not establish responsive or visual
  conformance.

## Tests added or updated

- `tests/unit/home.test.ts`: replaced the Astro starter-heading expectation with
  rendered assertions for the approved profile name/headline/notice and local
  image attributes; exact GitHub/LinkedIn labels and destinations with hidden
  icons and same-tab behavior; the sole `h1`, history heading, both complete cards,
  newest-first route order, exact dates/summary/link names and technologies; section
  order; and a single `client:load` Astro island for `FloatingNav`. Rendering uses
  the real Astro page and Markdown content collections, not test-only content
  fixtures.
- `tests/seo/home.test.ts`: strengthened rendered HTML checks for `lang="es"`,
  the exact approved title and description, exactly one description meta element,
  and exactly one canonical URL (`https://example.com/`).
- `tests/a11y/home.test.ts`: existing axe-core check was retained and exercised on
  the full rendered homepage; it reported no violations.
- `tests/helpers/render.ts`: unchanged; the existing Astro Container renderer
  successfully loads the production page and collections.

## Gate evidence

- **Lint:** `pnpm lint` — passed (exit 0).
- **Format:** `pnpm format:check` — failed (exit 1). After formatting the QA-owned
  tests, Prettier still reports nine non-QA-owned files: `src/components/ExperienceHistory.astro`,
  `src/components/FloatingNav.tsx`, `src/components/TechnologyBadges.astro`,
  `src/content.config.ts`, `src/content/experience/puesto-ejemplo-2022.md`,
  `src/content/experience/puesto-ejemplo-2024.md`, `src/lib/content-schema.ts`,
  `src/lib/content.ts`, and `src/pages/index.astro`. The T4-owned files needing
  Dev formatting include `ExperienceHistory.astro:22`, `TechnologyBadges.astro:10`,
  and `index.astro:10,18`. QA did not edit production code. A scoped check of the
  QA-owned homepage test files passed: `pnpm exec prettier --check
tests/unit/home.test.ts tests/seo/home.test.ts tests/a11y/home.test.ts`.
- **Build:** `pnpm build` — passed; Astro built three routes and generated the
  sitemap (`dist/sitemap-index.xml`).
- **Unit/rendered SEO:** `pnpm test:run` — passed, 11 files / 58 tests.
- **Accessibility:** `pnpm test:a11y` — passed, 3 files / 3 tests, including the
  homepage axe test.
- **Task status:** T4 remains incomplete because the repository format gate fails.
  Re-run all gates after Dev formats the reported source files. SEO and
  accessibility apply and were tested; neither was treated as N/A.
