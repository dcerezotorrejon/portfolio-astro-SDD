# T3 QA evidence — Floating navigator

- **Date:** 2026-10-05
- **Scope:** `src/components/FloatingNav.tsx` and `src/lib/navigation.ts` (R8/R11;
  helper behavior and component contract only). Browser-level snap, safe-area,
  settled-indicator, reduced-motion, and route integration checks remain for T4/
  final integration as specified in AC12.

## Tests added

- `tests/unit/navigation.test.ts`: nearest midpoint selection, exact-tie retention,
  first-item tie fallback without a previous choice, input ordering, removed/missing
  previous IDs, and the empty-list result.
- `tests/unit/floating-nav.test.tsx`: Astro Container SSR anchors and accessible
  current state; initial fragment/geometry selection; geometry-driven selection
  independent of link clicks; scroll-frame coalescing and tie retention; resize,
  hashchange, pageshow, font-loading, and optional `ResizeObserver` updates; changed
  ordering/removal; and listener, observer, and pending-frame cleanup. Includes the
  required jsdom annotation and uses the existing React Testing Library.
- `tests/a11y/floating-nav.test.ts`: axe-core check of the SSR navigation in a
  Spanish document with an accessible navigation name.

## Gate evidence

- **Unit/component:** `pnpm exec vitest run tests/unit/navigation.test.ts tests/unit/floating-nav.test.tsx tests/a11y/floating-nav.test.ts` — passed, 3 files / 13 tests.
- **Accessibility:** The same command runs the component's axe SSR test — passed;
  no axe violations. Interactive browser keyboard/focus inspection remains part of
  integration.
- **Lint:** `pnpm exec eslint tests/unit/navigation.test.ts tests/unit/floating-nav.test.tsx tests/a11y/floating-nav.test.ts` — passed.
- **Format:** `pnpm exec prettier --check tests/unit/navigation.test.ts tests/unit/floating-nav.test.tsx tests/a11y/floating-nav.test.ts` — passed. This is deliberately scoped to QA-owned files; no repository-wide format command was run.
- **SEO:** Not applicable to this standalone navigator/helper task: neither file
  owns page metadata, canonical URLs, or sitemap output. Route SEO belongs to T4/T5.
- **Build / repository-wide lint and test gates:** Not run for this isolated T3
  verification while T1/T2/T4 work is concurrent. They remain required at feature
  integration; browser verification also remains open per AC12.
