# Add Client Router

- **Spec ID**: `020-add-client-router`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio currently enables navigation transitions through the browser's
native cross-document View Transition mechanism: `@view-transition { navigation:
auto; }` in `src/styles/global.css`, paired with per-slug shared-element identity
(`transition:name`) between the home-page overview cards and the
`/experiencia/[slug]/` detail cards.

This increment switches same-origin navigation to Astro's built-in `ClientRouter`
(from `astro:transitions`), which turns the multi-page site into a single-page app
for internal navigation. It also retires the native cross-document transition
trigger so `ClientRouter` is the single navigation-transition mechanism, while
preserving the existing transition contract: per-slug shared-element identity, a
200 ms duration, and a reduced-motion reset.

## Goals

- Enable client-side (SPA) navigation across every page by rendering
  `ClientRouter` in `SiteLayout`.
- Retire the native cross-document `@view-transition { navigation: auto; }`
  trigger in favor of `ClientRouter` as the sole navigation-transition mechanism.
- Preserve the existing transition contract: per-slug shared-element identity,
  200 ms duration, and reduced-motion reset.
- Reconcile `tests/unit/transitions.test.ts` with the client-side mechanism.

## Non-goals

- No prefetch policy change; keep `ClientRouter`'s default prefetching
  (`prefetchAll`).
- No explicit `fallback` strategy; keep the `ClientRouter` default (`animate`).
- No content, layout, or visual changes: `index.astro` and page content are out
  of scope for this increment.
- No change to the SEO metadata (`<title>`, meta description, canonical) already
  emitted by `SiteLayout`.

## Requirements

- R1: `SiteLayout.astro` imports `ClientRouter` from `astro:transitions` and
  renders it in the `<head>`, so every page using the layout has client-side
  routing enabled.
- R2: Same-origin navigations (home ↔ `/experiencia/[slug]/`, section anchors,
  and the detail-page return link) are performed client-side without a full
  document reload.
- R3: The view-transition stylesheet no longer relies on the native
  cross-document trigger: `@view-transition { navigation: auto; }` and its
  reduced-motion `navigation: none` counterpart are removed. `ClientRouter` is
  the sole navigation-transition mechanism.
- R4: Per-slug shared-element identity (`transition:name` =
  `experience-transition-${slug}`) continues to pair each overview card with its
  matching detail card.
- R5: Shared-element transition timing stays at 200 ms, applied to the
  `::view-transition-*` pseudo-elements and resolved through `--duration-control`.
- R6: Reduced-motion users receive no transition animation while navigation and
  section selection remain functional.
- R7: Prefetching remains enabled (default `prefetchAll`); no `prefetch`
  configuration is added.
- R8: `tests/unit/transitions.test.ts` is updated to verify the client-side
  mechanism and no longer asserts the retired native MPA trigger.

## Acceptance criteria

- [x] AC1: The rendered `<head>` of every page includes the `ClientRouter` output
      (the `astro-view-transitions-enabled` meta tag).
- [x] AC2: Navigating home → experience detail → home on the shared branch does
      not trigger a full document reload.
- [x] AC3: `global.css` contains neither `@view-transition { navigation: auto; }`
      nor a reduced-motion `navigation: none` rule.
- [x] AC4: Overview and detail cards declare the same per-slug `transition:name`
      (`experience-transition-${slug}`).
- [x] AC5: The `::view-transition-*` pseudo-element `animation-duration` resolves
      to `200ms` through `--duration-control`.
- [x] AC6: The reduced-motion block sets `animation: none` on the view-transition
      pseudo-elements and appears after the timing rule in source order.
- [x] AC7: `astro.config.mjs` adds no `prefetch` setting; default prefetching is
      preserved.
- [x] AC8: All applicable quality gates pass — lint, format, build, unit tests,
      accessibility, and integration — with evidence recorded in `tasks.md`.

## Verification

- **Unit / component**: `tests/unit/transitions.test.ts` covers R3–R6 and
  AC3–AC6 (transition contract, timing, reduced-motion reset). A layout render
  test covers R1 and AC1. R7/AC7 is verified against `astro.config.mjs`.
- **Integration**: Playwright verifies client-side navigation (AC2) — a home →
  detail → home round-trip with no full reload — and keeps the existing
  `navigation.spec.ts` behavior green.
- **SEO**: Rendered HTML checks confirm `<title>`, meta description, and
  canonical remain present on every page (unchanged by this increment).
- **Accessibility**: keyboard navigation and reduced-motion behavior remain
  functional (R6/AC6), verified by the accessibility gate.
