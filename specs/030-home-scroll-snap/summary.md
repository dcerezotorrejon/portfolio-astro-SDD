# Summary: Home free scrolling

- **Spec**: `030-home-scroll-snap`
- **Date**: 2026-10-12

## Files changed

- `src/styles/global.css`
- `src/layouts/SiteLayout.astro`
- `src/pages/index.astro`
- `docs/design.md`
- `src/components/home/FloatingNav/FloatingNav.tsx`
- `src/components/home/FloatingNav/helpers/navigation.ts`
- `tests/unit/design-assets.test.ts`
- `tests/unit/navigation.test.ts`
- `tests/unit/floating-nav.test.tsx`
- `tests/unit/floating-nav-threshold.test.tsx`
- `tests/integration/navigation.spec.ts`

## Functions / components changed

- **`src/styles/global.css`** — Removed the `html.home-page { scroll-snap-type: y
  proximity; }` rule and the `#inicio, #trayectoria { scroll-snap-align: start; }`
  rule, so the home page exposes no snap points. Kept
  `html { scroll-padding-block-start: var(--space-16); }` for fragment jumps.
- **`src/layouts/SiteLayout.astro` / `src/pages/index.astro`** — Removed the
  vestigial `home-page` class and the `isHome` prop/attribute that only scoped
  the deleted snap rule; the root is now `<html lang="es">`.
- **`docs/design.md`** — Reconciled "Interaction and motion": in-page activation
  now states it jumps directly to the target without animating the scroll, and
  the reduced-motion bullet no longer mentions smooth scrolling.
- **`FloatingNav` (`FloatingNav.tsx`)** — Removed the indicator-hold machinery
  (`heldSectionIdRef`, `scheduleMeasureRef`, the held branch in `measure`, and
  the wheel/touch/keydown release effect). `handleLinkClick` now intercepts plain
  left clicks (`preventDefault`, `pushState("#id")`, instant scroll, optimistic
  active section) and leaves modified/new-tab/middle clicks native. The fragment
  pre-selection, `data-positioned`, geometry measurement, and focus-obscured
  behavior are unchanged.
- **`scrollToSection` (`helpers/navigation.ts`)** — Now always scrolls with
  `{ block: "start", behavior: "auto" }`. Removed the now-unused
  `prefersReducedMotion` and `hasReachedActivation` helpers.
- **Tests** — `tests/unit/design-assets.test.ts` asserts the absence of
  `scroll-snap-*`/`scroll-behavior` and that `docs/design.md` no longer presents
  smooth scrolling; `tests/unit/navigation.test.ts`,
  `floating-nav.test.tsx`, and `floating-nav-threshold.test.tsx` cover instant
  activation and geometry-governed selection without the hold;
  `tests/integration/navigation.spec.ts` proves the jump is immediate (no
  animated progression), the fragment and `aria-current`/`data-active-index`
  update, and reduced-motion behavior.
