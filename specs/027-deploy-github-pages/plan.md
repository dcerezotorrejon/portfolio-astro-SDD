# Plan: GitHub Pages Deployment

Spec: [`spec.md`](./spec.md) · Base revision: `main` @ `1552b36` · Shared branch:
`spec/027-deploy-github-pages`.

## Context recap

The site is currently configured for local development only (`site = "https://example.com"`,
no `base`, no CI). GitHub Pages project sites are served from a subpath, so the build
must target `https://dcerezotorrejon.github.io/portfolio-astro-SDD/` and every
site-root reference must resolve under `/portfolio-astro-SDD/`. The existing unit,
SEO, accessibility, and integration suites hardcode the placeholder origin and
root paths and must be re-anchored.

## Approach

1. **Point the build at the project URL.**
   In `astro.config.mjs`, set `site = "https://dcerezotorrejon.github.io"` and
   `base = "/portfolio-astro-SDD"`, and remove the `example.com` placeholder and
   TODO. Keep the named `site` export (test helper imports it).

2. **Make URL resolution base-aware at render time.**
   Add `src/lib/base-url.ts` exporting `withBase(path)` (prefixes a site-root path
   with `import.meta.env.BASE_URL`) and use it for every site-root reference:
   - `src/layouts/SiteLayout.astro` — favicon links.
   - `src/components/atoms/Icon.astro` — `<use href>`; `iconMap` values stay
     site-root strings.
   - `src/components/home/ProfileIntroduction.astro` — profile image `src`.
   - `src/components/home/ExperienceHistory.astro` — company icon `src` and
     detail `href`.
   - `src/pages/experiencia/[slug].astro` — company icon `src` and the
     `#trayectoria` return link.
   - `src/styles/global.css` — the Open Sans `@font-face` source. Plain CSS cannot
     read `import.meta.env`, so resolve the font URL at build time (e.g. emit the
     `@font-face` from `SiteLayout.astro` via an `is:global` style/`define:vars`
     carrying the base-derived URL) so the built CSS contains
     `/portfolio-astro-SDD/fonts/open-sans-latin.woff2`. `public/fonts/` is
     unchanged. If the toolchain already rebases `url()` in CSS, a minimal change
     is acceptable **only if** the built CSS proves the base prefix.
     Content Markdown values (`/images/...`) are left untouched; prefixing happens
     at render time, preserving the content schema.

3. **Keep canonical and sitemap correct.**
   `@astrojs/sitemap` derives entries from `site`; with `base` set, canonical
   links and `dist/sitemap-0.xml` must carry the origin plus base.

4. **Add the deployment workflow.**
   `.github/workflows/deploy.yml`, triggered only by `push` to `main`, with
   `permissions: { contents: read, pages: write, id-token: write }` and a Pages
   `concurrency` group. Steps: checkout → pnpm setup (pinned) → Node 22 with pnpm
   cache → `pnpm install --frozen-lockfile` →
   `pnpm exec playwright install --with-deps chromium` → gates in order
   (`pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
   `pnpm test:a11y`, `pnpm test:integration`) → `actions/configure-pages`
   (`enablement: true`) → `actions/upload-pages-artifact` (`path: ./dist`) →
   `actions/deploy-pages`. Build precedes `test:run` so the `dist/`-dependent SEO
   check is active; `pnpm test:integration` rebuilds and previews the site under
   the base.

5. **Document deployment.**
   `README.md`: update the provisional note and the "Site configuration" section;
   add a Deployment section with the published URL, the trigger/behavior, and the
   one-time `gh api` command that sets the Pages build type to `workflow`.

6. **Re-anchor tests and tooling.**
   - Dev (owns `tests/unit/**`): update the unit assertions affected by
     base-prefixed output, add tests for the `site`/`base` values and for the
     workflow, and update `playwright.config.ts` `baseURL` to the base path
     (keeping `tests/unit/integration-tooling.test.ts` consistent).
   - QA (owns `tests/seo/**`, `tests/a11y/**`, `tests/integration/**`,
     `tests/helpers/**`): re-anchor `tests/helpers/render.ts` to `site` + `base`,
     update SEO canonical/sitemap expectations, and make integration navigation
     base-aware (`page.goto` paths currently start with `/`, which ignores a
     base-path `baseURL`).

## Files to change

Production / config (Dev):

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

Tests, Dev-owned (`tests/unit/**`):

- affected assertions in `tests/unit/icon.test.ts`, `home.test.ts`,
  `experience.test.ts`, `button-design.test.ts`, `transitions.test.ts`,
  `design-assets.test.ts`, `integration-tooling.test.ts`
- new unit tests for `site`/`base` and for the deployment workflow

Tests, QA-owned (`tests/seo/**`, `tests/a11y/**`, `tests/integration/**`,
`tests/helpers/**`):

- `tests/helpers/render.ts`
- `tests/seo/home.test.ts`, `tests/seo/experience.test.ts`
- `tests/integration/pages.spec.ts`, `navigation.spec.ts`, and any other
  `tests/integration/*.spec.ts` with root-absolute navigation
- `tests/a11y/**` only if helper alignment requires it

## Approved decisions

- **Project site** under `/portfolio-astro-SDD` with `site`/`base` per spec R1
  (maintainer-approved).
- **GitHub Actions on `push` to `main`** with quality gates before publish
  (maintainer-approved).
- **Pages activation** via `actions/configure-pages` `enablement: true` plus a
  documented `gh` command (maintainer-approved).
- **Base handling**: `withBase()` over `import.meta.env.BASE_URL` in components;
  content Markdown unchanged; the font URL resolved at build time.
- **Workflow uses explicit steps**, not `withastro/action`, so gates run before
  artifact upload; pnpm pinned to 10 (lockfile v9), Node 22.x.
- **Playwright integration runs inside the CI workflow** (Chromium installed with
  `--with-deps`), before the artifact is published (maintainer decision).
- **Pending spec re-anchor (Spec Refiner)**: the spec still lists the workflow
  gates without `pnpm test:integration` and keeps a non-goal excluding the
  Playwright suite from the deployment workflow. `spec.md` must be re-anchored
  (R5, AC5, Non-goals) before T2/T3 are implemented; `spec.md` is Spec
  Refiner-owned and the Lead must not edit it.

## Risks and trade-offs

- Vite may not rebase `url("/fonts/...")` for public assets; the emitted CSS must
  be checked and the URL resolved explicitly if needed.
- `import.meta.env.BASE_URL` may differ between the build and the Astro
  container/Vitest context; assertions must be anchored to the configured base
  and validated in both.
- Integration navigation uses root-absolute `page.goto("/...")`, which drops a
  base-path `baseURL`; QA must make navigation base-aware.
- `/portfolio-astro-SDD` is case-sensitive and must keep matching the repository
  name; a rename requires a `base` change.
- The live deployment cannot be verified on the branch; the first workflow run on
  `main` and Pages activation are external outcomes reported by the Lead.

## Testing strategy

- **Dev**: `pnpm exec vitest run tests/unit` for Task 1/2; Prettier on every
  changed file.
- **QA per task**: full applicable gates. For Task 1: `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, `pnpm test:integration`, `pnpm lint`, `pnpm format:check`.
  For Task 2: `pnpm test:run`, `pnpm lint`, `pnpm format:check` (workflow is not
  rendered; integration not applicable by itself). For Task 3 (README-only,
  Markdown): `pnpm lint`, `pnpm format:check` under the Constitution §§5–6
  Markdown-only exception.
- **Lead final gates** over the whole increment: `pnpm lint`, `pnpm format:check`,
  `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`.
