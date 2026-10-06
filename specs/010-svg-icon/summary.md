# Summary — SVG icon atom

- **Spec ID**: `010-svg-icon`
- **Last updated**: 2026-10-06

## Files changed

- `src/components/atoms/Icon.astro` — new static SVG atom rendering a mapped
  external SVG symbol through `<svg><use>`; adds the default `icon` class, merges
  caller classes and forwards SVG attributes.
- `src/components/atoms/iconMap.ts` — new constant map for GitHub and LinkedIn
  public symbol URLs and the derived `IconName` type.
- `public/icons/github.svg`, `public/icons/linkedin.svg` — public `#icon`
  symbols preserving the previous button artwork with `currentColor` paths.
- `src/components/ProfileIntroduction.astro` — replaced the two social-button
  inline SVGs with the `Icon` atom, preserving labels, destinations and
  decorative semantics; passed Tailwind `text-white` for button contrast and
  `gap-x-2` for the 8px icon-to-label separation.
- `src/components/ExperienceHistory.astro` — added native `loading="lazy"` to
  homepage experience-card company-icon images only; the company image data and
  detail-page image remain unchanged.
- `src/styles/global.css` — defines the `.icon` 1rem size and primary-accent
  color in Tailwind's `components` layer; unifies `--color-primary` and
  `--color-button` through the `#0C7ABF` action-blue primitive.
- `docs/design.md` — documents the unified primary/action color and icon color
  treatment; refreshed the update date.
- `tests/unit/icon.test.ts`, `tests/types/icon-name.typecheck.ts` — QA coverage
  for the component/map/SVG contract and supported/unsupported names.
- `tests/unit/home.test.ts`, `tests/unit/button-design.test.ts`,
  `tests/unit/design-assets.test.ts` — QA coverage for migrated links/icons,
  color cascade, token unification, button contrast and focus.
- `tests/unit/experience.test.ts` — QA coverage that detail-page company icons
  remain unchanged and do not acquire lazy loading.
- `specs/010-svg-icon/{spec,plan,tasks,summary}.md` — agreed requirements,
  technical plan, QA evidence and this summary.
- `specs/004-portfolio-home/summary.md`,
  `specs/006-common-molecules/summary.md` — updated relationship records only;
  their historical `spec.md` files remain unchanged.

## Functions / components changed

- `Icon` — new static Astro atom that looks up a typed icon name and renders its
  external SVG symbol using `<use>`. The default `.icon` class sets a 1rem square
  and the unified primary accent; caller attributes and classes remain usable.
- `iconMap` / `IconName` — constant public-symbol mapping and its key-union type.
- `ProfileIntroduction` — renders GitHub and LinkedIn icons through `Icon`, with
  Tailwind `text-white` overriding the default color within primary buttons and
  `gap-x-2` separating each icon from its visible label.
- `ExperienceHistory` — marks homepage experience-card company icons for native
  lazy loading without changing their source, alternative text or dimensions.
- Global color token chain — the former distinct bright primary accent is removed;
  the primary and button roles now resolve to the single `#0C7ABF` primitive.

## Related specs

- `004-portfolio-home` — **modified**: the introduction social icons now use the
  reusable atom and public symbols, with the intentional 20px-to-16px size
  change and `gap-x-2` icon-label spacing. The global primary accent is unified
  with the button blue, and homepage experience-card company icons use native
  lazy loading; social-link destinations, names, routes, content, company icon
  data, and SEO remain unchanged.
- `006-common-molecules` — **modified**: extends its reusable component family
  with a static SVG atom, updates the shared design/color contract, and adds
  native lazy loading to homepage company icons in `ExperienceHistory`; its
  historical specification remains unchanged.
- `002-front-extra-dependencies` — **depends on**: uses the established Astro,
  Tailwind v4 and static-rendering stack without new dependencies or client JS.
- `007-workflow-changes` — **depends on**: follows the shared spec-branch and
  Dev/QA task handoff process.
- `009-workflow-governance` — **depends on**: follows the current role boundaries,
  named ownership and quality-gate rules.

## Notes

- The `.icon` declarations are in Tailwind's `components` cascade layer so the
  `text-white` utility can override the default color; QA confirmed the computed
  color in a real browser.
- The maintainer's `gap-x-2` and `loading="lazy"` refinements were verified by
  T7 QA in rendered tests and Chrome. Task gates pass; the Dev Lead's final
  integrated gate report is maintained in `tasks.md` after final closure.
