# Tasks — Subtle liquid-glass surface for the floating navigator

- **Spec ID**: `026-nav-liquid-glass`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Implement the navigator glass surface — component tokens for a
      translucent light surface and blur in `global.css` (registered with
      Tailwind), the glass utility stack with an opaque fallback in
      `FloatingNav.tsx`, and the shared criteria updated in `docs/design.md`;
      update/add the unit design tests.
  - Owner: Dev.
  - Files: `src/styles/global.css`,
    `src/components/home/FloatingNav/FloatingNav.tsx`, `docs/design.md`,
    `tests/unit/design-assets.test.ts` (and any navigator design test).
  - Covers: AC1, AC2, AC3, AC5, AC6 at the source/token level.
  - Evidence (QA-reviewed, T2): Dev's `tests/unit/design-assets.test.ts` coverage
    is sufficient for AC1/AC2/AC5/AC6 at the source/token level: it pins
    `--nav-glass-surface` = `rgb(255 255 255 / 0.7)` and `--nav-glass-blur` =
    `12px`, the `@theme inline --blur-nav` registration, the `@utility nav-glass`
    with `backdrop-filter` plus the `@supports not (...)` and
    `@media (prefers-reduced-transparency: reduce)` opaque branches, the absence
    of `.floating-nav` in `global.css`, the untouched non-navigator surfaces, and
    the `docs/design.md` criteria. No gaps requiring rework; the pinned exact
    values sit inside the 0.55–0.85 alpha / ≥8 px blur bounds that T2 asserts at
    the browser level.
- [x] T2: Verify T1 on the shared branch — review the unit tests' sufficiency,
      author/run the browser integration coverage (computed background alpha and
      `backdrop-filter`, screenshots over the page and over cards, focus
      visibility, and the fallback when `backdrop-filter` is unavailable or
      reduced transparency is requested) and the accessibility coverage, run all
      applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/**`, `tests/a11y/**` as needed.
  - Covers: AC1–AC6 at the browser level.
  - Evidence: Verified on `spec/026-nav-liquid-glass` at `ae4264e` (plus the
    uncommitted T1 changes). Added `tests/integration/nav-liquid-glass.spec.ts`
    (6 Chromium tests): AC1 computed `background-color: rgba(255, 255, 255, 0.7)`
    (alpha 0.7 within 0.55–0.85) and `backdrop-filter: blur(12px)` (≥8 px) with
    the pill radius, border/highlight, and shadow retained, no gradient; AC2
    card/badge/primary-button/page computed backgrounds are fully opaque and
    unchanged (`rgb(255,255,255)` / `rgb(12,122,191)` / `rgb(239,243,248)`, no
    `backdrop-filter`); AC3 label and indicator contrast ≥4.5:1 over composited
    page and card surfaces, keyboard focus outline `3px solid rgb(7,89,133)`,
    axe WCAG 2.2 A/AA clean, and screenshots `test-results/nav-glass-over-card.png`
    and `test-results/nav-glass-over-page.png` (asserted to differ). AC4 fallback
    verified two ways: `prefers-reduced-transparency: reduce` emulated with CDP
    `Emulation.setEmulatedMedia` → opaque `rgb(255,255,255)`, `backdrop-filter:
none`, layout/contrast/focus preserved; the no-`backdrop-filter` case
    verified by rewriting the served stylesheet so the real
    `@supports not ((-webkit-backdrop-filter:blur(0px)) or (backdrop-filter:blur(0px)))`
    branch applies → opaque surface. AC6 placement/size/destinations/indicator
    and reduced-motion suppression unchanged (existing `navigation.spec.ts`
    still passes). Gates: `pnpm lint` clean; `pnpm format:check` clean;
    `pnpm build` success (3 pages + sitemap); `pnpm test:run` 168 passed (25
    files); `pnpm test:a11y` 5 passed (4 files); `pnpm test:integration` 30
    passed. SEO not applicable (no change to titles, meta descriptions, canonical
    URLs, or the sitemap). AC1–AC6 verified; approved.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`) — applicable (styles / rendered
      behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)

Independently re-run by the Dev Lead on 2026-10-10 on `spec/026-nav-liquid-glass`:
`pnpm lint` clean; `pnpm format:check` clean; `pnpm build` success; `pnpm test:run`
168 passed; `pnpm test:a11y` 5 passed; `pnpm test:integration` 30 passed.
