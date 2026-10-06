# Plan — SVG icon atom

- **Spec ID**: `010-svg-icon`
- **Last updated**: 2026-10-06

## Approach

Implement the increment in two production steps with a QA verification after
each, followed by an explicit relationship-summary task:

1. Add a generic, static Astro `Icon` atom whose required `name` is derived from
   a constant icon map, plus external SVG symbol assets for GitHub and LinkedIn.
   The root SVG uses `<use href="...">`, merges the required `.icon` class with
   caller classes, and forwards SVG attributes.
2. QA the atom and public asset contract before integrating it. Then replace only
   the two inline social-button SVGs, apply Tailwind `text-white` at those call
   sites, unify the general primary accent with the button blue, and update the
   global design document and affected token tests.
3. After implementation and integration QA pass, the Dev Lead updates the current
   summary and the `Related specs` records in the affected 004 and 006 summaries.
   QA verifies those Markdown-only relationship changes without touching any
   historical `spec.md`.

The `.icon` rule will be placed in Tailwind's `components` cascade layer, with
`text-white` supplied from Tailwind's `utilities` layer at the two social-button
call sites. Tailwind utilities outrank component-layer styles, so `text-white`
can override the atom's default `var(--color-primary)`. The targeted browser check
will confirm the actual computed color rather than relying only on stylesheet
order assumptions.

The color tokens retain one primitive source: `--palette-action-blue` remains
`#0C7ABF`; `--color-primary` and `--color-button` both resolve to that value. The
distinct `--palette-primary-blue` value is removed rather than keeping a second
palette primitive with the same color. The existing button hover/pressed colors,
white labels, focus token, destinations, accessible names, and page structure are
not otherwise changed. The intentional icon-size difference is 20px → 1rem
(16px).

## Files to change

- `src/components/atoms/Icon.astro` — **new**. Static `<svg><use>` component;
  required map-derived `name`; `.icon` plus forwarded consumer class; forwards
  SVG attributes; no implicit SVG/ARIA attributes beyond the contract.
- `src/components/atoms/iconMap.ts` — **new**. Constant map from `github` and
  `linkedin` to the external public symbol URLs, with an exported name type.
- `public/icons/github.svg`, `public/icons/linkedin.svg` — **new**. External
  `#icon` symbols with the existing path artwork and `currentColor` fill.
- `src/components/ProfileIntroduction.astro` — replace only the two inline
  social SVGs with named `Icon` instances; pass `aria-hidden`, `focusable`, and
  Tailwind `text-white`.
- `src/styles/global.css` — unify primary/button token resolution; add `.icon`
  size/color styling in Tailwind's `components` layer; leave unrelated styles
  and button states intact.
- `docs/design.md` — replace the distinct primary accent description with the
  unified `#0C7ABF` primary/action accent; refresh `Last updated`.
- `tests/unit/icon.test.ts` — **new** (QA). Component rendering, map/assets,
  SVG attributes, class merging and static component contract.
- `tests/types/icon-name.typecheck.ts` — **new** (QA). Isolated compile-only
  assertion for supported and unsupported map-derived name values.
- `tests/unit/home.test.ts` — (QA) assert social icons use matching names,
  decorative attributes, and preserve current visible links.
- `tests/unit/button-design.test.ts` — (QA) re-anchor the global accent
  expectation and assert the `.icon` default and white social override while
  retaining button-state contrast coverage.
- `tests/unit/design-assets.test.ts` — (QA) assert the single primary/action
  color source and updated global-design color documentation.
- `specs/010-svg-icon/spec.md` — QA changes only acceptance checkbox markers
  supported by evidence; the Dev Lead does not edit the specification wording.
- `specs/010-svg-icon/tasks.md` — Lead task definitions and QA-owned assigned
  evidence entries.
- `specs/010-svg-icon/summary.md` — **new**, Dev Lead records actual changed
  files, components, verification status and resolved relationships.
- `specs/004-portfolio-home/summary.md` — Dev Lead updates only its date and
  relationship record for the icon migration and unified accent.
- `specs/006-common-molecules/summary.md` — Dev Lead updates only its date and
  relationship record for the new atom/global design change.

No earlier `spec.md` is to be edited. No other page or section SVG is migrated.

## Key decisions

- **Public API derives from one constant map.** The `name` type is the map's key
  union, so future icons extend the data map without extending a conditional
  branch in the component. No runtime fallback is added for unsupported names.
- **External symbol contract.** Each public file contains a symbol with `id="icon"`
  and a 24×24 viewBox; map URLs include `#icon`. Paths retain their existing
  `currentColor` artwork. This uses the requested browser SVG `<use>` mechanism
  without an icon dependency or client JavaScript.
