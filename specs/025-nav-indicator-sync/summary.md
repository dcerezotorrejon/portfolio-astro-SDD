# Summary — Navigator indicator selection during in-page scrolling

- **Spec ID**: `025-nav-indicator-sync`
- **Last updated**: 2026-10-10

## Files changed

- `src/components/home/FloatingNav/FloatingNav.tsx` — added a selection hold for
  an activated in-page target: the geometry measurement no longer pulls the
  indicator back to the origin while the programmatic smooth scroll runs; a
  manual-input effect releases the hold on `wheel`/`touchstart`/`touchmove`/scroll
  keys and re-measures.
- `src/components/home/FloatingNav/helpers/navigation.ts` — added the pure
  `hasReachedActivation(top, activationOffset = 16, tolerance = 1)` helper.
- `tests/unit/floating-nav.test.tsx`,
  `tests/unit/floating-nav-threshold.test.tsx`,
  `tests/unit/navigation.test.ts` — unit coverage for hold, boundary release,
  manual-input release, retarget, reduced-motion fall-through, and the helper.
- `tests/integration/navigation.spec.ts` — browser coverage sampling the active
  state across the whole in-page scroll, manual takeover, retarget, and
  reduced-motion activation.
- `tests/integration/accessibility.spec.ts` — `aria-current` follows the
  selection and the page stays axe-clean after activation.

## Functions / components changed

- `FloatingNav` — `handleLinkClick` now pins the activated target in
  `heldSectionIdRef`; `measure()` keeps that target selected until it reaches the
  activation inset (then hands back to `getActiveSectionIndex`), and a new effect
  releases the hold on user-initiated scrolling input. Component rendering,
  styles, indicator transition, `data-positioned` gating, the focus-protection
  effect, and the scroll/snap rules are unchanged.
- `hasReachedActivation` — new pure helper mirroring the geometry activation
  threshold (`top <= activationOffset + tolerance`).

## Notes

- A pure scrollbar drag that emits none of `wheel`/`touchstart`/`touchmove`/scroll
  keys is not detected as manual input; the hold still releases when the target
  reaches the inset.
- Headless Chromium does not cancel the programmatic smooth scroll on a synthetic
  `page.mouse.wheel`, so the browser-level manual-takeover test uses a scroll key;
  the wheel-release path is covered by unit tests.
