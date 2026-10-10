# Plan — Design consistency corrections

- **Spec ID**: `028-design-consistency`
- **Last updated**: 2026-10-10

## Approach

1. **Restore the control-motion duration.** Re-register the control duration in
   Tailwind v4's `--transition-duration-*` namespace inside the `@theme inline`
   block in `src/styles/global.css` (for example
   `--transition-duration-control: var(--duration-control);`), so the existing
   `duration-control` utility compiles again and resolves to 200 ms. This fixes
   both consumers — the floating navigator indicator and the button molecule —
   without touching their markup or the `duration-control` class contract.
2. **De-stale `docs/design.md`.** Update the `Status` line so it no longer reads
   "implementation pending", and rewrite the "Design review and verification"
   paragraph that cites a completed specification so the criteria stand on their
   own. Keep the "200 ms" motion statement (it becomes accurate again).
3. **Align the tests.** Update the affected unit contracts
   (`tests/unit/design-assets.test.ts`, `tests/unit/transitions.test.ts`) so they
   assert the corrected behavior and guard that the theme entry uses only the
   `--transition-duration-*` namespace (the existing assertion forbids
   `--duration-control:` inside the theme block, which must stay true).

## Files to change

- `src/styles/global.css` — register `--transition-duration-control` in
  `@theme inline`.
- `docs/design.md` — refresh the status line and the section that references a
  completed specification.
- `tests/unit/design-assets.test.ts`,
  `tests/unit/transitions.test.ts` — align/extend the token/utility contracts.
- `tests/integration/**` — QA-owned computed-style coverage for the 200 ms
  duration and reduced-motion suppression.

## Key decisions

- **Fix the token registration, keep the class.** The components and their tests
  depend on `duration-control`; generating the utility is the minimal, correct
  fix, versus renaming to an arbitrary value.
- **One increment.** The duration bug and the design-document staleness are both
  "design consistency" corrections requested together.

## Risks

- **Shadowing the `:root` token.** The theme entry must use the
  `--transition-duration-*` namespace; `tests/unit/design-assets.test.ts` already
  guards against re-declaring `--duration-control:` inside `@theme inline`.
- **Timing-sensitive tests.** The indicator/button transitions change from 150 ms
  to 200 ms; existing navigation integration tests wait for settle, but confirm
  they still pass.

## Testing strategy

- **Unit / component tests:** assert `--transition-duration-control` is
  registered in the theme namespace, the `--duration-control` token still
  resolves to 200 ms, and the `duration-control` class contract holds.
- **Integration tests:** assert the computed `transition-duration` is 200 ms for
  both `.floating-nav-indicator` and a primary button, and that reduced motion
  suppresses the transition.
- **SEO checks:** not applicable (no title/meta/canonical/sitemap change).
- **Accessibility checks:** unchanged; `pnpm test:a11y` and the integration
  accessibility spec must stay green.
