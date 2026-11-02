# Tasks

Evidence is recorded next to each task. Gates that do not apply are stated
explicitly.

## T1 — Align unit tests with the client-only contract (Dev, then QA review)

- Owner: `dev` (model: sonnet, default). Scope: `tests/unit/**` only.
- Depends on: none. Covers: AC1, AC2, AC5.
- [x] Update `tests/unit/home.test.ts` so the home render asserts no `.floating-nav`
      and exactly one `astro-island` for `FloatingNav` with `client="only"` and
      the `react` renderer; keep the section-order assertions.
- [x] Review the other `tests/unit/**` files that reference `FloatingNav` for
      assumptions about server-rendered markup and fix them.
- [x] Verified by QA: sufficiency against AC1, AC2.
- Evidence (QA, branch `spec/031-floating-nav-hydration` @ 7adc1b6 plus
  uncommitted working tree; scope `tests/unit/home.test.ts`): reviewed the diff.
  Assertions: no `.floating-nav`, exactly one `astro-island`, `client="only"`,
  `component-url` ends in `/FloatingNav.tsx`, `opts` equals
  `{name: "FloatingNav", value: "react"}`, and the page source contains
  `<FloatingNav sections={profile.navigation} client:only="react" />`. This is
  sufficient for AC1 and AC2 (R1, R2, R5; the single-island count covers R5).
  Section-order assertions kept. No other `tests/unit/**` file asserts
  server-rendered nav on the home page (`tests/seo/experience.test.ts:90` asserts
  its absence on detail pages, still valid). `pnpm test:run`: 31 files, 225
  tests passed. No defects.

## T2 — Improve browser coverage and run gates (QA)

- Owner: `qa` (model: sonnet, default). Scope: `tests/integration/**`,
  `tests/a11y/**`, `tests/seo/**`, and task evidence.
- Depends on: T1. Covers: AC3, AC4, AC5.
- [x] Add or adjust integration coverage for `/#<section-id>` active on first
      mount and for scrolling still updating the active link.
- [x] Confirm the axe audit covers the mounted navigation and its accessible name.
- [x] Run lint, format, build, unit, a11y, integration and record the results.
- Evidence (QA, branch `spec/031-floating-nav-hydration` @ 7adc1b6 plus
  uncommitted working tree; scope `tests/integration/navigation.spec.ts`,
  `tests/integration/helpers/content.ts`):
  - Added `navigationSections` helper (parses `profile.navigation`) and four
    Playwright tests in `navigation.spec.ts`: mounted nav has every configured
    link (text, href) and the name `Navegación por secciones` (AC3); `/#inicio`
    and `/#trayectoria` mark the matching link active on first mount, with
    exactly one `aria-current` and matching `data-active-index` (AC4); scrolling
    after a fragment first mount switches the active link both ways (AC4). All
    wait for `data-positioned="true"` (island mounted).
  - Axe: `tests/integration/accessibility.spec.ts` already waits for the mounted
    navigation on the home route before auditing WCAG A/AA through 2.2, and
    audits again after activation; sufficient, unchanged (AC3).
  - SEO/a11y: `tests/seo/*` and `tests/a11y/*` make no assumption of
    server-rendered home nav (a11y renders the component in isolation); unchanged.
  - Gates: `pnpm lint` pass; `pnpm format:check` pass; `pnpm build` pass (3
    pages); `pnpm test:run` pass (31 files, 225 tests); `pnpm test:a11y` pass (4
    files, 5 tests); `pnpm test:integration` pass (37 tests, Chromium).
  - No defects. AC1–AC5 verified.
