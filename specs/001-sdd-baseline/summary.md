# Summary — SDD baseline

- **Spec ID**: `001-sdd-baseline`
- **Last updated**: 2026-10-05

## Files changed

- `docs/constitution.md` — new authoritative rule set.
- `AGENTS.md` — rewritten as an operational guide linking to the constitution.
- `CLAUDE.md` — reduced to a pointer.
- `specs/README.md` — spec convention.
- `specs/_template/{spec,plan,tasks,summary}.md` — templates.
- `specs/001-sdd-baseline/{spec,plan,tasks,summary}.md` — this spec.
- `astro.config.mjs` — exported `site` and added `@astrojs/sitemap`.
- `package.json` — added `test`, `test:run`, `test:a11y` and dev deps.
- `vitest.config.ts` — Vitest config via `getViteConfig`.
- `tests/helpers/render.ts` — shared Astro container + render helper.
- `tests/helpers/a11y.ts` — axe-core runner and violation formatter.
- `tests/unit/home.test.ts`, `tests/seo/home.test.ts`, `tests/a11y/home.test.ts`.
- `src/pages/index.astro` — added meta description and canonical link.

## Functions / components changed

- `getContainer()` (new) — creates the Astro container with `site` injected.
- `render(component, props)` (new) — renders components/pages to HTML.
- `runAxeOnHtml(html)` (new) — runs axe-core against a JSDOM document.
- `formatViolations(results)` (new) — readable axe violation output.

## Commits

- `7b0858d` — `chore: initialize repo with spec-anchored SDD setup`. This commit
  is fused with the initial repo scaffolding (Astro starter + tooling), so it
  predates the `spec-<NNN>` scope convention and is not scoped to `spec-001`.

## Related specs

- `003-agent-workflow` — amends `docs/constitution.md`, the constitution and spec
  convention this spec established (§4.1 `summary.md`, new §4.2).

## Notes

- The `site` constant is a placeholder (`https://example.com`); replace it before
  deploying.
- New specs should be copied from `specs/_template/`.
