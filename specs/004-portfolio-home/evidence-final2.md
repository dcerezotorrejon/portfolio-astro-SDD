# Final integrated QA evidence — spec 004 (round 2: T11 / T12 / T6c)

- **Scope:** Independent final verification of the latest source after T11
  (active navigator label white on `#0C7ABF`, inactive ink), T12 (shared
  section-heading tokens 24/32 px · 700 · 1.25 · 24 px gap), and T6c
  (`--duration-control` 200 ms on the native view-transition pseudo-elements),
  on top of the already verified T8/T9/T10 and the T7b/T6b fixes.
- **Date:** 2026-10-05
- **QA model:** Auto Router (`openrouter/auto`, configured `#medium` default);
  no override.
- **Source verified:** exact current working tree. The browser run served the
  fresh `pnpm build` output via the already-running preview at
  `http://127.0.0.1:4322`; the served stylesheet contains the T11/T12/T6c
  declarations (`--nav-indicator-background`, `--section-heading-size`,
  `::view-transition-group(*) { animation-duration: var(--duration-control) }`).
- **Production code:** **not edited by QA.** Only tests, a test-only fixture and
  this evidence file were added/changed. `tasks.md`, `spec.md`, `plan.md` and
  `summary.md` were left untouched (Lead-owned).

## Files added / changed by QA

| File                                   | Change                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/button-design.test.ts`     | Re-anchored the floating-navigator contract from the old bright-accent/ink values to T11: indicator `var(--nav-indicator-background)` → `var(--color-button)` → `#0c7abf`; active label white via `[aria-current="location"]` → `var(--nav-link-text-active)` → `#ffffff`; inactive label still ink `#0f1419`. Kept the button-state and 4.5:1 contrast assertions and added active/inactive contrast. |
| `tests/unit/transitions.test.ts`       | Added two T6c tests: the pseudo-element `animation-duration` rule resolves to `200ms` through `--duration-control`, and the reduced-motion reset appears later in source (equal specificity → wins). Existing pairing/reduced-motion tests preserved.                                                                                                                                                  |
| `tests/unit/section-headings.test.ts`  | **New** (7 tests) for T12: token resolution (24/32 px, 700, 1.25, 24 px, ink), 768 px override, the shared grouped rule and its resolved declarations, the distinct `.experience-card h3` rule, and rendered h2/h3 hierarchy.                                                                                                                                                                          |
| `tests/fixtures/heading-fixture.md`    | **New** test-only Markdown fixture (`##` / `###`), no employment data.                                                                                                                                                                                                                                                                                                                                 |
| `tests/fixtures/heading-fixture.astro` | **New** fixture that compiles the Markdown inside a `.detail-content` wrapper, mirroring the real detail composition, so the shared selector is exercised against genuine compiled Markdown.                                                                                                                                                                                                           |
| This file                              | New evidence.                                                                                                                                                                                                                                                                                                                                                                                          |

`tests/unit/design-assets.test.ts` was **reviewed and left unchanged**: its
leading aliases (`--color-primary` → `#1d9bf0`, page gutter, control duration,
grouped orphan-token check) remain valid with the current CSS. It passes.

## Tests run (targeted)

- `pnpm exec vitest run tests/unit/button-design.test.ts tests/unit/design-assets.test.ts tests/unit/transitions.test.ts tests/unit/section-headings.test.ts`
  — **PASS**, 4 files / 30 tests.
- `tests/unit/section-headings.test.ts` — 7 tests; `tests/unit/transitions.test.ts`
  — 5 tests (was 3); `tests/unit/button-design.test.ts` — 6 tests.

The T12 tests use a compiled Markdown fixture rather than the real employment
entries (which contain no section headings), so no fabricated employment data is
introduced. The rendered assertions use `Element.matches` to prove the shared
selector reaches `.detail-content h2/h3` but **not** `.experience-card h3`
(card titles live outside `.detail-content` and keep their own 1.25 rem rule).

## Final gates — exact order, final source

