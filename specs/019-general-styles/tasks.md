# Tasks — General styles: Tailwind-first cleanup

- **Spec ID**: `019-general-styles`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.
> Formatting: `@theme` mapping, tokens, and CSS rules must be formatted before handoff.

## Checklist

- [x] T1 — Token registration, global boundary and container utility (Dev).
  - Add the `@theme inline` block to `src/styles/global.css` mapping the colors,
    radii, type and motion tokens.
  - Remove every component-specific selector from `global.css` (icon, button,
    heading, profile, experience, company, technology, floating-nav,
    detail-content, provisional-notice), keeping only cross-cutting styles.
  - Define `.site-container` as a Tailwind `@utility` with the responsive gutter.
  - Evidence: `pnpm build` ✓; `pnpm test:run` ✓ (24 files / 153 tests); AC1
    grep over `global.css` returns no component selectors; built CSS contains
    the `@theme`-generated semantic utilities (`bg-surface`, `text-ink`,
    `text-primary`, `rounded-card`, `text-24`, `text-display`, `leading-*`,
    `tracking-display`) (AC3). The earlier motion defect is resolved: the
    `@theme` block now registers
    `--transition-duration-control: var(--duration-control)` under Tailwind
    v4's `--transition-duration-*` namespace, so `dist/_astro/*.css` emits
    `.duration-control{--tw-duration:var(--duration-control);transition-duration:var(--duration-control)}`,
    which resolves to 200ms.

- [x] T2 — Molecules and Icon to utilities (Dev).
  - `Button.astro`, `Heading.astro`: replace `[data-molecule]` CSS rules with
    computed utility classes; keep the attributes as public hooks.
  - `Icon.astro`: `size-4` plus a scoped `<style>` with the `@layer components`
    default accent.
  - Evidence: `pnpm build` ✓; `pnpm test:run` ✓. The earlier contrast defect is
    resolved: the base element rules in `global.css` are wrapped in
    `@layer base`, so `text-surface` now wins over the former unlayered
    `a { color }` rule and the primary Button label computes `#ffffff` on
    `#0c7abf` (browser axe on `/` passes). The reduced-motion defect is
    resolved: `baseClasses` now includes `motion-reduce:transition-none`, and
    live Chromium computed styles against `astro preview` show the button's
    `transition-property: none` under `prefers-reduced-motion: reduce`, while
    normal motion keeps the color transition at `transition-duration: 0.2s`.

- [x] T3 — Home static components to utilities (Dev).
  - `ProfileIntroduction.astro`, `TechnologyBadges.astro`,
    `ExperienceHistory.astro`: replace component rules with utilities; keep the
    `social-links` test hook.
  - Evidence: `pnpm build` ✓; `pnpm test:run` ✓. The earlier contrast defect is
    resolved: browser axe on `/` passes for the social `GitHub`/`LinkedIn`
    labels and both `Más información` buttons (base `a` rule now layered; link
    labels compute `#ffffff` on `#0c7abf`).

- [x] T4 — Detail page and FloatingNav to utilities (Dev).
  - `pages/experiencia/[slug].astro`: utilities plus a scoped `<style>` for the
    `.detail-content` Markdown descendants.
  - `home/FloatingNav/FloatingNav.tsx`: utilities with
    `group`/`data-*`/`aria-[current=location]`/`motion-reduce:` variants.
  - Evidence: `pnpm build` ✓; `pnpm test:run` ✓. The earlier contrast defect is
    resolved: the active nav link computes `#ffffff` on `#0c7abf` and browser
    axe on `/` passes. The motion defect is resolved: once positioned the
    indicator computes `transition-property: transform, translate, scale, rotate`
    with `transition-duration: 0.2s` (200ms), and
    `motion-reduce:transition-none` sets `transition-property: none` under
    reduced motion (both confirmed via live Chromium computed styles against
    `astro preview`).

