# Summary: Experience transition (017)

- **Date**: 2026-10-08

## Files changed

- `src/components/home/ExperienceHistory.astro`
- `src/pages/experiencia/[slug].astro`
- `tests/unit/transitions.test.ts`
- `tests/unit/experience.test.ts`

## Functions / components changed

- `ExperienceHistory` overview card: added
  `transition:name={`experience-transition-${slug}`}` (per-slug shared-element
  transition identity) and removed the previous inline `view-transition-name`
  style.
- `experiencia/[slug]` detail page: added
  `transition:name={`experience-transition-${slug}`}` to the detail card, removed
  the inline `view-transition-name` style, and added `my-8` (2rem) vertical
  spacing to the detail `<main>`.
- `tests/unit/transitions.test.ts`: rewrote AC1 as a source-contract assertion
  (per-slug `transition:name` in both `.astro` sources, no inline
  `view-transition-name`); added AC2 (`data-astro-transition-scope` presence);
  kept AC4 (native MPA transitions, reduced motion, 200 ms).
- `tests/unit/experience.test.ts`: added AC3 (`my-8` on the detail `<main>`).
