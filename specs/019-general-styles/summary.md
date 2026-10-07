# Summary — General styles: Tailwind-first cleanup

- **Spec ID**: `019-general-styles`
- **Last updated**: 2026-10-08

## Files changed

- `src/styles/global.css` — added a `@theme inline` block registering the design
  tokens (colors, radii, type, motion) with Tailwind; converted `.site-container`
  into a `@utility site-container`; removed all component-specific selectors;
  wrapped the base/reset element rules in `@layer base`.
- `src/components/atoms/Icon.astro` — `size-4` utility plus a scoped
  `@layer components` `.icon` default accent.
- `src/components/molecules/Button.astro` — replaced `[data-molecule]` styling
  with computed utility classes; added `motion-reduce:transition-none`.
- `src/components/molecules/Heading.astro` — replaced `[data-molecule]` styling
  with per-variant utility classes.
- `src/components/home/ProfileIntroduction.astro` — layout/typography moved to
  utility classes.
- `src/components/home/TechnologyBadges.astro` — list and badge moved to utility
  classes.
- `src/components/home/ExperienceHistory.astro` — list/card/company identity/icon
  moved to utility classes (combined with the `transition:name` directive).
- `src/components/home/FloatingNav/FloatingNav.tsx` — positioning, surface, list,
  link and indicator moved to utilities with `group`/`data-*`/`aria-*`/
  `motion-reduce:` variants.
- `src/pages/experiencia/[slug].astro` — markup moved to utility classes plus a
  scoped `<style>` for the compiled-Markdown `.detail-content` descendants
  (combined with the `transition:name` directive).
- `tests/unit/*.test.ts` (design-assets, button-design, section-headings,
  molecules-button, molecules-heading, company-icon, icon, home) — rewritten to
  assert utility classes, `@theme` mapping, and token resolution instead of
  reading component rules from `global.css`.

## Functions / components changed

- `Icon`, `Button`, `Heading`, `ProfileIntroduction`, `TechnologyBadges`,
  `ExperienceHistory`, `FloatingNav`, and the experience detail page — styling
  migrated from the global stylesheet to Tailwind utility classes and a small
  amount of scoped CSS; rendered class-name and `data-*` hooks preserved.
- No change to tokens, computed colors, typography, responsive behavior, or
  motion; the base `main` branch was merged in during the increment (increments
  017/018), and the two conflicting files were combined without losing either
  side.

## Notes

- No CSS preprocessor or new dependency was introduced (Tailwind v4 only), so no
  constitution amendment was required.
