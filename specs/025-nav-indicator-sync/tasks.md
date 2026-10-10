# Tasks — Navigator indicator selection during in-page scrolling

- **Spec ID**: `025-nav-indicator-sync`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [ ] T1: Implement the selection hold in the floating navigator — a pure
      activation-offset helper in `helpers/navigation.ts`, and
      hold/release-on-arrival/retarget plus manual-input release and listener
      cleanup in `FloatingNav.tsx`; add unit tests.
  - Owner: Dev.
  - Files: `src/components/home/FloatingNav/FloatingNav.tsx`,
    `src/components/home/FloatingNav/helpers/navigation.ts`,
    `tests/unit/floating-nav.test.tsx`,
    `tests/unit/floating-nav-threshold.test.tsx`.
  - Covers: AC1–AC6 at the component/unit level.
  - Evidence: _pending_
- [ ] T2: Verify T1 on the shared branch — review the unit tests' sufficiency
      against the acceptance criteria, author/run the browser integration and
      accessibility coverage for hold/takeover/reduced-motion, run all
      applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/navigation.spec.ts`, `tests/a11y/**` as needed.
  - Covers: AC1–AC6 at the browser level.
  - Evidence: _pending_

## Gate summary

- [ ] Lint (`pnpm lint`)
- [ ] Format (`pnpm format:check`)
- [ ] Build (`pnpm build`)
- [ ] Unit tests (`pnpm test:run`)
- [ ] Accessibility (`pnpm test:a11y`)
- [ ] Integration (`pnpm test:integration`) — applicable (client behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)
