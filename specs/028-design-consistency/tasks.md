# Tasks — Design consistency corrections

- **Spec ID**: `028-design-consistency`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [x] T1: Restore the control-motion duration — register
      `--transition-duration-control` in Tailwind's `--transition-duration-*`
      namespace in `global.css`, de-stale `docs/design.md` (status + completed-spec
      references), and align the affected unit contracts.
  - Owner: Dev.
  - Files: `src/styles/global.css`, `docs/design.md`,
    `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`.
  - Covers: AC1, AC2, AC3, AC4 at the source/token level.
  - Evidence: QA-verified on `spec/028-design-consistency` at revision
    `0979c65422808a348e63ccd87b063847da5a1f67` plus the task's uncommitted
    working-tree changes (`src/styles/global.css`, `docs/design.md`,
    `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`).
    Source/token review: `@theme inline` registers the control duration in
    Tailwind's `--transition-duration-*` namespace, the `--duration-control`
    token stays `200ms`, and the `duration-control` class contract is preserved
    on `FloatingNav.tsx` and `Button.astro`. `docs/design.md` status is
    `agreed design direction; implemented` with no pending/spec-ID/path
    references and its 200 ms motion criteria match the rendered value. Unit
    contracts are sufficient (token value + namespace registration + class
    presence); compiled-utility proof is covered by the browser check. Gates:
    `pnpm lint` clean; `pnpm format:check` clean; `pnpm build` OK (emits the
    `.duration-control` utility resolving to `0.2s`); `pnpm test:run` 186
    passed (29 files); `pnpm test:a11y` 5 passed (4 files);
    `pnpm test:integration` 32 passed. SEO not applicable (no
    title/meta/canonical/sitemap change). Approved.
- [x] T2: Verify T1 on the shared branch — review the unit tests' sufficiency,
      author/run the browser integration coverage of the computed
      `transition-duration` (indicator and primary button) and reduced-motion
      suppression, run all applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/**`, `tests/a11y/**` as needed.
  - Covers: AC1, AC3 at the browser level.
  - Evidence: QA-owned browser coverage added in
    `tests/integration/motion-duration.spec.ts`. AC1: the computed
    `transition-duration` is `0.2s` for `.floating-nav-indicator` and the
    experience-card primary button. AC3 (`reducedMotion: reduce`): both report
    `transition-property: none` (transition suppressed; declared duration stays
    `0.2s` but no property transitions), and the indicator still moves onto the
    selected link while `data-active-index`/`aria-current` update. Latest run:
    `pnpm test:integration` 32 passed (Chromium) at revision `0979c65`.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`) — applicable (rendered behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)

Independently re-run by the Dev Lead on 2026-10-10 on `spec/028-design-consistency`:
`pnpm lint` clean; `pnpm format:check` clean; `pnpm build` success; `pnpm test:run`
186 passed; `pnpm test:a11y` 5 passed; `pnpm test:integration` 32 passed.
