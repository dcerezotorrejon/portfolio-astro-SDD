# Tasks — Design consistency corrections

- **Spec ID**: `028-design-consistency`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [ ] T1: Restore the control-motion duration — register
      `--transition-duration-control` in Tailwind's `--transition-duration-*`
      namespace in `global.css`, de-stale `docs/design.md` (status + completed-spec
      references), and align the affected unit contracts.
  - Owner: Dev.
  - Files: `src/styles/global.css`, `docs/design.md`,
    `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`.
  - Covers: AC1, AC2, AC3, AC4 at the source/token level.
  - Evidence: _pending_
- [ ] T2: Verify T1 on the shared branch — review the unit tests' sufficiency,
      author/run the browser integration coverage of the computed
      `transition-duration` (indicator and primary button) and reduced-motion
      suppression, run all applicable gates, record evidence, and mark criteria.
  - Owner: QA.
  - Files: `tests/integration/**`, `tests/a11y/**` as needed.
  - Covers: AC1, AC3 at the browser level.
  - Evidence: _pending_

## Gate summary

- [ ] Lint (`pnpm lint`)
- [ ] Format (`pnpm format:check`)
- [ ] Build (`pnpm build`)
- [ ] Unit tests (`pnpm test:run`)
- [ ] Accessibility (`pnpm test:a11y`)
- [ ] Integration (`pnpm test:integration`) — applicable (rendered behavior change)
- SEO — not applicable (no change to titles, meta descriptions, canonical URLs,
  or the sitemap)
