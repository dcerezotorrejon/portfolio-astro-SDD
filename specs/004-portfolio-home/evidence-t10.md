# T10 evidence — primitive / semantic / component token refactor, no presentation change

- **Spec**: `004-portfolio-home` (R15, AC16)
- **Scope verified**: `src/styles/global.css` only (dev refactor completed before this
  verification; QA did not modify production code).
- **Baseline**: `/tmp/opencode/spec004-before-token-refactor.css`, saved before the
  refactor.
- **Model**: Auto Router (`openrouter/auto`), medium reasoning effort.
- **Date**: 2026-10-05.

## What was verified

1. The three token layers exist and every public `--color-*` name resolves through
   aliases to an approved primitive:
   primitive `--palette-*` → semantic `--color-*`/`--content-width`/`--page-gutter`/
   `--control-transition-duration` → component `--card-*`/`--badge-*`/`--button-*`/
   `--nav-*`/`--profile-*`.
2. No missing tokens, no cycles, and no orphan palette primitives.
3. Source declarations use component/semantic tokens, but resolve to the exact values
   of the pre-refactor baseline.
4. Computed styles in a real browser are identical before vs after on all three
   routes, mobile 375×812 and desktop 1440×900, in normal / hover / active /
   focus-visible / reduced-motion states.
5. Accessibility (axe) is unchanged.

## Test changes (QA-owned files)

- **Added `tests/helpers/css-tokens.ts`**: a small CSS custom-property engine that
  parses `:root` declarations (base and media-query overrides, comment-safe) and
  recursively resolves `var()` chains. Resolution **throws** on cycles and on missing
  tokens without a fallback; `normalizeSpaces`, `resolveToken`,
  `resolveDeclaration` and `resolveMediaToken` are exported.
- **`tests/unit/design-assets.test.ts`**: replaced the fragile literal hex/regex
  assertions with recursive resolution to the approved values (e.g.
  `--color-ink` → `#0f1419`, `--page-gutter` → `16px`, 768 px override → `32px`,
  `--control-transition-duration` → `200ms`), resolved geometry
  (`.site-container` → `min(1120px, calc(100% - 2 * 16px))`, profile image
  `min(200px, 100%)` / radius `24px`, nav width `min(360px, calc(100% - 2 * 16px))`,
  `bottom: calc(16px + env(safe-area-inset-bottom, 0px))`, control targets `44px`,
  icon `0 0 40px`). Added orphan-palette detection and helper self-tests for
  multi-level chains, cycles and missing/fallback tokens (non-tautological: they
  exercise the detection logic with synthetic CSS).
- **`tests/unit/button-design.test.ts`**: the button now consumes component tokens;
  assertions now prove the chain resolves (`--button-background` → `--color-button`
  → `--palette-action-blue` → `#0c7abf`; hover `#096aa7`; active `#075985`; label
  `#ffffff`; nav/badge tokens → `#0f1419` / `#1d9bf0`). Rendered primary-action and
  contrast tests were preserved unchanged.
- **`tests/unit/company-icon.test.ts`**: icon geometry now asserts the resolved
  `--space-40` → `40px` (`width`/`height`/`flex: 0 0 40px`) instead of pinning a
  literal; all runtime helper, schema, rendered and SVG assertions preserved.

## Commands run

