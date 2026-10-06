# SVG icon atom

- **Spec ID**: `010-svg-icon`
- **Status**: draft
- **Last updated**: 2026-10-06

## Context

The two social buttons in the homepage introduction currently contain their SVG
paths inline in `ProfileIntroduction.astro`. This duplicates icon markup at the
consumer and makes the artwork harder to share. This feature adds a reusable
static Astro atom that renders an SVG `<use>` referencing a public SVG symbol,
then migrates only those two button icons. The atom must remain styleable like a
direct `<svg>` element and support additional named icons through a TypeScript
map.

The binding project constraints are in [the constitution](../../docs/constitution.md),
particularly §§2, 2.1, 5–10. UI styling follows [the global design](../../docs/design.md).

### Anticipated spec relationships

Per Constitution §4.2, the Dev Lead must resolve actual impacts in the final
`summary.md` and update affected summaries in the same change.

- [004-portfolio-home](../004-portfolio-home/spec.md): **modified**. Its
  `ProfileIntroduction.astro` social-button icon markup is replaced. Social
  destinations, labels, button behavior, and accessibility remain unchanged; the
  icons intentionally render at the new 1rem default size (16px instead of the
  current explicit 20px). The global primary accent is updated to the unified
  `#0C7ABF` value; homepage button text and icon contrast remains unchanged.
- [006-common-molecules](../006-common-molecules/spec.md): **modified**. This
  increment adds an `atoms` component directory beside the existing molecules.
  The global design documentation and color-token expectations also change. Its
  historical `spec.md` remains unchanged; its `summary.md` relationship record is
  updated under Constitution §4.2.
- [002-front-extra-dependencies](../002-front-extra-dependencies/spec.md):
  **depends on**. The component uses the existing Astro build-time rendering
  stack and introduces no framework, dependency, or client-side JavaScript.
- [007-workflow-changes](../007-workflow-changes/spec.md): **depends on**. Work
  follows the shared feature-branch and Dev/QA handoff workflow.
- [009-workflow-governance](../009-workflow-governance/spec.md): **depends on**.
  Work follows the current role boundaries, named task ownership, and applicable
  verification gates.

## Goals

- Provide a generic, static Astro SVG atom that resolves a required icon name
  through a typed TypeScript map and renders the referenced external symbol using
  HTML SVG `<use>`.
- Keep icon assets in `public/icons/` and make their paths explicit in the map.
- Make the root SVG directly styleable through normal SVG attributes and CSS
  classes, with a default 1rem square size.
- Replace the inline GitHub and LinkedIn SVG markup in the homepage introduction
  social buttons without changing their link behavior or accessible names.
- Unify the general primary accent with the existing primary-button blue,
  `#0C7ABF`, and document the updated global color in `docs/design.md`.

## Non-goals

- Replacing SVG or image assets outside the GitHub and LinkedIn social buttons in
  the homepage introduction.
- Changing social button labels, destinations, order, layout, or behavior.
- Introducing icon libraries, React, client-side JavaScript, or new dependencies.
- Reorganizing existing molecule components or changing shared visual design
  beyond the explicitly agreed 1rem icon default and primary-accent unification.
- Adding icons beyond GitHub and LinkedIn in this increment; the map/atom contract
  must allow future entries without changing the atom implementation.

## Requirements

- **R1 — Atom and icon map:** Add a static Astro component at
  `src/components/atoms/Icon.astro` and a TypeScript constant map at
  `src/components/atoms/iconMap.ts`. The component requires a `name` prop whose
  type is the key union of the map. The initial keys are `github` and `linkedin`;
  their values are the corresponding public SVG symbol URLs. Adding another
  supported icon must require a map entry and its asset, not a change to the
  component's name-selection logic. A name not in the map is invalid at the
  TypeScript API boundary; no fallback icon is rendered. The component renders a
  root `<svg>` containing `<use href={iconMap[name]} />`, with no script,
  hydration directive, or client-side JavaScript.
- **R2 — Public SVG symbols:** Add
  `public/icons/github.svg` and `public/icons/linkedin.svg`. Each asset exposes
  one symbol with the fragment identifier `icon` and a `0 0 24 24` viewBox. The
  symbol path preserves the corresponding existing social-button artwork and
  uses `currentColor`, so the rendered icon follows the surrounding SVG's text
  color. The map values point to `/icons/github.svg#icon` and
  `/icons/linkedin.svg#icon`, respectively.
- **R3 — SVG attributes and default class:** The atom applies the public `icon`
  class to its root SVG; that class sets both width and height to `1rem` and sets
  its color to the global primary accent, `var(--color-primary)` (`#0C7ABF`). It
  merges a consumer-provided `class` with `icon`, rather than replacing the
  default class. Other supplied SVG attributes, including `style`, `width`,
  `height`, `role`, `aria-*`, and `focusable`, are forwarded to the root SVG.
  Apart from the required icon reference and default class, the atom does not
  inject SVG presentation or accessibility attributes (including `viewBox`,
  `fill`, `aria-hidden`, `role`, or `focusable`); the native SVG defaults remain
  in effect unless a caller supplies an attribute. The symbol provides its own
  viewBox.
- **R4 — Homepage social-button migration:** In
  `src/components/ProfileIntroduction.astro`, replace only the two inline SVG
  elements with `Icon` instances named from their corresponding `platform`
  values. Pass `aria-hidden="true"` and `focusable="false"` from each consumer,
  preserving the existing decorative-icon semantics. Pass Tailwind's `text-white`
  class to each `Icon` so the icon remains white on the blue primary-button
  background despite the atom's default accent color. The default 1rem class
  makes these icons 16px square, replacing their existing explicit 20px size.
  Preserve the buttons' labels, destinations, order, same-tab navigation, and
  accessible names.
