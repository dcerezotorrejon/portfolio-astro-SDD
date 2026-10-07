# Plan — General styles: Tailwind-first cleanup

- **Spec ID**: `019-general-styles`
- **Last updated**: 2026-10-08

## Approach

Keep Tailwind v4 as the styling system and treat its utilities as the primary
way to express styles. For every component, move declarations that a utility can
express out of `src/styles/global.css` and into the component markup as utility
classes. Register the existing design tokens with Tailwind through a new
`@theme inline` block so semantic utilities are generated from the same values.
Keep only the CSS Tailwind cannot generate: `@font-face`, the native
`@view-transition` at-rule and `::view-transition-*` pseudo-elements plus their
reduced-motion reset, compiled-Markdown descendant selectors, the global
`:focus-visible` outline and the `@utility site-container`. No preprocessor is
introduced.

Order of work: (1) token registration + strip component rules from `global.css`

- `@utility site-container`; (2) migrate components to utilities; (3) rewrite the
  source-contract tests; (4) full gates.

## Token registration (`@theme inline`)

`global.css` keeps the full three-layer `:root` block and its 768px override. A
new `@theme inline` block registers the tokens under Tailwind namespaces by
referencing the existing custom properties (the `inline` keyword prevents
Tailwind from re-emitting them, so there is a single source of truth). Proposed
mapping:

- **Colors** (`--color-*`, already the right namespace): `--color-primary`,
  `--color-button`, `--color-button-hover`, `--color-button-active`,
  `--color-ink`, `--color-surface`, `--color-page`, `--color-border`,
  `--color-link`, `--color-focus`.
- **Radii** (`--radius-*`): `--radius-pill`, `--radius-card`.
- **Type**: `--text-24`, `--text-32`, `--text-display`, `--text-card`,
  `--font-weight-regular|semibold|bold`, `--leading-tight|display|card`,
  `--tracking-display` — all referencing the `--type-*` / `--heading-*` tokens.
- **Motion** (`--duration-*`): `--duration-control: var(--duration-control)`.
- **Spacing**: none — Tailwind's default scale is used (1 unit = 4px, matching
  the `--space-*` values at a 16px root).

## Component migration (utilities first)

Representative mappings; residual CSS is noted per component.

- **`atoms/Icon.astro`** — `size-4` plus a scoped `<style>` with
  `.icon { width: 1rem; height: 1rem; color: var(--color-primary) }` inside
  `@layer components`, so the caller's `text-white` keeps winning via
  cascade-layer order.
- **`molecules/Button.astro`** — replace `[data-molecule="button"]` and its
  variants with computed utility strings: base
  `inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-5 py-2.5 font-semibold leading-tight text-center no-underline transition-colors duration-200`;
  `primary` adds `bg-button text-surface hover:bg-button-hover active:bg-button-active`;
  `secondary` adds `border border-border bg-surface text-ink hover:bg-page active:bg-border`.
  `data-molecule`/`data-variant` attributes are kept (tests rely on them) but no
  CSS selects on them.
- **`molecules/Heading.astro`** — replace `[data-molecule="heading"]` variants with
  utility strings per `variant` (display/section/card) using the mapped type
  utilities (`text-24 md:text-32`, `text-display`, `text-card`, …). Attributes
  kept, CSS rules removed.
- **`home/ProfileIntroduction.astro`** — section layout, image, details and
  provisional notice become utilities (`flex`, `gap-7`, `py-10`,
  `md:flex-row`, `w-[min(200px,100%)]`, `rounded-card`, `md:w-60`, …); the `<p>`
  margins move onto each element. The social `<ul>` keeps the `social-links`
  test hook plus its own list utilities.
- **`home/TechnologyBadges.astro`** — list and badge become utilities
  (`flex flex-wrap gap-2 py-1 px-3 border border-border rounded-pill bg-surface text-ink`).
- **`home/ExperienceHistory.astro`** — list/card/company identity/icon become
  utilities. The card utility set is duplicated on the detail page (idiomatic for
  utilities).