| Order | Command             | Exit | Result                                                                                 |
| ----: | ------------------- | ---: | -------------------------------------------------------------------------------------- |
|     1 | `pnpm lint`         |    0 | **PASS** (`eslint .`)                                                                  |
|     2 | `pnpm format:check` |    0 | **PASS** (after Prettier-formatting the two new/changed QA test files; see note below) |
|     3 | `pnpm build`        |    0 | **PASS** — 3 pages (`/`, both details) + sitemap, 710 ms                               |
|     4 | `pnpm test:run`     |    0 | **PASS** — 19 files / 118 tests                                                        |
|     5 | `pnpm test:a11y`    |    0 | **PASS** — 4 files / 5 tests                                                           |

Note: the first `pnpm format:check` failed exit 1 on exactly
`tests/unit/button-design.test.ts` and `tests/unit/section-headings.test.ts`
(new/modified QA files). They were Prettier-formatted, and the full five-command
sequence above was then re-run in order on the final source; all exits are 0.

## Browser evidence (Puppeteer 25.12.0, Chrome 154, built preview)

### T11 — navigator active/inactive colors and settled indicator

| Viewport | Active label | Active color         | Inactive label | Inactive color    | Indicator background |
| -------- | ------------ | -------------------- | -------------- | ----------------- | -------------------- |
| 1440×900 | Inicio       | `rgb(255, 255, 255)` | Trayectoria    | `rgb(15, 20, 25)` | `rgb(12, 122, 191)`  |
| 320×700  | Inicio       | `rgb(255, 255, 255)` | Trayectoria    | `rgb(15, 20, 25)` | `rgb(12, 122, 191)`  |

The indicator **settles exactly on the active link** (Δx = 0, Δwidth = 0 px)
after a stable selection, in both directions, at both widths, and when the
selection is driven by a real navigator-link click:

| Width    | Transition measured       | Active      | Δx (indicator − link) | Δwidth |
| -------- | ------------------------- | ----------- | --------------------: | -----: |
| 1440×900 | scroll → Trayectoria      | Trayectoria |                  0 px |   0 px |
| 1440×900 | scroll → Inicio (reverse) | Inicio      |                  0 px |   0 px |
| 1440×900 | click `#trayectoria`      | Trayectoria |                  0 px |   0 px |
| 320×700  | scroll → Trayectoria      | Trayectoria |                  0 px |   0 px |
| 320×700  | scroll → Inicio (reverse) | Inicio      |                  0 px |   0 px |
| 320×700  | click `#trayectoria`      | Trayectoria |                  0 px |   0 px |

Indicator bounds, e.g. 1440×900 → `545,835 175×44` (Inicio) / `720,835 175×44`
(Trayectoria); 320×700 → `21,635 139×44` (Inicio) / `160,635 139×44`
(Trayectoria). `document.scrollWidth == innerWidth` at 320 (no overflow).

### T12 — section-heading computed styles

| Element                                     | Viewport | font-size | weight | line-height | color           | margin-bottom |
| ------------------------------------------- | -------- | --------: | -----: | ----------: | --------------- | ------------: |
| `#history-heading` (`.section-heading` h2)  | 1440     |     32 px |    700 |       40 px | `rgb(15,20,25)` |         24 px |
| `#history-heading`                          | 320      |     24 px |    700 |       30 px | `rgb(15,20,25)` |         24 px |
| Markdown-equivalent `.detail-content h2`    | 1440     |     32 px |    700 |       40 px | `rgb(15,20,25)` |         24 px |
| Markdown-equivalent `.detail-content h3`    | 1440     |     32 px |    700 |       40 px | `rgb(15,20,25)` |         24 px |
| Markdown-equivalent `.detail-content h2`    | 320      |     24 px |    700 |       30 px | `rgb(15,20,25)` |         24 px |
| Markdown-equivalent `.detail-content h3`    | 320      |     24 px |    700 |       30 px | `rgb(15,20,25)` |         24 px |
| `.experience-card h3` (unchanged, distinct) | 1440/320 |     20 px |    700 |       27 px | `rgb(15,20,25)` |          0 px |