- [x] T5 — Rewrite source-contract unit tests (Dev, `tests/unit/**`).
  - Update `design-assets`, `button-design`, `section-headings`, `transitions`,
    `molecules-button`, `molecules-heading`, `company-icon` to assert the new
    approach (utility classes, `@theme` output, token resolution) while keeping
    the same design contracts.
  - Evidence: `pnpm test:run` ✓ (24 files / 153 tests); `pnpm lint` ✓ clean (the
    3 `@typescript-eslint/no-unused-vars` errors are resolved: unused
    `resolveDeclaration`, `design`, and `documentFrom` symbols removed). QA
    sufficiency review: `tests/unit/**` asserts utility-class presence on
    rendered markup, absence of inline color overrides, `@theme` output for
    colors/radii/type, token resolution, and `[data-molecule]` CSS removal, and
    now also asserts the `@theme` `--transition-duration-control: var(--duration-control)`
    mapping (with no bare `--duration-control:` theme
    key) plus `duration-control`/`motion-reduce:transition-none` on the
    rendered Button and in the FloatingNav source. This closes the coverage gap
    through which the T1/T2/T4 motion defects escaped; the assertions are
    meaningful source/rendered-markup contracts that fail on the prior
    regressions.

- [x] T6 — Verification and final gates (QA).
  - Evidence (QA re-verification of `spec/019-general-styles` @ `2ebbd216` plus
    the uncommitted task changes; scope: non-Markdown styles, components, pages
    and `tests/unit/**`, so no Markdown-only exception and integration applies):
    - `pnpm lint` ✓ — clean.
    - `pnpm format:check` ✓ — all files formatted.
    - `pnpm build` ✓ — 3 pages built; `dist/_astro/*.css` contains the
      `@theme`-generated utilities (`bg-surface`, `text-ink`, `text-primary`,
      `rounded-card`, `text-24`, `text-display`, `leading-*`,
      `tracking-display`), the motion utility
      `.duration-control{--tw-duration:var(--duration-control);transition-duration:var(--duration-control)}`,
      and no `[data-molecule]` selectors.
    - `pnpm test:run` ✓ — 24 files / 153 tests (includes the SEO suites).
    - `pnpm test:a11y` ✓ — 4 files / 5 tests.
    - `pnpm test:integration` ✓ — 5 passed; `accessibility.spec.ts` browser axe
      passes (WCAG 1.4.3 contrast intact: primary button labels and the active
      nav link compute `#ffffff` on `#0c7abf`).
    - SEO: covered by the SEO tests inside `pnpm test:run` ✓; the sitemap build
      output was regenerated by `pnpm build` ✓.
    - Manual computed-style checks (Chromium/Playwright against `astro preview`,
      port 4325): primary button and floating-nav indicator
      `transition-duration` compute `0.2s` (200ms), and the positioned
      indicator computes `transition-property: transform, translate, scale, rotate`;
      under `prefers-reduced-motion: reduce` the button computes
      `transition-property: none` (reduced-motion parity restored) and the
      indicator likewise computes `transition-property: none`.
  - Verdict: **APPROVED.** Both prior defects are resolved (control motion back
    to 200ms via the `--transition-duration-*` namespace; Button
    reduced-motion parity restored via `motion-reduce:transition-none`), all
    six gate commands pass, and R8/G4/AC6 visual parity holds.

Dependencies: T1 → {T2, T3, T4} → T5 → T6. Parallelize only non-overlapping files;
serialize shared-file edits.

## Gate summary

- [x] Lint (`pnpm lint`) — ✓ clean
- [x] Format (`pnpm format:check`) — ✓
- [x] Build (`pnpm build`) — ✓
- [x] Unit tests (`pnpm test:run`) — ✓ 24 files / 153 tests
- [x] Accessibility (`pnpm test:a11y`) — ✓ 4 files / 5 tests
- [x] Integration (`pnpm test:integration`) — ✓ 5 passed; browser axe contrast
      regression fixed
- **Visual parity (manual, not gate-covered)** — ✓ control motion 200ms and
  Button reduced-motion parity restored (R8/G4/AC6)
