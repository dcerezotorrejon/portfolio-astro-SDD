# Tasks — Experience layout: 128px icon, side-by-side header, responsive

- **Spec ID**: `022-experience-layout`

> A task is only marked `[x]` with evidence from the applicable gates. If a gate
> does not apply, state it explicitly. Each task runs on the shared branch
> `spec/022-experience-layout` (stacked on `spec/021-cv-content`).

## Checklist

- [x] T1: **Layout restructure + unit test updates** — apply the 128px square icon
      (letterboxed logo) with the role→company→period text block on its right, the
      ≥1rem gap, the ≤600px stacked full-width layout, and right-aligned buttons in
      both views; update the unit tests to the new structure and 128px icon.
  - Owner: Dev. Files: `src/components/home/ExperienceHistory.astro`,
    `src/pages/experiencia/[slug].astro`, `tests/unit/home.test.ts`,
    `tests/unit/experience.test.ts`, `tests/unit/company-icon.test.ts`.
    Depends on: —.
  - Evidence (QA): approved. Re-verified on branch `spec/022-experience-layout`
    at revision `6128db9d1744bef14fc14a0d6103ad83dfc0ed85` with the task's
    uncommitted changes present. Scope:
    `src/components/home/ExperienceHistory.astro`,
    `src/pages/experiencia/[slug].astro`, `tests/unit/home.test.ts`,
    `tests/unit/experience.test.ts`, `tests/unit/company-icon.test.ts`.
    - AC1–AC5 unit-covered: 128×128 icon; header order (icon → role → company →
      period) in both views; right-aligned button wrapper (`flex` +
      `justify-end`). 17 passed across the three files.
    - Browser integration (QA) in `tests/integration/experience-layout.spec.ts`
      verifies AC2–AC5 on the home card and Babel detail at 1024/601/600/390px:
      side-by-side row (128×128 letterboxed icon left, role→company→period text
      right); 20px (≥1rem) header→description gap; stacked full-width
      undistorted icon at ≤600px; buttons right-aligned.
    - All six gates pass: lint, format, build, unit (156), a11y (5),
      integration (14).

- [x] T2: **Vertical centering** — change the desktop header alignment from
      `items-start` to `items-center` so the icon and the text block are vertically
      centered (R7/AC7), in both views; update the responsive integration
      assertion to verify the centered alignment.
  - Owner: Dev. Files: `src/components/home/ExperienceHistory.astro`,
    `src/pages/experiencia/[slug].astro`.
    Depends on: T1.
  - Evidence (QA): approved. Re-verified on branch `spec/022-experience-layout`
    at revision `ec3b32968c5f03573f826ced5c7e0a5819e02134` with the task's
    uncommitted changes present. Scope:
    `src/components/home/ExperienceHistory.astro`,
    `src/pages/experiencia/[slug].astro`,
    `tests/integration/experience-layout.spec.ts`.
    - AC7 (R7) browser integration (Chromium) on `tests/integration/experience-layout.spec.ts`
      (extended with a `headerAlignItems` measurement and centering assertions):
      at 1024px and 601px, both views compute `flex-direction: row` and
      `align-items: center`, and the text block's vertical center matches the
      icon's vertical center — home 1024px 0.00px, home 601px 0.00px, detail
      1024px 0.01px, detail 601px 0.00px.
    - AC1–AC6 re-confirmed by the full unit (156) and integration (14) suites:
      128×128 letterboxed icon, role→company→period order, ≥1rem header→description
      gap, ≤600px stacked full-width undistorted icon, right-aligned buttons,
      preserved heading levels.
    - All six gates pass: lint, format, build, unit (156), a11y (5),
      integration (14). (One initial `pnpm test:a11y` run hit a transient vitest
      worker SIGSEGV; a clean re-run passed 4 files / 5 tests.)

- [x] T3: **Reduce `display` heading to 32px** — change `--heading-display-size`
      from `clamp(2rem, 5vw, 2.75rem)` to `2rem` (R8/AC8); update the design doc
      and any test that asserts the old value.
  - Owner: Dev. Files: `src/styles/global.css`,
    `tests/unit/molecules-heading.test.ts`, `docs/design.md` (and verify
    `tests/unit/design-assets.test.ts`).
    Depends on: T1.
  - Evidence (QA): approved. Verified on branch `spec/022-experience-layout`
    at revision `ec3b32968c5f03573f826ced5c7e0a5819e02134` with the task's
    uncommitted changes present. Scope: `src/styles/global.css`,
    `tests/unit/molecules-heading.test.ts`, `docs/design.md`, and the AC8
    integration checks added by QA in
    `tests/integration/experience-layout.spec.ts`.
    - AC8 (R8): `--heading-display-size` is now `2rem` (was
      `clamp(2rem, 5vw, 2.75rem)`, which reached 44px). The unit token
      assertion in `tests/unit/molecules-heading.test.ts` resolves it to `2rem`.
      New Chromium integration checks (`display heading size (R8/AC8)` in
      `tests/integration/experience-layout.spec.ts`) confirm the rendered `h1`
      computes `font-size: 32px` on the home name (`#profile-name`) and the
      detail role (`.experience-detail-header h1`) at 1024px and 390px — the
      size is fixed and no longer responsive.
    - AC1–AC7 re-confirmed by the full unit (156) and integration (18) suites:
      the heading-size change does not affect the header layout, vertical
      centering, 128×128 icon, gap, ≤600px stacking, or button alignment.
    - `docs/design.md` `display` entry updated to `2rem` (32px).
    - All six gates pass: lint, format, build, unit (156), a11y (5),
      integration (18).

## Assets (maintainer-supplied, already in the working tree)

- `public/images/companies/babel.svg` (real logo), `nttdata.svg` (real logo),
  `astro.svg` (deleted) — committed with this increment; no Dev task required.

## Gate summary

Run at final verification (QA) and recorded against the relevant task.

- [x] Lint (`pnpm lint`) — pass
- [x] Format (`pnpm format:check`) — pass
- [x] Build (`pnpm build`) — pass (3 pages)
- [x] Unit tests (`pnpm test:run`) — pass (25 files / 156 tests)
- [x] Accessibility (`pnpm test:a11y`) — pass (4 files / 5 tests)
- [x] Integration (`pnpm test:integration`) — pass (18 tests)
