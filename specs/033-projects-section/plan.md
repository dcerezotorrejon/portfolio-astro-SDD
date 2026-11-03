# Plan — Projects section

- **Spec ID**: `033-projects-section`
- **Last updated**: 2026-11-02

## Approach

Add a validated `projects` Markdown collection, render five static cards in Astro,
and wrap them in one `client:load` React island that adds only the arrows, the wheel
handler, and the loop. Cards reach the island as a static slot, so their content is
never hydrated and never serialized as props (R16). After the collection, add detail
pages, sitemap support, and a third navigator destination. UI follows the applicable
criteria in `docs/design.md`: tokens and palette, Open Sans, the shared card, badge,
button, and heading variants, the 1120 px container, 44 px targets, and the floating
navigator rules.

### Island structure

```text
<section id="proyectos">                 Astro, ProjectsSection.astro
  <h2>
  <astro-island client:load>             props: previous and next labels only
    .projects-carousel                   React
      .projects-carousel-controls        React: two native buttons, disabled until hydrated
      .projects-carousel-scroller        React: overflow-x, snap, ref
        <astro-slot>                     display: contents
          <ul class="projects-list">     Astro, static slot
            <li class="project-slide">   Astro: ProjectCard, one per project
```

React does not own the slot's content, so clones are DOM nodes that the island's layout
effect inserts into the `ul` and removes in that effect's cleanup.

### Geometry

- CSS lives in a new `src/styles/projects-carousel.css`, imported by
  `ProjectsSection.astro`, not in `global.css`. An existing unit test asserts that
  `global.css` has no scroll snap, and that assertion remains true.
- The scroller is a size container (`container-type: inline-size`) and the slide width is
  `(100cqi - 2 * (peek + gap) - (visible - 1) * gap) / visible`. Explicit widths let the
  `ul` be `width: max-content` with inline padding of `peek + gap`, so the end padding is
  not lost to overflow and every real card can be shown in full before hydration. At 768 px
  and above, two cards are visible, so the last stop cannot align to the start until the loop's
  clones exist: maximum `scrollLeft` before hydration is N - 2 stops, where N is the project count.
- `visible` is 1 below 768 px and 2 at or above. Peek is 20 px below 768 px and 40 px at or
  above. Gap is 12 px below 768 px and 16 px at or above. At 320 px, this gives a 224 px card.
- Slides use `scroll-snap-align: start` and `scroll-snap-stop: always`. The scroller uses
  `scroll-snap-type: x mandatory`, `scroll-padding-inline-start: peek + gap`, and
  `overflow-anchor: none`, with the scrollbar hidden through `scrollbar-width: none` and
  `::-webkit-scrollbar`.
- Arrows sit in a row above the scroller, aligned to the end. They therefore cannot overlap
  any card and their space is reserved in the server output.

### Loop

- N is the project count, derived from the data and not hardcoded; it is five today. The layout
  effect prepends one full set of N clones and appends another, then sets `scrollLeft`
  to the first real stop in the same synchronous step, so no card moves (R17).
- A logical `target` ref holds the extended index, with real stops at 0 to N - 1 (0 to 4). An
  arrow sets `target` from its previous value rather than from a measurement, which is what makes
  rapid activation land correctly. If the next `target` would leave -(N - 1) to 2N - 3 (-4 to 7),
  the range in which every visible slot exists, the handler first shifts `scrollLeft` and `target`
  by N stops instantly, then issues the scroll.
- On settle (`scrollend`, with a debounced `scroll` fallback), `target` is read from the
  position. If it is outside 0 to N - 1, `scrollLeft` shifts by N stops with `behavior:
"instant"`. The clone and its real card are identical, so no pixel changes and focus stays put.
- A settle does not wrap if that would carry a visibly focused real card off screen, as with the
  real first card at stop -1 in the two-card layout.
- Scroll snap is off from an instant shift until settle, and a shift that would not fit at the
  scroller's edge is skipped while `target` still wraps, so neither causes a backward jump.
- The `focusin` move is synchronous, so it runs before the navigator's focus-obscuring measurement.
- Shift + wheel counts as horizontal input, because Chromium reports it through `deltaY` with
  `shiftKey`. Plain vertical input is never intercepted.
- Arrows use `behavior: "smooth"`, or `"instant"` when `prefers-reduced-motion: reduce` matches
  at activation.
- A `ResizeObserver` realigns to the current stop instantly when the width changes.

### Clone rules (R10)

Each clone `li` gets `aria-hidden="true"` and `data-carousel-clone`. Every `id` and
`aria-labelledby` is removed, and `data-astro-transition-scope` is removed, which is what
carries `view-transition-name`. Links get `tabindex="-1"`, and images get `loading="eager"` so
a wrap cannot reveal an unloaded image. `inert` is not used. A capturing `mousedown` listener calls
`preventDefault` on clone links so a click never focuses them, while the click still navigates.

### Wheel (R15)

