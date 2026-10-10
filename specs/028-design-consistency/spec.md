# Design consistency corrections

- **Spec ID**: `028-design-consistency`
- **Status**: in progress
- **Last updated**: 2026-10-10

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

Two inconsistencies accumulated between the implemented UI, the tests, and the
shared design document.

1. **Control-motion duration.** The floating navigator indicator
   (`FloatingNav.tsx`) and the button molecule (`Button.astro`) use the
   `duration-control` utility, and `docs/design.md` states that sliding
   indicators and shared-element transitions use a **200 ms** duration. The
   `--duration-control: 200ms` token is declared, but the Tailwind
   `duration-control` utility is no longer generated — the theme entry that fed
   Tailwind's duration namespace was removed — so both components fall back to
   Tailwind's default **150 ms** transition duration. The rendered motion is
   therefore 150 ms, not the documented 200 ms.

2. **Design document staleness.** `docs/design.md` still declares its status as
   "implementation pending" and, in "Design review and verification", points to a
   completed specification as the place where the navigator's rules "remain
   defined". The criteria should stand on their own in the design document, and
   new work should not route back to a frozen increment.

## Goals

- Restore the 200 ms control-motion duration in the rendered UI for the
  navigator indicator and the button molecule, without renaming the existing
  class contract.
- Make `docs/design.md` a self-contained source for its criteria, without a
  stale status or references to completed specifications.

## Non-goals

- Changing any other motion, visual, or interaction behavior.
- Changing the navigator's indicator behavior, the glass surface, or section
  selection.
- Reintroducing references to completed specifications anywhere.

## Requirements

- **R1**: The `duration-control` utility resolves so that elements using it
  transition at `--duration-control` (200 ms), including the floating navigator
  indicator and the button molecule.
- **R2**: The existing class/behavior contract is preserved: the components keep
  using `duration-control`, and reduced motion still suppresses the transition.
- **R3**: `docs/design.md` no longer states the design is implementation-pending
  and no longer cites a completed specification (by ID or path) as defining its
  criteria; the criteria are self-contained.
- **R4**: No visual or behavioral change beyond the corrected duration and the
  document text.

## Acceptance criteria

- [ ] AC1: The computed `transition-duration` of the floating navigator
      indicator and of a primary button is 200 ms.
- [ ] AC2: The unit contracts are updated to the corrected behavior and
      `pnpm test:run` passes.
- [ ] AC3: Reduced motion still suppresses the transition (unchanged).
- [ ] AC4: `docs/design.md` has no implementation-pending status and no
      references to completed specifications, and its motion criteria match the
      rendered 200 ms.

## Verification

- R1, R2 (duration): unit tests over the token/utility contract, plus a browser
  integration check of the computed `transition-duration` for the navigator
  indicator and a primary button, including reduced-motion suppression.
- R3 (document): review of `docs/design.md`.
- SEO: not applicable (no change to titles, meta descriptions, canonical URLs, or
  the sitemap). Accessibility: unchanged, verified by `pnpm test:a11y` and the
  integration accessibility spec.
