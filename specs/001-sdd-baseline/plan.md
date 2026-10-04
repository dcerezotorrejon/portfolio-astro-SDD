# Plan — SDD baseline

- **Spec ID**: `001-sdd-baseline`
- **Last updated**: 2026-10-05

## Approach

1. Write the authoritative constitution in `docs/constitution.md`.
2. Rewrite `AGENTS.md` as an operational guide that links to the constitution.
3. Define the `specs/` convention and add a `_template/` with four files.
4. Install and wire the verification stack:
   - `vitest` + Astro Container API for unit/component rendering.
   - `@astrojs/sitemap` for sitemap generation.
   - `axe-core` + `jsdom` for accessibility checks over rendered HTML.
5. Add a smoke test suite covering unit, SEO, and a11y for the home page.

## Files to change

- `docs/constitution.md` — new authoritative rules.
- `AGENTS.md`, `CLAUDE.md` — operational guide and pointer.
- `specs/README.md`, `specs/_template/*` — convention and templates.
- `astro.config.mjs` — `site` and sitemap integration.
- `package.json` — test scripts and dev dependencies.
- `vitest.config.ts` — Vitest config built on `getViteConfig`.
- `tests/**` — render/a11y helpers and smoke tests.
- `src/pages/index.astro` — meta description and canonical for the smoke tests.

## Key decisions

- **Code is the source of truth** on conflict; specs are re-anchored, not code.
- Pass `site` into the Astro container so pages building absolute URLs behave like
  the real build.
- Accessibility is tested with `axe-core` over a JSDOM document rather than adding
  a browser test runner (keeps the toolchain light). The `a11y` MCP remains
  available for URL-based audits.

## Risks

- Astro Container API is marked experimental; the helper isolates it in
  `tests/helpers/render.ts` so changes are contained.
- Placeholder `site` (`https://example.com`) must be replaced before deploy.

## Testing strategy

- Unit: `tests/unit/home.test.ts` renders the page and asserts the heading.
- SEO: `tests/seo/home.test.ts` asserts title, meta description, and absolute
  canonical; sitemap verified via `pnpm build`.
- Accessibility: `tests/a11y/home.test.ts` runs `axe-core`.
