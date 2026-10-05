# Plan — Portfolio home

- **Spec ID**: `004-portfolio-home`
- **Last updated**: 2026-10-05

## Approach and files

Use static Astro pages with schema-validated Markdown, a React `client:load`
island only for floating navigation, and native cross-document view transitions.
Follow `docs/design.md` and Constitution §2. No new dependencies are planned.

1. T1 owns `src/content.config.ts`, `src/content/**`, `src/lib/content*`: profile
   and employment collections, approved Spanish samples, validation, sorting,
   date formatting and duplicate route-slug rejection. Keep collection IDs based
   on filenames to avoid silently collapsing duplicate frontmatter slugs.
2. T2 owns `src/styles/global.css`, `public/fonts/**`, `public/images/**`: tokens,
   styles, local licensed Open Sans with Spanish glyphs, neutral SVG placeholder.
   Use a variable font or 400/600/700 weights with `font-display: swap`.
3. T3 owns `src/components/FloatingNav.tsx`, `src/lib/navigation.ts`: pure
   section-start threshold helper and SSR anchors with viewport-driven state. Props contain
   content-sourced section descriptors. Coalesce measurements with animation
   frames, clean up listeners/observers, use CSS for the 200 ms indicator.
4. T4 owns `src/layouts/**`, Astro homepage components and `src/pages/index.astro`:
   shared metadata shell and profile/history from collections. Load only the
   navigator as an island; keep portfolio content static. T4 also updates
   `AGENTS.md` to reference the global design (permitted Dev-owned guide change).
5. T5 owns `src/pages/experiencia/[slug].astro` and detail components: static paths
   and expanded Markdown with matching metadata, badges and return anchors.
6. T6 scopes transition changes after T4/T5: CSS `@view-transition`, unique
   slug-derived overview/detail-card names, reduced-motion opt-out and normal-navigation
   fallback. Do not add an SPA router.
7. T7 adds a local company icon and alt-text field to each experience entry,
   initially using the Astro mark as explicitly provisional. Both overview and
   detail components render that same Markdown-owned data next to the company name.

The Lead owns living spec artifacts and the approved constitutional amendment;
QA owns tests and evidence. Implementation tasks never edit each other's paths
concurrently. T1/T2/T3 run in parallel; T4 waits for them; T5 waits for T1/T2/T4;
T6 waits for T4/T5; T7 waits for T1/T4/T5. Every Dev report is handed to QA for
the same task.

## Decisions and trade-offs

- `client:load` is justified by an immediately visible navigator that must track
  initial fragments and scrolling. Static sections stay outside the island.
- Native view transitions preserve normal document/history navigation and add no
  router lifecycle. Unsupported browsers navigate normally, without simulated
  animation. Use the existing browser MCP for rendered evidence.
- Proximity snap applies only on the homepage; long content remains readable.
  Reserve bottom clearance and test actual scroll behavior, not only CSS classes.
- Content remains in Markdown, including labels and metadata. Site origin remains
  `https://example.com`; replacing it is outside this spec.
- Dev/QA assignments use their configured Auto Router `#medium` defaults without
  overrides unless task difficulty warrants a reasoned escalation. Auto chooses the
  concrete model; reasoning variants do not guarantee a cost band. Record the
  actual model reported for each assignment.

## Risks

- Native transition support and shared-element visibility need browser evidence
  for both entries, return links, history and reduced motion.
- Duplicate route slugs must fail before routes are built, not silently overwrite
  collection entries. Validate schema errors, content changes and ordering.
- Midpoint selection and snap can interact on tall sections: verify rapid scroll,
  long content, final indicator bounds, resize and restoration.
- Download fonts from official Google Fonts sources, include distributed license,
  verify same-origin requests, supported glyphs, fallback and computed font.
- QA must replace starter assertions and re-anchor the version test to the
  approved 1.3.0 amendment, preserving other agent assertions.

## Verification

QA adds unit, React interaction, rendered SEO and axe tests as applicable to each
task, explicitly recording N/A and blockers. Before completion run lint, format,
build, full unit/SEO and a11y suites with exit codes. Inspect built routes/sitemap.
Browser evidence covers all specified widths, colors/fonts, keyboard, no-JS,
reduced motion, shared transitions, snap, active-section rule and settled indicator.
HTML assertions alone do not prove responsive behavior. Do not close any task or
acceptance criterion without the relevant QA evidence and final integration gates.

### Execution amendment — single detail card

The maintainer requested that all employment-detail content share the rounded
card previously limited to the header. T5a wraps the header, badges, Markdown
description, notice and return link in one semantic article/card. Its entire
surface receives the shared transition identity, without changing routes or data.
QA must re-check containment, responsive layout and transition pairing after this
change; prior browser evidence does not automatically verify the new composition.

### Execution amendment — company icons

The maintainer requested a company icon in both the overview and expanded detail.
T7 adds validated local icon/alt fields to experience Markdown, a local Astro logo
placeholder and matching rendering in both views. Preserve the sample company
name, and label the Astro icon as a provisional placeholder; do not imply Astro is
the employer. QA rechecks accessibility and responsive behavior in both locations.

### Execution amendment — anchor inset and focus clearance

Browser QA found that the end spacer let `#trayectoria` approach its start, but the
combination of `scroll-padding` and `scroll-margin` produced a 32 px inset rather
than 16 px. At 320 × 700, the focused final-card action also overlapped the fixed
bar after anchor navigation. T6b removes the additive offset and ensures focused
controls remain unobscured (the bar may temporarily move/hide while focus is in
overlapping main content). QA measures direct and clicked anchors, focus, and
reduced motion; prior scroll evidence is not reused for this CSS change.

### Execution amendment — section-start activation

The maintainer replaced midpoint selection with section-start activation. T8
selects the last section whose top has reached the 16 px inset (1 px rounding
tolerance), defaulting to Inicio before any section crosses that threshold. This
must work in both scroll directions and with direct anchors, resize and history
restoration. Earlier midpoint unit/browser evidence is historical, not evidence
for the new behavior.

### Execution amendment — white button labels

T9 follows the updated global design: white primary-button text/icons on
`#0C7ABF`, with dark-enough hover/pressed states. Preserve the existing blue accent
and the floating navigator's distinct selected/unselected label states. QA calculates actual
foreground/background contrast in each button state and checks all three routes.

### Execution amendment — CSS token hierarchy

T10 refactors the shared CSS into primitive, semantic and component custom-property
layers without changing presentation or behavior. Keep values single-sourced,
retain meaningful public semantic names where useful, and avoid tokenizing every
one-off literal. The 768 px media-query remains a literal. QA must resolve nested
references in code-contract tests and compare computed styles against a before
snapshot, including mobile/desktop, button states and reduced motion. Do not
mistake a changed token storage representation for a changed rendered color.

### Execution amendment — active label and section hierarchy

T11 uses white text only on the current navigation link, with a `#0C7ABF`
indicator for contrast and dark inactive labels. Styling is driven by
`aria-current="location"`; React state controls both the link and the slider.
T12 introduces shared section-heading tokens (24/32 px mobile/desktop, weight 700,
line-height 1.25, 24 px following gap). Preserve heading hierarchy and use the same
visual language for expanded Markdown section headings. Verify actual browser
styles, wrapping, active/inactive colors and alignment at the latest source state.