| Command                                                                                                             | Result                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm vitest run tests/unit/design-assets.test.ts tests/unit/button-design.test.ts tests/unit/company-icon.test.ts` | **27 passed / 3 files**                                                                                                                                           |
| `pnpm lint`                                                                                                         | **pass** (eslint clean)                                                                                                                                           |
| `pnpm format:check`                                                                                                 | fail **only** on pre-existing `specs/004-portfolio-home/evidence-t8.md` (owned by the ongoing T8 QA). The four QA-touched files were prettier-formatted and pass. |
| `pnpm test:a11y`                                                                                                    | not run; superseded by live axe audits below (see Gate status).                                                                                                   |

## Browser evidence — before/after computed-style equivalence

Method: on each route the page's current CSS was captured live; then the raw baseline
CSS was fetched (served read-only from `/tmp/opencode/spec004-before-token-refactor.css`
via a local CORS server) and injected as a `<style>` **after** the current styles to
represent "before". `@import "tailwindcss"` is stripped from the injected copy so the
page's compiled Tailwind base stays the common source of truth; `@font-face` is also
stripped from injected copies to avoid a synthetic font-swap re-layout (already-loaded
Open Sans was confirmed via `document.fonts.check`). Hover/active/focus-visible rules
were exercised by mechanically rewriting `:hover`/`:active`/`:focus-visible` to
injected QA classes, and the reduced-motion media query was evaluated by rewriting its
header to `@media all`. Computed properties compared: color, background-color, borders,
radii, padding, font family/size/weight/line-height/letter-spacing, transition
property/duration/timing, outline color/style/width/offset, text-decoration-thickness,
box-shadow, width/height/min-width/min-height, transform, opacity, scroll-behavior,
scroll-snap-type, scroll-padding-top — for `html`, `body`, `.site-container`, `h1`,
`.profile-image`, `.profile-details`, `.provisional-notice`, `.experience-card`,
`.experience-detail-card`, `.company-icon`, `.company-identity`, `.technology-badge`,
`.detail-content`, `.button-link`, `.floating-nav`, `.floating-nav-link`,
`.floating-nav-indicator`, `main a`.

| Route                               | Viewport | normal  | hover/active/focus | reduced-motion | reduced-motion states |
| ----------------------------------- | -------- | ------- | ------------------ | -------------- | --------------------- |
| `/`                                 | 375×812  | 0 diffs | 0                  | 0              | 0                     |
| `/`                                 | 1440×900 | 0 diffs | 0                  | 0              | 0                     |
| `/experiencia/puesto-ejemplo-2024/` | 375×812  | 0 diffs | 0                  | 0              | 0                     |
| `/experiencia/puesto-ejemplo-2024/` | 1440×900 | 0 diffs | 0                  | 0              | 0                     |
| `/experiencia/puesto-ejemplo-2022/` | 375×812  | 0 diffs | 0                  | 0              | 0                     |
| `/experiencia/puesto-ejemplo-2022/` | 1440×900 | 0 diffs | 0                  | 0              | 0                     |

Sampled equivalence (current == baseline): button background `rgb(12, 122, 191)`,
card radius `24px`, indicator `rgb(29, 155, 240)`, container width `343px` (mobile) /
`1120px` (desktop), reduced-motion button/indicator transition `0s`, reduced-motion
`scroll-behavior: auto`, Open Sans loaded and used.

Real-input control (not the rewritten-class mechanism):

- Actual `hover` on the GitHub primary button → `background-color: rgb(9, 106, 167)`
  (= `#096aa7`, the approved hover token).
- Actual keyboard `Tab` focus → `:focus-visible` matched, outline
  `rgb(7, 89, 133) solid 3px`, offset `3px`.

## Accessibility

Live axe summaries (all zero issues):

| Route                               | issues | passed tests |
| ----------------------------------- | ------ | ------------ |
| `/`                                 | 0      | 31           |
| `/experiencia/puesto-ejemplo-2024/` | 0      | 26           |
| `/experiencia/puesto-ejemplo-2022/` | 0      | 26           |

## Gate status

- **Lint**: pass.
- **Format**: pass for QA-touched files; repository-wide `pnpm format:check` still
  fails on the unrelated, pre-existing `specs/004-portfolio-home/evidence-t8.md`.
- **Unit tests (targeted)**: pass, 27 tests.
- **SEO**: N/A for this task — T10 changes no markup, routes or metadata. Rendered
  source-contract tests that query rendered data (button/company-icon) were preserved
  and pass. Existing SEO/a11y suites are not re-run as final gates here because the
  legacy floating-navigator QA is ongoing and may fail independently.
- **Build / full `pnpm test:run` / `pnpm test:a11y`**: deferred to the final
  integration run by the Lead; not applicable to this bounded CSS-only verification.

## Defects found

- **None attributable to T10.** Token chains resolve without cycles or missing
  values; all approved colors, dimensions, radii, type values, ratios, font license
  and reduced-motion contracts are preserved.

Observations (not defects, no action requested):

- `.company-icon` sizes itself with the spacing token `--space-40` (value preserved);
  semantic naming could use a dedicated size token, but the refactor's equivalence
  requirement is met.
- Two palette primitives (`--palette-action-blue-active`, `--palette-link-blue`)
  intentionally share `#075985`; the orphan check still passes because both are
  referenced.
- Intentional, out-of-scope differences excluded from this equivalence baseline and
  deferred: T11 (active navigator label/background — nav indicator remains bright
  `#1d9bf0`, inactive label remains ink) and T6c (native shared-element timing stays
  the control default `200ms`; the `250ms` native fix is not implemented here).

## Harness artifacts (not product defects)

Two harness-only issues were found and corrected during verification; they do not
reflect product behavior:

1. Fetching `/src/styles/global.css` without `?raw` returns a Vite JS module, not
   CSS; the first run's "current" rewritten variants were inert. Switched to
   `/src/styles/global.css?raw`.
2. Re-declaring `@font-face` in injected copies triggered a font-swap re-layout that
   changed text-driven widths by ~1–5%. Removed `@font-face` from injected copies;
   Open Sans was confirmed loaded in every run.
