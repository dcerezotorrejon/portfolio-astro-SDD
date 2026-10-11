# Custom domain deployment

- **Spec ID**: `029-custom-domain`
- **Status**: done
- **Last updated**: 2026-10-11

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio is currently published as a GitHub Pages **project site** at
`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`, which forces every
canonical URL, sitemap entry, and internal asset/page reference to live under the
`/portfolio-astro-SDD` subpath. The deployment origin and base path are held in a
single source of truth, `src/lib/base-url.ts`, re-exported by
`astro.config.mjs`, and consumed by the render/layout code, the build output
assertions, the SEO tests, and the Playwright integration harness.

The maintainer wants the site served from the custom subdomain
`https://portfolio.dcerezo.work` at the **domain root**. Moving from a project
site with a subpath to a root-served custom domain changes the canonical origin
and removes the base path from every generated URL, so the configuration, the
tests that assert those URLs, and the deployment documentation must be re-aligned
together. The DNS `CNAME` record for the subdomain is already configured by the
maintainer, and the custom domain will be registered in **Settings → Pages**
(no `CNAME` file committed to the repository), with **HTTPS enforced** through
that same setting.

## Goals

- Serve the site at `https://portfolio.dcerezo.work` from the domain root.
- Make `site = "https://portfolio.dcerezo.work"` and `base = "/"` the single
  configured origin and base path, with no deployment subpath remaining.
- Keep canonical URLs, the sitemap, and all site-root asset/page references
  consistent with the new origin and root base.
- Keep the automated unit, SEO, accessibility, and integration evidence aligned
  with the new origin so the existing quality gates remain meaningful.
- Document the new domain, the root base, and the external deployment
  prerequisites (DNS, Pages custom-domain setting, enforced HTTPS) in the
  repository documentation.

## Non-goals

- No `CNAME` file is added to `public/`, `dist/`, or anywhere in the repository;
  the custom domain is registered only in GitHub Pages Settings.
- No change to the GitHub Actions deployment workflow or its triggers: the site
  is still deployed by pushing to `main`.
- No DNS automation or DNS provisioning from the repository.
- No explicit redirect shim for the former project-site URL; GitHub Pages'
  automatic redirect to the configured custom domain is relied upon.
- No content, copy, design, layout, or interactivity changes.

## Requirements

- **R1 — Configured origin and base**: The deployment origin is
  `https://portfolio.dcerezo.work` and the base path is `/`. Both are defined in
  the single source of truth `src/lib/base-url.ts` (`SITE` and `BASE`) and
  re-exported by `astro.config.mjs` as `site` and `base`.
- **R2 — Root-served URLs**: With the root base, `withBase` leaves site-root
  paths unchanged (no `""`/`/portfolio-astro-SDD` prefix is introduced), and
  built pages contain no `/portfolio-astro-SDD` segment.
- **R3 — Canonical URLs**: Every built page emits exactly one `<link
rel="canonical">` whose URL is under `https://portfolio.dcerezo.work/`.
- **R4 — Sitemap**: The generated sitemap lists page URLs under
  `https://portfolio.dcerezo.work/`, including the root page.
- **R5 — Assets and internal links**: Every site-root asset reference and
  internal page link in the built output resolves at the domain root.
- **R6 — Integration harness**: The Playwright configuration and the integration
  helper target the local preview at the root path, and the integration suite
  passes unchanged in behavior.
- **R7 — Automated tests aligned**: All repository tests that assert the former
  origin or base are updated to the new origin and root base, and the applicable
  quality gates in [`docs/constitution.md`](../../docs/constitution.md) §6 pass.
- **R8 — Deployment documentation**: `README.md` describes the new origin, root
  base, published URL, and the external prerequisites: the DNS `CNAME` record
  (`portfolio` → `dcerezotorrejon.github.io`, already configured), the Pages
  custom-domain setting, and enforced HTTPS. It must not instruct committing a
  `CNAME` file.
- **R9 — No committed `CNAME`**: No `CNAME` file exists in the repository or in
  the build output.

## Acceptance criteria

- [x] AC1: `SITE`/`site` equals `https://portfolio.dcerezo.work` and
      `BASE`/`base` equals `/` (R1).
- [x] AC2: `withBase` returns site-root paths unchanged under the root base, and
      no `/portfolio-astro-SDD` segment appears in built pages (R2).
- [x] AC3: Every built page has exactly one canonical URL under
      `https://portfolio.dcerezo.work/` (R3).
- [x] AC4: The generated sitemap lists only URLs under
      `https://portfolio.dcerezo.work/`, including the root page (R4).
- [x] AC5: Site-root asset and internal-link references in the built output
      resolve at the domain root (R5).
- [x] AC6: The Playwright config and integration helper target the root preview,
      and the integration suite passes (R6).
- [x] AC7: The updated unit, SEO, and accessibility tests pass, and the
      applicable gates (`pnpm lint`, `pnpm format:check`, `pnpm build`,
      `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`) pass (R7).
- [x] AC8: `README.md` documents the new domain, root base, published URL, and
      the external prerequisites without instructing a committed `CNAME` file (R8).
- [x] AC9: No `CNAME` file exists in the repository or in `dist/` (R9).

## Verification

- **R1 / AC1**: Unit test in `tests/unit/site-config.test.ts` asserts the new
  `site` and `base`; `tests/unit/base-url.test.ts` covers the constants.
- **R2 / AC2**: `tests/unit/base-url.test.ts` asserts `withBase` behavior under
  the root base; built-output test asserts the absence of the old subpath.
- **R3 / AC3**: `tests/seo/build-output.test.ts` asserts one canonical per built
  page under the new origin.
- **R4 / AC4**: `tests/seo/build-output.test.ts` asserts sitemap URLs under the
  new origin.
- **R5 / AC5**: `tests/seo/build-output.test.ts` asserts site-root asset and
  internal-link references; `tests/unit/**` component tests reflect the root
  base.
- **R6 / AC6**: `playwright.config.ts` and `tests/integration/helpers/site.ts`
  target the root; `pnpm test:integration` runs the suite.
- **R7 / AC7**: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration` per
  [`docs/constitution.md`](../../docs/constitution.md) §6.
- **R8 / AC8**: `tests/unit/site-config.test.ts` guards removed placeholders;
  documentation is reviewed for the required content.
- **R9 / AC9**: Unit test asserts no `CNAME` file is present in the repository
  root and `public/`.