- **Native SVG flexibility.** The root component forwards passed SVG attributes
  and merges caller `class` values with `.icon`. It does not synthesize
  viewBox/fill/accessibility attributes. The only CSS defaults are the agreed
  1rem square dimensions and the primary accent color.
- **Tailwind override behavior.** `.icon` is a component-layer rule and the
  buttons pass the standard `text-white` utility. This respects Tailwind's
  component-before-utilities cascade and avoids an `!important` utility or
  consumer-specific handwritten color rule. Browser computed-style verification
  is required to prove the result.
- **One primary/action primitive.** Keep `--palette-action-blue` as the single
  `#0C7ABF` primitive, remove the distinct bright-blue primary primitive, and
  point both semantic roles at the action primitive. This avoids duplicate
  palette values while preserving the existing button background.
- **Intentional icon size adjustment.** The atom's default is 1rem (16px), so
  only the two migrated icons change from their explicit 20px size. Link names,
  destinations and button geometry remain unchanged.
- **No new dependency or client runtime.** Reuse Astro, Tailwind v4, Vitest,
  existing browser/MCP tools and the installed TypeScript compiler. Keep all
  rendered portfolio content static.
- **Historical relationships only.** 004 and 006 summaries are updated for
  actual impacts; their historical specifications remain untouched. The current
  spec and summary retain the anticipated and resolved relationships respectively.

## Risks

- **Tailwind utility loses the cascade:** Existing stylesheet rules are generally
  unlayered, and unlayered rules outrank layered utilities. Keep only the `.icon`
  defaults inside `@layer components` and verify the built, rendered icon computes
  to white with `text-white` and to `#0C7ABF` without it.
- **External `<use>` does not load or render in a target browser:** Use same-origin
  public URLs with explicit symbol fragments; build and inspect both network
  responses and rendered icons in a browser.
- **Map and component types drift:** Derive the exported `IconName` from the
  constant map, use that exact type in `Icon.astro`, and run the QA type fixture
  with TypeScript in isolation. A whole-project `tsc` run currently reports
  unrelated baseline errors and is not the type-fixture gate.
- **Global accent re-anchor breaks old token contracts:** Update only the
  assertions that require `#1D9BF0` as a distinct primary accent. Preserve
  assertions for the color-token chain, button normal/hover/pressed contrast,
  minimum targets, and focus behavior; run the full test suite.
- **White foreground becomes low-contrast on an incorrect background:** Confirm
  the `text-white` computed color and primary button backgrounds across normal,
  hover and pressed states; keep existing ≥4.5:1 contrast checks.
- **Summary/spec relationship drift:** Dev Lead updates 004/006 summary records
  only after the actual files are known; QA checks the relationship direction and
  confirms no prior `spec.md` changed.

## Testing strategy

- **Unit / component tests:** Use the existing Astro Container API render helper
  to test `Icon` for both names, the matching `<use href>`, root class, merged
  caller class, forwarded SVG/ARIA attributes, and absence of injected attributes.
  Check the constant map and the two symbol files' IDs, viewBoxes and
  `currentColor` paths. Update homepage rendered tests for social labels,
  destinations, order and decorative semantics. Re-anchor the two style/token
  suites while preserving their current contrast, button-state and token-contract
  coverage. Run a compile-only type fixture against the map with an isolated
  TypeScript CLI invocation; do not use the currently failing full-project
  `tsc --noEmit` as evidence.
- **SEO checks:** No routes, content, or metadata change. Run the existing SEO
  tests as part of `pnpm test:run`; record that no additional SEO behavior is
  applicable.
- **Accessibility checks:** Keep both icons hidden from accessible names and
  unfocusable; run `pnpm test:a11y`, with the existing homepage axe test. Verify
  the white icon color and button foreground contrast in browser computed styles.
- **Browser check:** On `astro preview`, inspect both external symbol requests,
  `.icon` default dimensions/color, `text-white` override, and preserved button
  backgrounds and accessible names.
- **Task/final gates:** Source/assets and test tasks run all five required gates:
  `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, and
  `pnpm test:a11y`. The summary-only relationship task changes only Markdown
  outside `src/content/**`, so only lint and format apply to that task; explicitly
  report build, unit/SEO, and accessibility as not run under Constitution §§5–6.
  The complete feature increment includes non-Markdown files, so the Dev Lead
  runs all five final gates after every task is QA-approved.

## Model plan

- Dev tasks T1 and T3 use the configured GPT-6 Luna medium default: the work is a
  bounded static Astro component, asset migration, CSS and documentation change.
- QA tasks T2, T4 and T6 use the configured GPT-6 Luna medium default: their
  assigned component tests, integration assertions and relationship review fit
  the standard verification scope.
- Dev Lead task T5 uses the configured GPT-6 Luna high model for relationship
  resolution and summary accuracy. No model override is planned.
