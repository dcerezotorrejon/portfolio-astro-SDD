# Floating nav legacy test reanchoring evidence (R11/AC12)

Date: 2026-10-05  
QA model: Auto Router (configured default); no override.

## Scope

Reanchored the legacy `tests/unit/floating-nav.test.tsx` suite from the old
midpoint-centered geometry (`setCenter`, active section = the one covering the
viewport center) to the R11/AC12 section-start threshold contract now
implemented in `src/lib/navigation.ts` and `src/components/FloatingNav.tsx`:
a section activates when its `getBoundingClientRect().top` reaches the 16 px
scroll inset with 1 px rounding tolerance (top <= 17), the last qualifying
section in **DOM order** wins, and the first section is the fallback while
nothing qualifies. Also adapted the rAF assertions to the second effect
(keyboard-focus obscuring scheduler), which listens to `scroll`/`resize` too
and must cancel its own pending frame on unmount.

No production code, CSS, spec, plan, or tasks file was changed. The new
threshold suites (`tests/unit/floating-nav-threshold.test.tsx`,
`tests/unit/navigation.test.ts`) were left untouched.

## Tests changed (all in `tests/unit/floating-nav.test.tsx`)

- Replaced the `setCenter` geometry helper with `setTop`, pinning section tops
  (R11/AC12 activation input).
- **SSR test:** unchanged — normal fragment links, named nav, initial
  `aria-current="location"` on the first link, no tab semantics.
- **Mount measurement:** initial state is the first prop section before
  measurement; a top of 17.5 misses the threshold (17) so selection stays on
  "inicio" even with `#trayectoria` in the URL (geometry, not the fragment,
  drives selection); crossing to 16.4 activates "trayectoria" with
  `data-active-index="1"`.
- **Crossing/reversal/tie/coalescing:** downward crossing at top 16 activates
  the next section; upward reversal (top 18) restores the earlier section;
  coinciding tops at 16 resolve to the later DOM-order section; a two-event
  scroll burst leaves exactly 2 pending frames (one per effect scheduler),
  demonstrating per-scheduler rAF coalescing.
- **Lifecycle events:** resize, hashchange (exactly 1 pending frame — only the
  measurement scheduler hears it), pageshow, and ResizeObserver callbacks all
  re-measure; hashchange without a geometry change keeps the selection.
- **Order/removal/empty:** reordering the `sections` props keeps
  geometry-driven selection while `data-active-index` follows prop order
  (`"1"`); removal falls back to the remaining first section with no `tabindex`
  injected; an empty section list renders no links and keeps
  `data-active-index="0"`.
- **Cleanup without ResizeObserver:** works with `ResizeObserver` undefined;
  mount queues 1 frame (measurement only), `loadingdone` re-queues 1, a scroll
  wakes both schedulers (2 frames); unmount removes all window listeners plus
  the fonts listener, and **both schedulers cancel their pending frame**
  (`cancelAnimationFrame` twice, 0 frames left, no post-unmount requests).
- **Focus-obscuring (2 tests):** unchanged behavior, geometry reanchored to
  `setTop`; navigator hides for a keyboard-focused control it would cover
  (8 px outline margin respected), restores when focus moves into it while
  staying in the tab order, and stays visible for non-overlapping focus.
- **Observer disconnect:** still verifies observation of both sections and
  `disconnect()` on unmount.

## Commands and results

- `pnpm exec vitest run tests/unit/floating-nav.test.tsx
tests/unit/floating-nav-threshold.test.tsx tests/unit/navigation.test.ts`
  — **PASS**, exit 0; 3 files / 23 tests (legacy 9, threshold 8, navigation 6).
- `pnpm exec vitest run tests/a11y/floating-nav.test.ts` — **PASS**, exit 0;
  1 file / 1 test (axe-core: no violations on server-rendered nav).
- `pnpm exec eslint tests/unit/floating-nav.test.tsx` — **PASS**, exit 0.
- `pnpm exec prettier --check tests/unit/floating-nav.test.tsx` — **PASS**
  (after one `--write` to fix line wrapping).

## Gate status

- Targeted unit tests: pass (see above). Full `pnpm test:run` deferred to the
  final gate run, per task instruction.
- Targeted axe (floating nav): pass. Full `pnpm test:a11y` deferred.
- Targeted lint/format: pass. Full `pnpm lint` / `pnpm format:check` /
  `pnpm build` deferred to the final gate run.
- Browser/reserved-CSS verification intentionally not performed here; owned by
  the later browser QA pass.

## Defects found

None. The legacy expectations that failed under the threshold contract were
stale test expectations, not production defects; they were reanchored to the
spec'd behavior without weakening cleanup or coalescing coverage (the rAF
counts were updated to the real two-scheduler lifecycle rather than relaxed).
