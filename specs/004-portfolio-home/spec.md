# Portfolio home

- **Spec ID**: `004-portfolio-home`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

The homepage at `/` was an Astro starter heading with no content collections or
profile assets. It now renders a responsive portfolio foundation: a personal
introduction, a professional history, and per-entry detail pages, all driven by
explicitly provisional Spanish Markdown content. A floating section navigator and
shared native view transitions provide the requested interactivity. This spec is
done, with its `tasks.md` and `summary.md` recording the final evidence.

The binding constraints are in [the constitution](../../docs/constitution.md),
particularly §2, §5–§10. The maintainer approved referencing the global design
document from the constitution; the Lead applied that amendment as version 1.3.0
and updated dependent guidance.

Constitution §2 was clarified, at the maintainer's request, in version 1.2.1 to
explicitly permit React for genuinely interactive elements while retaining island
boundaries and explicit `client:*` directives. That clarification is retained in
1.3.0. Only the floating navigator is hydrated; all portfolio content stays static.

### Anticipated spec relationships

- [001-sdd-baseline](../001-sdd-baseline/spec.md): modifies the starter homepage
  and its unit, SEO, and accessibility coverage; extends the constitution and
  operational guidance it established with a global design reference. Retains
  the verification stack.
- [002-front-extra-dependencies](../002-front-extra-dependencies/spec.md): depends
  on Tailwind v4 and its static-by-default policy, with client interactivity limited
  to the requested navigation and transitions under Constitution §2. Any React
  component must be an explicit interactive island; no stack change is requested.
  The 1.2.1 constitutional clarification preserves that spec's React island policy
  and explicitly permits interactive navigation and stateful indicators.
- [003-agent-workflow](../003-agent-workflow/spec.md): follows its refinement,
  planning, implementation, and QA workflow; does not modify agent definitions.
  Specs 003 and 005 define the workflow and OpenRouter Auto routing respectively.
  Its frontmatter/configuration tests preserve structure, permissions, reasoning
  variants and constitution/design references; the constitution-version assertion
  must expect 1.3.0.

The Dev Lead must consolidate actual impacts into the final `summary.md` and
update affected summaries as required by Constitution §4.2.

## Goals

- Replace the starter homepage with two sections: introduction and professional
  history.
- Provide a centered, consistently spaced, responsive content container.
- Make provisional content replaceable through schema-validated Markdown.
- Deliver a light, restrained visual foundation with accessible social links.
- Provide employment detail routes, technology badges, and shared transitions.
- Provide local company icons in employment cards and detail pages.
- Support proximity scroll snapping and a floating, discrete section indicator.
- Apply the shared visual system in [the global design](../../docs/design.md).
- Establish the global design document's role through a constitutional reference
  and keep dependent guidance consistent.

## Non-goals

- Global navigation, footer, additional homepage sections, contact forms, and
  interactions other than the section navigator and employment transitions.
- Dark mode, decorative animation, and multilingual routing.
- Real personal information, employment claims, or a real portrait.
- Selecting the production domain or publishing the site.
- A Twitter clone or a general-purpose component library.

## Requirements

- **R1 — Container:** Both sections share a centered container with a maximum
  content width of 1120 px. Horizontal space between the viewport and content is
  at least 16 px below 768 px and 32 px at or above 768 px; wider viewports center
  the capped container with equal left and right space. The page must not cause
  horizontal scrolling at viewport widths of 320 px or greater.
- **R2 — Introduction layout:** Use a flex layout. Below 768 px, show the image
  above the personal details, with the image horizontally centered and the details
  left-aligned. At or above 768 px, show the image on the left and details on the
  right, with left-aligned text. Details contain the full name as the page's sole
  `h1`, a short personal headline, and the social links.
- **R3 — Image:** Use a local, neutral square placeholder rather than a fictitious
  portrait or remote image service. Its rendered size is 240 × 240 px at or above
  768 px and up to 200 × 200 px below 768 px, shrinking as needed to fit. Use a
  24 px corner radius and the provisional alternative text specified below.
- **R4 — Social links:** Show GitHub and LinkedIn links, each with an icon and
  visible platform name. Their provisional destinations are `https://github.com/`
  and `https://www.linkedin.com/`. Open in the same tab. Icons must not duplicate
  the accessible link name. Do not imply these destinations are personal profiles.
