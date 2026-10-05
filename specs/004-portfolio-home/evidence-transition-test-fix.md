# Transition test reconciliation evidence

Date: 2026-10-05  
QA model: configured default; no override.

## Scope

Resolved the stale T5a transition assertion in
`tests/unit/transitions.test.ts`. The detail route assigns its unique
`view-transition-name` and `data-experience-slug` to the outer
`.experience-detail-card` article, not its header. No production source, spec,
task checklist, or other test file was changed.

## Tests changed

- Reworked the pairing test to match each overview card to its detail article
  using the experience slug, and verify that both have the same slug-specific
  transition name.
- Asserted that the detail article is the sole owner of the transition name and
  slug on its page, and that the header does not duplicate either identity.
- Retained the native MPA navigation/reduced-motion and same-tab anchor tests.

## Commands and results

- Initial post-change run: `pnpm exec vitest run tests/unit/transitions.test.ts`
  — **PASS**, exit 0; 1 file / 3 tests.
- Initial post-change run: `pnpm test:run` — **FAIL**, exit 1; 14 of 15 files
  and 68 of 69 tests passed. The stale transition assertion passed; the only
  failure was the unrelated `tests/unit/agents.test.ts:142` expectation of
  `openrouter/openai/gpt-6.1-sol#medium` versus the configured
  `spec-refiner` model `openrouter/openai/gpt-6.1-luna#medium`.
- Later workspace rerun: `pnpm exec vitest run tests/unit/transitions.test.ts`
  — **FAIL**, exit 1; 2 of 3 tests fail during component rendering, before the
  transition assertions execute. The current `ExperienceHistory.astro` reads
  `companyIcon.src` at line 43, but the collection data is undefined there.
- Later workspace rerun: `pnpm test:run` — **FAIL**, exit 1; 9 of 15 files
  and 18 of 69 tests fail. Failures include that same missing `companyIcon`
  runtime value (`src/components/ExperienceHistory.astro:43` and
  `src/pages/experiencia/[slug].astro:57`), incomplete company-icon schema test
  data (`tests/unit/content.test.ts:61`), and the agent model expectation
  mismatch (`tests/unit/agents.test.ts:142`). The transition test's assertions
  are not reached in the later run.

## Gate applicability

- Unit tests apply and were run as recorded above.
- SEO, accessibility, lint, format, and build gates are not applicable to this
  test-only correction; no rendered production markup or implementation changed
  by this task. The later full unit-suite run did include the SEO/a11y test files,
  which were among the failures blocked by the rendering error above. Standalone
  `pnpm test:a11y`, lint, format, and build commands were not run as part of this
  bounded task. Existing T5a rendered SEO/a11y/build evidence remains in
  [`evidence-t5a.md`](./evidence-t5a.md).

## Defects / remaining blocker

- The stale T5a transition-test contract is corrected.
- The later full-suite failure includes unrelated content/icon and agent-model
  mismatches noted above. Production files, content/schema tests, and agent tests
  were left unchanged because this task is limited to the T5a transition test.
