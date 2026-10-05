# Company icon schema fixture evidence

Date: 2026-10-05  
Scope: Update only `tests/unit/content.test.ts` to provide the newly required
company icon in valid experience data, preserving each invalid sample's intended
validation failure. No production files, task checklist, or spec requirements
were changed.

## Test data changed

- Added the approved provisional Astro icon (`/images/companies/astro.svg`,
  `Icono provisional de Astro para Empresa de ejemplo`) to both approved parsed
  experience samples and the valid open-role sample.
- Added the same valid icon to the deliberately invalid role, missing-start-date,
  and reversed-date samples. They therefore continue testing their named invalid
  fields/ranges rather than failing because the required icon is absent.

## Commands and results

- `pnpm astro sync` — **PASS**, exit 0; Astro synced content and generated types.
- `pnpm exec vitest run tests/unit/content.test.ts` — **PASS**, exit 0; 1 file,
  8 tests.
- `pnpm exec eslint tests/unit/content.test.ts` — **PASS**, exit 0.
- `pnpm exec prettier --check tests/unit/content.test.ts` — **PASS**, exit 0.

## Generated collection data follow-up

`astro sync` did not refresh the parsed experience records used by page rendering:
after sync, `.astro/data-store.json` still has `companyIcon` in each entry's
frontmatter metadata but omits it from the cached parsed `data` object. Thus sync
alone does not clear the previously reported `companyIcon`-undefined rendering
failure. A build was not run because QA browser verification is in progress; the
collection-backed page integration checks and any required build/cache refresh
remain for T7 QA/Lead to resolve once browser verification is clear.

## Gate applicability

- Unit/schema tests apply and were run as recorded above.
- Lint and formatting were run on the changed test file and passed.
- SEO and accessibility do not apply to this test-fixture-only correction; no
  rendered markup changed.
- Build and the full unit/accessibility suites were not run in this bounded task,
  to avoid running a build/full suite concurrently with the QA browser session.
  The collection-backed integration blocker above remains explicitly open.
