# Tasks — Add Client Router

- **Spec ID**: `020-add-client-router`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Retire the native MPA view-transition trigger and reconcile the
      transition unit tests.
  - **Dev owns**: `src/styles/global.css`, `tests/unit/transitions.test.ts`
  - Remove `@view-transition { navigation: auto; }` and the reduced-motion
    `@view-transition { navigation: none; }`; keep the `::view-transition-*`
    timing and reduced-motion reset. Update the "native MPA" unit assertions to
    assert the native trigger is absent.
  - Evidence (QA, shared branch `spec/020-add-client-router` rev `1334ef1`, working tree includes T1+T2; re-verified after defect fix): unit `pnpm test:run` — pass (24 files, 152 tests; includes the SEO and a11y vitest suites). SEO `pnpm vitest run tests/seo` — pass (2 files, 5 tests). a11y `pnpm test:a11y` — pass (4 files, 5 tests). integration `pnpm test:integration` — pass (5 tests). lint `pnpm lint`, format `pnpm format:check`, build `pnpm build` — pass. Approved.

- [x] T2: Wire `ClientRouter` into `SiteLayout` and add layout render coverage.
  - **Dev owns**: `src/layouts/SiteLayout.astro`, `tests/unit/site-layout.test.ts`
  - **QA owns**: `tests/integration/navigation.spec.ts` (AC2: home → detail →
    home client-side navigation with no full reload)
  - Evidence (QA, shared branch `spec/020-add-client-router` rev `1334ef1`,
    working tree includes T1+T2): unit `pnpm test:run` — pass (25 files, 154
    tests; includes the new `site-layout.test.ts` and the SEO/a11y vitest
    suites). Unit sufficiency: AC1 covered by the layout render test asserting
    the `astro-view-transitions-enabled` meta (`content="true"`); AC7 covered by
    reading `astro.config.mjs` and asserting no `prefetch` setting — sufficient.
    SEO `pnpm vitest run tests/seo` — pass (2 files, 5 tests; `<title>`, meta
    description, and canonical unchanged). a11y `pnpm test:a11y` — pass (4
    files, 5 tests). integration `pnpm test:integration` — pass (6 tests; new
    `navigation.spec.ts` AC2 case proves a home → detail → home round-trip keeps
    a `window` marker across both hops, i.e. no full document reload). lint
    `pnpm lint`, format `pnpm format:check`, build `pnpm build` — pass.
    Approved.

## Gate summary

Final-gate pass (QA, shared branch `spec/020-add-client-router`, working tree
includes the complete feature change set; non-Markdown changes so the
Markdown-only exception does not apply, and integration applies because the
feature affects routing, styles, and client behavior):

- [x] Lint (`pnpm lint`) — pass (no errors).
- [x] Format (`pnpm format:check`) — pass (all matched files use Prettier code
      style).
- [x] Build (`pnpm build`) — pass (3 pages built, sitemap generated).
- [x] Unit tests (`pnpm test:run`) — pass (25 files, 154 tests; includes the
      SEO and a11y vitest suites).
- [x] Accessibility (`pnpm test:a11y`) — pass (4 files, 5 tests).
- [x] Integration (`pnpm test:integration`) — pass (6 tests; includes the AC2
      client-side round-trip and the browser axe audit).
