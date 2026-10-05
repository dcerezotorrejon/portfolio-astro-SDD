# F2 QA evidence — `/#trayectoria` return flicker fix (R10, R11; AC11, AC12)

- **Scope:** Independent QA of the F1 fix (fragment-load flicker on returning to
  `/#trayectoria`) and the corresponding test re-anchoring (F2). F1 removed
  `scroll-behavior: smooth` from `html.home-page`, added the
  `.floating-nav:not([data-positioned="true"])` transition suppression in
  `src/styles/global.css`, made `FloatingNav.tsx` read `location.hash` in a layout
  effect, expose `data-positioned`, and intercept plain clicks to scroll smoothly
  (`scrollIntoView`). It also added `prefersReducedMotion()` / `scrollToSection()`
  to `src/lib/navigation.ts`.
- **Date:** 2026-10-05
- **QA model:** Auto Router (`openrouter/auto`, configured `#medium` default); no
  override.
- **Source verified:** exact current working tree. Browser checks served the fresh
  `pnpm build` output via the already-running preview at
  `http://127.0.0.1:4322` (see the dev-server note under _Limitations_).
- **Production code:** **not edited by QA.** Only the four QA test files and this
  evidence file were changed. `src/**`, `spec.md`, `plan.md` were left untouched;
  `tasks.md` and `summary.md` were updated for spec hygiene only.

## Files changed by QA

| File                                         | Change                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit/design-assets.test.ts`           | Replaced the removed reduced-motion `scroll-behavior: auto` assertion. Added a regression guard that `html.home-page` sets `scroll-snap-type: y proximity` and declares **no** `scroll-behavior` (so cross-document fragment loads are instant), plus that the indicator transition is `none` until `[data-positioned="true"]`. Kept the reduced-motion indicator/`@view-transition` checks.                               |
| `tests/unit/floating-nav.test.tsx`           | Updated the mount-selection test to the new contract: a present fragment selects pre-paint from the hash (before the measurement rAF), then geometry governs; added a case for an absent/unknown fragment driving selection by geometry alone. Updated the rAF-frame expectation to `2` at mount and `frameCancel` to `3` (the `data-positioned` scheduler is a third frame owner). Resets `location.hash` in `afterEach`. |
| `tests/unit/floating-nav-threshold.test.tsx` | Replaced the obsolete "a link click does not change selection" test with the new contract: a plain click intercepts, calls `history.pushState(null, "", "#…")`, calls `scrollIntoView({ block: "start", behavior: "smooth" })`, and updates `aria-current`; reduced-motion and modified/new-tab/middle clicks are **not** intercepted. Resets `location.hash` in `afterEach`.                                              |
| `tests/unit/navigation.test.ts`              | Added `// @vitest-environment jsdom` and 6 tests for `prefersReducedMotion()` (both media-query directions, unavailable `matchMedia`) and `scrollToSection(id)` (missing target, smooth scroll, reduced-motion `auto`, non-scrollable target).                                                                                                                                                                             |

Net: 228 insertions / 19 deletions across the four test files.

## Tests run (targeted)

- `pnpm exec vitest run tests/unit/design-assets.test.ts tests/unit/floating-nav.test.tsx tests/unit/floating-nav-threshold.test.tsx tests/unit/navigation.test.ts`
  — **PASS**, 4 files / 78 tests.
- `tests/unit/navigation.test.ts` grew from 6 to 12 tests; `floating-nav.test.tsx`
  from 9 to 10.

The mount-selection test asserts the fragment is applied synchronously (layout
effect) _before_ the measurement frame, and then that an unreached section's
geometry restores the previous selection — preserving the original intent
(geometry governs steady state) while covering the new pre-paint behavior.

## Final gates — exact order, final source

| Order | Command             | Exit | Result                                                               |
| ----: | ------------------- | ---: | -------------------------------------------------------------------- |
|     1 | `pnpm lint`         |    0 | **PASS** (`eslint .`)                                                |
|     2 | `pnpm format:check` |    0 | **PASS** (after Prettier-formatting `tests/unit/navigation.test.ts`) |
|     3 | `pnpm build`        |    0 | **PASS** — 3 pages (`/`, both details) + sitemap, 651 ms             |
|     4 | `pnpm test:run`     |    0 | **PASS** — 21 files / 149 tests                                      |
|     5 | `pnpm test:a11y`    |    0 | **PASS** — 4 files / 5 tests                                         |

Note: the first `pnpm format:check` failed exit 1 on
`tests/unit/navigation.test.ts` (new QA file); it was Prettier-formatted and the
full sequence re-run on the final source, all exits 0.

## Browser evidence (chrome-devtools MCP, fresh built preview at :4322, 375×800)

### 1. Direct fragment load `/#trayectoria` — instant landing, no scroll animation

