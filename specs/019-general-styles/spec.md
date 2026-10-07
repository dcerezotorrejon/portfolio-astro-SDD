# General styles — Tailwind-first cleanup

- **Spec ID**: `019-general-styles`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

Today all styling lives in one hand-written `src/styles/global.css` (~590 lines)
imported once in `src/layouts/SiteLayout.astro`. Tailwind v4 is enabled (via the
`@tailwindcss/vite` plugin and `@import "tailwindcss"`) but almost unused: the
only utilities consumed today are `gap-x-2` and `text-white`. The stylesheet
mixes two kinds of content:

1. **Cross-cutting concerns** — the three-layer design tokens in `:root`
   (primitive → semantic → component), element reset/box-sizing, `html`/`body`
   base, `@font-face`, the `:focus-visible` outline, `.site-container`, the
   768px token override, `html.home-page` scroll-snap and section anchors
   (`#inicio`, `#trayectoria`), native view transitions, and reduced-motion
   overrides.
2. **Component-specific rules** that style exactly one component family:
   - `.icon` → `atoms/Icon.astro`
   - `[data-molecule="button"]` + variants → `molecules/Button.astro`
   - `[data-molecule="heading"]` + variants → `molecules/Heading.astro`
   - `.profile-intro`, `.profile-image`, `.profile-details`, `.provisional-notice`
     → `home/ProfileIntroduction.astro`
   - `.experience-list`, `.experience-card`, `.company-identity`, `.company-icon`
     → `home/ExperienceHistory.astro` and `pages/experiencia/[slug].astro`
   - `.technology-list`, `.technology-badge`
     → `home/TechnologyBadges.astro` and `home/ProfileIntroduction.astro`
   - `.floating-nav`, `-list`, `-link`, `-indicator` and their `data-*` state
     rules → `home/FloatingNav/FloatingNav.tsx`
   - `.detail-content`, `.experience-detail-*` → `pages/experiencia/[slug].astro`

Those component rules are flat plain CSS, live far from the components they
style, and repeat token-driven declarations. The maintainer wants the styles
reviewed so Tailwind utilities are used to the maximum: everything a utility can
express is removed from the stylesheet and applied in markup, and the design
tokens are registered with Tailwind so semantic utilities are generated from the
same values. Only the CSS that Tailwind genuinely cannot generate is kept.

The shared visual language and token values remain governed by
[`docs/design.md`](../docs/design.md).

## Goals

- **G1** — Maximize Tailwind: remove from `global.css` every declaration a
  Tailwind utility can express and apply those utilities directly in component
  markup.
- **G2** — Register the design tokens with Tailwind's `@theme` so semantic
  utilities are generated from the same token values, without changing the
  `:root` tokens.
- **G3** — Keep only the unavoidable non-utility CSS (font loading, native view
  transitions, compiled-Markdown descendants, global focus outline) in the global
  stylesheet or a component/page-scoped `<style>` block.
- **G4** — Preserve the visual design exactly: token values, contrast, responsive
  breakpoints, motion, and reduced-motion behavior are unchanged (no visual
  regression).

## Non-goals

- No SCSS/Sass or any other CSS preprocessor; no `sass` dependency, no `.scss`
  files, and no `@apply`-based abstraction layers.
- No constitution amendment: Tailwind v4 is already the mandated styling system
  and no tooling changes.
- No new runtime dependency for styling (for example, the Tailwind Typography
  plugin); compiled-Markdown descendants stay hand-written CSS.
- No redesign of the visual language — see [`docs/design.md`](../docs/design.md).
- No change to content (`.md`), routing, or non-styling behavior.
- The `:root` design tokens keep their current names and resolved values (the
  three-layer structure is preserved, not flattened or renamed).

## Requirements

- **R1 — Utilities-first:** For each component, declarations in `global.css` that
  a Tailwind utility can express are deleted and expressed as utility classes in
  the component markup (via `class` / `class:list`). This covers icon sizing and
  color, button pill shape/padding/states, heading variants, profile layout and
  typography, card/badge surface and spacing, and the floating navigator's
  positioning, surface and states.
- **R2 — Tokens → `@theme`:** The `:root` design tokens keep their names and
  resolved values. A Tailwind `@theme inline` block referencing them generates
  semantic utilities for colors, radii, type (size/weight/leading/tracking) and
  duration. Spacing uses Tailwind's default scale.