The Markdown-equivalent rows were measured by injecting a representative
`.detail-content` with `h2`/`h3` (no employment data) into the built page and
reading computed styles, then removed. No horizontal overflow at 320
(`scrollWidth 320 == innerWidth 320`). Card titles remain visibly smaller and
distinct (20 px / 27 px vs 24–32 px / 1.25 leading).

### T6c — native transition timing and reduced-motion override

Sampled real cross-document transitions (Chrome 154) via `pageswap`/`pagereveal`
and pseudo-element computed styles:

- `/` → detail (forward): `pageswap` ran 2 animations of **200 ms**; computed
  `::view-transition-group(root)` = `0.2s` and
  `::view-transition-group(experience-puesto-ejemplo-2024)` = `0.2s`.
- detail → `/#trayectoria` (return): same — **200 ms** running animations and
  `0.2s` on `::view-transition-group(root)` /
  `...-experience-puesto-ejemplo-2024`.
- This replaces the earlier 250 ms UA default recorded in
  `evidence-final-integration.md`; the CSS pin
  `::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*)
{ animation-duration: var(--duration-control) }` is in force.

Reduced motion (`prefers-reduced-motion: reduce` emulated):

- `matchMedia` matched, `scroll-behavior: auto`, indicator/button
  `transition-duration: 0s`.
- `pageswap`/`pagereveal` had **no active view transition** (`viewTransition:
false`, 0 animations).
- Pseudo-element computed styles: `animation-name: none`,
  `animation-duration: 0s` for `::view-transition-group(root)`,
  `group(experience-puesto-ejemplo-2024)`, `old(...)`, `new(...)` and
  `image-pair(root)` — the later reduced-motion `animation: none` wins.
- Navigation still works: a real card click loaded
  `/experiencia/puesto-ejemplo-2024/` with `h1` “Puesto de ejemplo”.
- T11 colors under reduced motion are preserved: active white, inactive ink,
  indicator `rgb(12, 122, 191)`.

### MCP axe on the built preview

| Route                               | Violations | Incomplete | Passes |
| ----------------------------------- | ---------: | ---------: | -----: |
| `/`                                 |          0 |          0 |     30 |
| `/experiencia/puesto-ejemplo-2024/` |          0 |          0 |     24 |
| `/experiencia/puesto-ejemplo-2022/` |          0 |          0 |     24 |

## Reused vs newly measured

**Reused (unchanged production areas, not re-measured here)** — cited from
`browser-evidence.md` and `evidence-final-integration.md`, whose production
areas T11/T12/T6c do not touch:

- Six-width responsive layout/gutters/overflow table.
- Local Open Sans loading, same-origin font requests, aborted-font fallback.
- Company icon loading/size/alt/adjacency (T7/T7b).
- JavaScript-disabled navigation and content presence.
- SEO titles/descriptions/canonicals, `lang="es"`, sitemap contents.
- Keyboard focus outline and T6b focus-overlap navigator hiding.
- T6b 16 px ± 1 px section anchor inset (no CSS scroll inset changed here).
- Unsupported-transition fallback emulation.

**Newly measured this round (because T11/T12/T6c changed the values):**

- Navigator active/inactive colors, indicator background, settled-indicator
  alignment (both directions, both widths, scroll and click).
- Section-heading computed styles at 1440/320 and the distinct card-title style.
- Real native transition duration 200 ms (both directions) and reduced-motion
  pseudo-element `animation: none`.
- Fresh MCP axe audits on all three built routes.

## Defects / blockers

**None found.** All five gates pass with exit 0 in the required order on the
exact final source, and every browser criterion in the assignment passes.

Harness note (not a product defect): the first slider-alignment sample was taken
before the smooth-scroll-driven selection had settled and read a mid-animation
x-offset; re-measuring after the selection and slider had settled (waiting for
`aria-current` to change and for the indicator/link x to converge) gives exact
0 px deltas. This was a measurement-timing artifact, not an oscillating or
misaligned indicator.

Acceptance checkboxes and `tasks.md`/`summary.md` remain Lead-owned and were not
edited by QA.