A `reload` of `http://localhost:4322/#trayectoria` was instrumented with an
`initScript` sampling `requestAnimationFrame`:

| Observation                                        | Measured                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Computed `scroll-behavior` on `html.home-page`     | `auto`                                                           |
| Distinct `window.scrollY` values across all frames | `[544]` — **no intermediate positions**, i.e. no animated scroll |
| `#trayectoria` top at rest                         | `16px` (the agreed scroll inset)                                 |
| `aria-current` / active section at rest            | `Trayectoria` (`data-active-index="1"`)                          |
| `data-positioned`                                  | `false` until the hydration frame, then `true`                   |

Pre-hydration timeline (clean reload):

|                t (ms) | scrollY | active index | data-positioned |
| --------------------: | ------: | -----------: | --------------- |
| 14 (DOMContentLoaded) |     544 |            0 | false           |
|                    17 |     544 |            0 | false           |
|                    26 |     544 |            1 | false           |
|                    30 |     544 |            1 | true            |

The SSR markup starts with the default `Inicio` active; React's layout effect
moves it to `Trayectoria` at ~26 ms, while `data-positioned` is still `false`, so
the indicator slide is suppressed. The scroll itself never animates (only `544`).

An earlier direct navigation to `http://localhost:4322/?diag=2#trayectoria`
recorded `y: 0 → 544` within one frame (t≈17 → t≈20), corroborating the instant
jump.

### 2. Clicking the nav links — smooth scroll, `aria-current` in sync

A trusted MCP click on **Inicio** from the `#trayectoria` position:

- `history.pushState` spy captured `[null, "", "#inicio"]`.
- `location.hash` became `#inicio`; `aria-current`/`data-active-index` switched to
  `Inicio` (`0`) immediately.
- The scroll was **not** applied synchronously (`scrollY` stayed `544` right after
  the click), confirming the handler intercepts and starts an animated
  (`scrollIntoView` smooth) scroll rather than a native jump. The value later
  settled at `0`.

### 3. Reduced motion — immediate anchor activation (emulated)

CDP media emulation is not exposed by the MCP `emulate` tool, so
`prefers-reduced-motion` was **emulated by stubbing `window.matchMedia`** in the
page (JS-level emulation of the media query; CSS-level transition suppression is
covered by the source test). Clicking **Trayectoria** from `y=0`:

| Branch         |      `scrollY` before | `scrollY` synchronously after click | Result                                |
| -------------- | --------------------: | ----------------------------------: | ------------------------------------- |
| Normal motion  |    544 → click Inicio |                544 (animated later) | intercepted smooth scroll             |
| Reduced motion | 0 → click Trayectoria |                 **544 (immediate)** | native fragment jump, not intercepted |

Under reduced motion the hash changed natively and the jump was synchronous
(0 → 544 within the click), matching R10/R11's immediate-navigation requirement.

### 4. View transition from a detail page — still works

Using `localStorage` to survive the document swap and a `pageswap` listener:

- Homepage → detail (trusted click on "Más información"): `pageswap`
  `{ fired: true, activation: true, type: "push" }` — the cross-document view
  transition is active.
- Detail → `/#trayectoria` (trusted click on "Volver a la trayectoria"):
  `pageswap` `{ fired: true, activation: true, type: "push" }`, and the landing
  page measured `scrollY 544`, section top `16px`, `scroll-behavior: auto`,
  `Trayectoria` active/`aria-current`, `data-positioned="true"`.
- The destination document fired `pagereveal`, and
  `document.startViewTransition` is available.

## Limitations / residual risk

- **Paint timing unavailable.** The MCP browser returned no
  `performance.getEntriesByType("paint")` entries, so the ~12 ms interval between
  the server-rendered default (`Inicio`) and the hydration correction
  (`Trayectoria`) could not be confirmed as painted or not. The animated flicker
  is eliminated (single scroll value, suppressed indicator transition), but on a
  very slow hydration the wrong _label color_ could theoretically be visible for
  one frame. A possible hardening (production change, out of QA scope) is to
  suppress the `[aria-current="location"]` label color until
  `[data-positioned="true"]`, mirroring the indicator rule.
- **Reduced motion was JS-emulated**, not a real OS/CDP media override.
- **Dev server not used.** The `astro dev --background` server on
  `http://localhost:4321` (pid 26601, uptime ≈95 min) was stale and repeatedly
  logged `Cannot read properties of undefined (reading 'src')` from
  `ExperienceHistory.astro:43`; browser verification therefore used the preview
  server at `:4322` serving the freshly built `dist` (the same origin used by
  earlier 004 evidence). `pnpm build` was re-run immediately before verification.
- The `#{inicio}` landing measures section top `0px` (the document start cannot
  hold the 16 px inset); `#trayectoria` holds the `16px` inset as required.
