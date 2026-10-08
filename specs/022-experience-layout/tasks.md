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

## Assets (maintainer-supplied, already in the working tree)

- `public/images/companies/babel.svg` (real logo), `nttdata.svg` (real logo),
  `astro.svg` (deleted) — committed with this increment; no Dev task required.

## Gate summary

Run at final verification (QA) and recorded against the relevant task.

- [x] Lint (`pnpm lint`) — pass
- [x] Format (`pnpm format:check`) — pass
- [x] Build (`pnpm build`) — pass
- [x] Unit tests (`pnpm test:run`) — pass (156 tests)
- [x] Accessibility (`pnpm test:a11y`) — pass (5 tests)
- [x] Integration (`pnpm test:integration`) — pass (14 tests)
