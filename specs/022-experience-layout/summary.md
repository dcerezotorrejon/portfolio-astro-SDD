# Summary — Experience layout: 128px icon, side-by-side header, responsive

- **Spec ID**: `022-experience-layout`
- **Last updated**: 2026-10-08

## Files changed

- `src/components/home/ExperienceHistory.astro` — header restructure: icon in a
  128px square container (letterboxed logo) with role→company→period text block on
  its right (desktop), stacked full-width on mobile, right-aligned button; icon
  and text block vertically centered.
- `src/pages/experiencia/[slug].astro` — same header treatment; right-aligned
  "Volver a la trayectoria" button; vertically centered.
- `src/styles/global.css` — `--heading-display-size` reduced to `2rem` (32px).
- `docs/design.md` — `display` heading documented at 32px.
- `tests/unit/home.test.ts` — 128px icon, header order (icon → role → company →
  period), right-aligned button.
- `tests/unit/experience.test.ts` — same for the detail view.
- `tests/unit/company-icon.test.ts` — 128px icon assertions.
- `tests/unit/molecules-heading.test.ts` — `display` heading size now `2rem`.
- `tests/integration/experience-layout.spec.ts` — responsive layout checks
  (side-by-side > 600px, stacked ≤ 600px, gap, right alignment, vertical
  centering, 32px `h1`).
- `tests/integration/experience.spec.ts` — `.company-identity` → `.company-name`.
- `tests/integration/pages.spec.ts` — `.company-identity` → `.company-name`.
- `public/images/companies/babel.svg` — real Babel logo (maintainer-supplied).
- `public/images/companies/nttdata.svg` — real NTTData logo (maintainer-supplied).
- `public/images/companies/astro.svg` — deleted (unused).

## Functions / components changed

- `ExperienceHistory` (home cards) — new responsive header: flex row (icon + text
  column) at > 600px, flex column at ≤ 600px; icon is 128px square with
  `object-contain` letterbox; icon and text vertically centered.
- Experience detail page (`[slug].astro`) — same header structure with `h1` role.
- Heading `display` variant — size lowered from `clamp(2rem, 5vw, 2.75rem)` to
  `2rem` (32px), affecting the home name and the detail role.

## Notes

- The 600px breakpoint is applied explicitly (Tailwind arbitrary `min-[601px]`)
  rather than the site's default `md` (768px).
- The real logos are landscape and are letterboxed inside the fixed 128px square
  via `object-contain`.
- Review feedback added after first closure: vertical centering of the header
  (T2) and the `display` heading reduced to 32px (T3); both re-verified.