- **R5 — Professional history:** Place this section after the introduction. Show
  a section heading and vertically stacked cards, each occupying 100% of the
  available section content width. Each card shows role, company, date range, and
  a brief responsibilities description. Order entries by descending start date.
  A missing end date denotes a current role and displays “actualidad”. Also show
  the entry's technology badges and a “Más información” link styled as a button,
  navigating to its detail route in the same tab. Display a company icon beside
  the company name.
- **R6 — Content:** Obtain portfolio copy and page metadata from Markdown content
  collections with validated frontmatter, following Constitution §2 and §9.
  Components receive content instead of hardcoding it. Provide the exact
  maintainer-approved provisional values below. Changing profile text, social
  destinations, employment entries, technologies, or expanded descriptions must
  not require component edits. Each employment entry has a unique route slug, a
  technology list, local company icon and alternative text, and an expanded
  Markdown body. Repeated “Más información” links
  must have accessible names that distinguish their employment destinations.
- **R7 — Visual direction:** Follow [the global design](../../docs/design.md):
  Twitter-inspired light surfaces, blue accents, dark text, subtly bordered rounded
  cards, pill controls and badges. Comply with Constitution §7. The design document
  is global, not a fifth per-feature artifact; no copy belongs under this spec's
  directory. It holds shared colors, Open Sans typography, layout foundations,
  shapes, control states, and motion. Homepage composition, employment routes,
  transition identity, and section selection/snap behavior remain in this spec.
  Primary button labels and icons are white on the agreed darker `#0C7ABF`
  background, including contrast-safe hover/pressed states. This applies to social,
  “Más información” and return buttons. The floating navigator uses dark inactive
  labels on white, with a white active label over its darker `#0C7ABF` indicator.
- **R8 — Pages and quality:** Serve `/` and all employment detail routes in
  Spanish (`lang="es"`), with unique titles and canonical URLs, page-appropriate
  descriptions, and sitemap coverage. Pre-render their content; use client
  JavaScript only for the requested interactive navigation and transitions,
  following Constitution §2. React is permitted, but not required, for genuinely
  interactive elements such as the floating navigator and its stateful indicator.
  If used, each React island must have an explicit `client:*` directive and must
  not hydrate the static introduction, history cards, badges, or detail copy merely
  because they share a page with an island. React is not required for view
  transitions. The Dev Lead documents island boundaries and hydration choices.
  Preserve the existing configured site origin until a separate production-domain
  decision. Verify all applicable constitutional gates; SEO and accessibility apply.
- **R9 — Employment details and badges:** Generate one directly accessible page
  per employment entry. Show role as the page's sole `h1`, company, dates,
  technologies, expanded Markdown description, the provisional notice, and a
  “Volver a la trayectoria” link to `/#trayectoria`. Use the shared container and
  visual system. Technology badges appear on both the card and detail page, are
  non-interactive text with rounded borders, and wrap without horizontal overflow.
  On detail pages, all visible employment content belongs inside one bordered,
  rounded card: header, technologies, expanded description, provisional notice,
  and return link. Do not limit the card surface to the header or leave description
  and controls outside it. Use semantic header/body regions inside that card.
  Display the same company icon beside its name inside the detail header.
- **R10 — View transitions:** Use a shared-element view transition between an
  employment card and its complete detail card, in both directions. Entry identity must
  remain consistent; one employment must never animate into another. When the
  transition API is unsupported, links still navigate normally. Under
  `prefers-reduced-motion: reduce`, navigation is immediate without animated
  transitions. The mechanism and route/scroll lifecycle are planning decisions.