- **R3 — Global boundary:** `src/styles/global.css` retains only cross-cutting or
  non-utility CSS: `@import "tailwindcss"`, the `@theme` block, the `:root` token
  block and its 768px override, reset/box-sizing, `html`/`body` base,
  `@font-face`, the `:focus-visible` outline, the `@utility site-container`, the
  `html.home-page` scroll-snap and section anchors, native view transitions, and
  reduced-motion overrides. All component-specific selectors are removed from it.
- **R4 — `.site-container` as `@utility`:** The container is defined as a
  Tailwind `@utility` (responsive gutter included) and used as the same class on
  both pages.
- **R5 — `data-molecule` styling removed:** Button and Heading are styled through
  utility classes. The `[data-molecule]` / `[data-variant]` CSS rules are removed
  and no stylesheet selects on those attributes. The attributes themselves are
  kept or dropped solely based on what existing tests or consumers require, with
  tests updated where needed.
- **R6 — Icon default accent:** `Icon.astro` carries a scoped `<style>` with a
  `.icon` rule in `@layer components` providing its size and default accent, so a
  caller's color utility (for example `text-white`) still overrides it through
  cascade-layer order, exactly as today.
- **R7 — Markdown descendants:** The compiled-Markdown styling on the detail page
  (`.detail-content h2/h3/p`) is kept as plain CSS in a scoped `<style>` block in
  `pages/experiencia/[slug].astro`.
- **R8 — Visual parity:** Computed styles, token values, contrast (interactive
  labels and focus indicators remain ≥ 4.5:1), the 768px gutter/heading
  breakpoint, 200ms control motion, and reduced-motion behavior are identical to
  today.
- **R9 — Test updates:** The unit source-contract tests that read component rules
  from `global.css` are updated to assert the new approach (utility classes on
  rendered markup, `@theme` mapping, token resolution) while keeping the same
  design contracts. Token-resolution tests are unchanged. Dev owns
  `tests/unit/**`; QA owns the SEO, accessibility, and integration suites.

## Acceptance criteria

- [x] **AC1** — `global.css` contains no component-specific selector: grep for
      `[data-molecule`, `.icon`, `.profile-`, `.experience-`, `.company-`,
      `.technology-`, `.floating-nav`, `.detail-content`, and `.provisional-notice`
      returns no matches (only cross-cutting rules remain).
- [x] **AC2** — The `:root` tokens still resolve to the approved values
      (`--color-button` → `#0c7abf`, `--color-surface` → `#ffffff`,
      `--heading-section-size` 24px → 32px at the 768px breakpoint, etc.); the
      existing token-resolution tests pass.
- [x] **AC3** — Tailwind generates semantic utilities from the tokens (for
      example `bg-surface`, `text-ink`, `text-primary`, `rounded-card`) and they are
      present in the built CSS.
- [x] **AC4** — Component markup uses utility classes for layout, typography, and
      color; rendered HTML contains no inline `style` color overrides and no
      `[data-molecule]`-based styling.
- [x] **AC5** — `.site-container` is defined as a Tailwind `@utility` and used by
      both `index.astro` and the detail page.
- [x] **AC6** — Visual parity holds: `pnpm test:a11y` and `pnpm test:integration`
      pass unchanged (computed styles, contrast, keyboard focus, and reduced-motion
      intact).
- [x] **AC7** — Residual CSS is scoped: the Markdown descendant rules live in the
      detail page's scoped `<style>`, the `.icon` default is scoped in `Icon.astro`,
      and no component page leaks selectors it does not own.
- [x] **AC8** — All gates pass: `pnpm lint`, `pnpm format:check`, `pnpm build`,
      `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration`.

## Verification

- **Unit / component tests** (Dev, `tests/unit/**`): token resolution unchanged;
  utility-class presence and absence of inline color overrides on rendered
  markup; `@theme`-generated utilities present in built CSS; `[data-molecule]`
  styling removed.
- **Accessibility** (QA): `pnpm test:a11y` — contrast, keyboard focus, and
  reduced-motion unchanged.
- **SEO** (QA): existing SEO tests over rendered HTML; record applicability per
  the changed-file set.
- **Integration** (QA): `pnpm test:integration` — styles affect page rendering,
  so integration applies.
- **Lint / format / build**: `pnpm lint`, `pnpm format:check`, `pnpm build`.
