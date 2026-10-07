# Experience transition

- **Spec ID**: `017-experience-transition`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio home page lists employment experience as overview cards, each
linking to a dedicated detail page. Navigation between the list and a detail
page uses the browser's native cross-document (MPA) View Transitions
(`@view-transition { navigation: auto }`), without a client-side router or
JavaScript. This increment gives each overview card and its matching detail card
a per-slug shared-element transition identity so the two pages cross-fade the
card as one element, and it adds vertical spacing to the detail page.

## Goals

- Assign a per-slug shared-element transition identity
  (`experience-transition-<slug>`) to each experience overview card and its
  matching detail card.
- Give the experience detail page vertical breathing room with `my-8` spacing.

## Non-goals

- No client-side JavaScript or Astro `<ClientRouter />`; native MPA transitions
  remain the mechanism.
- No change to the transition timing (200 ms) or reduced-motion behavior, which
  remain governed by the global stylesheet and the design document.

## Requirements

- R1: The experience overview card (`ExperienceHistory`) and the experience
  detail card (`experiencia/[slug]`) each declare
  ``transition:name={`experience-transition-${slug}`}``, a name unique per slug.
- R2: Astro compiles that directive into a per-slug
  `view-transition-name: experience-transition-<slug>` rule (scoped via
  `data-astro-transition-scope`), pairing each overview card with its matching
  detail card. No inline `view-transition-name` style is used.
- R3: Native MPA view transitions remain enabled and no client-side router or
  JavaScript is introduced.
- R4: The experience detail `<main>` uses `my-8` (2rem) vertical margin in
  addition to `site-container`.

## Acceptance criteria

- [x] AC1: Each overview card and its matching detail card pair on a unique
      `view-transition-name: experience-transition-<slug>`.
- [x] AC2: Each rendered overview and detail card carries a
      `data-astro-transition-scope` attribute, and the compiled stylesheet maps that
      scope to `view-transition-name: experience-transition-<slug>`.
- [x] AC3: The experience detail `<main>` renders with `my-8` vertical spacing.
- [x] AC4: No client-side transition script or `<ClientRouter />` is emitted;
      native MPA transitions remain enabled and reduced motion still disables the
      animation.

## Verification

- AC1: Vitest source-contract over the `.astro` sources — assert both cards
  declare ``transition:name={`experience-transition-${slug}`}``; the build output —
  assert each slug's compiled `view-transition-name: experience-transition-<slug>`
  rule. The Astro Container render does not emit the compiled CSS, so the pairing
  is asserted at source/build level rather than on the rendered element.
- AC2: Vitest (Astro Container + JSDOM) — assert `data-astro-transition-scope` on
  the rendered cards; the compiled `view-transition-name` value is asserted from
  the build output.
- AC3: Vitest (Astro Container + JSDOM) — assert the detail `<main>` has `my-8`.
- AC4: Vitest — assert `@view-transition { navigation: auto }` and the
  reduced-motion reset in the global stylesheet, and the absence of client-side
  transition scripts.
