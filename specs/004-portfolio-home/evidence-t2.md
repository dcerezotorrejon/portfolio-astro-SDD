# T2 QA evidence — styles and local assets

- **Task**: T2 (R1, R3, R7, R12)
- **Date**: 2026-10-05
- **QA model**: configured default, `openrouter/openai/gpt-6-luna#medium`

## Tests added

Added `tests/unit/design-assets.test.ts` with eight unit checks covering:

- WOFF2 signature and header length/table metadata.
- The Open Sans SIL Open Font License and redistribution notice.
- Local-only Open Sans source, variable weight range, `font-display: swap`,
  system sans-serif fallback, and declared Latin glyph range.
- A square, self-contained SVG placeholder without external assets.
- Design color tokens and CSS contracts for the container, responsive profile
  image, snap behavior, floating navigation safe area/indicator, touch targets,
  and reduced-motion styles.

These are source/asset contract checks. They do **not** establish computed styles,
actual viewport dimensions, visual contrast, browser font loading, or network
privacy; those browser checks are deferred to T4 integration as planned.

## Commands and results

| Command                                                       | Result                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec vitest run tests/unit/design-assets.test.ts`       | **PASS** — 1 file, 8 tests.                                                                                                                                                                                                                                         |
| `pnpm exec eslint tests/unit/design-assets.test.ts`           | **PASS**.                                                                                                                                                                                                                                                           |
| `pnpm exec prettier --check tests/unit/design-assets.test.ts` | **PASS**.                                                                                                                                                                                                                                                           |
| `pnpm lint`                                                   | **PASS**.                                                                                                                                                                                                                                                           |
| `pnpm format:check`                                           | **FAIL** — Prettier reports 14 files, including `src/styles/global.css`; T2 CSS needs a line-wrap adjustment at `src/styles/global.css:10-12`. The other reported files are outside T2. No production files were formatted or changed by QA.                        |
| `pnpm build`                                                  | **PASS** — Astro build completed and generated the sitemap index; one page was built in the current integration state.                                                                                                                                              |
| `pnpm test:run`                                               | **FAIL / integration blocker** — 51 passed, 4 failed. Home unit/SEO tests error while rendering because `src/pages/index.astro:9-10` throws that the `profile/profile` entry is missing. This is outside T2; no production or other test/helper files were changed. |
| `pnpm test:a11y`                                              | **FAIL / same integration blocker** — home axe test cannot render for the missing `profile/profile` entry at `src/pages/index.astro:9-10`.                                                                                                                          |

## Gate applicability and evidence limits

- **Unit**: applicable; the new targeted asset/style suite passes (8/8).
- **SEO**: not applicable to T2's global styles and static assets; rendered-page
  SEO coverage belongs to T4/T5. Full suite was attempted and is blocked by the
  current homepage content-entry rendering failure above.
- **Accessibility**: no page markup or interactive component is owned by T2.
  Source checks cover touch-target and focus/reduced-motion CSS contracts, but
  rendered axe and keyboard checks belong to T4/T5. The required full a11y command
  was attempted and is blocked by the same homepage rendering failure.
- **Browser visual/font checks**: deferred to T4 integration as specified in the
  task plan. In particular, no browser evidence is claimed for contrast,
  responsive measurements, computed styles, same-origin font requests, Spanish
  glyph rendering, or fallback behavior.

## Findings

1. **T2 formatting defect**: `pnpm format:check` includes
   `src/styles/global.css:10-12`, where Prettier expects the `unicode-range`
   declaration reflowed. Left unchanged because QA must not edit production code.
2. **Non-T2 integration blocker**: page-rendering tests (including `tests/unit/home.test.ts`,
   `tests/seo/home.test.ts`, and `tests/a11y/home.test.ts`) cannot resolve the
   `profile/profile` content entry when rendering `src/pages/index.astro:9-10`.
   The full suite and accessibility gate therefore remain blocked; this requires
   Dev/Lead investigation outside T2.

**T2 status**: asset/style checks pass. Do not mark the task fully verified until
the T2 CSS formatting issue and the integration gate blockers are resolved, and
the deferred T4 browser evidence is recorded.
