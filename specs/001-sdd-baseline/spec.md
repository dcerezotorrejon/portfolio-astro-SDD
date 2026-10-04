# SDD baseline

- **Spec ID**: `001-sdd-baseline`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

The repository was a bare Astro starter with a generic `AGENTS.md` copied from the
Astro template. There was no methodology, no spec structure, and no automated
verification beyond ESLint/Prettier.

## Goals

- Adopt **spec-anchored** development and document it.
- Provide an authoritative `docs/constitution.md`.
- Define a repeatable spec structure under `specs/`.
- Install the verification tooling required by the constitution: unit tests, SEO,
  and accessibility.

## Non-goals

- Building the actual portfolio content or pages.
- Choosing the final production domain.

## Requirements

- R1: `docs/constitution.md` defines the binding rules, including spec-anchored
  development, conflict resolution (code is source of truth), spec naming, task
  verification gates, quality gates, a11y, SEO, and the language policy.
- R2: `AGENTS.md` is an operational guide that points to the constitution.
- R3: `specs/` documents the convention and provides templates for `spec.md`,
  `plan.md`, `tasks.md`, and `summary.md`.
- R4: A verification toolchain is installed and wired into package scripts.

## Acceptance criteria

- [x] AC1: Constitution exists and separates rules from operational guidance.
- [x] AC2: Spec folders use `[NNN]-[feature-slug]` and contain four files.
- [x] AC3: `pnpm test:run`, `pnpm test:a11y`, `pnpm lint`, `pnpm format:check`, and
      `pnpm build` all pass.
- [x] AC4: A rendered page is covered by at least one unit, SEO, and a11y test.

## Verification

- Unit/SEO/a11y: `tests/**/*.test.ts` rendered through the Astro Container API.
- SEO: sitemap integration verified in the build output.
- Accessibility: `axe-core` over rendered HTML.
