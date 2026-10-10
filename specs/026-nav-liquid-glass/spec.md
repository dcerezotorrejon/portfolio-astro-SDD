# Subtle liquid-glass surface for the floating navigator

- **Spec ID**: `026-nav-liquid-glass`
- **Status**: done
- **Last updated**: 2026-10-10

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The floating navigator currently renders as an opaque white pill on a light
page, with a fine border and soft shadow (`--nav-surface`, `--color-surface`).
The maintainer wants the navigator to feel a bit more "liquid glass": a subtle
translucent, frosted surface with a light backdrop blur, while keeping the
existing clean, readable appearance.

Because this is a shared visual criterion for the floating navigator (it applies
wherever that navigator appears), the criteria belong in `docs/design.md`.
Today that document specifies an opaque white surface for the navigator and, in
"Interaction and motion", forbids gradients. Introducing a glass surface
therefore requires reconciling those rules, so this increment updates
`docs/design.md` alongside the navigator styles.

Scope is limited to the navigator surface. Cards, badges, buttons, and the page
keep their current styling.

## Goals

- Give the floating navigator a subtle liquid-glass surface: a translucent light
  background with a light backdrop blur, retaining the pill shape, fine
  border/highlight, and shadow.
- Keep the navigator fully legible and accessible (WCAG 2.2 AA), with safe
  fallbacks when the effect is unsupported or unwanted.
- Record the shared navigator glass criteria in `docs/design.md` and reconcile
  the existing opaque-surface and "no gradients" rules for this surface.

## Non-goals

- Applying a glass effect to cards, badges, buttons, or any other surface.
- Changing navigator placement, size, destinations, active-section logic, or
  indicator motion.
- Strong translucency, heavy tinting, animated specular/highlight motion, or
  other decorative animation.
- Changing smooth scrolling or the page scroll animation.

## Requirements

- **R1**: The floating navigator renders a translucent, frosted "liquid glass"
  surface: a semi-transparent light background plus a backdrop blur, retaining
  the pill shape, the fine border/highlight, and the shadow.
- **R2**: The effect is subtle: the surface reads as light frosted glass and
  stays close to the current light appearance (not dark, strongly tinted, or
  heavily transparent). As a bound: a light background with alpha in the range
  **0.55–0.85**, a backdrop blur of **at least 8 px**, and no strong color tint.
- **R3**: No other surface changes: cards, badges, buttons, and the page
  background keep their current styling and values.
- **R4**: Legibility and contrast: active and inactive labels, the sliding
  indicator, and the focus outline keep WCAG 2.2 AA contrast (at least 4.5:1 for
  text) against the composed navigator surface, over both the page background
  and the card surfaces the navigator can overlap while scrolling.
- **R5**: Fallbacks preserve layout, contrast, and focus visibility: the
  navigator renders an opaque surface when `backdrop-filter` is unsupported and
  when the user prefers reduced transparency.
- **R6**: No new motion: the indicator transition, smoothing, and
  reduced-motion behavior are unchanged; only the navigator surface treatment
  changes.
- **R7**: `docs/design.md` is updated to define the shared navigator glass
  criteria (translucency, blur, border/highlight, and fallbacks) and to
  reconcile the existing opaque-white-surface and "no gradients" rules for this
  surface.

## Acceptance criteria

- [x] AC1: The floating navigator's computed background is translucent with
      alpha in the 0.55–0.85 range and it applies a backdrop blur of at least
      8 px, while retaining the pill shape, border/highlight, and shadow.
- [x] AC2: Cards, badges, buttons, and the page background are unchanged (their
      computed styles match the current values; no glass effect is applied).
- [x] AC3: Active and inactive labels and the indicator meet at least 4.5:1
      contrast against the composed navigator surface, and the keyboard focus
      outline stays clearly visible; the accessibility audit passes.
- [x] AC4: When `backdrop-filter` is unavailable and when reduced transparency
      is requested, the navigator renders an opaque surface with the same
      layout, compliant contrast, and visible focus outline.
- [x] AC5: `docs/design.md` documents the navigator glass criteria and no longer
      contradicts them (the opaque-surface and "no gradients" rules are
      reconciled for this surface).
- [x] AC6: Navigator placement, size, destinations, active-section logic, and
      indicator motion are unchanged.

## Verification

- R1, R2, R3, R5 (surface and fallbacks): Vitest tests under `tests/unit/`
  asserting the navigator's translucent background, backdrop blur, and the
  opaque fallback rules, plus that non-navigator surfaces are untouched.
  Authored by Dev; sufficiency verified by QA.
- R2, R3, R4 (rendered result): Playwright Chromium integration coverage
  asserting computed background/blur, capturing screenshots of the navigator
  over the page and over cards, and checking focus visibility. Owned by QA.
- R4, R5 (accessibility): `pnpm test:a11y` plus the integration accessibility
  spec, including the reduced-transparency / no-`backdrop-filter` fallback
  (emulated via CDP media emulation where supported; otherwise asserted from the
  CSS rules). SEO: not applicable (no change to titles, meta descriptions,
  canonical URLs, or the sitemap).
- R7 (shared criteria): review of `docs/design.md` against the implemented
  navigator styles and concrete token values. Owned by QA.
- Gates: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration` (styles and rendered behavior
  change make integration applicable).
