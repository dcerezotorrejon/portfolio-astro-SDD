# T5a QA evidence — Single employment detail card

Date: 2026-10-05  
QA model: GPT-6 Luna (`openrouter/openai/gpt-6-luna`), configured default; no override.

## Tests added/updated

- Updated `tests/unit/experience.test.ts` for both approved detail entries. The
  Astro Container-rendered markup must have exactly one `.experience-card`,
  which is the outer `article.experience-card.experience-detail-card`. The test
  verifies that its header and body share that card; the header is not itself a
  card; and the body contains the technology badges, expanded Markdown,
  provisional notice, and return link. It also verifies that the article (not
  the header) owns the slug-specific `view-transition-name` and
  `data-experience-slug`.
- Existing rendered SEO tests check each detail title, description, canonical
  URL, built route, and sitemap entry. Existing axe tests run against both
  rendered detail pages.

## Commands and results

- `pnpm build` — **PASS**, exit 0; generated the homepage, both detail routes,
  and sitemap. Run twice; both runs passed.
- `pnpm exec vitest run tests/unit/experience.test.ts tests/seo/experience.test.ts tests/a11y/experience.test.ts`
  — **PASS**, exit 0; 3 files / 8 tests. The final run included the built-route
  and sitemap checks.
- `pnpm lint` — **PASS**, exit 0.
- `pnpm format:check` — initial run **FAIL**, exit 1, because the new test file
  needed formatting; after formatting that QA-owned test file, **PASS**, exit 0.
- `pnpm test:run` — **FAIL**, exit 1; 14 of 15 files and 68 of 69 tests passed.
  The existing transition contract at `tests/unit/transitions.test.ts:50-51`
  still expects the detail header to own `viewTransitionName` and
  `data-experience-slug`. T5a now assigns both the transition identity and slug
  to the outer card as required. This conflicting T6 test was not weakened or
  edited; it needs reconciliation by the transition-test owner.
- `pnpm test:a11y` — **PASS**, exit 0; 4 files / 5 tests, including axe checks on
  both detail routes.

## Gate applicability and remaining evidence

Unit/component, SEO, accessibility, lint, format, and build gates apply and were
run as above. Automated a11y passed. Responsive visual inspection and browser
transition pairing were not repeated here: T6's browser work is in progress,
and the Lead delegated the post-composition visual/transition recheck to its T6
follow-up. No browser was opened concurrently with that work.

## Defects / blockers

- No T5a production defect found by rendered structural, SEO, build, or axe
  checks.
- Full unit suite is blocked by the contradictory transition assertions at
  `tests/unit/transitions.test.ts:50-51`; see the command result above. No
  production source or T6-owned test file was changed.
