# Global design

- **Status**: agreed design direction; implementation pending
- **Last updated**: 2026-10-06

## Scope and references

This document defines the shared visual language for the entire portfolio:
colors, typography, layout foundations, component styling, and motion. Existing
and future feature specs reference it rather than maintaining separate copies of
these criteria. It does not require every page to contain every component.

Feature-specific content, routes, component placement, and interaction behavior
belong in their respective specs. This document supplements the standard spec
artifacts; it does not replace them. The authoritative constraints remain in
[the constitution](./constitution.md), particularly
[§7](./constitution.md#7-accessibility).

The reference is Twitter's light visual language: blue accents, clear sans-serif
text, fine borders, rounded surfaces, and pill controls. This is a professional
portfolio, not a social feed replica. Preserve the maintainer's chosen reference
rather than adding unrelated visual motifs.

## Token organization

Global CSS uses three explicit layers, with one source for each reusable value:

1. **Primitive tokens:** palette colors, spacing/type scales, radii and durations.
   These describe values, not a component's role.
2. **Semantic tokens:** page/background/surface/text/border/focus roles and primary
   button states. These reference primitives rather than duplicating values.
3. **Component tokens:** container, card, badge and floating-navigation properties
   that reference the semantic or primitive layers as appropriate, plus the
   molecule groups `--button-*` / `--button-secondary-*` and `--heading-*`
   (`--section-heading-*` is kept as a compatibility alias of
   `--heading-section-*`).

Keep related declarations grouped and named consistently. Component rules consume
semantic/component tokens rather than raw reusable literals. Preserve a useful
small scale instead of creating a token for every one-off declaration. CSS custom
properties do not resolve inside standard media-query conditions: the `768px`
breakpoint remains explicit and documented. Organizing tokens alone must not change
computed colors, dimensions, typography, responsive behavior or motion.

## Color tokens

- **Primary accent / action background — `#0C7ABF`:** One shared palette primitive
  for general blue accents, primary buttons and the active navigator indicator,
  paired with white labels.
- **Button label — `#FFFFFF`:** Text and icons inside primary buttons.
- **Secondary / ink — `#0F1419`:** Main text, headings and inactive navigator labels.
- **Surface — `#FFFFFF`:** Cards and floating navigator.
- **Page background — `#EFF3F8`:** Light page canvas.
- **Border — `#CFD9DE`:** Subtle 1 px card and badge borders; not the sole
  interactive-state cue.
- **Link / focus — `#075985`:** Text links, focus indicators, and contrasting
  interaction outlines.

Primary blue is not the default body-text color. Icons use the primary accent by
default; icons inside primary buttons use white to match their labels. Primary
buttons use white labels and icons on `#0C7ABF` (approximately 4.61:1 contrast).
Hover and pressed backgrounds
must remain dark enough to keep white labels at 4.5:1 or better. The floating
navigator uses a white surface with dark inactive labels and a `#0C7ABF` sliding
indicator with a white active label. Active styling follows the settled semantic
selection (`aria-current`), not a persistent inline text color. Keep text and focus
contrast compliant with the constitution; pale borders are decorative and must
not carry meaning alone.

## Typography

- Use **Open Sans**, downloaded from Google Fonts and self-hosted as local site
  assets. Do not embed a Google Fonts stylesheet or request Google's font servers
  in visitors' browsers.
- Apply it consistently to body text, headings, buttons, badges, and navigation.
- Body text is 16 px. Use a readable system sans-serif fallback and non-blocking
  font loading. Include the distributed font license with the files.
- Support Spanish characters. Actual font files, weights, heading scale, and
  loading configuration are resolved in the technical plan.
- Align copy to the left; do not justify paragraphs. Keep expanded descriptions
  at a comfortable reading width within the shared container.

### Heading styles and variants

Heading appearance is decoupled from heading semantics. A heading's tag
(`h1`–`h6`) selects its outline level and never determines its size, and a visual
style variant never implies a tag: choose the semantic level and the visual
variant independently. Three variants exist, driven by the `--heading-*` token
group:

- **`display`** — the page's hero heading: `2rem` (32px), weight
  700, line-height 1.2, letter-spacing -0.025em and no margin.
- **`section`** — section headings: 24 px below 768 px and 32 px at or above
  768 px, weight 700, line-height 1.25, dark ink and a 24 px bottom gap.
- **`card`** — compact card titles: `1.25rem`, weight 700, line-height 1.35 and
  no margin.

`section` headings keep normal sentence casing, left alignment and natural
wrapping; do not add decorative labels or force uppercase. Their visual emphasis
must not change semantic heading levels: the homepage name remains the sole `h1`,
the professional-history heading is `h2`, and each employment card title is `h3`.
Expanded Markdown section headings follow the same visual language without
generating extra `h1` elements. Because compiled Markdown cannot use a component,
the retained `.detail-content h2, .detail-content h3` stylesheet rule keeps the
`section` visual language for Markdown `h2`/`h3` output.

## Buttons

Buttons are the shared pill controls, styled through the `--button-*` and
`--button-secondary-*` token groups. Both variants keep the pill shape, the base
padding and the 44 px minimum target, and only differ in their surface treatment.
No size variants exist; callers customize through a forwarded class.

- **`primary`** — the filled action: `--color-button` background, white label,
  `--color-button-hover` on hover and `--color-button-active` when pressed, with a
  200 ms background transition.
- **`secondary`** — the outline action: a white `--color-surface` surface, a 1 px
  border and a dark ink label. Hover and pressed also change the surface, so the
  border is never the only interaction cue.

Both variants keep their label at 4.5:1 contrast or better against every
background in the normal, hover and pressed states, and both preserve the global
visible focus outline.

## Layout and shapes

- Content width: maximum 1120 px; centered, with at least 16 px horizontal gutters
  below 768 px and 32 px at or above 768 px.
- Cards: white surface, 1 px border, 24 px corner radius. Their content and
  arrangement are determined by the feature spec.
- Buttons, technology badges, and floating navigator: pill-shaped. Badges are
  non-interactive, outlined text labels that wrap onto additional lines.
- Interactive controls have a minimum height and touch-target width of 44 px.
  This minimum does not apply to non-interactive technology badges.
- Use the same tokens and container across overview and detail pages.
- Do not force sections to a single viewport height or clip overflowing content.

## Floating navigation

These styling criteria apply wherever a feature includes a floating navigator;
the feature spec determines where it appears and which destinations it exposes.

- Center horizontally and fix to the bottom.
- Bottom clearance is 16 px plus the device's bottom safe-area inset.
- Use a white pill surface, with one `#0C7ABF` sliding indicator behind the active
  link. The active link label is white; inactive labels are dark ink. Update the
  label styling with the same current-section state as the indicator, including
  upward scrolling and reduced-motion changes. Selection must also be exposed
  programmatically.
- Provide enough document-end clearance to keep final content and focused
  controls unobscured. Do not shrink the controls to force a fit on mobile.
- If a fixed navigator would overlap a keyboard-focused main-content control, it
  may temporarily move or hide until focus moves into the navigator or out of the
  overlap region. Keep the focused element and its visible focus indicator clear.
- The indicator ends aligned to one whole link, never between links after
  settling. Active-section rules and scroll snapping belong to the feature spec.

## Interaction and motion

- Shared-element transitions and sliding indicators use a 200 ms duration.
  Smooth-scroll distance/timing remains browser-controlled.
- Retarget interrupted indicator animations to the latest active section;
  settled selection must not oscillate or stop between links.
- On reduced motion, disable shared-element animation, indicator movement, and
  smooth scrolling; navigation and selection changes remain functional.
- Unsupported view transitions fall back to normal page navigation.
- Hover and pressed states must keep labels readable. Use the link/focus color
  for a clearly visible keyboard-focus outline; do not rely on color alone to
  distinguish focused or current controls.
- No gradients, decorative entrance animations, or unrelated motion.

## Design review and verification

The repeated rounded cards and blue pill controls are intentional here because
the maintainer explicitly chose the Twitter reference. Keep that direction
focused on readable professional information; do not add feed counters, social
interaction controls, or extra decorative labels.

Each consuming spec must map the relevant global design criteria to its acceptance
criteria and verification methods: computed styles, responsive screenshots,
keyboard and reduced-motion review, transition/indicator recordings where
applicable, and same-origin font network inspection.

The initial consumer is
[004-portfolio-home](../specs/004-portfolio-home/spec.md), particularly AC7 and
AC11–AC13. Its introduction composition, employment routes, transition identity,
and section-selection/snap rules remain defined in that spec.
