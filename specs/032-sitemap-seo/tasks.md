# Tasks — Sitemap SEO

- **Spec ID**: `032-sitemap-seo`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: `<lastmod>` resolver and `serialize` wiring (R1, R5, R5a–R5c;
      AC10–AC12). Dev owns `src/lib/sitemap-lastmod.ts`, `astro.config.mjs`,
      `tests/unit/sitemap-lastmod.test.ts`. No dependencies. Model: `dev`
      `sonnet` (default).
  - Evidence: Verified on `spec/032-sitemap-seo` at base revision 59fca59 plus uncommitted task changes (shared worktree). Models: dev `sonnet`, qa `sonnet`. Reviewed `src/lib/sitemap-lastmod.ts`, `astro.config.mjs` (`sitemap({ serialize: createSitemapSerializer() })`, no `filter` needed: sitemap has 3 URLs) and `tests/unit/sitemap-lastmod.test.ts` (14 tests, fake clock/Git/experience readers, no `git` spawn, no real clock). Sufficient for AC10 (UTC date incl. instant 04:30Z whose prior-day local date differs; Git throws, shallow check throws, shallow, no commit, unknown route, unknown/failing slug), AC11 (exact home and detail source sets, slug by frontmatter not file name, `-02:00` offset to UTC date), AC12 (serialize sets lastmod, preserves fields, no changefreq/priority; config wiring test). Built `<lastmod>` form: `YYYY-MM-DDT00:00:00.000Z` (A9). `pnpm test:run`: 34 files, 248 tests passed. `pnpm lint`, `pnpm format:check`: pass. No defects.
- [x] T2: `robots.txt` endpoint and sitemap discovery link (R6, R7, R8; AC6
      unit part). Dev owns `src/pages/robots.txt.ts`,
      `src/layouts/SiteLayout.astro`, `tests/unit/robots-txt.test.ts`,
      `tests/unit/site-layout.test.ts`. No dependencies. Model: `dev` `sonnet`
      (default).
  - Evidence: Verified on `spec/032-sitemap-seo` at base revision 59fca59 plus uncommitted task changes (shared worktree). Models: dev `sonnet`, qa `sonnet`. Reviewed `src/pages/robots.txt.ts`, `src/layouts/SiteLayout.astro` (single `<link rel="sitemap" href={withBase("/sitemap-index.xml")}>` after canonical, no other change), `tests/unit/robots-txt.test.ts` (exact body, content type, Sitemap built from SITE/withBase, no literal in source), `tests/unit/site-layout.test.ts`. AC6 source check: `grep -c "https://portfolio.dcerezo.com" src/pages/robots.txt.ts` = 0. `dist/robots.txt` matches R6 byte-for-byte (verified by integration). `pnpm test:run`, lint, format: pass. No defects.
- [x] T3: Full Git history in CI (R5d; AC14). Dev owns
      `.github/workflows/deploy.yml`, `tests/unit/deployment-workflow.test.ts`.
      No dependencies. Model: `dev` `haiku` (one bounded YAML key plus a test
      assertion).
  - Evidence: Verified on `spec/032-sitemap-seo` at base revision 59fca59 plus uncommitted task changes (shared worktree). Models: dev `haiku`, qa `sonnet`. AC14: `git diff -- .github` shows only `with:` / `fetch-depth: 0` (+2 lines) under the `Checkout` step; `tests/unit/deployment-workflow.test.ts` asserts it (string "0" comparison is consistent with the file's YAML reader) while the rest of the existing workflow assertions still pass. `pnpm test:run`, lint, format: pass. No defects.
- [x] T4: Build-output verification (AC1–AC9, AC13). QA owns
      `tests/integration/sitemap.spec.ts`, `tests/integration/robots.spec.ts`,
      `tests/seo/**`. Depends on T1–T3. Model: `qa` `sonnet` (default).
  - Evidence: Verified on `spec/032-sitemap-seo` at base revision 59fca59 plus uncommitted task changes (shared worktree). Model: qa `sonnet`. Files: `tests/integration/sitemap.spec.ts` (AC1-AC5, AC13), `tests/integration/robots.spec.ts` (AC6 body/status/content type, AC7 href 200, AC8 island/script baseline: home = 1 FloatingNav island + 2 inline scripts, details = none, each page only the ClientRouter module script), `tests/seo/sitemap-discovery.test.ts` (AC7 exactly one `link[rel=sitemap]` href `/sitemap-index.xml` on home and every detail; no island on details). Existing skippable sitemap checks in `tests/seo/build-output.test.ts` and `tests/seo/experience.test.ts` kept unchanged (AC8: existing assertions unchanged; they are now complemented by the always-run integration checks). AC13 exercised: repository not shallow (`git rev-parse --is-shallow-repository` = false), per-URL dates equal `git log -1 --format=%cI` over R5c source sets (`:(literal)` pathspecs). `pnpm test:integration`: 48 passed. `pnpm test:a11y`: 4 files, 5 tests passed. Approved.

## Gate summary

- [x] Lint (`pnpm lint`): pass
- [x] Format (`pnpm format:check`): pass
- [x] Build (`pnpm build`): pass (3 pages, sitemap-index.xml created)
- [x] Unit tests (`pnpm test:run`): 34 files, 248 tests passed
- [x] Accessibility (`pnpm test:a11y`): 5 tests passed
- [x] Integration (`pnpm test:integration`): 48 passed — applicable (routes, generated
      HTML, sitemap output)
