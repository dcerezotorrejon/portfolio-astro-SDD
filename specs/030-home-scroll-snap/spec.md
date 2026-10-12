# Home free scrolling

- **Spec ID**: `030-home-scroll-snap`
- **Status**: done
- **Last updated**: 2026-10-12

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The home page currently mediates scrolling in two ways. First, CSS scroll
snapping: `scroll-snap-type: y proximity` on the home root plus
`scroll-snap-align: start` on `#inicio` and `#trayectoria`. Second, an animated
programmatic scroll when a floating-navigator link is activated
(`scrollIntoView` with `behavior: "smooth"`), together with "hold" logic that
keeps the active selection pinned to the target while that animation is in
flight.

On touch devices this makes scrolling feel intercepted and slow: the viewport
resists and re-engages toward a section start instead of following the gesture,
and the friction is felt throughout the scroll. The maintainer has decided to
remove the mediation entirely on the home page: no snapping at all, and
navigator activation that jumps straight to the section, while keeping the
navigator's active/indicator state correct.

`docs/design.md` states that active-section rules and scroll snapping belong to
the feature spec, and its "Interaction and motion" section currently describes
smooth scrolling as active behavior. Current project rules live in
[`docs/constitution.md`](../../docs/constitution.md).

## Goals

- Remove all scroll snapping from the home page so scrolling is completely free.
- Make floating-navigator activation jump directly to the target section, with
  no animated scroll, updating the URL fragment and the active/indicator state.
- Retire the indicator-hold logic that existed only to bridge the animated
  scroll.
- Preserve the navigator's remaining behavior: active-section tracking,
  indicator, liquid-glass surface, focus protection, keyboard operation, and
  `aria-current`.
- Reconcile `docs/design.md` motion criteria so they no longer describe smooth
  scrolling as active behavior.

## Non-goals

- Changing section content, layout, heights, spacing, or visual design.
- Changing the floating navigator's visual design, glass surface, focus
  protection, safe-area handling, or keyboard behavior.
- Affecting non-home pages, which currently have no snapping.
- Introducing any client-side scroll animation, new island, or new script.

## Requirements

- **R1**: The home root declares no scroll snapping: `scroll-snap-type` is
  absent from the home rule, and the home root declares no `scroll-behavior`.
- **R2**: The home sections expose no snap points: `#inicio` and `#trayectoria`
  declare no `scroll-snap-align`, so home scrolling is fully free.
- **R3**: Activating a floating-navigator link positions the page at the target
  section immediately, without an animated (smooth) scroll.
- **R4**: Activation updates the URL fragment to the target section
  (`#inicio` / `#trayectoria`).
- **R5**: On activation the navigator reflects the target section as current
  (`aria-current="location"` and a matching `data-active-index`), and on later
  scrolling it continues to track the section under geometry.
- **R6**: The indicator-hold logic that pinned the selection during an animated
  scroll is retired; selection follows geometry.
- **R7**: Modified, new-tab, and middle-click activation keeps native browser
  behavior (no interception), and keyboard activation still jumps to and selects
  the target with visible focus.
- **R8**: Reduced-motion behavior stays correct: no animated scroll is
  introduced, and the indicator transition remains suppressed under reduced
  motion.
- **R9**: The 16 px scroll inset (`scroll-padding-block-start`) and the
  floating navigator's existing behavior (indicator, liquid-glass surface, focus
  protection, safe-area, `aria-current`, entries under
  [`docs/design.md`](../../docs/design.md)) are unchanged.
- **R10**: `docs/design.md` motion criteria are reconciled so they no longer
  describe smooth scrolling as active behavior.
- **R11**: No new client-side island or script is introduced; the home page
  still renders only the existing `FloatingNav` island.

## Acceptance criteria

- [x] AC1: `src/styles/global.css` contains no `scroll-snap-type` and no
      `scroll-snap-align`; the home root declares neither `scroll-snap-type` nor
      `scroll-behavior`.
- [x] AC2: Plain activation of a navigator link moves the page to the target
      section with no animated progression (the position reaches the target
      immediately) and sets the URL fragment to the target section.
- [x] AC3: After activation, the target link has `aria-current="location"` and
      the navigator's `data-active-index` matches the target.
- [x] AC4: Scrolling away from the target after activation updates the current
      section, proving the retired hold no longer pins the selection.
- [x] AC5: Modified/new-tab/middle-click activation is not intercepted; keyboard
      activation still jumps to and selects the target with visible focus.
- [x] AC6: Reduced-motion navigation still works with the indicator transition
      suppressed.
- [x] AC7: `docs/design.md` no longer describes smooth scrolling as active
      behavior.
- [x] AC8: The home page still renders exactly one island (`FloatingNav`).

## Verification

- **Unit / component** (Dev-owned tests under `tests/unit/**`): update
  `navigation.test.ts` so `scrollToSection` no longer requests a smooth
  behavior; update the floating-navigator tests to assert immediate activation
  and geometry-driven selection, removing or replacing the hold-specific cases;
  update `design-assets.test.ts` to assert the absence of scroll-snap rules; and
  add a consistency check that `docs/design.md` no longer presents smooth
  scrolling as active behavior.
- **Integration** (QA-owned, Playwright, applicable because rendering and client
  behavior change): update `navigation.spec.ts` to assert that activation
  positions the page at the target immediately (no smooth in-flight), that the
  fragment updates, and that `aria-current`/`data-active-index` match; cover the
  modified/new-tab click and reduced-motion cases; and remove or replace the
  in-flight hold test that no longer applies.
- **Accessibility**: run the accessibility gate. Keyboard activation, focus
  visibility, and the navigator's landmark/`aria-current` semantics remain
  unchanged.
- **SEO**: not applicable — page titles, meta, canonical, and sitemap are
  unaffected by this change.
- **Manual**: on a touch device or emulator, confirm fully free scrolling with
  no snap resistance and instant navigator jumps.
