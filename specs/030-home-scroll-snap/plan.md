# Plan: Home free scrolling

- **Spec**: `specs/030-home-scroll-snap/spec.md`
- **Branch**: `spec/030-home-scroll-snap`
- **Last updated**: 2026-10-12

## Approach

Remove every form of scroll mediation from the home page and keep the floating
navigator's state in sync with plain geometry. Two independent workstreams:

1. **Static scroll removal** — delete the scroll-snap declarations from
   `src/styles/global.css` (and the now-vestigial `home-page` hook), and
   reconcile the smooth-scroll wording in `docs/design.md`.
2. **Navigator activation** — make `FloatingNav` jump directly to the target
   section (no animation) and retire the indicator-hold machinery that only
   existed to bridge the animated scroll.

Both touch disjoint files and can run in parallel. The change introduces no new
client JavaScript and no new island.

## Approved decisions (maintainer)

- No scroll snapping at all on the home page; scrolling is fully free.
- Navigator activation jumps directly to the target section, updating the URL
  fragment and syncing the active/indicator state.
- The indicator-hold logic is retired.
- No new client JavaScript.
- `docs/design.md` is reconciled so it no longer describes smooth scrolling as
  active behavior.

Implementation-level decisions recorded here (mechanical consequences, not
material architecture changes):

- The `home-page` class on `<html>` and the `isHome` prop on `SiteLayout`
  existed only to scope the snap rule. They are removed to avoid a dead hook.
  No test or stylesheet depends on them.
- `prefersReducedMotion()` and `hasReachedActivation()` in
  `helpers/navigation.ts` become unused once the smooth scroll and hold are
  removed; they are deleted together with their unit tests.

## Files to change

### Task T1 — remove snap and reconcile motion docs

- `src/styles/global.css`
  - Delete the `html.home-page { scroll-snap-type: y proximity; }` rule.
  - Delete the `#inicio, #trayectoria { … scroll-snap-align: start; }` rule and
    its explanatory comment.
  - Keep `html { scroll-padding-block-start: var(--space-16); }` unchanged
    (the 16 px anchor inset still applies to fragment jumps).
- `src/layouts/SiteLayout.astro` — drop the `isHome` prop and the
  `class:list={{ "home-page": isHome }}` output; render `<html lang="es">`.
- `src/pages/index.astro` — drop the `isHome` attribute passed to `SiteLayout`.
- `docs/design.md` — in "Interaction and motion":
  - Replace "Smooth-scroll distance/timing remains browser-controlled." with
    wording that in-page activation jumps directly to the target section without
    animating the scroll.
  - Remove "and smooth scrolling" from the reduced-motion bullet, leaving
    "disable shared-element animation and indicator movement".
- `tests/unit/design-assets.test.ts`
  - Replace the two snap-presence assertions (`scroll-snap-type: y proximity` on
    `css`, and the `html.home-page` regression guard) with assertions that
    `global.css` contains no `scroll-snap-type`, no `scroll-snap-align`, and no
    `scroll-behavior`, while still asserting the 16 px
    `scroll-padding-block-start`.
  - Add a consistency assertion that `docs/design.md` no longer presents smooth
    scrolling as active behavior (no `Smooth-scroll` / `smooth scrolling`
    wording).

### Task T2 — instant activation and hold removal

- `src/components/home/FloatingNav/helpers/navigation.ts`
  - `scrollToSection` scrolls with `{ block: "start", behavior: "auto" }`
    (always instant); keep the `false` fallback when the target is missing or
    `scrollIntoView` is unavailable.
  - Delete `prefersReducedMotion` and `hasReachedActivation` (unused after T2).
- `src/components/home/FloatingNav/FloatingNav.tsx`
  - Remove the hold machinery: `heldSectionIdRef`, `scheduleMeasureRef`, the
    held branch inside `measure`, and the whole wheel/touch/keydown
    release-hold effect.
  - `measure` keeps the measured geometry (via `getActiveSectionIndex`) and the
    `requestAnimationFrame` coalescing as-is.
  - `handleLinkClick`: keep the guard for modified/new-tab/middle clicks and the
    missing-target fallback; then `preventDefault()`, `history.pushState` to
    `#id`, `scrollToSection(id)` (instant), and set the active section
    optimistically so the indicator moves with the jump.
  - Keep the fragment pre-selection layout effect, the `data-positioned`
    one-shot effect, and the focus-obscured effect unchanged.
- `tests/unit/navigation.test.ts` — update `scrollToSection` expectations to
  `behavior: "auto"`; remove the `hasReachedActivation` and
  `prefersReducedMotion` suites and imports.
- `tests/unit/floating-nav.test.tsx` — drop the reduced-motion hold test;
  assert activation after an instant jump selects the target and that geometry
  governs afterwards.
- `tests/unit/floating-nav-threshold.test.tsx` — replace the smooth-click test
  with an instant-jump + fragment + selection test; delete the hold-specific
  tests (in-flight hold, threshold release, wheel release, keydown release,
  retarget) and the `stubSmoothScroll` helper; keep the geometry/threshold,
  resize, coalescing, and focus tests.

## Trade-offs

- **No animation vs. no mediation**: an instant jump removes the last scroll
  mediation on the home page, at the cost of losing a smooth transition between
  sections. This is the maintainer's explicit choice.
- **Optimistic selection without a hold**: because the jump is immediate, the
  optimistic `setActiveSectionId` agrees with the geometry measured on the next
  scroll/hashchange frame, so no hold is needed and selection cannot get stuck.
- **Doc reconciliation**: `docs/design.md` keeps ownership of shared motion
  criteria; scroll behavior itself stays in the feature spec, so the edit is a
  wording reconciliation, not a new criterion.

## Risks

- **Test churn**: several existing tests assert the old snap and hold behavior.
  They must be updated in the same task as the behavior change (unit) or by QA
  (integration). `tests/integration/navigation.spec.ts` has in-flight-hold tests
  that no longer apply.
- **Reduced motion**: no animated scroll remains, so the reduced-motion path
  must still work and keep the indicator transition suppressed via the existing
  `motion-reduce:transition-none` utility.
- **Fragment jumps**: removing snapping must not regress the "return to
  `/#trayectoria`" cross-page flow; `scroll-padding-block-start` stays so the
  section lands at the 16 px inset.

## Testing strategy

- **Unit / component (Dev)**: static contract over `global.css` (no snap
  declarations; 16 px inset retained), `scrollToSection` instant behavior,
  FloatingNav instant activation + geometry-governed selection, and the
  `docs/design.md` consistency check.
- **Integration (QA, Playwright)**: `tests/integration/navigation.spec.ts`
  updated to assert immediate positioning after activation (position reaches the
  target with no animated progression), fragment updates, `aria-current` /
  `data-active-index` sync, modified/new-tab and reduced-motion cases; remove
  the obsolete in-flight-hold tests.
- **Accessibility (QA)**: run the a11y suites; `FloatingNav` markup and landmark
  semantics are unchanged, so no a11y test edits are expected.
- **SEO (QA)**: not applicable — titles, meta, canonical, and sitemap are
  untouched.

## Gate applicability

The increment changes non-Markdown files (`global.css`, Astro layout/page,
React island, TS helper, tests), so the Markdown-only exception does not apply.
Applicable gates: `pnpm lint`, `pnpm format:check`, `pnpm build`,
`pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration` (page rendering
and client behavior). SEO is covered by `pnpm test:run` (`tests/seo/**`).
