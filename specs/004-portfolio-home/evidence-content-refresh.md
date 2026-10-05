# T7 content refresh follow-up evidence

- **Task:** T7 (R6, R9, R14; AC5, AC6, AC10, AC15)
- **Date:** 2026-10-05
- **QA model:** configured default; no override.
- **Scope:** Follow up the collection-data blocker after the source schema and
  both experience Markdown files were updated. No production files or tests were
  edited in this follow-up; the only owned change is this evidence file.
- **Browser:** No browser tools were used; existing QA6 browser evidence remains
  untouched.

## Findings

The source is internally consistent: `src/lib/content-schema.ts:65-68` requires
`companyIcon.src` and `.alt`, and both experience Markdown files provide them
(`src/content/experience/puesto-ejemplo-2022.md:5-7` and
`src/content/experience/puesto-ejemplo-2024.md:5-7`).

`pnpm build` completed successfully and generated all three routes and the
sitemap. Inspection of the generated `.astro/data-store.json` after that build
still found the following normalized experience `data` keys:

```text
puesto-ejemplo-2022: slug, role, company, startDate, endDate, summary,
  technologies, seo
puesto-ejemplo-2024: slug, role, company, startDate, summary, technologies, seo
```

Neither normalized `data` object contains `companyIcon`, even though the same
records' serialized rendered-frontmatter metadata contains the `companyIcon`
object. Thus the requested refresh did not fix the persisted normalized store.

There is a runtime split worth preserving in the diagnosis: the successful build
output itself does contain the right image markup. A post-build HTML assertion
checked `dist/index.html` (two icons) and both detail route HTML files (one icon
each); every icon had `/images/companies/astro.svg`, the approved non-empty
provisional alt text, and the adjacent `Empresa de ejemplo` label. In contrast,
the Vitest Astro Container collection-backed renders still receive entries without
`data.companyIcon` and throw before those same assertions can run. This isolates
the remaining blocker to the persisted collection data as consumed by the test
runtime, rather than missing source frontmatter or the production build output.

The full suite also exposed a separate stale transition assertion:
`tests/unit/transitions.test.ts:63-73` still looks for the transition identity on
`.experience-detail-header`. The implementation assigns the identity to the outer
`article.experience-detail-card` at `src/pages/experiencia/[slug].astro:47-50`.
No test was edited under this follow-up. The updated agent-model and content
fixture tests pass in isolation (27 tests total).

## Commands and results (exact run order)

1. `pnpm build` — **PASS**, exit 0; Astro generated three pages and
   `sitemap-index.xml`.
2. Read-only Node inspection of `.astro/data-store.json` normalized collection
   records — **BLOCKED**, process exit 0; inspection confirmed `companyIcon` is
   absent from both normalized `data` objects (details above). This is an
   observation, not a passing acceptance check.
3. `pnpm exec vitest run tests/unit/company-icon.test.ts tests/unit/home.test.ts tests/unit/experience.test.ts tests/unit/transitions.test.ts tests/seo/home.test.ts tests/seo/experience.test.ts tests/a11y/home.test.ts tests/a11y/experience.test.ts` — **FAIL**, exit 1; 8 files failed, 15 tests failed and 7 passed. Homepage/detail rendering, SEO, and axe tests fail before their assertions because `companyIcon` is undefined. The transition pairing test independently fails because it checks the header rather than the outer detail card.
4. `pnpm test:run` — **FAIL**, exit 1; 16 files, 8 failed and 8 passed; 15 tests failed and 58 passed (73 total). Failures have the same rendering and transition causes.
5. `pnpm test:a11y` — **FAIL**, exit 1; 4 files, 2 failed and 2 passed; 3 tests failed and 2 passed. All three failing axe tests stop during rendering on missing `companyIcon`, before axe can evaluate the markup.
6. `pnpm lint` — **PASS**, exit 0.
7. `pnpm format:check` — **PASS**, exit 0; all matched files are formatted.
8. In parallel: `pnpm exec vitest run tests/unit/agents.test.ts tests/unit/content.test.ts` — **PASS**, exit 0; 2 files, 27 tests passed. A read-only Node/JSDOM check of the three built HTML routes — **PASS**, exit 0; homepage 2/2 icons and each detail page 1/1 icon passed expected local path, alt, and adjacent company-name assertions.
9. `pnpm format:check` — **PASS**, exit 0; rerun after writing this evidence
   file, so the final repository format gate includes the QA artifact.
10. `pnpm exec prettier --check specs/004-portfolio-home/evidence-content-refresh.md`
    — **PASS**, exit 0; checked the final evidence file after its command log was
    updated. The repository-wide `pnpm format:check` passed at step 9.

## Gate status and applicability

- **Unit / component:** Applicable; **FAIL**. Collection-backed rendering cannot
  verify the icon contract in Vitest because the icon is missing at runtime. The
  agent-model and content-fixture tests pass as noted above.
- **SEO:** Applicable; **FAIL / not verified**. Rendered SEO tests were run but
  fail before title, description, and canonical assertions due to the same page
  render exception. Build route generation alone does not replace those tests.
- **Accessibility:** Applicable; **FAIL / not verified**. Axe tests were run but
  fail before axe executes, due to the collection render exception. Built-image
  attributes were checked, but this is not an axe result.
- **Build:** Applicable; **PASS**. Three routes and sitemap were generated. Built
  output HTML includes all four expected company images and attributes.
- **Lint:** Applicable; **PASS**.
- **Format:** Applicable; **PASS**.
- **Responsive/manual browser inspection:** Applicable to AC15; **not run** in
  this follow-up, per instruction not to use the active QA6 browser. Build/HTML
  checks do not establish rendered dimensions, aspect ratio, or overflow.

## Defects returned to the Lead / Dev

1. **Vitest collection runtime still omits normalized `companyIcon`.** After a
   successful build, the normalized entries in `.astro/data-store.json` omit the
   property while the stored frontmatter metadata has it. The same Vitest
   Container render then fails at `src/components/ExperienceHistory.astro:43`
   and `src/pages/experiencia/[slug].astro:57` (`companyIcon` is undefined).
   Production build HTML does include the expected images, so the discrepancy is
   specifically between generated build output and the content data consumed by
   the Container test runtime. T7 remains blocked until the test runtime sees the
   validated field and the real-collection rendering, SEO, and axe checks pass.
2. **Transition test still asserts the former identity location.**
   `tests/unit/transitions.test.ts:63-73` expects the identity on the detail
   header, but the page assigns it to the outer article at
   `src/pages/experiencia/[slug].astro:47-50`. The transition unit currently
   fails independently of the icon-render failures.

No production or test code was changed. Do not mark T7 complete or claim SEO/a11y
verification from this run. Browser sizing/wrapping evidence remains open.
