# Summary — Sitemap SEO

- **Spec ID**: `032-sitemap-seo`
- **Last updated**: 2026-11-02

## Files changed

- `src/lib/sitemap-lastmod.ts` — new module that resolves each sitemap URL's `<lastmod>`.
- `astro.config.mjs` — `sitemap({ serialize: createSitemapSerializer() })`.
- `src/pages/robots.txt.ts` — new static endpoint that emits `robots.txt`.
- `src/layouts/SiteLayout.astro` — adds the `<link rel="sitemap">` discovery link.
- `.github/workflows/deploy.yml` — `fetch-depth: 0` on the checkout step.
- `tests/unit/sitemap-lastmod.test.ts`
- `tests/unit/robots-txt.test.ts`
- `tests/unit/site-layout.test.ts`
- `tests/unit/deployment-workflow.test.ts`
- `tests/integration/sitemap.spec.ts`
- `tests/integration/robots.spec.ts`
- `tests/seo/sitemap-discovery.test.ts`

## Functions / components changed

- **`createLastmodResolver` / `createSitemapSerializer`
  (`src/lib/sitemap-lastmod.ts`)** — Resolve a UTC date per URL from the most
  recent git commit touching that page's files (home: `index.astro`,
  `SiteLayout.astro`, `profile.md`, the experience content directory; detail:
  `experiencia/[slug].astro`, `SiteLayout.astro`, and the `.md` whose frontmatter
  `slug` matches). The serializer sets `lastmod` on each entry. Clock, git
  reader, and experience reader are injected so tests are deterministic.
- **`createGitReader`** — Runs git via `execFileSync` without a shell.
- **Build-date fallback** — Used when git fails, the clone is shallow, no commit
  touches the files, or the route/slug is unknown. It never breaks the build.
- **`robots.txt` endpoint** — Emits `User-agent: *`, `Allow: /`, and a
  `Sitemap:` line derived from the configured site/base; no AI-crawler policy.
- **`SiteLayout.astro`** — Renders exactly one `<link rel="sitemap">` through
  `withBase`.

## Notes

- `lastmod` is emitted as `YYYY-MM-DDT00:00:00.000Z` (Assumption A9).
- The repository root falls back to `process.cwd()` when the config is imported
  under jsdom.
- Shared components and styles do not affect `lastmod` (Assumption A8).
- The AI-training crawler policy is managed by Cloudflare, outside the repository.
- After the first deploy, check that the published `sitemap-0.xml` shows
  per-page dates (not the deploy date) and that Cloudflare's managed
  `robots.txt` block keeps `Allow: /` and the `Sitemap:` line.
