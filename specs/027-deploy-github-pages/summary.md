# Summary: GitHub Pages Deployment

- **Date**: 2026-10-10
- **Spec**: `027-deploy-github-pages`

## What changed

The Astro site now builds for the GitHub Pages project URL
`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`, and a GitHub Actions
workflow validates and publishes it on every push to `main`. A shared
base-resolution helper makes every site-root asset and link resolve under the
`/portfolio-astro-SDD` base, and the test/tooling suites were re-anchored to the
new origin and base.

## Files changed

- `astro.config.mjs`
- `src/lib/base-url.ts` (new)
- `src/layouts/SiteLayout.astro`
- `src/styles/global.css`
- `src/components/atoms/Icon.astro`
- `src/components/home/ProfileIntroduction.astro`
- `src/components/home/ExperienceHistory.astro`
- `src/pages/experiencia/[slug].astro`
- `.github/workflows/deploy.yml` (new)
- `playwright.config.ts`
- `README.md`
- `tests/helpers/render.ts`
- `tests/seo/home.test.ts`
- `tests/seo/experience.test.ts`
- `tests/seo/build-output.test.ts` (new)
- `tests/integration/helpers/site.ts` (new)
- `tests/integration/accessibility.spec.ts`
- `tests/integration/experience-layout.spec.ts`
- `tests/integration/experience.spec.ts`
- `tests/integration/navigation.spec.ts`
- `tests/integration/pages.spec.ts`
- `tests/integration/profile.spec.ts`
- `tests/unit/base-url.test.ts` (new)
- `tests/unit/site-config.test.ts` (new)
- `tests/unit/deployment-workflow.test.ts` (new)
- `tests/unit/button-design.test.ts`
- `tests/unit/company-icon.test.ts`
- `tests/unit/design-assets.test.ts`
- `tests/unit/experience.test.ts`
- `tests/unit/home.test.ts`
- `tests/unit/icon.test.ts`
- `tests/unit/integration-tooling.test.ts`
- `tests/unit/transitions.test.ts`
- `specs/027-deploy-github-pages/spec.md`
- `specs/027-deploy-github-pages/plan.md`
- `specs/027-deploy-github-pages/tasks.md`
- `specs/027-deploy-github-pages/summary.md`

## Functions / components changed

- `withBase(path)` in `src/lib/base-url.ts` (new): single source of truth for the
  deployment origin (`SITE`) and base (`BASE`), prefixing site-root paths with the
  base while preserving fragments/queries and leaving external, protocol-relative,
  and relative references untouched.
- `astro.config.mjs`: `site` and `base` now come from the `SITE`/`BASE` constants;
  the `example.com` placeholder and its TODO were removed.
- `SiteLayout.astro`: base-aware favicon links and a build-time
  `@font-face` whose Open Sans URL carries the base in the emitted CSS.
- `Icon.astro`: base-aware `<use href>` from the unchanged `iconMap` entries.
- `ProfileIntroduction.astro`, `ExperienceHistory.astro`,
  `experiencia/[slug].astro`: base-aware image sources and experience links,
  including the `#trayectoria` return link.
- `global.css`: removed the base-less `@font-face` (now emitted from the layout).
- `.github/workflows/deploy.yml` (new): on push to `main` only, installs with pnpm
  and the frozen lockfile, installs Chromium, runs `pnpm lint`, `pnpm format:check`,
  `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration`,
  enables Pages with `actions/configure-pages` (`enablement: true`), uploads
  `dist/`, and deploys with `actions/deploy-pages`.
- `playwright.config.ts`: `baseURL` and `webServer.url` point at the base path.
- `README.md`: deployment section with the published URL, the workflow trigger and
  gate behavior, and the one-time `gh api` Pages activation command.
- Tests: unit/SEO/accessibility/integration suites re-anchored to the new origin
  and base, including a new build-output SEO check and a workflow guard test.
