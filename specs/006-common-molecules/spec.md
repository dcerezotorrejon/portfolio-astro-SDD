# Common molecules

- **Spec ID**: `006-common-molecules`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

Today the portfolio's reusable UI pieces exist only as global CSS classes tied to
specific markup: `.button-link` in `src/styles/global.css` styles the social
links, the “Más información” links and the detail return link; `.section-heading`
styles the history `h2` and the expanded Markdown `h2/h3`; `.profile-details h1`
and `.experience-card h3` style the remaining headings inline in the stylesheet.
The same visual rules are re-declared where needed, the button has no reusable
variant, and heading semantics (which tag) are entangled with heading appearance
(which size).

This is a **technical spec**: it introduces a small set of reusable Astro
molecules and migrates the existing consumers, adding one new button variant. It
is a refactor plus new variants, not a new page or feature. The binding
constraints are in [the constitution](../../docs/constitution.md), particularly
§2 (static by default, content not hardcoded), §2.1 (global design), §5–§10, and
the shared visual criteria in [the global design](../../docs/design.md), which
this spec also updates to document the new variants.

The maintainer decisions used to write this spec:

- **Scope**: extract the molecules **and** add the `secondary` (outline) button
  variant. `secondary` stays available and tested but is not adopted on any page
  yet.
- **Home**: `src/components/molecules/` (atomic-design naming), plain Astro
  components, no React islands.
- **Button**: one `Button` component with a required `variant` prop and an
  optional `href`; it renders `<a>` when `href` is present and `<button>`
  otherwise. Base size only; further customization via a forwarded `class`.
- **Heading**: one `Heading` component with a required `level` (1–6) and a
  required `variant` style (`display` | `section` | `card`); semantic level and
  visual style are independent.
- **Migration**: migrate all current consumers in `004-portfolio-home`.
- **Tokens**: molecule-scoped token groups; `--button-*` stays canonical and
  `--section-heading-*` is kept as a compatibility alias of the new
  `--heading-section-*`.
- **Visual documentation**: the new variants are documented in `docs/design.md`
  under Constitution §2.1.

### Anticipated spec relationships

Per Constitution §4.2, the Dev Lead must consolidate actual impacts in the final
`summary.md`.

- [004-portfolio-home](../004-portfolio-home/spec.md): **modified**. This spec
  migrates `ProfileIntroduction.astro`, `ExperienceHistory.astro` and
  `pages/experiencia/[slug].astro`, so files inside that feature change. No
  behavioral requirement of 004 is intended to change: R16's expanded-Markdown
  heading styling is preserved through the new tokens (R6), and routes, content,
  SEO and the single-`h1` rule are untouched. Because the feature is affected,
  its `summary.md` MUST be refreshed in the same change and must reference this
  spec. One intentional visual normalization is recorded: the detail-page `h1`
  moves from the user-agent default to the `display` variant (R7).
- [002-front-extra-dependencies](../002-front-extra-dependencies/spec.md):
  **depends on**. Tailwind v4 and the static-by-default policy remain; the
  molecules are build-time Astro components with no new dependency and no client
  JavaScript.
- [003-agent-workflow](../003-agent-workflow/spec.md): **depends on**. Follows
  its refinement → plan → implementation → QA workflow; does not modify agent
  definitions.
- No other spec is expected to change.

## Goals

- Provide reusable, testable `Button` and `Heading` molecules under
  `src/components/molecules/`.
- Give buttons a `primary` (existing) and a new `secondary` (outline) variant
  driven by tokens.
- Decouple heading semantic level from heading visual style, exposing the
  `display`, `section` and `card` styles.
- Migrate every existing consumer without regressing the delivered behavior of
  `004-portfolio-home`, except the one intentional normalization documented in
  R7.
- Keep the site static: no new client JavaScript and no new dependency.
- Document the new variants in `docs/design.md` as shared design criteria.

## Non-goals

- New pages, sections, routes or portfolio content. `secondary` is not adopted
  on any existing control.
- A general-purpose component library: only `Button` and `Heading`; no atoms,
  cards, badges, layouts or other molecules in this spec.
