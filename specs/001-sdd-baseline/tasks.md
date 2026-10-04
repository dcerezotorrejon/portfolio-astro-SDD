# Tasks — SDD baseline

- **Spec ID**: `001-sdd-baseline`

> A task is only marked `[x]` with evidence from the applicable gates.

## Checklist

- [x] T1: Write `docs/constitution.md`.
  - Evidence: reviewed with maintainer; `pnpm format:check` passes.
- [x] T2: Rewrite `AGENTS.md` and reduce `CLAUDE.md` to a pointer.
  - Evidence: `pnpm format:check` passes.
- [x] T3: Document the `specs/` convention and add four-file template.
  - Evidence: `specs/README.md` + `specs/_template/*`.
- [x] T4: Install and wire Vitest, sitemap, axe-core, and jsdom.
  - Evidence: `pnpm test:run` -> 4 passed; `pnpm build` -> `sitemap-index.xml`
    created.
- [x] T5: Add unit, SEO, and a11y smoke tests for the home page.
  - Evidence: `pnpm test:run` -> 4 passed; `pnpm test:a11y` -> 1 passed.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
