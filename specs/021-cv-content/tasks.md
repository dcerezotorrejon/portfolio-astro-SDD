# Tasks — Adapt real CV content into the portfolio

- **Spec ID**: `021-cv-content`

> A task is only marked `[x]` with evidence from the applicable gates. If a gate
> does not apply, state it explicitly. Each task runs on the shared branch
> `spec/021-cv-content`.

## Checklist

- [x] T1: **Placeholder company SVGs** — add `public/images/companies/babel.svg`
      and `public/images/companies/nttdata.svg` (self-contained initials marks,
      matching the `companyIconSchema` path regex).
  - Owner: Dev. Files: the two SVG files only. Depends on: —.
  - Evidence: QA verified both SVGs exist, their filenames match
    `companyIconSchema`'s `/^\/images\/companies\/[a-z0-9-]+\.svg$/`, and both are
    self-contained (no `<image>`, external `href`, or `url()` references). They
    render through `pnpm test:run` and `pnpm test:integration`.
- [x] T2: **Core migration** — schema (`about`, remove `notice`, relax `image.src`),
      real profile + two real experience entries (delete the two placeholders),
      components (render `about`, drop notice), and unit-test updates.
  - Owner: Dev. Files: `src/content/parsers/content-schema.ts`,
    `src/content/profile/profile.md`, `src/content/experience/babel-senior-frontend-engineer.md`,
    `src/content/experience/nttdata-lead-engineer.md` (new) and delete
    `src/content/experience/puesto-ejemplo-*.md`, `src/components/home/ProfileIntroduction.astro`,
    `src/pages/experiencia/[slug].astro`,
    `tests/unit/content.test.ts`, `tests/unit/home.test.ts`,
    `tests/unit/experience.test.ts`, `tests/unit/company-icon.test.ts`.
    Depends on: T1 (content references the two SVGs for a complete render).
  - Evidence: QA re-verification on shared branch `spec/021-cv-content`, revision
    `b5ae8526fb63a2221b6226e4031bb014ca1773a4` (change set uncommitted). All gates
    pass: lint, format, build, `pnpm test:run` (25 files / 156 tests),
    `pnpm test:a11y` (4 files / 5 tests), and `pnpm test:integration` (6 Chromium
    tests, incl. the WCAG A/AA browser axe audit). The `image-redundant-alt`
    regression is resolved via descriptive `companyIcon.alt` values, and AC3 is
    exercised by the `tests/unit/content.test.ts` image-path accept/reject cases.
    Spec R2/AC2 are re-anchored to the descriptive `companyIcon.alt` values and
    match the implementation and tests.
- [x] T3: **Ignore the source PDF** — add `Daniel Cerezo Torrejón` to `.gitignore`
      so the untracked CV source is never committed (contains personal data).
  - Owner: Dev. Files: `.gitignore`. Depends on: —.
  - Evidence: QA verified `.gitignore` contains `/Daniel Cerezo Torrejón` and
    `git check-ignore -v "Daniel Cerezo Torrejón"` confirms the CV source is
    ignored.

## Gate summary

Run at final verification (QA) and recorded against the relevant tasks.

- [x] Lint (`pnpm lint`) — pass (exit 0)
- [x] Format (`pnpm format:check`) — pass (exit 0; all files Prettier-clean)
- [x] Build (`pnpm build`) — pass (exit 0; 3 pages incl. both
      `/experiencia/<slug>/` routes)
- [x] Unit tests (`pnpm test:run`) — pass (25 files, 156 tests)
- [x] Accessibility (`pnpm test:a11y`) — pass (4 files, 5 tests; zero axe
      violations)
- [x] Integration (`pnpm test:integration`) — pass (6 Chromium tests, incl.
      WCAG A/AA browser axe)
