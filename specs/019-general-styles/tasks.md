# Tasks — General styles: Tailwind-first cleanup

- **Spec ID**: `019-general-styles`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.
> Formatting: `@theme` mapping, tokens, and CSS rules must be formatted before handoff.

## Checklist

- [ ] T1 — Token registration, global boundary and container utility (Dev).
  - Add the `@theme inline` block to `src/styles/global.css` mapping the colors,
    radii, type and motion tokens.
  - Remove every component-specific selector from `global.css` (icon, button,
    heading, profile, experience, company, technology, floating-nav,
    detail-content, provisional-notice), keeping only cross-cutting styles.
  - Define `.site-container` as a Tailwind `@utility` with the responsive gutter.
  - Evidence: build/unit, SEO, a11y — _pending_.

- [ ] T2 — Molecules and Icon to utilities (Dev).
  - `Button.astro`, `Heading.astro`: replace `[data-molecule]` CSS rules with
    computed utility classes; keep the attributes as public hooks.
  - `Icon.astro`: `size-4` plus a scoped `<style>` with the `@layer components`
    default accent.
  - Evidence: build/unit, SEO, a11y — _pending_.

- [ ] T3 — Home static components to utilities (Dev).
  - `ProfileIntroduction.astro`, `TechnologyBadges.astro`,
    `ExperienceHistory.astro`: replace component rules with utilities; keep the
    `social-links` test hook.
  - Evidence: build/unit, SEO, a11y — _pending_.

- [ ] T4 — Detail page and FloatingNav to utilities (Dev).
  - `pages/experiencia/[slug].astro`: utilities plus a scoped `<style>` for the
    `.detail-content` Markdown descendants.
  - `home/FloatingNav/FloatingNav.tsx`: utilities with
    `group`/`data-*`/`aria-[current=location]`/`motion-reduce:` variants.
  - Evidence: build/unit, SEO, a11y — _pending_.

- [ ] T5 — Rewrite source-contract unit tests (Dev, `tests/unit/**`).
  - Update `design-assets`, `button-design`, `section-headings`, `transitions`,
    `molecules-button`, `molecules-heading`, `company-icon` to assert the new
    approach (utility classes, `@theme` output, token resolution) while keeping
    the same design contracts.
  - Evidence: `pnpm test:run` — _pending_.

- [ ] T6 — Verification and final gates (QA).
  - Review Dev's `tests/unit/**` sufficiency; run SEO, accessibility and
    integration suites; record final-gate results while the increment is active.
  - Evidence: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
    `pnpm test:a11y`, `pnpm test:integration` — _pending_.

Dependencies: T1 → {T2, T3, T4} → T5 → T6. Parallelize only non-overlapping files;
serialize shared-file edits.

## Gate summary

- [ ] Lint (`pnpm lint`)
- [ ] Format (`pnpm format:check`)
- [ ] Build (`pnpm build`)
- [ ] Unit tests (`pnpm test:run`)
- [ ] Accessibility (`pnpm test:a11y`)
- [ ] Integration (`pnpm test:integration`)
