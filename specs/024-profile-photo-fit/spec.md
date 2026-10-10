# Profile photo fit and logo optimization

- **Spec ID**: `024-profile-photo-fit`
- **Status**: done
- **Last updated**: 2026-10-10

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The homepage profile section renders the maintainer's real photograph, referenced
from the profile content collection frontmatter and rendered by
`src/components/home/ProfileIntroduction.astro`. The frame is a square avatar
using `object-cover`, but the photograph is a tall portrait (its aspect ratio is
about 4:5; the source file is 3258×4102). Covering a square with a taller image
always crops the top and bottom, so the top of the head and the lower body are
cut off.

The photograph is also still delivered as a raw, unoptimized public asset
(about 1.8 MB at 3258×4102), far larger than needed for a frame that renders at
200–240 px.

An asset audit found that most other public assets are already minimal: the
social icons (648 B / 493 B), favicons (749 B / 655 B) and the variable WOFF2
font (48 KB, latin subset) are fine. The clear exceptions are the two company
logo SVGs (`public/images/companies/babel.svg`, 5.4 KB; `nttdata.svg`, 3.5 KB),
which still carry editor/export cruft (Illustrator and GIMP/Inkscape comments,
`<metadata>`/`<style>`/`<defs>` blocks, redundant namespaces and whitespace).
They are rendered by `<img class="company-icon">` from content frontmatter and
do not pass through `astro:assets`, so minification is the applicable
optimization rather than re-encoding.

Related global criteria live in [`docs/design.md`](../../docs/design.md)
(card radius, surface color) and the binding rules in
[`docs/constitution.md`](../../docs/constitution.md), notably §2 (content from
Markdown, static assets), §7 (accessibility), and §10 (Astro asset tooling).

## Goals

- Show the entire photograph inside the profile frame without any cropping.
- Keep the existing square, rounded frame and give it a white surface so the
  photograph's white background blends with the frame.
- Deliver the photograph through Astro's asset pipeline in a modern format at a
  size appropriate for its rendered dimensions, under a 100 KB target.
- Shrink the two company logo SVGs by removing non-rendering cruft, without
  changing their rendered appearance or their use from content.

## Non-goals

- Changing the profile layout, copy, social links, or section structure.
- Changing or re-encoding other assets beyond minifying the company logos
  (favicon, fonts, social icons, placeholder).
- Adding client-side JavaScript or new interactive islands.
- Choosing a different photograph or altering its artistic content.

## Requirements

- R1: The profile image MUST render the entire photograph without cropping. Its
  square frame MUST use `object-fit: contain` instead of `object-cover`.
- R2: The frame MUST keep the card corner radius (`--radius-card`, 24 px) and use
  a white surface background (`--color-surface`) so the bands beside the
  photograph blend with its white background, with no visible page-color bands.
- R3: The photograph MUST be delivered through Astro's asset pipeline
  (`astro:assets`) and served in a modern image format (WebP and/or AVIF), with
  the source asset declared as a collection image.
- R4: Every image variant the site can serve for the profile photograph MUST be
  smaller than 100 KB.
- R5: The image MUST remain content-driven: its source and alt text come from the
  profile collection frontmatter, and `ProfileIntroduction.astro` MUST NOT
  hardcode the image (Constitution §2).
- R6: The profile content schema MUST declare the image through Astro's
  `image()` helper as a collection-relative asset, so the path resolves against
  the content entry at build; a remote URL or a path that does not resolve to an
  image fails content loading.
- R7: The rendered image MUST keep the current responsive geometry: at most
  200 px wide below the desktop breakpoint and 240 px wide at or above it,
  retaining the `--profile-image-width-desktop` component token.
- R8: The profile image MUST remain eagerly loaded (it sits above the fold) and
  MUST NOT introduce any additional client-side JavaScript or hydration.
- R9: The two company logo SVGs (`public/images/companies/babel.svg`,
  `public/images/companies/nttdata.svg`) MUST be minified in place, removing
  non-rendering content (XML declaration/editor comments, `<metadata>`,
  `<style>`/`<defs>` cruft that is unused, redundant namespaces and attributes,
  and insignificant whitespace) while preserving identical rendered output
  (same `viewBox`, aspect ratio, shapes and colors).
- R10: Minification MUST NOT change the asset paths, the `companyIcon` content
  schema (local `/images/companies/*.svg`), the frontmatter alt text, or the
  `<img class="company-icon">` width/height/`object-contain` behavior.
- R11: Each minified SVG MUST be strictly smaller than its current size:
  `babel.svg` under 5462 bytes and `nttdata.svg` under 3529 bytes.

## Acceptance criteria

- [x] AC1: On the rendered homepage the profile image has a square box whose
      computed `object-fit` is `contain`, so the full photograph is visible with
      no top/bottom (or side) cropping.
- [x] AC2: The frame has a white surface background and the card corner radius,
      and the empty area beside the photograph matches the photograph's white
      background.
- [x] AC3: The production build emits the profile photograph as modern-format
      (`.webp` and/or `.avif`) asset file(s), and every emitted variant is under
      100 KB.
- [x] AC4: The profile image `src` (and any `srcset`) is derived from the profile
      frontmatter; no image path is hardcoded in the component.
- [x] AC5: The `alt` attribute equals the profile frontmatter alt text.
- [x] AC6: Responsive width geometry is preserved (≤200 px mobile, 240 px
      desktop) and `--profile-image-width-desktop` still resolves to 240 px.
- [x] AC7: The profile image is not lazy-loaded, and no new hydrated island or
      client script is introduced.
- [x] AC8: The profile schema accepts a collection-relative image asset via
      `image()`; content loading fails for a remote URL or a non-resolvable
      image path.
- [x] AC9: Both company logo SVGs parse as valid SVG, keep their original
      `viewBox`, contain no editor comments/metadata blocks, and are each
      strictly smaller than before minification (under R11's byte limits).
- [x] AC10: The experience cards and detail pages still render both logos with
      their alt text and dimensions, and the logos load successfully
      (`naturalWidth > 0`).

## Verification

- **Unit / component** (Vitest + Astro Container): AC1, AC2, AC4, AC5, AC6, AC7,
  and AC8 over the rendered homepage and the profile schema; AC9 over the two
  logo SVG files (validity, preserved `viewBox`, absent metadata/comments, byte
  size under R11).
- **SEO** (rendered HTML): homepage `<title>`, meta description, and canonical
  remain unchanged.
- **Accessibility** (axe-core): AC5 — the profile image keeps meaningful alt text
  on the homepage.
- **Integration** (Playwright + Chromium): the homepage image loads
  (`naturalWidth > 0`); computed `object-fit` is `contain`; the frame shows the
  white surface; the served image response is a modern format below the size
  threshold; and AC10 — the experience cards and detail pages load both logos.
- **Build output inspection**: AC3 — formats and byte sizes of the emitted
  profile-image assets.