A native `mouse.wheel(120, 0)` is expected to snap back at card widths above 240 px, which
QA confirms by test. A non-passive `wheel` listener handles only input where `|deltaX| > |deltaY|`.
It classifies a gesture on its first event, where a gesture starts after 150 ms without wheel
input: `deltaMode !== 0` or `|deltaX| >= 40` is discrete, and anything else is continuous.
A discrete gesture calls `preventDefault` and moves one stop per event, throttled to one per
150 ms. A continuous gesture, such as a trackpad, stays native. Vertical input is never
intercepted. Shift with a vertical wheel, which browsers report as `deltaX`, follows the same
path. The thresholds are provisional until the maintainer's physical check (AC13).

### No-JS (R18)

`@media (scripting: none)` switches the list to a wrapping layout, removes the scroller's
overflow and left reservation, and hides the arrows. It needs no markup or script. A probe on
2026-11-02 confirmed that Playwright's `javaScriptEnabled: false` context matches
`(scripting: none)` in Chromium and applies the rule, so AC17 can test the real mechanism.
A browser without this media feature falls back to the scroller, which R18 already accepts
for the island-failure case.

### Carousel position on return (R37)

- This is T6, and it starts after QA finishes T2, because it changes the files QA is verifying.
- The record holds only two slugs, in `sessionStorage`: the project at the logical stop and the
  one opened. Every read and write tolerates storage failures and invalid values. Nothing reaches
  the server output or the island's props (R16).
- Each exit to a detail page rewrites the record, and each entry that loads the home consumes it.
  Only returns restore: the detail back link, browser back and forward through `ClientRouter`, and
  a traversal with a full reload. Other entries start on the first project.
- The restored stop keeps the saved stop if it shows the opened real card in full. Otherwise it is
  the nearest real stop that does, as with `focusStop`.
- The position MUST be set before the view transition captures the new page, and
  `astro:after-swap` can run before hydration finishes. Code outside the island therefore applies
  it, including when the detail page loaded as a full document. Confirm this order in a browser
  first, because it comes from reading Astro's router and has not been tested.
- At two cards per view, the last stop cannot be reached before hydration, and R10 forbids clones
  in that state. Dev proposes temporary end space or an equivalent that causes no visible jump and
  no height change, and records the choice here.
- After hydration, the island adopts the restored stop as `target` without an animated move, because
  the controller already reads `scrollLeft` on mount.

Decisions made during implementation:

- Order confirmed in Chromium, including when the detail page loaded as a full document:
  `astro:before-swap`, `astro:after-swap`, end of the update callback, `astro:page-load`, `ready`
  (capture), then the clones from hydration. `astro:after-swap` is therefore the point to apply.
- The key is `projects-carousel-return`, holding `{"at":"<slug>","opened":"<slug>"}`. Each
  `li.project-slide` has a static `data-project-slug`.
- The island records on `astro:before-preparation`: `at` from `target`, `opened` from the destination URL.
- A module in `SiteLayout` handles router entries: `astro:before-swap` classifies them and
  `astro:after-swap` applies them. It also loads on experience pages, because those entries must consume
  the record.
- An inline synchronous script right after the island handles full-document entries. Only `back_forward`
  restores; a reload or new visit consumes the record without applying it. It is ignored unless
  `readyState` is `loading`, because the router re-runs inline scripts. It is generated with
  `Function#toString` from the same TypeScript functions, so they must be self-contained.
- For the last stop at two cards per view, `data-carousel-end-space` adds end padding through `calc()`.
  The controller removes it in the same synchronous step that inserts the clones.
- Going back from a browser-made hash change swaps the home to itself, because the browser's `pushState`
  runs outside the router. It is recorded as a traversal to the same route and restores, as AC42 requires.
- `helpers/return-position.ts` and `helpers/return-listeners.ts` hold this code.

### Navigator (R29, R30)

Measured on 2026-11-02 at 320 px with Open Sans 600 at 16 px: Inicio 41 px, Trayectoria 87 px,
Proyectos 77 px, 205 px in total, inside 278 px of inner width. Equal columns give 92.67 px, which
leaves under 3 px of padding per side beside "Trayectoria". The plan therefore uses content-sized
columns, one `auto` track per section, which share leftover space. Horizontal link padding is 8 px
below 360 px and the existing 12 px from 360 px up. That leaves 25 px of slack at 320 px, covers the
Arial fallback (204.5 px), and keeps the 360 px cap and the 44 px target. Controls are not shrunk:
height, type size, and font weight do not change.

Unequal columns mean the indicator must be measured. A layout effect sets `--nav-indicator-x` and
`--nav-indicator-width` from the active link's `offsetLeft` and `offsetWidth`, re-measuring through a
`ResizeObserver` and on font load. The indicator keeps the 200 ms transition, now over transform and
width, and the existing no-transition states. The `active-index` translate classes and `grid-cols-2`
are removed.

### End clearance (R31)