- React/interactive islands; these molecules stay static Astro components.
- Additional button variants (`ghost`, `danger`) or sizes (`sm`, `lg`).
- Dark mode, motion changes, color-palette changes or new fonts.
- Changes to content collections, schemas, SEO metadata or the i18n policy.
- A full atomic-design restructure of `src/components/`.

## Requirements

- **R1 — Molecule home and form:** `src/components/molecules/` contains
  `Button.astro` and `Heading.astro`. Both are static Astro components with no
  `client:*` directive and no client JavaScript. Filenames and component names
  are PascalCase and match. The molecules render only the content they receive
  and never hardcode portfolio content. They expose stable public hooks for
  styling and tests: `data-molecule="button"` / `data-molecule="heading"` on the
  single root element, plus `data-variant` on both and `data-level` on headings.
- **R2 — Button API:** `Button` props are `variant: "primary" | "secondary"`
  (required), `href?: string`, and `class?: string`. It renders the default
  `<slot />` as the label and forwards the remaining passed attributes (`id`,
  `aria-*`, `data-*`, `rel`, `target`, …) to the single root element. When `href`
  is present the root is `<a href={href}>`; otherwise it is
  `<button type="button">`. `type` and `disabled` are button-only attributes:
  they are applied when the root is a `<button>` (so `type` can be overridden)
  and are never emitted on the `<a>` root. It never renders both elements. A
  forwarded `class` is merged with the component's own hooks rather than
  replacing them.
- **R3 — Button styles and variants:** Both variants are pill-shaped and use the
  base padding and the 44 px minimum touch target (`min-width` /`min-height`).
  No size variants exist; callers customize through the forwarded `class`.
  - `primary` keeps the delivered computed styles: `--button-background` label
    white (`--button-label`), hover `--button-background-hover`, pressed
    `--button-background-active`, 200 ms background transition.
  - `secondary` uses a `--button-secondary-background` (white) surface, a 1 px
    `--button-secondary-border`, dark ink label (`--button-secondary-label`),
    and distinct hover/pressed backgrounds. Candidate token chain: background
    `var(--color-surface)`, hover `var(--color-page)`, pressed
    `var(--color-border)`; it is visibly the same family as `primary` but not a
    filled action, and the border is never the only interaction cue
    (hover/pressed also change the surface). The plan may refine these values
    only if every state keeps the 4.5:1 contrast below.
  - Label-to-background contrast is **≥ 4.5:1** in normal, hover and pressed
    states for both variants, and the global focus-visible outline still applies.
- **R4 — Heading API:** `Heading` props are
  `level: 1 | 2 | 3 | 4 | 5 | 6` (required) and
  `variant: "display" | "section" | "card"` (required). `level` selects the
  semantic tag (`<h1>`…`<h6>`) and nothing else; `variant` selects the visual
  style and nothing else. There is no implicit mapping or promotion between
  them, and omitting either prop is an error. The component renders the default
  `<slot />` and forwards remaining attributes (`id`, `aria-*`, `class`, …) to
  the single root element, merging a forwarded `class`.
