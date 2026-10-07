# Plan: Experience transition (017)

- **Spec**: `017-experience-transition`
- **Base**: `origin/main`
- **Branch**: `spec/017-experience-transition`

## Approach

The production change is already present in the working tree (uncommitted):

- `src/components/home/ExperienceHistory.astro` — `transition:name={`experience-transition-${slug}`}` on the overview card `<article>`; the previous inline `view-transition-name` style is removed.
- `src/pages/experiencia/[slug].astro` — `transition:name={`experience-transition-${slug}`}` on the detail `<article>`; inline `view-transition-name` removed; `my-8` added to the `<main>` class.

No production code changes are required; the work is test coverage plus verification.

The `transition:name={`experience-transition-${slug}`}` directive compiles to:

- a `data-astro-transition-scope` attribute on each card, and
- a CSS rule `[data-astro-transition-scope="…"] { view-transition-name: experience-transition-<slug>; }`.

Each overview card and its matching detail card therefore pair on a unique
`view-transition-name: experience-transition-<slug>`.

## Files

| File                             | Change                                                                                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit/transitions.test.ts` | Replace the stale inline-style AC1 assertions with a source-contract assertion (`transition:name={`experience-transition-${slug}`}` in both `.astro` sources); keep AC2 (`data-astro-transition-scope`) and AC4 (native MPA + reduced motion). |
| `tests/unit/experience.test.ts`  | Keep the AC3 `my-8` assertion on the detail `<main>`.                                                                                                                                                                                          |

Production files are not changed by any task.

## Decisions and trade-offs

- **No production edit.** The maintainer's change is the source of truth.
- **`transition:name` is the effective mechanism now.** With the inline
  `view-transition-name` removed, the directive's compiled CSS rule supplies the
  per-slug name. No client-side router is involved; native MPA transitions apply
  the name.
- **Unit tests cannot read the compiled CSS.** The Astro Container render emits
  `data-astro-transition-scope` but not the compiled `view-transition-name` rule
  (that lives in the built page's `<head>`). AC1 is therefore asserted at the
  source-contract level (reading the `.astro` sources); the compiled value is
  verified from build output during QA.
- **`my-8` = 2rem.** Tailwind resolves `.my-8` to
  `margin-block: calc(var(--spacing) * 8)` (32px). AC3 verifies the class on the
  detail `<main>`.
- **Integration applies.** The change touches page rendering/styles, so
  `pnpm test:integration` is run.

## Risks

- **Source-contract strength.** AC1's source-level assertion is weaker than the
  prior rendered-element check; QA compensates by verifying the compiled
  `view-transition-name` value against build output.
- **`transition:name` injects Astro's default fade animation** (`astroFadeIn` /
  `astroFadeOut` keyframes). QA must confirm reduced motion still disables
  animation (AC4) and the 200 ms duration is preserved.

## Testing strategy

- **Unit (Vitest + Container + JSDOM + readFileSync)** — AC2
  (`data-astro-transition-scope`), AC3 (`my-8`), AC4 (existing CSS assertions);
  AC1 via source-contract.
- **SEO** — no title/meta/canonical change; existing `tests/seo/**` continue to pass
  under `pnpm test:run`.
- **Accessibility** — `pnpm test:a11y`.
- **Integration** — `pnpm test:integration` (Playwright).

## Final gate set

Non-Markdown change (`.astro` files): `pnpm lint`, `pnpm format:check`,
`pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration`.
