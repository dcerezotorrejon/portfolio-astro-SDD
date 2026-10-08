# Experience layout: 128px icon, side-by-side header, responsive

- **Spec ID**: `022-experience-layout`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure with
> status `done`, the entire directory becomes an immutable historical snapshot,
> and code remains the source of truth for current behavior. Later changes belong
> in a new increment.

## Context

The experience cards on the home page (`ExperienceHistory.astro`) and the
experience detail page (`experiencia/[slug].astro`) currently render a small
40px company icon inline next to the company name, with the role title and period
stacked separately. The maintainer wants a stronger visual hierarchy: a large
128px company icon on the left, with the role, company name, and period as a text
block on its right (desktop), collapsing to a stacked full-width image on mobile.
Action buttons are right-aligned, and there is a minimum gap before the
description. This is a purely presentational change; content and heading
semantics stay the same.

## Goals

- Render the company icon in a 128px (8rem) square container (logo letterboxed)
  in both views.
- Ship the maintainer's real company logos (replacing the placeholders) and
  remove the unused `astro.svg`.
- Desktop: icon on the left, text block on the right in the order role → company
  name → period.
- At least 1rem of separation between the header block and the description.
- Mobile (viewport ≤ 600px inclusive): text falls below the image, and the image
  spans the full content width (with the card's own padding as the inset).
- Right-align the "Más información" (home) and "Volver a la trayectoria" (detail)
  buttons.

## Non-goals

- No content changes (profile or experience data).
- No change to `TechnologyBadges` rendering or order.
- No change to heading levels (home card `h3`, detail `h1`, section `h2`).
- No change to the logo content beyond the maintainer-supplied real SVG files
  (only their rendered size and the letterboxed square container).
- No new design tokens unless required; prefer existing Tailwind utilities.

## Requirements

- R1: In `src/components/home/ExperienceHistory.astro` and
  `src/pages/experiencia/[slug].astro`, the company icon renders inside a 128px
  (8rem, Tailwind `size-32`) square container, with `width="128"` and
  `height="128"` attributes; the (landscape) logo is centered within it via
  `object-contain` (letterboxed, never distorted).
- R2: The card/detail header is a horizontal flex row: the icon on the left; on
  its right a vertical text block containing, top to bottom, the role heading,
  the company name, and the formatted period (`formatDateRange`).
- R3: Between the header block and the description (the `summary` on the home
  card, the body content on the detail page) there is at least 1rem of
  separation.
- R4: At viewport widths ≤ 600px inclusive, the header stacks vertically: the
  icon spans the full content width (preserving aspect ratio, no distortion),
  and the text block renders below it.
- R5: The "Más información" button (home card) and the "Volver a la trayectoria"
  button (detail page) are right-aligned.
- R6: Replace the placeholder company SVGs with the maintainer's real logos
  (`public/images/companies/babel.svg`, `public/images/companies/nttdata.svg`),
  and delete the now-unused `public/images/companies/astro.svg`.

## Acceptance criteria

- [x] AC1: In both views the company icon is a 128×128px (8rem) square.
- [x] AC2: On desktop, the header shows the icon on the left and the text block
      on the right with role → company → period order.
- [x] AC3: The gap between the header and the description is at least 1rem.
- [x] AC4: At ≤ 600px the header stacks: full-width image on top, text block
      below, with the image undistorted.
- [x] AC5: Both action buttons are right-aligned.
- [x] AC6: Heading levels are preserved (`h3` card, `h1` detail) and all quality
      gates pass (lint, format, build, unit, SEO, accessibility, integration).

## Verification

- **Structure / size** — unit/component tests over rendered HTML (icon `width`
  and `height` are `128`, `size-32` class present, right-alignment class present,
  text order). Update existing assertions that expect the old 40px icon.
- **Responsive / computed styles** — browser integration: verify the side-by-side
  header above 600px and the stacked full-width layout at ≤ 600px, plus a ≥ 1rem
  gap, via computed styles/screenshots.
- **Accessibility** — `pnpm test:a11y` (structure changed; re-run to confirm no
  regression).
- **Full gates** — `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`.