- **R11 — Floating navigator and snap:** Only on `/`, show a fixed bottom-centered
  pill navigator containing “Inicio” (`#inicio`) and “Trayectoria”
  (`#trayectoria`). Both section anchors must work on direct loading and without
  JavaScript. On initial render and while scrolling, select the last section in
  document order whose top has reached or passed the viewport's 16 px start inset
  (allow up to 1 px rounding tolerance). If no section has reached that threshold,
  select “Inicio”. A section becoming visible or centered is not sufficient to
  activate it: its start must reach the top inset. Scrolling upward restores the
  preceding section when the current section's top moves below that threshold.
  If starts coincide, the later section in document order wins.
  A single sliding indicator identifies the active link and rests exactly aligned
  with one link after each animation. Intermediate positions are allowed only
  during animation; interruption or rapid scrolling must converge on the latest
  active link, without oscillating or leaving the indicator stranded. Expose the
  current section programmatically (for example `aria-current="location"`). The
  current link's label is white over the `#0C7ABF` indicator; the non-current link
  uses dark ink on white. Colors follow the same active-section state as the
  indicator and reset when selection changes. Link
  activation scrolls to the section start. Use vertical proximity snap at section
  starts, not mandatory one-screen paging: users can freely read tall sections.
  Smooth anchor scrolling and the indicator animation respect reduced motion.
  A direct or cross-document navigation to a section fragment (for example the
  detail-page return link to `/#trayectoria`) MUST land on the section without an
  animated scroll: the page must not paint at the top and then scroll down. Smooth
  scrolling applies only to in-page anchor activation and MAY be implemented with
  script as a progressive enhancement; the anchors still work without JavaScript.
  Before the first paint after a fragment load, the navigator MUST already show
  the fragment's section as active (the section-start threshold rule reconciles it
  afterwards), so the indicator never flashes from one section to another; the
  navigator exposes its positioned state so the indicator transition is suppressed
  until it is positioned.
  Respect device safe areas and reserve enough page-end space that the floating
  bar does not obscure the last content or focused controls. If the fixed bar would
  overlap a keyboard-focused control in main content, temporarily hide or
  reposition the bar until focus moves into it or out of the overlap region. Detail
  pages have no floating section navigator or section snap behavior.
  The floating navigator is the preferred candidate for a React interactive
  island: it owns the viewport/scroll-driven active-section state and sliding
  indicator, while the sections it observes remain statically rendered outside
  the island. Selection must track actual section positions, not only link clicks.
  React remains optional; the Dev Lead justifies the final choice under R8.
- **R12 — Local typography:** Use Open Sans, downloaded from Google Fonts and
  served from local site assets, for page text and controls. Visiting any page must
  not request fonts or font stylesheets from Google or another third-party host.
  Include the font's distributed license with the assets. Use a system sans-serif
  fallback and a non-blocking font loading strategy. Font files, supported weights,
  and Spanish-character coverage are planning decisions; do not download unused
  families.
- **R13 — Global design governance:** During implementation, amend
  `docs/constitution.md` to reference `docs/design.md` as the shared visual guidance
  for the entire portfolio. Add §2.1 “Global design”, requiring feature specs,
  technical plans, and UI implementations to reference and follow applicable
  global design criteria, while keeping feature-specific behavior in its spec.
  State explicitly that the design document is subordinate to the constitution,
  including accessibility requirements. Increment the current version from 1.2.1
  to 1.3.0 and set “Last amended” to the actual amendment date under §11. If the
  baseline version changes before implementation, the Dev Lead must resolve the
  version increment with the maintainer rather than overwrite newer amendments.
  Update `AGENTS.md` in the same change to point UI work to the global design and
  the constitutional section, without duplicating design tokens. Re-anchor
  dependent version-consistency checks and affected spec summaries under §4.2.
  This amendment does not change the constitution's precedence, existing quality
  gates, approved tooling, or standard four-file spec structure.
- **R14 — Company icon:** Each experience entry MUST provide a local company icon
  path and meaningful alternative text in its validated Markdown data. Both
  provisional entries use a local Astro logo and alt text identifying it as a
  provisional Astro icon for `Empresa de ejemplo`; the logo MUST NOT imply the
  sample employer is actually Astro. Render the icon beside the visible company
  name in both the homepage card and detail card, using the same entry data. Keep
  it local, consistently sized without distortion, and independently replaceable
  (icon path and alt text) without component edits. It does not replace or duplicate
  the employer name.

- **R15 — Global CSS tokens:** Organize the shared stylesheet into primitive,
  semantic and component token layers following `docs/design.md`. Cover reusable
  colors, spacing, typography, radii, focus and motion with consistently named
  declarations and references rather than duplicated reusable literals. Preserve
  the current agreed visual and responsive behavior. Keep the 768 px media-query
  breakpoint explicit; no new preprocessing tool or runtime styling dependency is
  required. A token refactor is not permission to change any other requirement.

- **R16 — Section-heading emphasis:** Apply the global section-heading style to
  the professional-history `h2` and any expanded Markdown section headings:
  24 px below 768 px, 32 px from 768 px, weight 700, line-height 1.25, dark ink,
  and 24 px separation before following content. Use shared type/spacing tokens
  and preserve existing heading levels, normal casing, left alignment and wrapping.
  The change must not promote card titles to section headings or add extra `h1`
  elements. It affects hierarchy, not content or routes.

