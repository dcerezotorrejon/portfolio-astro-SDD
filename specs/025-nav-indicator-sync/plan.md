# Plan — Navigator indicator selection during in-page scrolling

- **Spec ID**: `025-nav-indicator-sync`
- **Last updated**: 2026-10-10

## Approach

Add a **selection hold** (a pinned target section) to `FloatingNav` so an in-page
link activation keeps the indicator on the chosen section while the programmatic
smooth scroll is running, instead of letting the geometry measurement revert it to
the origin section. The hold is released when the chosen section reaches the
activation inset (geometry confirms it) or when the user performs manual scrolling
input; after release, geometry governs exactly as today.

Mechanics, reusing the existing structure (`isPositioned` pre-paint gating,
`getActiveSectionIndex`, coalesced rAF measurement):

1. On link activation, set the held section (the optimistic selection already
   done in `handleLinkClick`) and mark a hold as active in a ref.
2. In the measurement step, when a hold is active:
   - if the held section's top has reached the activation offset (16 px + 1 px
     tolerance), clear the hold and let the normal geometry selection run (it
     will select the held section — no flicker);
   - otherwise, keep the held section active and skip the geometry override.
3. Attach release listeners **while a hold is active** for user-input signals
   (`wheel`, `touchstart`/`touchmove`, and `keydown` for scrolling keys);
   releasing clears the hold and schedules a measurement so the indicator follows
   real geometry immediately.
4. Activating another link mid-hold retargets the held section to the new one.
5. Reduced motion: activation still sets the held section, but with no smooth
   scroll the target reaches the inset on the first measurement, so the hold
   releases immediately. The native fall-through for modified/new-tab clicks and
   missing targets is unchanged.

## Files to change

- `src/components/home/FloatingNav/FloatingNav.tsx` — add the hold ref/state, the
  measurement guard, the manual-input release listeners, retarget on activation,
  and release-on-arrival logic. Keep rendering driven by `activeSectionId`.
- `src/components/home/FloatingNav/helpers/navigation.ts` — add a small pure
  helper (for example `hasReachedActivation(top, activationOffset, tolerance)`)
  that reports whether a section start qualifies as active, so the hold/release
  decision is unit-testable without the DOM. Reuse the same offset/tolerance as
  `getActiveSectionIndex`.
- `tests/unit/floating-nav.test.tsx` and `tests/unit/floating-nav-threshold.test.tsx`
  — add cases for: hold across in-flight scroll events, release on arrival,
  manual-scroll takeover, retarget, and unchanged reduced-motion/native
  fall-through. (Dev owns `tests/unit/**`.)
- `tests/integration/navigation.spec.ts` — browser coverage of the same behaviors
  (active state during/after the click-triggered scroll, manual takeover,
  `reducedMotion: "reduce"`). (QA owns integration tests.)

## Key decisions

- **Detect manual scroll via input events, not scroll heuristics.** Scroll events
  cannot reliably distinguish programmatic from manual scrolling; `wheel`,
  `touchstart`/`touchmove`, and scroll-key `keydown` are the standard signal.
  Trade-off: a pure scrollbar drag that emits none of these is not detected, but
  the hold still self-releases when the target arrives.
- **Release keyed on the same activation inset** used by
  `getActiveSectionIndex`, so the hand-off from hold to geometry is continuous —
  the measured active section already equals the held section at release.
- **Hold in a ref, mirrored into state for rendering**, to avoid extra renders
  and keep the scroll-driven measurement path cheap, matching the existing
  `activeSectionIdRef` pattern.

## Risks

- Regression to pre-paint fragment selection or threshold behavior. Mitigation:
  keep the existing tests green and add focused hold/release cases.
- Manual-scroll detection gaps (scrollbar drag). Mitigation: documented; the hold
  still releases on arrival, and the failure mode is bounded (a brief lag, never
  a permanently wrong selection).
- Listener/frame leaks. Mitigation: follow the existing mount-guard and cleanup
  pattern; extend the unmount cleanup test to cover the new listeners.

## Testing strategy

- **Unit / component tests:** jsdom + the existing fake-rAF harness. Assert that a
  click sets the target and holds across simulated `scroll` events before the
  inset; that the hold releases at the inset with the target selected; that
  manual input releases the hold and geometry takes over; that a second
  activation retargets; and that reduced-motion/ modified-click fall-through is
  unchanged.
- **Integration tests:** Playwright Chromium samples `data-active-index` /
  `aria-current` and `window.scrollY` during and after the activation scroll, the
  manual-takeover case, and the reduced-motion case.
- **SEO checks:** not applicable (no title/meta/canonical/sitemap change).
- **Accessibility checks:** `pnpm test:a11y`; `aria-current` still follows the
  selection and the focused link stays visible during the scroll.
