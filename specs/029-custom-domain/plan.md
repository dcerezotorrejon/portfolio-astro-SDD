# Plan — Custom domain deployment

- **Spec ID**: `029-custom-domain`
- **Status**: draft (awaiting maintainer confirmation)
- **Last updated**: 2026-10-10

## Approach

Move the deployment from a GitHub Pages **project site** with a subpath
(`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`) to the custom
subdomain at the **domain root** (`https://portfolio.dcerezo.work/`). The change
is configuration + test alignment + documentation, not a feature rewrite:

1. **Single source of truth.** `src/lib/base-url.ts` holds `SITE` and `BASE`.
   Update `SITE` to `https://portfolio.dcerezo.work` and `BASE` to `/`. Its
   `withBase` helper already normalizes a root base to an empty prefix, so
   site-root paths pass through unchanged. `astro.config.mjs` only re-exports
   `SITE`/`BASE`, so it needs no literal change.
2. **Harness configuration.** `playwright.config.ts` points `baseURL` and the
   managed `webServer.url` at the root preview (`http://127.0.0.1:4321`) instead
   of `.../portfolio-astro-SDD`.
3. **Unit/component tests.** Every `tests/unit/**` assertion that hardcodes
   `/portfolio-astro-SDD/...` becomes root-relative. `withBase` is asserted to
   return paths unchanged under the root base.
4. **SEO tests.** `tests/seo/**` re-derive the canonical origin and must avoid
   the root-base URL pitfalls (see Risks): `site + base` yields a trailing slash
   and `base + "/"` produces `//`, which `new URL("//", site)` rejects. These
   tests are updated to build URLs from the origin and a root-relative path.
5. **Integration helper.** `tests/integration/helpers/site.ts` derives from
   `BASE`, so it needs no behavioral change; its explanatory comment is updated
   to reflect the root base.
6. **Documentation.** `README.md` documents the new origin, root base, published
   URL, and the external prerequisites (DNS record already configured, Pages
   custom-domain setting, enforced HTTPS), explicitly without a committed
   `CNAME` file.

## Approved decisions (maintainer)

- Origin `https://portfolio.dcerezo.work`, base `/` (domain root).
- The custom domain is registered **only** in GitHub Pages Settings; **no
  `CNAME` file** is committed to the repository or emitted into `dist/`.
- The DNS `CNAME` record `portfolio` → `dcerezotorrejon.github.io` is **already
  configured** by the maintainer; no DNS automation in the repository.
- **HTTPS enforced** is an external Pages setting kept as a configuration
  prerequisite.
- The former project-site URL relies on GitHub Pages' **automatic redirect** to
  the custom domain; no redirect artifact is added.

## Files to change

Production / configuration (Dev):

- `src/lib/base-url.ts` — `SITE`, `BASE`, and doc comments.
- `playwright.config.ts` — `baseURL`, `webServer.url` (root preview).

Unit tests (Dev):

- `tests/unit/site-config.test.ts` — new `site`/`base`; keep placeholder guard;
  add repository-level `CNAME` absence assertions.
- `tests/unit/base-url.test.ts` — `withBase` under the root base.
- `tests/unit/integration-tooling.test.ts` — root preview URLs.
- `tests/unit/button-design.test.ts`, `tests/unit/company-icon.test.ts`,
  `tests/unit/experience.test.ts`, `tests/unit/home.test.ts`,
  `tests/unit/icon.test.ts`, `tests/unit/design-assets.test.ts`,
  `tests/unit/transitions.test.ts` — replace `/portfolio-astro-SDD` literals.

SEO / integration tests (QA):

- `tests/seo/home.test.ts`, `tests/seo/build-output.test.ts`,
  `tests/seo/experience.test.ts` — new origin, root-base-safe URL construction,
  and a `dist/CNAME` absence check.
- `tests/integration/helpers/site.ts` — comment update only.

Documentation (Dev):

- `README.md` — "Site configuration" and "Deployment" sections plus
  prerequisites.

Not changed: `astro.config.mjs` (re-exports only), the GitHub Actions workflow
(`.github/workflows/deploy.yml`), content under `src/content/**`, and any design
or component markup (components already route through `withBase`).

## Trade-offs

- **Root base vs. keeping `/portfolio-astro-SDD`.** The maintainer chose the
  root, which removes the subpath from every URL and simplifies the custom-domain
  setup, at the cost of touching every test that hardcoded the subpath.
- **Settings-only custom domain.** Keeping the domain out of the repository
  avoids a second source of truth and a committed `CNAME`, but the setting and
  HTTPS enforcement live outside version control and are documented as
  prerequisites.
- **No explicit redirect shim.** Relying on GitHub's automatic redirect keeps the
  change small and avoids maintaining a redirect artifact.

## Risks

- **Root-base URL construction in tests.** With `BASE = "/"`:
  `new URL(`${base}/`, site)` throws (`//`) and
  `new URL(`${base}/experiencia/…`, site)` resolves to `https://experiencia/…`.
  `canonicalBase = site + base` ends in `/`, so naive `${canonicalBase}/…`
  produces `//`. SEO tests must be rewritten to join the origin and a
  root-relative path safely.
- **Missed hardcoded subpath.** Any remaining `/portfolio-astro-SDD` literal in a
  built asset or test keeps failing gates; the full gate run plus the
  built-output test are the backstop.
- **External prerequisites.** DNS, the Settings custom-domain value, and enforced
  HTTPS are outside the repository; live-site confirmation is post-deployment.
- **`dist/` cache.** Stale `dist/` output can mask regressions; gates rebuild
  before the built-output assertions run.

## Testing strategy

- **Unit / component**: `tests/unit/**` asserts the new `SITE`/`BASE`, root-base
  `withBase` behavior, and root-relative component output.
- **SEO**: `tests/seo/**` asserts one canonical per page and the sitemap under
  `https://portfolio.dcerezo.work/`, plus root-resolved assets/internal links.
- **Accessibility**: `tests/a11y/**` unchanged; run via `pnpm test:a11y`.
- **Integration**: `pnpm test:integration` against the root preview.
- **Gates** (Constitution §6): for the code/config/test change set run
  `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration`. For the `README.md`-only change
  set the Markdown-only exception limits the applicable gates to `pnpm lint` and
  `pnpm format:check`, recording build/unit/SEO/a11y/integration as not
  applicable.

## Task ownership summary

| Task | Dev implementation                                             | QA verification                                                          |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T1   | `src/lib/base-url.ts`, `playwright.config.ts`, `tests/unit/**` | `tests/seo/**`, `tests/integration/helpers/site.ts`, all gates, evidence |
| T2   | `README.md`                                                    | doc content check, lint/format, evidence                                 |

## Deployment follow-up (external)

By maintainer decision, the former live-check acceptance criterion was removed
from the spec: the live HTTPS serve and old-URL redirect can only be observed
after `main` deploys, i.e. after increment closure, so it cannot be a
closure-blocking criterion. The external prerequisites (DNS record already
configured, Pages custom-domain setting, enforced HTTPS, automatic redirect) are
documented in `README.md` under the R8/AC8 scope and reported externally after
deployment; they are not part of this increment's gate set.