### Approved provisional content

Spanish strings below are page content, not the language of this specification.

- **Full name:** `Nombre Apellidos`.
- **Personal headline:** `Un breve titular sobre mi perfil profesional`.
- **Visible provisional notice:** `Contenido provisional de ejemplo`.
- **Image alternative text:** `Imagen de perfil provisional`.
- **Professional history heading:** `Trayectoria profesional`.
- **Role (both entries):** `Puesto de ejemplo`.
- **Company (both entries):** `Empresa de ejemplo`.
- **Description (both entries):**
  `Descripción de ejemplo de las responsabilidades del puesto`.
- **Most recent date range:** `enero de 2024 – actualidad`.
- **Earlier date range:** `enero de 2022 – diciembre de 2023`.
- **Page title:** `Nombre Apellidos | Portfolio profesional`.
- **Meta description:**
  `Presentación y trayectoria profesional de Nombre Apellidos. Contenido provisional de ejemplo`.
- **Recent entry slug:** `puesto-ejemplo-2024`.
- **Recent entry technologies:** `Astro`, `Tailwind CSS`.
- **Earlier entry slug:** `puesto-ejemplo-2022`.
- **Earlier entry technologies:** `React`, `TypeScript`.
- **Expanded description (both entries):**
  `Información ampliada de ejemplo sobre las responsabilidades y el contexto del puesto. Este contenido no representa una experiencia laboral real`.

Employment routes are `/experiencia/puesto-ejemplo-2024/` and
`/experiencia/puesto-ejemplo-2022/`. Their respective titles are
`Puesto de ejemplo (2024) | Nombre Apellidos | Portfolio profesional` and
`Puesto de ejemplo (2022) | Nombre Apellidos | Portfolio profesional`. Each detail
page uses its expanded description above as its meta description. Both pages may
share that provisional description, but their titles and canonical URLs differ.
Both provisional entries use `/images/companies/astro.svg` with alt text
`Icono provisional de Astro para Empresa de ejemplo`.

Display the provisional notice visibly on the homepage; do not present the sample
employment history as real. The image path and neutral artwork are planning
decisions, subject to R3.

## Acceptance criteria

- [x] **AC1 (R1):** At widths of 320, 375, 767, 768, 1024, and 1440 px, both
      sections share the centered container, the specified minimum gutters are
      respected, content width never exceeds 1120 px, and there is no horizontal
      overflow.
- [x] **AC2 (R2):** At 767 px the image is above and centered, with details
      left-aligned; at 768 px and wider the image is left of the details. The name,
      headline, and links are present, with exactly one `h1`.
- [x] **AC3 (R3):** The placeholder loads from a local asset, has the approved
      alternative text and 24 px corner radius, and meets the specified square
      dimensions without overflowing its container.
- [x] **AC4 (R4):** Both social links have the exact approved destinations,
      visible platform names and icons, and navigate in the same tab. Each has
      one unambiguous accessible name.
- [x] **AC5 (R5, R9, R14):** Two full-width cards appear below the introduction under
      `Trayectoria profesional`, newest first. Both display all four fields and
      the approved date ranges, technology badges, and a working “Más información”
      link to the matching detail; the current entry displays `actualidad`. Each
      card shows the content-sourced local company icon beside the company name.
- [x] **AC6 (R6, R14):** Schema-validated Markdown supplies the approved content and
      metadata. The provisional notice is visible. Changing a profile value or
      social destination and adding a dated employment entry with technologies,
      a unique slug, local company icon/alt text, and expanded body updates the
      rendered cards, ordering, and detail routes without editing components;
      invalid required content, unsafe icon paths, or duplicate route slugs are
      rejected by validation.
- [x] **AC7 (R7):** Visual review confirms the light, restrained presentation,
      dark body text, bordered rounded cards, and white primary-button labels/icons
      on `#0C7ABF`. Normal, hovered and pressed button states achieve at least
      4.5:1 text contrast. The active navigator label is white on `#0C7ABF` and
      inactive labels are dark ink on white, each with at least 4.5:1 contrast.
      Automated accessibility checks pass;
      keyboard review confirms operable links and visible focus, with a logical
      heading hierarchy.
