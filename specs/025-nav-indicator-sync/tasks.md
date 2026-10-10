# Tasks — Navigator indicator selection during in-page scrolling

- **Spec ID**: `025-nav-indicator-sync`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Implement the selection hold in the floating navigator — a pure
      activation-offset helper in `helpers/navigation.ts`, and
      hold/release-on-arrival/retarget plus manual-input release and listener
      cleanup in `FloatingNav.tsx`; add unit tests.
  - Owner: Dev.
  - Files: `src/components/home/FloatingNav/FloatingNav.tsx`,
    `src/components/home/FloatingNav/helpers/navigation.ts`,
    `tests/unit/floating-nav.test.tsx`,
    `tests/unit/floating-nav-threshold.test.tsx`.
  - Covers: AC1–AC6 at the component/unit level.
  - Evidence: `pnpm test:run` (three files: `floating-nav.test.tsx`,
    `floating-nav-threshold.test.tsx`, `navigation.test.ts`) → 39 passed; full
    `pnpm test:run` → 166 passed / 1 skipped; `pnpm lint` clean;
    `pnpm format:check` clean. Coverage reviewed by QA: hold across in-flight
    measurements, 17.1 px hold / 17 px release, wheel release, scroll-key
    release (Tab ignored), retarget, reduced-motion fall-through, and the pure
    `hasReachedActivation` boundary. QA re-ran all commands and confirmed (T2).
- [x] T2: Verify T1 on the shared branch — review the unit tests' sufficiency
      against the acceptance criteria, author/run the browser integration and
      accessibility coverage for hold/takeover/reduced-motion, run all
      applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/navigation.spec.ts`, `tests/a11y/**` as needed.
  - Covers: AC1–AC6 at the browser level.
  - Evidence: Verified on `spec/025-nav-indicator-sync` @ `23655e5` plus the
    task working-tree changes. `pnpm lint` clean; `pnpm format:check` clean;
    `pnpm build` success (3 pages); `pnpm test:run` 25 files → 166 passed /
    1 skipped; `pnpm test:a11y` 4 files → 5 passed; `pnpm test:integration`
    (build + Playwright Chromium) → 24 passed, including new coverage in
    `tests/integration/navigation.spec.ts` (indicator holds the activated
    target across the whole in-page scroll — samples every frame, never reverts
    to "Inicio" — manual-scroll takeover via a scroll key returns to "Inicio",
    mid-hold retarget, reduced-motion activation, keyboard-focused link stays
    visible and current) and `tests/integration/accessibility.spec.ts`
    (`aria-current` follows the selection and the page stays axe-clean). SEO:
    not applicable (no change to titles, meta descriptions, canonical URLs, or
    the sitemap). AC1–AC6 verified. Known harness limitation: headless Chromium
    does not cancel the programmatic smooth scroll on a synthetic wheel, so the
    browser manual-scroll takeover is asserted with a scroll key; the wheel
    release path is unit-covered.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`) — applicable (client behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)

Independently re-run by the Dev Lead on 2026-10-10 on `spec/025-nav-indicator-sync`:
`pnpm lint` clean; `pnpm format:check` clean; `pnpm build` success; `pnpm test:run`
167 passed; `pnpm test:a11y` 5 passed; `pnpm test:integration` 24 passed.
