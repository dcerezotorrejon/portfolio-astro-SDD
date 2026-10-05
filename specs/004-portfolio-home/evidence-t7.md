# T7 QA evidence — Local company icons

- **Task:** T7 (R6, R9, R14; AC5, AC6, AC10, AC15)
- **Date:** 2026-10-05
- **QA model:** GPT-6 Luna (`openrouter/openai/gpt-6-luna`), configured default;
  no override.
- **Dev report reviewed:** `companyIcon` path/alt added to the experience schema
  and both Markdown entries; overview and detail views render the icon from entry
  data at 40 × 40 with `object-fit: contain`; local Astro SVG added.

## Tests added

Added `tests/unit/company-icon.test.ts` with four checks:

1. Render the real homepage and each detail page from the experience collection;
   verify both Markdown-provided image paths/alts match, sit alongside the exact
   visible `Empresa de ejemplo` label, have explicit 40 × 40 attributes, and are
   inside the detail card with its expanded description.
2. Replace the icon path and alt on an actual collection entry and render the
   overview component and detail page, checking that the replacement flows without
   editing either component.
3. Verify the schema accepts the approved and replacement local SVG paths and
   rejects remote/protocol URLs, traversal, other locations/formats, query strings,
   and missing or blank alt text.
4. Parse the local Astro SVG and check its `viewBox`/artwork and the CSS contract
   for 40 × 40 sizing, fixed flex basis, `object-fit: contain`, and aligned company
   identity.

The CSS assertions are stylesheet-contract checks only; they do **not** prove
computed browser dimensions, rendered aspect ratio, or absence of viewport
overflow. The existing homepage and detail axe suites were included in the
rendered smoke run; the `companyIcon` runtime failure prevented axe from reaching
its assertions.

## Commands and results

- `pnpm exec prettier --write tests/unit/company-icon.test.ts` — **PASS**, formatted
  the new test.
- `pnpm exec vitest run tests/unit/company-icon.test.ts -t 'allows a replacement|rejects remote|ships a parseable'` — **PASS**, 1 file; 3 passed,
  1 skipped.
- `pnpm exec vitest run tests/unit/company-icon.test.ts` — **FAIL**, 1 file; 3
  passed, 1 failed. Real collection-backed rendering fails because the collection
  data has no `companyIcon`.
- `pnpm exec vitest run tests/unit/company-icon.test.ts tests/unit/home.test.ts tests/unit/experience.test.ts tests/seo/home.test.ts tests/seo/experience.test.ts tests/a11y/home.test.ts tests/a11y/experience.test.ts` — **FAIL**, 7 files; 14 failed and 5 passed. Homepage and detail render tests (including SEO and axe suites) fail before their assertions with the same missing `companyIcon` runtime value.
- `pnpm exec eslint tests/unit/company-icon.test.ts` — **PASS**, exit 0.
- `pnpm exec prettier --check tests/unit/company-icon.test.ts` — **PASS**, all
  matched files use Prettier style.
- `pnpm exec astro sync` — **PASS**, sync completed; the collection data returned
  to Vitest still lacked the icon.

## Defect / blocker returned to Dev Lead

- **Collection-backed company icon data is absent at runtime.** Both Markdown files
  contain the expected `companyIcon` frontmatter, and Astro's generated experience
  JSON schema lists the field as required, but `getCollection("experience")`
  returned entries without `data.companyIcon` in this QA run. Rendering then throws
  at `src/components/ExperienceHistory.astro:43` (`companyIcon.src`); the detail
  render independently throws at `src/pages/experiencia/[slug].astro:57`. This
  blocks the rendered-content verification and causes existing homepage/detail
  unit, SEO, and axe tests to fail before their own assertions. The generated
  `.astro/data-store.json` appears to contain stale parsed collection data; this
  diagnosis is not yet confirmed by a clean build, which was deferred under the
  assigned QA constraints. Please refresh/rebuild the content collection state and
  return the task for the full real-collection render, SEO, and axe checks.

## Gate applicability and remaining evidence

- **Unit tests:** Applicable and run. Schema, replacement-propagation (using an
  actual collection entry with the replacement value), local SVG, and CSS contract
  checks pass. Real collection-backed homepage/detail icon checks are blocked as
  recorded above.
- **SEO:** Applicable to the rendered homepage and detail routes; home and detail
  SEO tests were run but fail before metadata assertions because page rendering
  hits the same missing icon value. SEO is **not verified** by this run.
- **Accessibility:** Applicable because the image markup changes accessible names.
  Homepage and both detail axe tests were run but fail before axe executes, due to
  the same render exception. Axe accessibility is **not verified** by this run.
- **Lint / format:** Scoped checks on the owned test file pass. Repository-wide
  `pnpm lint` and `pnpm format:check` were not run because QA6 browser work is
  concurrent; they remain integration gates.
- **Build:** `pnpm build` was not run under the assigned constraint to avoid the
  concurrent QA6 browser work; build verification remains pending.
- **Responsive/manual browser evidence:** Not run here. The CSS contract test is
  not a substitute for browser inspection of position, aspect ratio, breakpoints,
  or overflow. No browser-responsiveness claim is made.
- QA made no production edits and did not modify `tasks.md`, other tests, or the
  spec. T7 and AC5/AC6/AC10/AC15 remain pending until the collection runtime issue
  is resolved and applicable render/SEO/a11y evidence passes.