- [x] **AC8 (R8):** Built HTML at `/` and both detail routes declares Spanish,
      contains the approved page-specific metadata, and has a distinct canonical
      URL using the configured origin. The sitemap includes all three routes.
      Portfolio content remains readable and links usable with JavaScript disabled;
      client code is limited to the requested interactions. If React is used,
      each interactive island has an explicit `client:*` directive and static
      portfolio content remains outside hydrated island boundaries. The plan
      identifies and justifies those boundaries and hydration directives.
- [x] **AC9 (R1–R16):** All constitutional quality gates pass with recorded
      evidence before the feature is marked complete.
- [x] **AC10 (R9, R14):** Both detail URLs load directly and display the matching
      employment data, company icon/name, expanded description, technology badges, provisional
      notice, one `h1`, and a working link back to `/#trayectoria`. Badges wrap
      correctly at 320 px and are not exposed as interactive controls. All those
      visible elements are descendants of the same bordered, rounded detail card;
      none of the description, notice, or return control sits outside the surface.
- [x] **AC11 (R10):** In a supporting browser, entering either detail and returning
      animates its matching overview/detail card. Unsupported-API and reduced-motion checks
      confirm usable navigation without animation; repeated navigation does not
      produce mismatched elements or duplicate transition identities. Evidence:
      `browser-evidence.md` records real 200 ms transitions for both slugs in both
      directions, with the shared name on each complete detail card; transition
      fallback/reduced-motion checks are explicitly reported as emulated where
      applicable. `evidence-t6.md` records 3 targeted transition tests passing.
      A later snapshot measured the UA-default 250 ms; after T6c the final
      integrated browser run sampled real 200 ms transitions in both directions and
      `::view-transition-group(*)` computed to `0.2s` (`evidence-final2.md`).
- [x] **AC12 (R11):** At the agreed mobile and desktop widths, the navigator is
      visible only on the homepage, honors bottom safe-area spacing, and reaches
      both anchors. Initial loading, direct fragment loading, manual scrolling,
      tall history content, rapid direction changes, and return from a detail page
      yield the active section defined by the section-start threshold rule. No
      premature selection occurs merely because the next section is visible or
      centered; selection changes only as its top reaches the 16 px inset (with
      1 px rounding tolerance), and reverses at that boundary when scrolling up.
      After 200 ms of a
      stable selection, the indicator rests exactly on that link, whose label is
      white; the other label is dark. Returning to the previous section swaps these
      colors consistently with `aria-current`. Following direct
      fragment load or anchor activation, the selected section's top settles at the
      agreed 16 px scroll inset (±1 px) at desktop and mobile viewports. The page
      uses proximity snap without preventing access to any card, and its final
      content and keyboard-focused controls are not covered by the navigator; if
      necessary, the floating bar moves or hides while focus is on overlapping main
      content. Reduced motion produces immediate scrolling and indicator changes.
      A direct or cross-document fragment load (including the detail return link
      to `/#trayectoria`) lands at the section instantly — the page never paints at
      the top and then animates — and the navigator shows that section active from
      the first paint, with no indicator flash; in-page anchor activation still
      scrolls smoothly.
- [x] **AC13 (R7, R12):** Computed styles and browser inspection confirm the tokens,
      dimensions, control states, and motion in `docs/design.md`. Open Sans loads
      from same-origin assets, including Spanish glyphs; blocking those assets
      preserves readable fallback text. Network inspection shows no third-party
      font requests, and the font license is included in the repository.
- [x] **AC14 (R7, R13):** `docs/design.md` is the single global design document,
      with no feature-local duplicate. Constitution §2.1 links to it, requires
      its applicable criteria across specs, plans, and UI implementation, and
      states constitutional precedence. The version is 1.3.0 against the current
      baseline and the amendment date reflects implementation. `AGENTS.md` points
      to the same guidance. Version-consistency checks pass without losing their
      existing structural coverage. The final summary records actual relationships
      and affected summaries are updated in the same change.
- [x] **AC15 (R14):** Both overview and detail pages display the same local Astro
      icon and meaningful provisional alt from the entry's Markdown. Replacing its
      path and alt updates both views without component edits; the visible company
      name remains `Empresa de ejemplo`. Aspect ratio is preserved, the icon has
      consistent sizing, and it causes no overflow; axe and manual inspection
      confirm its accessible relationship to the company name.

