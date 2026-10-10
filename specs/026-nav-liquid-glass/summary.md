# Summary — Subtle liquid-glass surface for the floating navigator

- **Spec ID**: `026-nav-liquid-glass`
- **Last updated**: 2026-10-10

## Files changed

- `src/styles/global.css` — added the component tokens
  `--nav-glass-surface: rgb(255 255 255 / 0.7)` and `--nav-glass-blur: 12px`,
  registered `--blur-nav` in `@theme inline` (feeds the `backdrop-blur-*`
  namespace), and added the Tailwind v4 `@utility nav-glass` with the frosted
  surface plus two opaque fallbacks (`@supports not (backdrop-filter…)` and
  `prefers-reduced-transparency: reduce`). No `.floating-nav` selector added.
- `src/components/home/FloatingNav/FloatingNav.tsx` — replaced the navigator's
  `bg-surface` with `nav-glass`; pill radius, border, shadow, indicator, layout,
  and destinations unchanged.
- `docs/design.md` — documented the translucent liquid-glass navigator surface
  and its opaque fallback, and reconciled the opaque-surface and "No gradients"
  rules for this surface.
- `tests/unit/design-assets.test.ts` — updated the navigator source contract to
  `nav-glass` and added assertions for the glass tokens, the `@utility` with both
  fallback branches, the absence of `.floating-nav`, and the untouched
  non-navigator surfaces.
- `tests/integration/nav-liquid-glass.spec.ts` — new Playwright Chromium coverage
  (computed alpha/blur, untouched other surfaces, contrast/focus, both fallbacks,
  unchanged navigator geometry).

## Functions / components changed

- `FloatingNav` — navigator surface utility changed from `bg-surface` to
  `nav-glass`.
- `nav-glass` — new Tailwind `@utility` (translucent background + backdrop blur
  with opaque fallbacks); `hasReachedActivation`/indicator logic untouched.

## Notes

- Subtle values: alpha 0.7 (range 0.55–0.85) and blur 12 px (≥ 8 px); no
  gradients, no new motion.
- Fallback verified at browser level via CDP media emulation
  (`prefers-reduced-transparency: reduce`) and by rewriting the emitted
  `@supports not (…)` condition.
- Out-of-scope observation for future work: the navigator indicator's computed
  `transition-duration` resolves to 0.15 s rather than the 200 ms documented in
  `docs/design.md`, because the `duration-control` utility no longer resolves
  after the theme entry was removed. Not touched by this increment.
