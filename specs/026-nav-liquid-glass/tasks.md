# Tasks — Subtle liquid-glass surface for the floating navigator

- **Spec ID**: `026-nav-liquid-glass`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [ ] T1: Implement the navigator glass surface — component tokens for a
      translucent light surface and blur in `global.css` (registered with
      Tailwind), the glass utility stack with an opaque fallback in
      `FloatingNav.tsx`, and the shared criteria updated in `docs/design.md`;
      update/add the unit design tests.
  - Owner: Dev.
  - Files: `src/styles/global.css`,
    `src/components/home/FloatingNav/FloatingNav.tsx`, `docs/design.md`,
    `tests/unit/design-assets.test.ts` (and any navigator design test).
  - Covers: AC1, AC2, AC3, AC5, AC6 at the source/token level.
  - Evidence: _pending_
- [ ] T2: Verify T1 on the shared branch — review the unit tests' sufficiency,
      author/run the browser integration coverage (computed background alpha and
      `backdrop-filter`, screenshots over the page and over cards, focus
      visibility, and the fallback when `backdrop-filter` is unavailable or
      reduced transparency is requested) and the accessibility coverage, run all
      applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/**`, `tests/a11y/**` as needed.
  - Covers: AC1–AC6 at the browser level.
  - Evidence: _pending_

## Gate summary

- [ ] Lint (`pnpm lint`)
- [ ] Format (`pnpm format:check`)
- [ ] Build (`pnpm build`)
- [ ] Unit tests (`pnpm test:run`)
- [ ] Accessibility (`pnpm test:a11y`)
- [ ] Integration (`pnpm test:integration`) — applicable (styles / rendered
  behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)
