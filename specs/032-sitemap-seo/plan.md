# Plan — Sitemap SEO

- **Spec ID**: `032-sitemap-seo`
- **Last updated**: 2026-11-02

## Approach

Keep `@astrojs/sitemap` as the only generator and extend it through its
`serialize` option with a single build-time resolver module
(`src/lib/sitemap-lastmod.ts`) that maps each sitemap URL to a UTC calendar
date. The resolver takes injectable dependencies (clock, Git reader, experience
file reader) with production defaults that call `git` through
`execFileSync` (no shell) from the repository root. Any failure, a shallow
repository, an unknown route/slug, or a source set with no commits falls back to
the build date (R5b); a full-history repository yields the committer date of the
latest commit touching the R5c source set.

Discovery is added through a static `src/pages/robots.txt.ts` endpoint that
derives the `Sitemap:` URL from `SITE`/`BASE` in `src/lib/base-url.ts`, and a
`<link rel="sitemap" href={withBase("/sitemap-index.xml")} />` in
`SiteLayout.astro`. The deployment workflow's `Checkout` step gains
`fetch-depth: 0` so CI builds resolve Git dates.

Build-output verification moves into the integration suite (always preceded by
`pnpm build`), so it cannot be skipped.

## Files to change

- `src/lib/sitemap-lastmod.ts` (new, T1) — resolver plus a serializer factory
  used by the config; injectable `now`, Git reader (`isShallow`,
  `lastCommitDate(paths)`), and experience reader (slug → file path).
- `astro.config.mjs` (T1) — `sitemap({ serialize })` wiring; `filter` only if
  R2 requires it.
- `tests/unit/sitemap-lastmod.test.ts` (new, T1) — AC10–AC12.
- `src/pages/robots.txt.ts` (new, T2) — R6 endpoint.
- `src/layouts/SiteLayout.astro` (T2) — R7 discovery link.
- `tests/unit/robots-txt.test.ts` (new, T2) and, if needed,
  `tests/unit/site-layout.test.ts` (T2) — AC6 unit part, R7 unit coverage.
- `.github/workflows/deploy.yml` (T3) — `fetch-depth: 0` on `Checkout` (R5d).
- `tests/unit/deployment-workflow.test.ts` (T3) — assert `fetch-depth: 0`.
- `tests/integration/sitemap.spec.ts` (new, QA in T4) — AC1–AC5, AC13.
- `tests/integration/robots.spec.ts` (new, QA in T4) — AC6 preview check, AC7
  `href` resolution.
- `tests/seo/**` (QA in T4) — AC7 link check and AC8 no-new-island check;
  QA decides whether to keep or consolidate the skippable sitemap checks in
  `tests/seo/build-output.test.ts` and `tests/seo/experience.test.ts`.

## Key decisions

- **Open questions applied as documented assumptions** (maintainer instruction
  for this increment: open questions do not block). A2: R5c and R5d ship in this
  increment. A8: shared components/styles do not count toward `<lastmod>`. R5d
  and A3 post-deploy confirmations remain external checks for the maintainer.
- **R6 without AI policy**: the endpoint emits exactly the R6 text; the
  AI-training policy stays in Cloudflare (A3).
- **Serializer testability (AC12)**: the config builds its `serialize` function
  from a factory exported by `src/lib/sitemap-lastmod.ts`; the unit test mocks
  the resolver module (or injects a fake resolver) so it never spawns `git` or
  reads the real clock. Exact export shape is left to Dev within this rule.
- **Serialized `<lastmod>` form (A9)**: recorded in `summary.md` after T1/T4
  observe the built output.
- **Models**: T1 and T2 `dev` on the default `sonnet` (resolver logic and Astro
  endpoint/layout tests); T3 `dev` on `haiku` (one YAML key plus one test
  assertion, well bounded). QA on the default `sonnet` (integration tests and
  Git-based checks).

## Risks

- **Preview port 4321 shared with other worktrees** (`strictPort`,
  `reuseExistingServer: false`): a concurrent integration run elsewhere fails
  fast. Mitigation: QA sessions are serialized; on a port conflict, stop and
  report rather than kill foreign processes.
- **Shallow clones**: local worktrees have full history; CI depends on R5d.
  AC13 records when R5c is not exercised.
- **Uncommitted changes on the branch**: `git log` ignores them; AC13 compares
  against committed history computed the same way, so results stay consistent.
- **Endpoint leaking into the sitemap**: if `robots.txt` appears in
  `sitemap-0.xml`, T1 adds a `filter` (coordinated by the Lead, since
  `astro.config.mjs` is owned by T1).
- **Build-time Git cost**: a few `git log` calls per build; results are cached
  per resolver instance.

## Testing strategy

- Unit / component tests (Dev): resolver fallbacks and Git-derived dates with a
  fixed clock and fake readers (AC10, AC11), serializer wiring (AC12), robots
  endpoint output and content type (AC6), layout link (R7), workflow
  `fetch-depth` (AC14).
- SEO checks (QA): exactly one `link[rel="sitemap"]` per page (AC7); no new
  islands or client scripts (AC8).
- Integration (QA): sitemap files, URL set vs. content slugs, canonical match,
  index, `<lastmod>` format and Git dates (AC1–AC5, AC13); `/robots.txt` body,
  status, content type, and `/sitemap-index.xml` resolution (AC6, AC7).
- Accessibility checks: existing suite must stay green (no visual change;
  `docs/design.md` not applicable).
