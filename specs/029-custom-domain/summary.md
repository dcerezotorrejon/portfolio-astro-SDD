# Summary — Custom domain deployment

- **Date**: 2026-10-11

## Files changed

- `src/lib/base-url.ts`
- `playwright.config.ts`
- `README.md`
- `tests/integration/helpers/site.ts`
- `tests/seo/build-output.test.ts`
- `tests/seo/experience.test.ts`
- `tests/seo/home.test.ts`
- `tests/unit/base-url.test.ts`
- `tests/unit/button-design.test.ts`
- `tests/unit/company-icon.test.ts`
- `tests/unit/design-assets.test.ts`
- `tests/unit/experience.test.ts`
- `tests/unit/home.test.ts`
- `tests/unit/icon.test.ts`
- `tests/unit/integration-tooling.test.ts`
- `tests/unit/site-config.test.ts`
- `tests/unit/transitions.test.ts`

## Functions / components changed

- `src/lib/base-url.ts`: `SITE` changed to `https://portfolio.dcerezo.work` and
  `BASE` changed to `/` (domain root); doc comments rewritten for the root-base
  passthrough. `withBase` logic unchanged (it already normalizes `/` to an empty
  prefix).
- `playwright.config.ts`: `use.baseURL` and `webServer.url` point at the root
  preview `http://127.0.0.1:4321` instead of the removed deployment subpath.
- `README.md`: "Site configuration" and "Deployment" document the new origin,
  root base, published URL `https://portfolio.dcerezo.work/`, and the external
  prerequisites (DNS `CNAME`, Pages custom-domain setting, enforced HTTPS,
  automatic redirect), with no committed `CNAME` file.
- `tests/integration/helpers/site.ts`: explanatory comments updated for the root
  base; behavior unchanged (derives from `BASE`).
- `tests/seo/**` (build-output, experience, home): canonical URLs, sitemap
  entries, and asset/internal-link assertions updated to the new origin and root
  base; added no-old-subpath and no-`dist/CNAME` checks; URL construction fixed
  so a root base does not yield `//`.
- `tests/unit/**` (base-url, site-config, integration-tooling, button-design,
  company-icon, design-assets, experience, home, icon, transitions): assertions
  updated to the root base; `site-config.test.ts` asserts the new `site`/`base`
  and the absence of a committed `CNAME`.
