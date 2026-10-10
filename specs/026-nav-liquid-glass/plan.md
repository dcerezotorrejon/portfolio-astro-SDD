# Plan — Subtle liquid-glass surface for the floating navigator

- **Spec ID**: `026-nav-liquid-glass`
- **Last updated**: 2026-10-10

## Approach

Apply a subtle translucent/frosted ("liquid glass") treatment to the floating
navigator surface using the existing token architecture and Tailwind utilities,
without introducing a component selector in `global.css` (the design contract
forbids `.floating-nav` there).

1. **Tokens (component layer in `global.css`).** Add a translucent navigator
   surface color and a blur radius, resolving from the existing semantic/primitive
   layers. Register them with Tailwind so utilities exist:
   - a color token registered in `@theme inline` (for example
     `--color-nav-glass` → `bg-nav-glass`);
   - a blur token in Tailwind's `--blur-*` namespace (for example `--blur-nav`
     → `backdrop-blur-nav`).
2. **Surface stack in `FloatingNav.tsx`.** Keep the current opaque `bg-surface`
   as the base (fallback) and layer the glass only when the platform supports it:
   `bg-surface`, then `backdrop-blur-nav` + `bg-nav-glass` gated by a
   backdrop-filter support variant, so unsupported browsers stay opaque.
   Keep the pill shape, the fine border/highlight, and the shadow unchanged.
3. **Fallbacks.** On `prefers-reduced-transparency: reduce`, force the opaque
   surface (via a Tailwind arbitrary media variant, or an explicit `@media` rule
   in `global.css` keyed on the navigator's own utility/token rather than a
   `.floating-nav` selector). The same opaque fallback covers missing
   `backdrop-filter` support.
4. **No gradients.** The glass is translucency + blur only; no gradients or
   animated highlights are added, so the existing "No gradients" motion rule is
   preserved.
5. **Design doc.** Update `docs/design.md`: replace the navigator's
   opaque-white-surface statement with the glass criteria (translucent light
   surface, blur amount, border/highlight, opaque fallback) and reconcile the
   opaque-surface and "No gradients" rules for this surface.

## Files to change

- `src/components/home/FloatingNav/FloatingNav.tsx` — replace `bg-surface` with
  the glass utility stack plus the opaque base/fallback and the supported-only
  layering.
- `src/styles/global.css` — add the navigator glass component tokens, register
  the theme tokens (`@theme inline` color, `--blur-*` token), and, if the
  utility variants are insufficient, add the reduced-transparency /
  no-`backdrop-filter` fallback rules without a `.floating-nav` selector.
- `docs/design.md` — shared navigator glass criteria and the reconciled opaque
  surface / "No gradients" rules.
- `tests/unit/design-assets.test.ts` (and any navigator design test) — update the
  pinned contracts: the test currently asserts `bg-surface` in the source (keep
  it as the opaque base) and add assertions for the glass tokens/utilities and
  the untouched non-navigator surfaces. (Dev owns `tests/unit/**`.)
- `tests/integration/` — computed background alpha and `backdrop-filter` blur,
  screenshots of the navigator over the page and over cards, focus visibility,
  and the fallback behavior. (QA owns integration tests.)
- `tests/a11y/**` — confirm contrast and `aria-current` are unchanged. (QA owns.)

## Key decisions

- **Opaque base + supported-only glass layering.** This satisfies the
  no-support and reduced-transparency fallbacks without reintroducing a
  component selector into `global.css`, honoring the existing design-assets
  contract.
- **Concrete values within the spec bounds.** Subtle per the spec: alpha around
  0.7 (range 0.55–0.85) and a blur around 12 px (minimum 8 px), documented in
  `docs/design.md`.
- **No gradients or motion.** Keeps the design document's motion and decoration
  rules intact and avoids new animation.

## Risks

- **Contrast over cards while scrolling.** Mitigation: verify with `pnpm test:a11y`
  plus screenshots, and tune alpha/blur so labels stay ≥ 4.5:1 against the
  composed surface.
- **`prefers-reduced-transparency` support varies.** Mitigation: also provide the
  `@supports not (backdrop-filter:…)` fallback; emulate the reduced-transparency
  case where supported and assert the CSS rule otherwise.
- **Existing pinned design contracts break.** Mitigation: update them
  deliberately with QA review — adjust the contract to the new approved surface,
  never weaken unrelated assertions.
- **Tailwind arbitrary-variant syntax for negated support/media queries.**
  Mitigation: validate in the build; fall back to explicit `@media`/`@supports`
  rules keyed on the navigator's token-driven utility.

## Testing strategy

- **Unit / component tests:** assert the new tokens resolve to the approved
  values and that the navigator source carries the glass utilities with the
  opaque base; assert non-navigator surfaces are untouched.
- **Integration tests:** assert computed `background-color` alpha and
  `backdrop-filter` blur; capture the navigator over the page and over a card;
  check the focus outline; and check the fallback when `backdrop-filter` is
  disabled or reduced transparency is emulated.
- **SEO checks:** not applicable (no title/meta/canonical/sitemap change).
- **Accessibility checks:** `pnpm test:a11y` plus integration a11y; contrast and
  `aria-current` remain compliant.
