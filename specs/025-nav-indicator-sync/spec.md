# Navigator indicator selection during in-page scrolling

- **Spec ID**: `025-nav-indicator-sync`
- **Status**: done
- **Last updated**: 2026-10-10

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The home page has a floating section navigator (`FloatingNav`) whose links are
in-page anchors (for example "Inicio" and "Trayectoria"). On activation the
component prevents the native fragment jump, runs a smooth `scrollIntoView` to
the target section, and marks the target link as the current item so the sliding
indicator is expected to move right away.

Today the geometry-driven section measurement overrides that immediate
selection: while the smooth scroll is in flight, every scroll event re-measures
which section is under the activation inset (16 px) and reverts the current item
to the section currently under the inset — the origin section. As a result the
indicator stays on the origin link for the whole scroll and only slides to the
target once the scroll has essentially finished. The navigation feedback then
looks late and slow even though the page scroll itself is smooth and
browser-controlled.

The desired behavior: the indicator should animate to the chosen section at
click time and stay there until the scroll reaches that section, while manual
scrolling by the user must still drive the indicator from real geometry.

## Goals

- Move the navigator indicator (and `aria-current`) to the chosen section as
  soon as an in-page link is activated, and hold it there while the page scrolls
  to that section.
- Keep manual scrolling authoritative: user-initiated scrolling continues to
  update the indicator from real section geometry, exactly as it does today.

## Non-goals

- Changing the page's smooth-scroll animation or its duration; smooth-scroll
  timing stays browser-controlled (see `docs/design.md`, "Interaction and
  motion").
- Changing colors, layout, sizing, or the inset/threshold rules that decide the
  geometry-active section.
- Adding, removing, or reordering navigator destinations or page sections.

## Requirements

- **R1**: Activating an in-page navigator link (pointer click or keyboard
  activation) immediately selects that link's section: it becomes the current
  item (`aria-current="location"`), the navigator's active index reflects it,
  and the indicator begins moving to it.
- **R2**: While the programmatic scroll to the chosen section is in progress,
  geometry-based measurement MUST NOT override the selection. It stays on the
  chosen section instead of reverting to the section currently under the
  activation inset.
- **R3**: The selection hold is released once the chosen section reaches its
  activation inset (the scroll is positioned on the chosen section). From that
  point geometry governs and continues to report the chosen section.
- **R4**: Any user-initiated manual scroll before the chosen section is reached
  releases the hold immediately; the indicator then follows real section
  geometry again.
- **R5**: Activating a different section while a hold is active retargets the
  selection and the hold to the newly activated section.
- **R6**: With reduced motion, activation still selects the chosen section and
  the hold applies; the page positions without the smooth-scroll animation and
  the indicator transition stays suppressed as today.
- **R7**: Preserve current activation behavior: geometry decides the active
  section when its top reaches the activation inset (16 px, with 1 px rounding
  tolerance), ties resolve to the later section, the pre-paint URL-fragment
  selection still applies, and manual scrolling in both directions keeps
  updating the indicator.

## Acceptance criteria

- [x] AC1: On activating "Trayectoria" from the top, the "Trayectoria" link is
      current (`aria-current="location"`), the navigator active index is the
      target index, and the indicator has started its transition before the page
      scroll has reached the target.
- [x] AC2: During that scroll — from the activation until the target section
      reaches the 16 px inset — the navigator never reverts to "Inicio"; once
      the scroll settles on the target, the selection is still "Trayectoria".
- [x] AC3: After the same activation, a manual scroll performed before reaching
      the target makes the indicator follow real geometry again (for example, it
      returns to "Inicio" when scrolled back to the top).
- [x] AC4: Activating a different section while the first hold is active
      retargets the selection and indicator to the second section.
- [x] AC5: With `prefers-reduced-motion: reduce`, activating a section selects
      it, the page positions without smooth animation, and the indicator shows
      the target state.
- [x] AC6: Existing activation rules are unchanged: downward and upward inset
      crossings, tie-to-later resolution, and pre-paint fragment selection all
      behave as before.

## Verification

- R1, R2, R3, R5, R7 (component behavior): Vitest component tests under
  `tests/unit/` that simulate activation, in-flight scroll events, reaching the
  inset, retargeting, and hold release. Authored by Dev; sufficiency verified by
  QA.
- R2, R3, R4, R6 (browser behavior): Playwright Chromium integration coverage
  under `tests/integration/` that observes the active state during and after the
  click-triggered scroll, manual-scroll takeover, and the
  `reducedMotion: "reduce"` case. Owned and run by QA.
- Accessibility: `pnpm test:a11y` plus the integration accessibility spec,
  verifying `aria-current` follows the selection. SEO: not applicable (no
  change to titles, meta descriptions, canonical URLs, or the sitemap).
- Design/motion evidence: a short recording or frame captures showing the
  indicator moving at activation, holding until the target is reached, and the
  reduced-motion case (see `docs/design.md`, "Design review and verification").
- Gates: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration` (client behavior changes make
  integration applicable).
