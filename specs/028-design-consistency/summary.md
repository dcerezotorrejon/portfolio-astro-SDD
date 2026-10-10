# Summary — Design consistency corrections

- **Spec ID**: `028-design-consistency`
- **Last updated**: 2026-10-10

## Files changed

- `src/styles/global.css` — registered
  `--transition-duration-control: var(--duration-control);` inside `@theme inline`
  (Tailwind v4 `--transition-duration-*` namespace) so the `duration-control`
  utility is generated again and resolves to 200 ms.
- `docs/design.md` — status line no longer says "implementation pending"; the
  "Design review and verification" paragraph that cited a completed
  specification was rewritten so the criteria are self-contained.
- `tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts` —
  refreshed the stale comments and asserted the `--transition-duration-*`
  namespace registration alongside the existing `200ms` token check.
- `tests/integration/motion-duration.spec.ts` — new Playwright Chromium coverage
  for the computed 200 ms duration and reduced-motion suppression.

## Functions / components changed

- No component code changed. `FloatingNav` (indicator) and `Button` keep using
  the `duration-control` class; the token/theme registration restores its
  resolution to `--duration-control` (200 ms) instead of Tailwind's 150 ms
  default.

## Notes

- Root cause: Tailwind v4 derives `duration-*` from the `--transition-duration-*`
  namespace, which was missing after an earlier theme cleanup.
- The raw `--duration-control: 200ms` token stays in `:root`; the theme block
  still does not re-declare `--duration-control:`.