- [x] **AC16 (R15):** Global CSS declares distinct primitive, semantic and component
      token groups and resolves their references without cycles or missing values.
      Browser computed-style comparisons before/after the refactor show unchanged
      approved colors, button states, dimensions, radii, type and motion across
      mobile and desktop views. Existing responsive, navigation, accessibility and
      SEO checks still pass. Reusable design values are not duplicated directly
      across component rules.

- [x] **AC17 (R16):** Browser computed styles confirm the shared section-heading
      size (24 px mobile / 32 px desktop), weight 700, line-height 1.25, dark ink
      and 24 px following gap. The history heading is visibly distinct from body
      text and card titles. At 320 px it wraps without overflow; heading hierarchy
      and the single-`h1` rule still pass rendered and axe tests.

## Verification

- **AC1–AC3, AC5, AC7, AC10, AC13, AC15:** Browser inspection at the listed viewport
  widths; record container measurements, computed layout, tokens and image
  dimensions, overflow checks, and screenshots. HTML-only tests do not prove
  responsive layout.
- **AC2–AC6, AC10:** Vitest and Astro Container API tests for rendered content,
  headings, image attributes, links and accessible names, card fields, technology
  badges and ordering; collection validation tests for missing required values,
  duplicate slugs, and representative content changes.
- **AC7, AC10, AC12:** axe-core checks on homepage and detail markup, plus manual
  keyboard/focus inspection, including floating-navigation overlap and
  current-section semantics, under Constitution §7.
- **AC8:** Rendered-HTML SEO tests and build-output inspection for all routes,
  language, titles, descriptions, canonicals, and sitemap inclusion; browser checks
  with JavaScript disabled and review of client-code scope. If React is used,
  inspect source directives, island boundaries, and the plan's hydration rationale;
  test island interactions with the existing React testing tools.
- **AC9:** Run and record every command required by
  [Constitution §6](../../docs/constitution.md#6-quality-gates), including
  `pnpm test:a11y`. Update starter-page assertions to the new approved content
  rather than preserving the Astro heading.
- **AC11:** Browser navigation recordings for both entries and return navigation;
  repeat with transition support unavailable and reduced motion enabled. Verify
  identity and complete navigation, not only CSS declarations.
- **AC12:** Unit tests for section-start threshold selection, the 16 px inset and
  1 px rounding tolerance, initial selection, coinciding section starts, and
  interruption state. Browser checks cover selection before/at/after the next
  section's start reaches the top inset, upward reversal, settled indicator bounds,
  scroll/snap behavior, tall content, fragments, repeated navigation, safe areas,
  and reduced motion. Earlier midpoint-based evidence does not verify this rule.
- **AC13:** Browser font/network and fallback checks on all routes, computed styles
  against `docs/design.md`, and review of local assets and the distributed license.
- **AC15:** Rendered tests verify the content-sourced image path and alt on both
  views; schema tests validate safe local paths and non-empty alternative text.
  Browser inspection checks local loading, placement beside employer name,
  consistent dimensions/aspect ratio, overflow and axe results.
- **AC17:** Rendered hierarchy and axe checks plus browser measurements at 320,
  375, 767, 768 and 1440 px for heading size, weight, line-height, color, spacing
  and wrapping. Verify the shared class/style and Markdown headings independently
  using a representative content fixture without adding fabricated employment data.
- **AC16:** Tests resolve nested custom-property references and verify token
  group contracts and the approved underlying values, rather than requiring each
  semantic token to contain a literal hex. Browser computed-style snapshots on all
  three routes at mobile/desktop widths confirm equivalence before/after refactor.
  Check default, hover, pressed, focus and reduced-motion states and all global gates.
- **AC14:** Documentation review and repository checks for the global document,
  absence of a local duplicate, working relative links, constitutional precedence,
  version/date, and consistent `AGENTS.md` guidance. Run QA's updated
  constitution-version consistency test and review affected summaries and
  relationship notes under Constitution §4.2.

Implementation planning must retain the distinction between automated structural
checks and browser-based visual/responsive evidence. Acceptance criteria remain
unchecked until QA supplies evidence.

The Dev Lead receives this agreed specification and the global design document,
clarifies implementation choices with the maintainer, and produces `plan.md` and
`tasks.md` before delegating implementation and QA. The React policy clarification
was applied in version 1.2.1 during refinement, and the global-design reference
was applied in version 1.3.0 during plan execution. Production work, dependent
guidance and tests remain pending until their recorded reports and QA evidence;
constitutional edits alone do not complete the feature.
