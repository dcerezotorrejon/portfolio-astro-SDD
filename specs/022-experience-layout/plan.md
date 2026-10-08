# Plan — Experience layout: 128px icon, side-by-side header, responsive

- **Spec ID**: `022-experience-layout`
- **Last updated**: 2026-10-08

## Approach

Restructure the experience card header (home) and the detail header so the
company logo sits in a 128px (8rem) square container on the left, with the role
heading, company name, and period as a vertical text block on its right. On
mobile (≤ 600px) the header stacks: the logo becomes full-width and the text
falls below it. A minimum 1rem gap separates the header from the description, and
the action buttons are right-aligned.

The maintainer supplied the real company logos, replacing the placeholder SVGs;
`astro.svg` is deleted. This plan commits those asset changes together with the
layout work (same increment).

The feature branch `spec/022-experience-layout` is stacked on the unmerged
`spec/021-cv-content` (maintainer decision), so the real CV content is present.

## Files to change

### Components

- `src/components/home/ExperienceHistory.astro` — new card header: a flex row with
  the icon (`size-32`, `object-contain`, `aspect-square`, `width`/`height` 128) on
  the left and a text column (role `h3` → company → period) on the right; the
  description (`summary`) follows with ≥ 1rem gap; "Más información" button is
  right-aligned.
- `src/pages/experiencia/[slug].astro` — same header treatment (role `h1` →
  company → period), ≥ 1rem gap before the body, "Volver a la trayectoria" button
  right-aligned.

### Assets (maintainer-supplied, already in the working tree)

- `public/images/companies/babel.svg` — real Babel logo.
- `public/images/companies/nttdata.svg` — real NTTData logo.
- `public/images/companies/astro.svg` — delete (unused).

### Tests (unit — Dev-owned)

- `tests/unit/home.test.ts` — icon `width`/`height` 128; header structure (icon +
  text column) and order.
- `tests/unit/experience.test.ts` — icon `width`/`height` 128; header structure.
- `tests/unit/company-icon.test.ts` — icon `width`/`height` 128.

## Key decisions

- **128px square container with letterbox**: the real logos are landscape
  (`526.8×129.1` Babel, `340.16×69.52` NTTData). The icon box stays a fixed 128×128
  (`size-32` + `aspect-square`) and the logo is centered via `object-contain`
  (letterboxed, never distorted) — approved by the maintainer.
- **600px breakpoint**: the stacked mobile layout applies at viewport ≤ 600px
  inclusive. Use a 600px breakpoint (Tailwind arbitrary `max-[600px]` /
  `min-[601px]`, or a documented custom breakpoint) rather than the site's default
  `md` (768px).
- **Real logos committed with this increment** rather than a separate one
  (maintainer decision); `astro.svg` deletion is safe because no `src/`/`tests/`
  reference remains.
- **Model choice**: subagent defaults (`dev` → `opencode-go/kimi-k2.7-code`, `qa`
  → `opencode-go/deepseek-v4.1-flash`); no override needed.

## Risks

- **Test blast radius**: unit tests assert the old 40px icon and positional `<p>`
  order; they must be updated to the new structure and 128px size.
- **Breakpoint convention**: 600px differs from the site's 768px `md` breakpoint;
  it must be applied explicitly to avoid an inconsistent mobile cutoff.
- **Wide logos**: the square container letterboxes them; `object-contain` +
  `aspect-square` must be combined so the box never distorts.

## Testing strategy

- **Unit/component tests** (Dev): assert icon `width`/`height` = 128, the
  side-by-side header order, and right-aligned buttons.
- **Responsive / computed styles** (QA, browser integration): verify side-by-side
  above 600px and stacked full-width at ≤ 600px, plus the ≥ 1rem gap.
- **Accessibility** (QA): `pnpm test:a11y` — structure changed, re-run.
- **Full gates**: `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`.