- **`pages/experiencia/[slug].astro`** — markup to utilities; `.detail-content`
  (compiled Markdown `h2/h3/p`) stays as descendant selectors in a scoped
  `<style>` block in the page.
- **`home/FloatingNav/FloatingNav.tsx`** — positioning, surface, list, link,
  indicator and the `data-active-index` / `data-positioned` /
  `data-focus-obscured` states become utilities with
  `group`/`data-*`/`aria-[current=location]`/`motion-reduce:` variants. No CSS
  file.

## Files to change

- `src/styles/global.css` — add `@theme inline` and `@utility site-container`;
  remove all component-specific selectors; keep Tailwind import, tokens,
  reset/base, `@font-face`, focus outline, scroll-snap/anchors, view transitions,
  reduced-motion.
- `src/components/atoms/Icon.astro` — utilities + scoped `<style>`.
- `src/components/molecules/Button.astro`, `Heading.astro`.
- `src/components/home/ProfileIntroduction.astro`, `TechnologyBadges.astro`,
  `ExperienceHistory.astro`.
- `src/components/home/FloatingNav/FloatingNav.tsx`.
- `src/pages/experiencia/[slug].astro` — utilities + scoped `<style>` for
  Markdown descendants.
- `src/pages/index.astro` — only if the container usage changes.
- `tests/unit/**` — rewrite the source-contract tests that read `global.css`.
- `docs/design.md` — optional note that component styles now live with components
  while tokens remain global (no token-value changes).
- `specs/019-general-styles/{plan,tasks,summary}.md` — Lead-owned.

## Key decisions

1. **No preprocessor.** Everything stays Tailwind v4 plus plain CSS; no `sass`
   dependency and no constitution amendment.
2. **`@theme inline` referencing the `:root` tokens** keeps the three-layer token
   system and its tests intact while generating utilities from the same values.
3. **`.site-container` as `@utility`** — keeps the single responsive container
   used by both pages while moving it under Tailwind.
4. **Icon default accent** stays a scoped `@layer components` rule so `text-white`
   overrides deterministically instead of depending on two competing color
   utilities.
5. **`[data-molecule]` styling removed**, attributes retained as public test/JS
   hooks; only the CSS attribute selectors disappear.
6. **Spacing uses Tailwind's default scale** (rem), which matches the `--space-*`
   values at a 16px root.
7. **Markdown descendants** stay hand-written CSS scoped to the detail page; the
   Typography plugin is explicitly out of scope.

## Risks

- **`@theme inline` self-reference** (`--color-surface: var(--color-surface)`):
  expected to work because `inline` does not re-emit the variable, but must be
  validated against the built CSS.
- **Utility vs scoped-source order** for nested/arbitrary utilities in Tailwind
  v4; validate with computed-style/integration checks.
- **`.detail-content` Markdown headings** must keep the exact section typography
  after the `Heading` component moves to utilities; verified by the integration
  and a11y suites.
- **`data-active-index` indicator transform** expressed through
  `group-data-[active-index=…]` variants must keep the 200ms transition, the
  pre-position suppression and reduced-motion behavior.
- **Test churn**: seven unit files read `global.css` for component rules; the
  rewrite is substantial and must preserve the same design contracts.

## Testing strategy

- **Unit / component tests** (`tests/unit/**`, Dev): token resolution unchanged;
  utility-class presence on rendered markup; no inline color overrides; no
  `[data-molecule]`-based styling; `@theme`-generated utilities present in the
  build output; responsive variant classes present.
- **Accessibility** (QA, `pnpm test:a11y`): contrast, focus visibility, keyboard
  reachability and reduced-motion unchanged.
- **SEO** (QA): existing rendered-HTML tests; applicability recorded per changed
  files.
- **Integration** (QA, `pnpm test:integration`): page rendering, computed styles,
  floating-nav behavior and view transitions unchanged; applies because styles
  and rendering are affected.
- **Lint / format / build**: `pnpm lint`, `pnpm format:check`, `pnpm build`.
