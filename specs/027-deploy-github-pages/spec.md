# GitHub Pages Deployment

- **Spec ID**: `027-deploy-github-pages`
- **Status**: done
- **Last updated**: 2026-10-10

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio is an Astro static site that currently runs only in local
development. `astro.config.mjs` still uses the placeholder
`site = "https://example.com"` with a TODO to replace it, and the repository has
no CI or deployment configuration. Nothing in the codebase is prepared to be
served from a URL subpath.

The site must be published through GitHub Pages for the
`dcerezotorrejon/portfolio-astro-SDD` repository. Because that is a GitHub
Pages **project site**, it is served from the subpath
`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`, not from the origin
root. Serving from a subpath requires an Astro `base`, and every asset and
internal link currently written as a root-absolute path — the favicon, the
Open Sans web font, the GitHub/LinkedIn icon sprite, the profile image, the
company icons, and the experience-detail return link — resolves as site-root
and would break under the base path.

The existing test and tooling suites hardcode the placeholder origin and
root-relative paths, so they must be re-anchored to the real deployment URL for
the repository gates to keep passing.

Authoritative rules live in [`docs/constitution.md`](../../docs/constitution.md);
this spec defines only the increment's requirements and acceptance criteria.

## Goals

- Make the production build link-correct when served from
  `https://dcerezotorrejon.github.io/portfolio-astro-SDD/`.
- Add a GitHub Actions workflow that validates the repository and publishes the
  site to GitHub Pages automatically on every push to `main`.
- Document the deployment, including the deployed URL and the one-time Pages
  activation, so the maintainer can operate it.

## Non-goals

- Custom domain, `CNAME` file, or DNS configuration.
- Renaming the repository or changing its visibility.
- Changing portfolio content, routes, layout, or visual design.
- Performing the final deployment, merge, or push to `main` within this
  increment; those are external, maintainer-approved outcomes.

## Requirements

- R1: `astro.config.mjs` MUST set `site` to `https://dcerezotorrejon.github.io`
  and `base` to `/portfolio-astro-SDD`, and MUST remove the `example.com`
  placeholder and its TODO comment.
- R2: The production build MUST reference every asset and internal link through
  the configured base so the site works when served under
  `/portfolio-astro-SDD/`. At minimum this covers the favicon `<link>`s, the
  Open Sans `@font-face` source, the GitHub and LinkedIn icon sprite
  references, the profile image, the experience company icons, and the
  experience-detail return link to the home `#trayectoria` section.
- R3: Canonical URLs and the generated sitemap MUST use the deployed origin and
  base (for example, `https://dcerezotorrejon.github.io/portfolio-astro-SDD/`),
  and each page MUST keep exactly one canonical `<link>`.
- R4: The repository MUST include a GitHub Actions workflow that, on push to
  `main`, builds the static site and deploys it to GitHub Pages using the
  official Pages actions.
- R5: The deployment workflow MUST install Chromium
  (`pnpm exec playwright install --with-deps chromium`) and run the repository
  quality gates before publishing: `pnpm lint`, `pnpm format:check`,
  `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration`.
  If any gate fails, the workflow MUST NOT deploy.
- R6: The deployment workflow MUST enable GitHub Pages when needed with
  `actions/configure-pages` and `enablement: true`, upload the built `dist/`
  directory with `actions/upload-pages-artifact`, and publish with
  `actions/deploy-pages`.
- R7: The workflow MUST use a Node version that satisfies the project's
  `>=22.12.0` requirement, install with pnpm using the committed
  `pnpm-lock.yaml` and `--frozen-lockfile`, install Chromium for the integration
  suite, declare the permissions required by Pages (`contents: read`,
  `pages: write`, `id-token: write`), use a Pages concurrency group, and pin
  action versions.
- R8: The README MUST document the deployed URL, the workflow trigger and
  behavior, and the one-time `gh` CLI command that sets the GitHub Pages build
  type to `workflow`.
- R9: The existing test and tooling suites MUST be re-anchored to the new
  origin and base so they pass: unit tests that assert `site`/`base` or the
  workflow, SEO tests' canonical and sitemap expectations, and the Playwright
  `baseURL` used by the integration suite. New unit tests MUST cover the site
  configuration and the deployment workflow.
- R10: The repository MUST NOT add a custom-domain `CNAME` file.

## Acceptance criteria

- [x] AC1: `astro.config.mjs` exports `site === "https://dcerezotorrejon.github.io"` and `base === "/portfolio-astro-SDD"`, and the `example.com` placeholder no longer appears in it.
- [x] AC2: `pnpm build` succeeds, and the built `dist/index.html` and `dist/experiencia/<slug>/index.html` each contain exactly one canonical `<link>` pointing at the base-prefixed URL.
- [x] AC3: Built pages and styles reference the favicon, web font, icon sprite, profile image, and company icons under `/portfolio-astro-SDD/`, the experience-detail return link targets the base-prefixed home anchor, and the build output contains no asset reference that omits the base.
- [x] AC4: `dist/sitemap-0.xml` lists base-prefixed page URLs.
- [x] AC5: `.github/workflows/deploy.yml` exists and is valid YAML; it triggers on `push` to `main`, installs with pnpm and the frozen lockfile, installs Chromium, runs the R5 gates (including `pnpm test:integration`), enables Pages with `actions/configure-pages` and `enablement: true`, uploads `dist/`, and deploys with `actions/deploy-pages`.
- [x] AC6: The README documents the deployed URL and the one-time `gh` Pages activation command.
- [x] AC7: No `CNAME` file exists at the repository root or in `public/`.
- [x] AC8: The full applicable gate set passes: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration`.

## Verification

- **AC1, AC5, AC7**: unit tests under `tests/unit/**` (Dev-owned) assert the
  `astro.config.mjs` values, the workflow's trigger/steps/actions (including the
  Chromium install and `pnpm test:integration`), and the absence of a `CNAME`
  file.
- **AC2, AC3, AC4**: SEO checks under `tests/seo/**` and the accessibility suite
  (QA-owned) run over rendered HTML; the build-output checks read `dist/` after
  `pnpm build`. The shared Astro container helper and its SEO/integration test
  files are QA-owned and must be aligned with the new `site`/`base`.
- **AC6**: verified by a unit/README assertion or direct QA review of the README
  content.
- **AC8**: the repository quality gates in
  [Constitution §6](../../docs/constitution.md#6-quality-gates) —
  `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration`. Integration is applicable
  because this increment changes routing, rendering, and configuration; the
  Playwright `baseURL` change is part of the tooling configuration and is
  verified by the integration suite.
- **External outcome**: the workflow's behavior on GitHub is only observable
  after it is present on `main` and runs there. Actual publication to GitHub
  Pages is reported externally by the Dev Lead and is not a criterion verified
  within the feature branch. Enabling Pages must be done once by the maintainer
  or the first workflow run; that step is documented per R8.
