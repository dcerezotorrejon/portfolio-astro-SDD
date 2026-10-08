# Summary — Experience layout: 128px icon, side-by-side header, responsive

- **Spec ID**: `022-experience-layout`
- **Last updated**: 2026-10-08

## Files changed

- `src/components/home/ExperienceHistory.astro` — header restructure: icon in a
  128px square container (letterboxed logo) with role→company→period text block on
  its right (desktop), stacked full-width on mobile, right-aligned button.
- `src/pages/experiencia/[slug].astro` — same header treatment; right-aligned
  "Volver a la trayectoria" button.
- `tests/unit/home.test.ts` — 128px icon, header order (icon → role → company →
  period), right-aligned button.
- `tests/unit/experience.test.ts` — same for the detail view.
- `tests/unit/company-icon.test.ts` — 128px icon assertions.
- `tests/integration/experience-layout.spec.ts` — new responsive layout checks
  (side-by-side > 600px, stacked ≤ 600px, gap, right alignment).
- `tests/integration/experience.spec.ts` — `.company-identity` → `.company-name`.
- `tests/integration/pages.spec.ts` — `.company-identity` → `.company-name`.
- `public/images/companies/babel.svg` — real Babel logo (maintainer-supplied).
- `public/images/companies/nttdata.svg` — real NTTData logo (maintainer-supplied).
- `public/images/companies/astro.svg` — deleted (unused).

## Functions / components changed

- `ExperienceHistory` (home cards) — new responsive header: flex row (icon +
  text column) at > 600px, flex column at ≤ 600px; icon is 128px square with
  `object-contain` letterbox.
- Experience detail page (`[slug].astro`) — same header structure with `h1` role.

## Notes

- The 600px breakpoint is applied explicitly (Tailwind arbitrary `min-[601px]`)
  rather than the site's default `md` (768px).
- The real logos are landscape and are letterboxed inside the fixed 128px square
  via `object-contain`.
- The layout and its tests were one atomic Dev task; QA added the responsive
  integration spec and fixed stale `.company-identity` selectors.