- **R5 — Heading styles and variants:** Each variant maps to the delivered
  values:
  - `display`: `clamp(2rem, 5vw, 2.75rem)`, weight 700, line-height 1.2,
    letter-spacing `-0.025em`, margin 0 (today's profile `h1`).
  - `section`: 24 px below 768 px and 32 px at/above 768 px, weight 700,
    line-height 1.25, dark ink, `margin-block-end` 24 px (today's
    `.section-heading`).
  - `card`: `1.25rem`, weight 700, line-height 1.35, margin 0 (today's
    experience card `h3`).
    Migrated elements must keep their current computed styles, except the
    intentional normalization in R7.
- **R6 — Token contract:** `src/styles/global.css` is the single source for the
  molecule styles. It declares the component-token groups following the
  primitive/semantic/component layers of `docs/design.md`: `--button-*` and
  `--button-secondary-*` stay canonical, and a new `--heading-*` group covers
  `display`/`section`/`card`. `--section-heading-*` is kept as a compatibility
  alias resolving to `--heading-section-*`, and the existing `--button-*` names
  remain the canonical button tokens (no rename), so existing token assertions
  and consumers keep working. The molecules' own CSS rules live in this
  stylesheet, not in scoped `<style>` blocks, and target the public hooks from
  R1, so the stylesheet and token tests can keep reading them. Reusable values
  are not duplicated across rules. No new preprocessing tool, runtime styling
  dependency or client bundle is introduced, and the 768 px breakpoint stays
  explicit.
- **R7 — Migration of existing consumers:** Replace the current class-based
  styling with the molecules while preserving behavior, accessible names, links,
  ids, view-transition names and content:
  - `ProfileIntroduction.astro`: the name `h1` becomes
    `<Heading level={1} variant="display" id="profile-name">`; the social links
    become `<Button variant="primary" href={url}>` keeping the icon-+-label
    children, the `aria-label` on the list and the same destinations.
  - `ExperienceHistory.astro`: the history `h2` becomes
    `<Heading level={2} variant="section" id="history-heading">`; each card
    `h3` becomes `<Heading level={3} variant="card">`; the “Más información”
    links become `<Button variant="primary">` keeping their distinguishing
    accessible names.
  - `pages/experiencia/[slug].astro`: the role `h1` becomes
    `<Heading level={1} variant="display">`. This is the **only intentional
    visual change**: that `h1` previously had no project style and used the
    user-agent default; it is normalized to the page `display` style. The
    return link becomes `<Button variant="primary">`.
  - Compiled Markdown `h2/h3` cannot use a component, so the
    `.detail-content h2, .detail-content h3` selector is **kept** and updated to
    consume `--heading-section-*` instead of the old aliases. No other old
    heading/button class (`.button-link`, `.section-heading`,
    `.profile-details h1`, `.experience-card h3`) remains once migrated.
  - Routes, content, SEO metadata, `view-transition-name` values and behavior
    are unchanged.
- **R8 — Accessibility:** Migrated and new molecules preserve semantics: links
  stay links (`<a>`), non-link actions stay `<button>`, both are keyboard
  reachable with a visible focus indicator, buttons keep the 44 px minimum
  target, heading order/the single-`h1` rule are preserved, and every visible
  label/background pair meets WCAG 2.2 AA contrast. Decorative icons remain
  `aria-hidden` and do not duplicate the accessible name.
- **R9 — Design documentation:** `docs/design.md` documents the button variants
  (`primary`, `secondary`) and the heading style variants (`display`, `section`,
  `card`), stating that semantic level and visual style are decoupled, and
  naming the token groups; it refreshes its `Last updated` date. It remains the
  single global design document: feature/placement behavior stays in this spec
  and no duplicate design document is created.
- **R10 — Tests and re-anchoring:** New component tests cover `Button` (link vs
  button root, required `variant`, both variants' tokens, forwarded attributes
  and merged `class`) and `Heading` (tag matches `level`, required
  `level`/`variant`, forwarded attributes and merged `class`). Existing unit
  tests that select the removed classes
  (`tests/unit/button-design.test.ts`, `tests/unit/section-headings.test.ts`,
  `tests/unit/design-assets.test.ts`) are re-anchored to the molecules and the
  new tokens **without losing their covered intent** (contrast ≥ 4.5:1, min
  target, token values, heading hierarchy, single `h1`, Markdown heading
  styling). The SEO and accessibility suites stay green.

## Acceptance criteria

- [x] **AC1 (R1):** `src/components/molecules/` contains `Button.astro` and
      `Heading.astro`; both are static Astro components with no `client:*`
      directive, no client JavaScript and no hardcoded portfolio content; both
      expose the stable hooks (`data-molecule`, `data-variant`, and `data-level`
      on headings).
- [x] **AC2 (R2):** `Button` requires `variant`; with `href` it renders one
      `<a href>` (no `type`/`disabled`) and without it one
      `<button type="button">` (`type` overridable), never both. The root
      carries the `data-molecule`/`data-variant` hooks, forwarded
      `id`/`aria-*`/`data-*` attributes reach it, a passed `class` is merged, and
      the slot renders as the label.
- [x] **AC3 (R2, R3):** `primary` reproduces the current button computed styles
      and states; `secondary` renders a bordered white pill with dark ink label
      and distinct hover/pressed surfaces. Both meet the 44 px minimum target
      and at least 4.5:1 contrast in normal, hover and pressed states, with the
      focus outline visible.
- [x] **AC4 (R4):** `Heading` requires `level` (1–6) and `variant`
      (`display`|`section`|`card`); each `level` maps to the matching `<h1>`–`<h6>`
      tag, `variant` controls only the visual style, and a forwarded `class` is
      merged. Omitting `level` or `variant` is an error.
- [x] **AC5 (R5):** Computed styles confirm `display`, `section` (24/32 px at the
      768 px breakpoint) and `card` match the delivered values.
- [x] **AC6 (R6):** Global CSS declares the `--heading-*` and extended
      `--button-*` component groups and resolves them through the
      primitive/semantic layers; `--button-*` remains canonical and
      `--section-heading-*` still resolves to the approved values as an alias of
      `--heading-section-*`; no reusable value is duplicated and the 768 px
      breakpoint stays explicit.
- [x] **AC7 (R6, R7):** No migrated markup uses `.button-link`,
      `.section-heading`, `.profile-details h1` or `.experience-card h3`.
      `.detail-content h2, .detail-content h3` is retained and token-driven so
      compiled Markdown headings keep their section style.
- [x] **AC8 (R7):** Homepage and both detail routes render through the
      molecules with unchanged links, accessible names, ids, order (newest
      first), routes, `view-transition-name` values and content; the detail
      `h1` is normalized to `display` as the sole documented visual change.
      Previous desktop/mobile computed-style snapshots are unchanged for every
      other migrated element.
- [x] **AC9 (R8):** Rendered and axe checks confirm link/button semantics,
      keyboard operability with visible focus, preserved heading order and single
      `h1`, 44 px targets and AA contrast for all button states; decorative icons
      stay `aria-hidden` and do not duplicate accessible names.
- [x] **AC10 (R9):** `docs/design.md` documents both button variants and all
      three heading variants (semantics decoupled from style) with their token
      groups, and no duplicate design document or feature-specific content is
      added to it.
- [x] **AC11 (R10):** New component tests and the re-anchored
      `button-design`, `section-headings` and `design-assets` tests pass while
      still asserting the original intent (contrast, min target, token values,
      hierarchy, Markdown heading styling).
- [x] **AC12 (R1–R10):** All constitutional quality gates pass with recorded
      evidence before the spec is marked complete.

### Acceptance criteria evidence

Recorded by T4 QA on 2026-10-05; commands run on the final integrated source.

- **AC1** — `Button.astro`/`Heading.astro` exist and are static (no `client:*`,
  no `<script>`) with the documented hooks:
  `tests/unit/molecules-button.test.ts`, `tests/unit/molecules-heading.test.ts`
  (`pnpm test:run`, 21 files / 141 tests).
- **AC2** — root polymorphism, `type`/`disabled` restriction, forwarding and merged
  `class`: `tests/unit/molecules-button.test.ts` (“root selection”/“hooks and
  forwarding” suites).
- **AC3** — primary/secondary token rules, contrast ≥ 4.5:1, 44 px target and focus:
  `tests/unit/button-design.test.ts` + `tests/unit/molecules-button.test.ts`; browser
  computed styles at 1440 px/375 px (`primary` `rgb(12,122,191)` / white / 44 px /
  200 ms, hover `rgb(9,106,167)`; `secondary` injected probe white/`#0f1419`/1 px
  `#cfd9de`/44 px; focus outline 3 px `rgb(7,89,133)` offset 3 px). Pressed states
  verified via matched CSS rules + resolved tokens (`#075985` / `#cfd9de`) and the
  unit contrast assertions.
- **AC4** — `level`→tag mapping, variant independence, merged `class` and required
  props: `tests/unit/molecules-heading.test.ts`. Required-prop omission is enforced
  at the type level (asserted non-optional in source); Astro has no runtime prop
  error.
- **AC5** — browser computed styles: `display` 44 px desktop / 32 px mobile,
  `section` 32/24 px at the explicit 768 px breakpoint, `card` 1.25 rem, with matching
  weight/leading; see `docs/design.md` and the `006` summary.
- **AC6** — token groups, alias chain and explicit breakpoint:
  `tests/unit/molecules-heading.test.ts`, `tests/unit/molecules-button.test.ts`,
  `tests/unit/design-assets.test.ts`; browser `:root` token dump.
- **AC7** — `grep` over `src/` finds no `.button-link`/`.section-heading`/
  `.profile-details h1`/`.experience-card h3`; `.detail-content h2/h3` retained and
  token-driven (`tests/unit/section-headings.test.ts`).
- **AC8** — routes, links, accessible names, ids, ordering and `view-transition-name`
  asserted by `tests/unit/{home,experience,transitions}.test.ts` and
  `tests/seo/{home,experience}.test.ts`; the detail `h1` is the only visual change,
  confirmed by the browser and by comparing the removed rules to the new ones
  (`git show HEAD:src/styles/global.css`). No persisted before/after screenshot
  snapshot exists; equivalence rests on the recorded `004` computed values and the
  identical source declarations.
- **AC9** — `pnpm test:a11y` (4 files / 5 tests) + `a11y` MCP 0 violations on `/` and
  both detail routes; isolated-fixture axe covers `secondary`; browser confirms the
  visible focus outline; icons remain `aria-hidden`.
- **AC10** — `docs/design.md` documents both button and all three heading variants,
  the decoupled semantics/style rule and the token groups; it is the only design
  document.
- **AC11** — new molecule tests + re-anchored `button-design`/`section-headings`/
  `design-assets` suites all pass (`pnpm test:run`).
- **AC12** — `pnpm lint`, `pnpm format:check`, `pnpm build` (3 routes + sitemap),
  `pnpm test:run` (141 tests) and `pnpm test:a11y` (5 tests) all pass; see the
  `tasks.md` gate summary.

## Verification

- **AC1, AC2, AC4–AC7:** Vitest component tests using the Astro Container API
  (`render` helper) over `Button` and `Heading`; assert root element type, tag
  mapping, required props, forwarded attributes, merged `class` and the stable
  molecule hooks. Molecule tests render isolated fixtures rather than page
  markup, which is also how the `secondary` variant (unused on pages) is
  covered. Stylesheet/token tests resolve `--heading-*`,
  `--button-secondary-*` and the compatibility aliases, and assert the retained
  `.detail-content h2/h3` rule is token-driven; the existing
  `tests/fixtures/heading-fixture.astro` keeps exercising the retained
  Markdown-heading selector.
- **AC3, AC5, AC8, AC9:** Browser inspection at mobile and desktop widths
  comparing computed styles before/after migration for every non-normalized
  migrated element; record the intentional detail-`h1` change. Confirm button
  states, 44 px target, focus outline and hover/pressed contrast. Run axe-core
  on the homepage and detail markup plus manual keyboard review, under
  Constitution §7. The `secondary` variant has no page usage, so its contrast
  and axe coverage comes from the isolated component fixture, while page-level
  axe covers the `primary` buttons.
- **AC8, AC9:** Rendered-HTML tests keep asserting routes, links, accessible
  names, `view-transition-name` values, ordering and the single `h1`; existing
  SEO tests over rendered HTML must remain green.
- **AC10:** Documentation review of `docs/design.md` for the variant sections,
  decoupled semantics/style statement, token names and the absence of a
  duplicate design document.
- **AC11, AC12:** Run and record every command in
  [Constitution §6](../../docs/constitution.md#6-quality-gates): `pnpm lint`,
  `pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`.
- **Relationship check:** Confirm no `004-portfolio-home` requirement changed
  and refresh its `summary.md` (referencing this spec and the detail-`h1`
  normalization) in the same change, per Constitution §4.2.
