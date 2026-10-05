# Evidence — T9: White primary-button labels/icons on darker accessible blue

- **Spec ID**: `004-portfolio-home`
- **Date**: 2026-10-05
- **Scope**: QA verification of `src/styles/global.css` button tokens and
  `.button-link` foreground, plus rendered primary actions. No production,
  spec, or task files were modified by QA; only this evidence file and the new
  test file were added.

## Verified change

- `:root` tokens: `--color-button: #0c7abf`, `--color-button-hover: #096aa7`,
  `--color-button-active: #075985`.
- `.button-link` foreground is `var(--color-surface)` (`#ffffff`); hover/active
  rules change only the background, so no state reintroduces a dark label.
- Social icons use `fill="currentColor"` and inherit the white foreground.
- Unchanged: `--color-primary: #1d9bf0` (navigator indicator),
  `.floating-nav-link` ink, `.technology-badge` ink-on-surface palette.

## Tests added

`tests/unit/button-design.test.ts` (6 tests, all passing):

1. Token values for the three button states plus the preserved accent.
2. Semantic state mapping (normal/hover/active → dedicated tokens) and no
   dark `color:` override in any state.
3. WCAG contrast ratios computed from the **parsed** hex tokens:
   white `#ffffff` on `#0c7abf` = **4.61:1**, on `#096aa7` = **5.78:1**, on
   `#075985` = **7.56:1** — all ≥ 4.5:1. (Computed in Node per the task
   instruction; browser-computed colors pending.)
4. Navigator and badge palette unchanged (ink, primary indicator, surface).
5. `ProfileIntroduction` rendered via the actual `profile` collection entry:
   every social button has `button-link`, an icon whose paths are all
   `fill="currentColor"`, and no inline color overrides.
6. Homepage and both detail routes rendered via real collections: the same
   `button-link` class on all primary actions, a single `/#trayectoria` return
   link per detail page, and no hardcoded colors or portfolio data in markup.

The prior QA evidence asserting ink-on-bright-blue for buttons is treated as
obsolete; the new tests explicitly assert the white foreground and reject a
dark `color:` in hover/active.

## Gate results

| Gate           | Command                                                  | Result           |
| -------------- | -------------------------------------------------------- | ---------------- |
| Targeted tests | `pnpm vitest run tests/unit/button-design.test.ts`       | 6/6 pass         |
| Lint           | `pnpm lint`                                              | Pass (no errors) |
| Format         | `pnpm prettier --check tests/unit/button-design.test.ts` | Pass             |

Repo-wide `pnpm format:check` currently fails on
`tests/unit/floating-nav-threshold.test.tsx` (T8's in-progress file, not T9);
T9-owned files pass. Full `build`, `test:run`, `test:a11y` and browser gates are
deferred to the final integration run per the task instructions.

## Pending (final integration QA)

- Browser-computed normal/hover/active button colors and rendered contrast
  sampling. QA did **not** launch Chrome because the browser is owned by the
  currently active final-integration QA session; manual browser checks are
  recorded as pending.
- Full regression gates (`pnpm build`, `pnpm test:run`, `pnpm test:a11y`).

## Verdict

T9 passes its targeted verification: tokens, white-foreground contract,
computed WCAG contrast, cross-route button consistency and unchanged
navigator/badge palette are all confirmed. T9 remains open until final
integration gates and the reserved browser checks pass.
