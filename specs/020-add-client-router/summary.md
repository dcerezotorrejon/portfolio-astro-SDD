# Summary — Add Client Router

- **Spec ID**: `020-add-client-router`
- **Last updated**: 2026-10-08

## Files changed

- `src/layouts/SiteLayout.astro` — import `ClientRouter` from
  `astro:transitions` and render `<ClientRouter />` in the `<head>`.
- `src/styles/global.css` — remove the native cross-document
  `@view-transition { navigation: auto; }` trigger and the reduced-motion
  `navigation: none` rule; keep the 200 ms `::view-transition-*` timing and the
  reduced-motion `animation: none` reset.
- `tests/unit/transitions.test.ts` — assert the native MPA trigger is absent
  (ClientRouter is the sole mechanism); keep the shared-element, timing, and
  reduced-motion assertions.
- `tests/unit/design-assets.test.ts` — replace the stale `navigation: none`
  presence assertion with an absence assertion.
- `tests/unit/site-layout.test.ts` — new; assert the ClientRouter marker in the
  rendered head and the default prefetch behavior.
- `tests/integration/navigation.spec.ts` — add an AC2 test proving a home →
  detail → home round-trip is client-side with no full document reload.

## Functions / components changed

- `SiteLayout` — now renders Astro's `ClientRouter` to enable client-side
  routing for same-origin navigation.

## Notes

- `ClientRouter` keeps its default `fallback` and `prefetchAll`; no Astro
  configuration change.
- The native `@view-transition { navigation: auto }` cross-document approach is
  retired in favor of `ClientRouter` as the single navigation-transition
  mechanism, while the per-slug shared-element identity, 200 ms timing, and
  reduced-motion reset are preserved.
