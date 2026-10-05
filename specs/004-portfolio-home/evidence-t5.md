# T5 QA evidence — Static employment detail pages

Date: 2026-10-05

## Tests added

- `tests/unit/experience.test.ts`: renders each approved detail route using the
  real Astro experience/profile collections and Container API. Checks matching
  slug, role, company, Spanish date range, collection technologies, expanded
  Markdown, provisional notice, return link, one `h1`, and absence of the
  homepage floating navigator and hydrated islands. Also checks duplicate-slug
  rejection using real collection data with distinct IDs.
- `tests/seo/experience.test.ts`: checks Spanish language, exact per-entry title,
  expanded-content description, and unique canonical URL on rendered HTML. When
  build output is available, also checks both generated route files, their
  metadata/canonical and static markup, and inclusion of both routes in the
  generated sitemap.
- `tests/a11y/experience.test.ts`: runs axe-core against both rendered detail
  pages.

## Commands and results

- `pnpm build` — **PASS**; generated
  `/experiencia/puesto-ejemplo-2022/`, `/experiencia/puesto-ejemplo-2024/`,
  `/`, and `dist/sitemap-0.xml` (three pages built).
- `pnpm exec vitest run tests/unit/experience.test.ts tests/seo/experience.test.ts tests/a11y/experience.test.ts`
  — **PASS**, 3 files / 8 tests.
- `pnpm lint` — **PASS**.
- `pnpm format:check` — **PASS**.
- `pnpm test:run` — **PASS**, 14 files / 66 tests.
- `pnpm test:a11y` — **PASS**, 4 files / 5 tests.

SEO, sitemap, and accessibility gates apply to these markup-producing routes and
were exercised; no gate was marked not applicable. The SEO Container render passes
the route URL explicitly so the canonical assertion represents the detail path,
and the build-output assertion independently verifies directly generated files.

## Defects

No T5 production defects found.
