# Plan — Add Client Router

- **Spec ID**: `020-add-client-router`
- **Last updated**: 2026-10-08

## Approach

Enable Astro's client-side router (`ClientRouter` from `astro:transitions`) in the
shared `SiteLayout`, and retire the browser-native cross-document View Transition
trigger (`@view-transition { navigation: auto; }`) so `ClientRouter` becomes the
single navigation-transition mechanism. Same-origin navigations (home ↔
`/experiencia/[slug]/`, section anchors, and the detail-page return link) turn into
SPA navigations without a full document reload, while the existing transition
contract — per-slug shared-element identity, 200 ms duration, and reduced-motion
reset — is preserved.

## Files to change

- `src/layouts/SiteLayout.astro` — import `ClientRouter` from `astro:transitions`
  and render `<ClientRouter />` in the `<head>`. Already present in the working
  tree; Dev owns finalization.
- `src/styles/global.css` — remove the native cross-document trigger: the
  top-level `@view-transition { navigation: auto; }` rule and the reduced-motion
  `@view-transition { navigation: none; }` block. Keep the `::view-transition-*`
  200 ms timing rule and the reduced-motion `animation: none` reset. Update the
  now-stale "native cross-document transitions" comment.
- `tests/unit/transitions.test.ts` — replace the "enables native MPA transitions"
  assertion with a "does not declare the native MPA trigger" assertion; keep the
  shared-element, transition-scope, timing, and reduced-motion assertions.
- `tests/unit/site-layout.test.ts` — NEW: render `SiteLayout` and assert the
  `astro-view-transitions-enabled` meta tag is emitted in the `<head>` (AC1).
- `tests/integration/navigation.spec.ts` — QA extends to assert a home → detail →
  home round-trip performs client-side navigation without a full reload (AC2).

## Key decisions

- **Single mechanism**: `ClientRouter` replaces the native `@view-transition
{ navigation: auto; }` approach rather than coexisting with it (maintainer
  scope answer: "ClientRouter + reconciliar CSS/tests").
- **No explicit fallback**: keep `ClientRouter`'s default `fallback="animate"`;
  the spec does not pin a fallback strategy (maintainer decision).
- **Default prefetch**: keep `ClientRouter`'s default `prefetchAll`; no `prefetch`
  configuration change (maintainer decision).

## Risks

- **Container resolution of `astro:transitions`**: the `site-layout.test.ts` unit
  test renders `SiteLayout` through the Astro container, which must resolve the
  `astro:transitions` virtual module. Mitigation: `tests/unit/home.test.ts` and
  `tests/seo/home.test.ts` already render the full home page (which includes
  `SiteLayout`), so this path is exercised; if the container does not emit the
  meta tag, assert the ClientRouter wiring at the source-contract level instead.
- **Timing / reduced-motion behavior**: removing `navigation: auto` must not drop
  the 200 ms or reduced-motion guarantees. Mitigation: the `::view-transition-*`
  rules also apply to same-document transitions and are retained, with the unit
  assertions kept.
- **Prefetch load**: default `prefetchAll` issues client requests for all
  internal routes. Accepted by the maintainer; no config change.

## Testing strategy

- Unit / component: `tests/unit/transitions.test.ts` (reconciled) and
  `tests/unit/site-layout.test.ts` (new, AC1).
- SEO: existing `tests/seo/home.test.ts` and `tests/seo/experience.test.ts`
  confirm `<title>`, meta description, and canonical remain unchanged.
- Accessibility: existing `tests/a11y/*` plus the reduced-motion review (AC6).
- Integration: `tests/integration/navigation.spec.ts` extended for AC2.