- **R5 — Design, static rendering, and verification:** The atom and migrated
  buttons follow [the global design](../../docs/design.md) and the accessibility
  requirements in [the constitution](../../docs/constitution.md#7-accessibility).
  They remain server-rendered HTML; the feature adds no third-party requests,
  runtime dependency, or client JavaScript. Verify the component API, name-to-URL
  mapping, attribute forwarding and class merging; both public symbol references;
  and the rendered homepage button markup and accessibility. Run all applicable
  gates in Constitution §6.
- **R6 — Unified primary accent:** The general primary accent and primary-button
  blue both resolve to `#0C7ABF`; there is one canonical source for that shared
  color rather than distinct primary and action blues. Update
  `docs/design.md` to document the unified accent and its existing button use.
  Re-anchor affected CSS-token/style assertions without removing their coverage
  of the token contract, button-label contrast, or focus behavior. Existing white
  primary-button labels and icons remain white; no other button behavior or visual
  token changes as part of the unification.

## Acceptance criteria

- [x] **AC1 (R1):** `Icon.astro` and `iconMap.ts` exist at the specified paths.
      The map is a constant with exactly the initial `github` and `linkedin`
      entries pointing to the specified URLs; the component's `name` type is
      derived from its map keys. Rendering either valid name produces one root
      `<svg>` containing a `<use>` with the matching external `href`. An invalid
      name is rejected by the component's TypeScript contract. The component has
      no script or hydration directive.
- [x] **AC2 (R2):** Both SVG files exist under `public/icons/`, expose the
      `#icon` symbol with `viewBox="0 0 24 24"`, and preserve their respective
      current social icon paths with `currentColor`. The built homepage's two
      `<use>` references resolve to these same-origin public resources.
- [x] **AC3 (R3):** The rendered root always has class `icon`; computed width and
      height are each `1rem` when no override is provided, and computed color is
      `#0C7ABF`. A caller-provided class is present alongside `icon`, and
      supplied SVG attributes are present on the root. No unrequested `viewBox`,
      `fill`, role, or accessibility attribute is added by the atom.
- [x] **AC4 (R4):** The homepage's GitHub and LinkedIn social buttons render the
      matching `Icon` names, are 16px square by default, and retain their existing
      visible labels, URLs, order, same-tab navigation, and accessible names.
      Each icon receives Tailwind's `text-white` class and is marked
      `aria-hidden="true"` and `focusable="false"` by its consumer; computed
      icon color is white on the button. No other page or section SVG is migrated
      by this change.
- [x] **AC5 (R5):** Rendered-component and homepage checks pass, accessibility
      checks report no new violations, the page remains usable without client
      JavaScript, and all applicable constitutional quality gates pass with
      evidence recorded in the assigned task entry. Acceptance criteria remain
      unchecked until QA records that evidence.
- [x] **AC6 (R6):** `--color-primary` and `--color-button` resolve to the same
      canonical `#0C7ABF` value; the obsolete distinct `#1D9BF0` primary accent
      is no longer documented or used as a competing primary color. The global
      design document describes the unified color. Re-anchored token and style
      assertions pass, primary-button labels/icons remain white with at least
      4.5:1 contrast in applicable states, and focus indicators remain visible.

## Verification

- **AC1:** Use Astro Container API component tests to verify the root `<svg>`,
  `<use href>` mapping for both names, derived name type, forwarded SVG
  attributes, absence of injected attributes, default class, and merged consumer
  class. Verify the component source has no script or `client:*` directive. Use
  a compile-only TypeScript assertion fixture that imports the map's name type
  and is checked in isolation with `pnpm exec tsc`; it asserts both supported
  names are accepted and an unsupported name is rejected. Inspect the component
  prop declaration to confirm it uses that map-derived type.
- **AC2:** Inspect both public SVG files and assert their symbol IDs, viewBoxes,
  paths, and `currentColor`. Build and inspect rendered HTML, then use browser
  network/DOM inspection to confirm both external same-origin symbol references
  load and render.
- **AC3:** Component tests assert root attributes and class merge. Browser
  computed-style inspection confirms width and height are each 1rem and color is
  `#0C7ABF` by default; render a caller-supplied class and SVG attributes to
  verify customization works.
- **AC4:** Rendered homepage tests assert that social platform names resolve to
  the correct `href`, preserve the existing visible text and accessible link
  names, and pass `aria-hidden`/`focusable` to the icon root. Browser inspection
  confirms 16px square icons, unchanged button behavior, and no regressions in
  social-button contrast, layout, or keyboard focus. Run the homepage
  accessibility tests.
- **AC6:** Inspect `src/styles/global.css` and `docs/design.md` to confirm the
  primary and button color tokens share one canonical `#0C7ABF` value and that
  the former distinct `#1D9BF0` accent is absent from active design guidance.
  Re-run token/style tests updated for this contract and use computed-style and
  contrast checks for button normal, hover, pressed, and focus states.
- **AC5:** Run `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  and `pnpm test:a11y` as required for this non-Markdown-only change by
  [Constitution §6](../../docs/constitution.md#6-quality-gates). QA records the
  applicable results and evidence in the assigned task entry. The Dev Lead
  resolves actual related-spec impacts in the current feature summary and the
  affected prior summaries; earlier `spec.md` files remain unchanged.
