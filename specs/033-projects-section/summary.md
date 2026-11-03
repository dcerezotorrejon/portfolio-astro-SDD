# Summary — Projects section

- **Spec ID**: `033-projects-section`
- **Last updated**: 2026-11-03

## Files changed

- `src/content.config.ts`, `src/content/parsers/content-schema.ts`,
  `src/content/parsers/content.ts` — `projects` collection, schema, profile labels, uniqueness
  assertion, and sort.
- `src/content/projects/*.md`, `src/content/projects/hassio-pacman-icon.svg` — five project entries
  and the hassio image.
- `src/assets/project-default.svg` — neutral default card image.
- `src/content/profile/profile.md` — projects labels and the third navigation entry.
- `src/components/home/ProjectsSection.astro`, `src/components/home/ProjectCard.astro` — static
  section and cards, plus the inline script that restores the position on full-document entries.
- `src/components/home/ProjectsCarousel/ProjectsCarousel.tsx`,
  `src/components/home/ProjectsCarousel/helpers/carousel.ts`,
  `src/components/home/ProjectsCarousel/helpers/return-position.ts`,
  `src/components/home/ProjectsCarousel/helpers/return-listeners.ts` — carousel island, loop, wheel
  handling, and position on return.
- `src/styles/projects-carousel.css` — carousel geometry, no-JS layout, and end space.
- `src/pages/index.astro` — renders the section after the professional history.
- `src/layouts/SiteLayout.astro` — installs the return listeners on every page.
- `src/pages/proyectos/[slug].astro` — project detail pages.
- `src/lib/sitemap-lastmod.ts` — `lastmod` source sets for `/` and the project routes.
- `src/components/home/FloatingNav/FloatingNav.tsx` — third destination, measured indicator, and
  focus re-check after a nested scroller moves.
- `src/styles/global.css` — navigator columns and end clearance (`780px`).
- `README.md` — collection, detail pages, and both React islands.
- `tests/unit/**`, `tests/seo/**`, `tests/a11y/**`, `tests/integration/**` — coverage for all of
  the above; new specs for the carousel, detail pages, Markdown headings, navigator, return
  position, and design, and updated expectations for the sitemap, `robots`, and navigator.

## Functions / components changed

- `assertUniqueProjects`, `sortProjects` — reject duplicate slugs and orders; order the cards.
- `ProjectsSection`, `ProjectCard` — render the section and cards without hydrating their content.
- `ProjectsCarousel`, `createCarouselController` — arrows, wheel, and looping scroll over a static
  slot.
- `planMove`, `wrapStop`, `focusStop`, `stopLeft`, `stopFromPosition`, `isAlignedToStop` — stop
  arithmetic for the loop and for focus moves.
- `createClone`, `insertClones` — sanitized clones for the loop.
- `createWheelClassifier`, `horizontalWheelDelta` — separate discrete wheels from native trackpad
  input.
- `parseReturnRecord`, `writeReturnRecord`, `restoredStop`, `restoresOnSwap`,
  `restoreCarouselPosition` — record and restore the carousel position on return.
- `installReturnListeners`, `returnScriptSource` — router listeners and generation of the inline
  script.
- `createSlugReader`, `createProjectReader` — shared Markdown slug reader; `lastmod` for project
  routes.
- `FloatingNav` — three destinations, measured indicator through `placeIndicator`, and capture-phase
  scroll handling.

## Notes

- Every page now loads a second module script (`SiteLayout`), and the home has a fourth inline
  script, because R37 needs code outside the island.
- The inline script is generated with `Function#toString`, so the helpers it uses must stay
  self-contained.
- The inline script does not use `blocking="render"`. A browser could paint a partial document with
  stop 0 for one frame on a slow or chunked response; this was not reproduced.
- Not verified: bfcache restoration, the visual look of the view transition, touch and keyboard
  input before hydration, and scrollbar hiding outside Chromium.
- The discrete-wheel thresholds were confirmed by the maintainer on a physical device; other devices
  may report different deltas.