`--home-end-scroll-space` remains `max(112px, calc(100svh - N))`, with `N` no greater than the
projects section's smallest measured height plus 16 px across the listed viewports. Dev measures it
and documents the value in a comment. The bottom padding then guarantees that the section top reaches
the 16 px activation offset.

## Files to change

- `src/content.config.ts`, `src/content/parsers/content-schema.ts`, `src/content/parsers/content.ts`
  — collection, schema, profile fields, uniqueness assertion, and sort.
- `src/content/projects/*.md`, `src/content/projects/hassio-pacman-icon.svg` — entries and image.
- `src/assets/project-default.svg` — neutral default image.
- `src/content/profile/profile.md` — interface labels and the third navigation entry.
- `src/components/home/ProjectsSection.astro`, `src/components/home/ProjectCard.astro`,
  `src/components/home/ProjectsCarousel/ProjectsCarousel.tsx`,
  `src/components/home/ProjectsCarousel/helpers/carousel.ts`, `src/styles/projects-carousel.css`,
  `src/pages/index.astro` — section, cards, and island.
- `src/pages/proyectos/[slug].astro` — detail pages.
- `src/lib/sitemap-lastmod.ts` — source sets for `/` and project routes.
- `src/components/home/FloatingNav/FloatingNav.tsx`, `src/styles/global.css` — third destination and
  end clearance.
- `README.md` — collections, pages, and both islands.
- `tests/unit/**` (Dev), and `tests/seo/**`, `tests/a11y/**`, `tests/integration/**` (QA).

## Key decisions

All are choices the spec leaves to the plan or that its Context settles. No new dependency, tool, or
`docs/design.md` or constitution change is involved.

- **Hassio image: `icon.svg`.** It is 1.9 KB against 222 KB for the PNG, and sharp at every density.
  Both render the same text-free artwork, confirmed by viewing `icon.png` as an image. The SVG declares
  `width="100%"`, so if Astro's image metadata rejects it, Dev uses `icon.png` and reports the change.
  The third-party marks are the accepted risk recorded in the spec.
- **Default image.** One 16:9 SVG, which fills the 16:9 image area without cropping: flat abstract
  geometry in palette values only, on `--palette-page`. The hassio icon is shown whole with
  `object-contain` in the same area.
- **Scroll snap stays mandatory**, with `scroll-snap-stop: always`, so a fling cannot pass the clones.
- **No-JS mechanism: `@media (scripting: none)`**, over a `<noscript>` style or an inline script.
- **Navigator: content-sized columns with a measured indicator**, over narrowing gutters or padding
  further. It adds a small measurement, but it does not depend on these three labels being short.
- **Execution authorization.** The maintainer authorized execution before this plan was written, through
  the go-ahead recorded in the spec, so the plan was not separately confirmed. It is presented for review
  with the result.
- **Branch and commits, under the maintainer's limits for this run.** The branch exists locally but is not
  published, because this run must not push. Implementation stays uncommitted: Constitution §5.1 allows final
  commits only after every task is approved and all gates pass, and AC3 and AC13 await the maintainer. The dev
  server serves the working tree, so the review does not need a commit.

## Risks

- **Tilt wheel.** Synthetic input cannot prove physical behavior or every device's deltas. Mitigation: AC13's
  maintainer check, with the thresholds in one named constant.
- **Wrap flicker.** Fractional stops can round by a pixel. Mitigation: positions come from measured slide offsets,
  mandatory snap re-aligns, and QA asserts within 1 px across the wrap.
- **Slot behavior.** Slotted `transition:name` and `astro-slot` hydration are untested here. Mitigation: AC8, AC14,
  AC15, and AC28 run against the build.
- **Parallel-agent interference.** One working tree is shared. Mitigation: tasks run strictly in sequence.
- **Dev server.** The content config change may need a restart. Mitigation: Dev reports it and the Lead restarts it.
- **Integration port clash.** While the maintainer's dev server holds `[::1]:4321`, `astro preview` leaves 4321 despite
  `--strictPort` and the literal `pnpm test:integration` times out. Task-level runs therefore use `pnpm build` and an
  out-of-repo copy of the Playwright config on port 4330, recorded as an equivalent run. `playwright.config.ts` does not change.

## Testing strategy

- Unit / component tests: Dev, per the spec's Verification section, including carousel math and clone sanitizing with
  Testing Library. Dev updates `tests/unit/design-assets.test.ts` and `tests/unit/button-design.test.ts`, which pin the
  two-destination classes.
- SEO checks: QA, AC32 over rendered HTML and sitemap output.
- Accessibility checks: QA, Vitest axe and browser axe on the hydrated home, no-JS home, and five detail pages.
- Integration: QA, Playwright geometry at the five listed viewports, including `nav-liquid-glass.spec.ts` lines 437–446.
- Manual: QA keyboard, reduced-motion, screenshot, and neutral-artwork review. Maintainer: AC3 and AC13.
