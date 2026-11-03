# Projects section

- **Spec ID**: `033-projects-section`
- **Status**: in progress
- **Last updated**: 2026-11-02

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio's home shows a profile introduction and a professional history, and
each experience has a detail page. The maintainer wants a new section that shows
five personal projects as a looping carousel of cards, each leading to GitHub and
to a page that explains the project in more detail.

What exists today:

- Content collections are only `profile` and `experience`. Constitution §2 already
  names projects as Markdown-hydrated content, but no collection holds them.
- The nearest pattern is the experience card and its `/experiencia/<slug>/` detail
  page.
- `FloatingNav` is the only React island, declared with `client:only="react"`. The
  carousel introduces the first server-rendered island.
- `ClientRouter` is active on every page through `SiteLayout`.
- The floating navigator assumes exactly two destinations: `grid-cols-2`, a 50%
  indicator width in both its class and `--nav-indicator-width`, translate classes
  for indexes 0 and 1 only, and a two-value `navigation` id enum with a matching
  `ProfileData` type.
- `--home-end-scroll-space` hardcodes `610px`, which appears tied to the current
  page layout.
- The sitemap `lastmod` resolver recognizes only `/` and `/experiencia/<slug>/`.
  Other routes fall back to the build date, and the `/` source set has no projects
  directory.
- `docs/design.md` has no card image or carousel criteria, so those belong in this
  spec (Constitution §2.1).
- The site is Spanish only and remains so.

Images found in each repository's file tree (read through the GitHub API, none
truncated; files were not viewed as rendered images):

- **Hassio-pacman-cherry**: `Hassio-pacman-cherry/icon.svg` and `icon.png`. The SVG
  source describes a square, text-free icon showing Pac-Man on a CRT screen with the
  Arch Linux logo inside the character, and has no attribution metadata.
- **custom-AUR**: none.
- **LinuxOpenRazerDeviceConfig**: none.
- **portfolio-astro-SDD**: none that represents the project. Its image files are
  favicons, social icons, company icons, a profile placeholder, and the profile photo.
- **zot-quarantine-proxy**: none.

### Maintainer decisions

These are confirmed and are not open:

- The carousel is a React island, server-rendered into the static HTML and hydrated
  with `client:load`, not `client:only`.
- The carousel is circular, has arrows, and also moves with horizontal mouse-wheel
  input from tilting the wheel sideways.
- Each card has an image: the project's own when it has one, otherwise a neutral
  default image.
- Each card has two links: a direct link to the project on GitHub and a link to its
  detail page.
- The carousel's scrollbar is not visible.
- A fraction of the neighboring cards peeks at the right and left.
- The section goes after the professional history, with anchor `#proyectos`, and the
  floating navigator gains a link labeled "Proyectos".
- The featured projects are hassio-pacman, custom-aur, openrazer, portfolio, and
  zot-quarantine-proxy. The last was added during implementation, and none was removed.
- After opening a project's detail page and returning to the home, the carousel stays on the
  same slide. This was added during implementation, and a new visit starts at the first project.

### Reconciled decision

The maintainer first chose a CSS carousel with scroll snap, then asked for React
without mentioning snap. This spec layers React over CSS scroll snap rather than
replacing it: the scroller stays native and snaps through CSS, and React adds the
arrows and the loop. The other decisions settle this. A hidden scrollbar implies a
native scroller, native scrolling already provides horizontal wheel and touch input,
and Constitution §2 keeps build-time content out of hydration.

### Accepted recommendations

These were presented to the maintainer as recommendations. The maintainer then told
the team to proceed with execution without answering each one, after being told that
accepting meant taking these recommendations. This go-ahead is recorded as acceptance:

- **Detail route**: `/proyectos/<slug>/` with slugs `hassio-pacman`, `custom-aur`,
  `openrazer`, `portfolio`, and `zot-quarantine-proxy`, and no index page.
- **Card order**: portfolio, openrazer, hassio-pacman, custom-aur, zot-quarantine-proxy.
  The fifth position keeps the other entries' `order` values and is pending the
  maintainer's confirmation, because the decision to add the project did not set it.
- **Cards per view**: one full card below 768 px and two at or above 768 px.
- **Card content**: image, name, short summary, and technologies, with the detail link
  as the `primary` button labeled "Más información" and the GitHub link as the
  `secondary` button labeled "GitHub".
- **Detail page content**: name, technologies, explanatory Markdown, a GitHub link, and a
  return link to the section, with no image.
- **Archived status and licenses**: a text label "Archivado" on the card and detail page
  of archived projects, no "active" label, and a license shown only on the detail page
  where one exists.
- **Copy authorship**: Dev drafts display names, summaries, image alt text, and detail
  text in Spanish from each repository, and the maintainer approves them before closure.
- **Arrow movement**: the carousel slides with the browser's native smooth scrolling,
  whose duration the browser sets, and jumps instantly under reduced motion.
  `docs/design.md` fixes 200 ms only for shared-element transitions and sliding
  indicators, and its no-animation rule covers in-page section jumps.
- **Hassio image, accepted risk**: the icon contains Pac-Man and the Arch Linux logo,
  which belong to third parties. It is used because the maintainer already publishes it
  in that repository.

These implementation decisions were listed for the maintainer and drew no objection:
React layered over scroll snap, the wrapped no-JS layout, the accepted island-failure
gap, the blank left peek until hydration, and clones added only after hydration.

### Return-position assumptions

The maintainer left these decisions on the return behavior to the spec, to be recorded here. They
are assumptions rather than maintainer decisions, and R37 states them as rules:

- **Reload**: a reload starts at the first project. It asks for the page afresh, and it is not a
  return from a detail page.
- **Full-document back or forward**: restores, because the visitor's intent matches a `ClientRouter`
  back. A bfcache restoration is left alone, because the browser already shows the page as it was.
- **Other paths**: a new visit, or an entry from any page other than a project detail page, such as
  an experience page, starts at the first project, even in the same tab.
- **Direct landing on a detail page**: its return link starts at the first project, because the
  visitor never left a position.
- **GitHub link**: leaving the home through a card's GitHub link is not a return from a detail page.
  It records nothing, so a bfcache restoration keeps the position and a full load starts at the first
  project.
- **Opening from a clone**: the restored stop shows the opened project's real card, so that the view
  transition has its target in place, even where this changes which cards are visible.
- **Focus**: focus is not returned to the activated link. Restoring it is not requested, and it could
  fight the page's vertical position.

## Goals

- Present the five projects on the home as a looping scroll-snap carousel of cards.
- Give each project a detail page and a direct GitHub link from its card.
- Keep the carousel on the slide the visitor left when returning from a detail page.
- Keep project content in a validated Markdown collection and in unhydrated HTML.
- Keep every card reachable by touch, keyboard, and mouse under Constitution §7.
- Keep navigation, SEO, and sitemap output correct with the new section and routes.

## Non-goals

- Auto-advance or drag-to-scroll in the carousel.
- Live repository data such as stars or commit counts, whether fetched at build
  time or in the browser.
- Hotlinking or fetching images from GitHub at build time or in the browser.
- Creating project-specific images or screenshots. The neutral default image in R23 is
  the only new artwork.
- A GitHub logo or mark anywhere in the projects section or detail pages.
- A link to a project's published site or a `siteUrl` field, for any project.
- Changing the featured repositories, including their licenses or archived state.
- Filtering, search, tags pages, or a projects index page.
- Additional locales or dark mode.
- Structured data, which Constitution §8 permits but does not require.
- Changing the experience section or experience detail pages, other than sitemap
  and navigator effects required here.
- Native CSS carousel controls (`::scroll-button()`, `::scroll-marker`). MDN reports
  `::scroll-button()` as experimental and not Baseline.
- A carousel library or any new dependency.

## Requirements

### Content

- R1: A `projects` content collection MUST load `src/content/projects/*.md` and
  validate frontmatter with a schema in `src/content/parsers/content-schema.ts`
  (Constitution §9). The schema MUST cover: a kebab-case `slug`, a display `name`, a
  `summary`, a non-empty `technologies` list, an HTTP or HTTPS `repositoryUrl`, an
  `archived` boolean, an optional `license`, an
  optional `image` with a build-processed `src` and a non-empty `alt`, an integer
  `order`, and `seo` with the same rules as experience entries. The Markdown body is
  the detail text.
- R2: The build MUST fail when two entries share a `slug` or an `order`.
- R3: The collection MUST contain exactly these five entries:
  - `hassio-pacman`: repository
    `https://github.com/dcerezotorrejon/Hassio-pacman-cherry`, archived, no license,
    with the repository's icon as its image (`icon.svg` or `icon.png`, selected in the
    plan).
  - `custom-aur`: repository
    `https://github.com/dcerezotorrejon/custom-AUR`, archived, no license, no image.
  - `openrazer`: repository
    `https://github.com/dcerezotorrejon/LinuxOpenRazerDeviceConfig`, not archived,
    license GPL-3.0, no image.
  - `portfolio`: repository
    `https://github.com/dcerezotorrejon/portfolio-astro-SDD`, not archived, no
    license, no image.
  - `zot-quarantine-proxy`: repository
    `https://github.com/dcerezotorrejon/zot-quarantine-proxy`, archived, no license,
    no image.
- R4: Project copy MUST describe only what the repository supports. It MUST NOT call
  a project without a license "open source". Where a repository's description and
  README differ, the README prevails, as with hassio-pacman, whose README describes
  compiling PKGBUILD recipes from a Git repository. `technologies` MUST list
  technologies the repository actually uses, not its GitHub language statistic, so
  custom-aur MUST NOT list HTML on that basis alone. For zot-quarantine-proxy:
  - The README describes a pull-through container image cache for a homelab, based on
    Podman and Zot. New images are scanned with ClamAV and promoted immediately if clean,
    with no CVE check and no waiting period. Updates wait 7 days by default
    (`QUARANTINE_DAYS`, counted from the source build date) and go through ClamAV malware
    scanning and optional Trivy CVE scanning. CVEs block promotion only when
    `CVE_SEVERITY_THRESHOLD` is set, and it is empty by default.
  - Copy MUST NOT say that new images are quarantined or checked for CVEs, or that CVE
    findings always block an update.
  - `technologies` MUST be Python, Podman, Zot, Trivy, and ClamAV.
- R5: Display names, summaries, image alt text, and detail text are drafted in Spanish by
  Dev from each repository and approved by the maintainer before closure.
- R6: Every interface string this feature adds MUST come from Markdown (Constitution
  §2), through new `profile` fields as needed: the section heading, the navigator
  label, the arrow names, the GitHub link label, the return label, the archived label,
  and the license label. The existing `moreInfoLabel` is
  reused for the detail link.

### Home section

- R7: The home MUST render a section with `id="proyectos"` directly after the
  professional history, labeled by a section-variant `h2`. The carousel MUST be a list
  of cards, each titled by a card-variant `h3`, ordered by `order` as portfolio, openrazer,
  hassio-pacman, custom-aur, zot-quarantine-proxy. The homepage name remains the sole `h1`.

### Carousel

- R8: The carousel MUST be a native horizontal scroller using CSS scroll snap, and MUST
  settle with cards aligned to a snap position. React adds the arrows and the loop and
  MUST NOT replace native scrolling. Vertical wheel input MUST keep scrolling the page.
- R9: The carousel MUST be circular: moving forward from the last project reaches the
  first, and moving backward from the first reaches the last, by arrows, wheel, and
  touch, with no visible jump when the position wraps. Wrapping MUST NOT change the
  visible pixels or move keyboard focus. It MUST NOT auto-advance. Repeated rapid
  movement in either direction MUST settle on the expected project.
- R10: If looping uses cloned cards:
  - Clones MUST exist only after hydration, never in the built HTML.
  - Clones MUST be removed from the keyboard order and hidden from assistive technology,
    so the accessibility tree exposes each project once.
  - Clones visible on screen MUST remain operable by pointer, so they MUST NOT use
    `inert`. A pointer click on a clone MUST NOT leave focus inside the hidden subtree.
  - Clones MUST NOT carry a duplicate `id`, `aria-labelledby` reference, landmark, or
    view-transition name. A duplicate view-transition name aborts the transition.
  - Clones MUST be removed on unmount, so `ClientRouter` navigation and return MUST NOT
    accumulate them.
- R11: The carousel MUST show one full card below 768 px and two full cards at or above
  768 px, with one stop per project at every width and overflow at every viewport
  from 320 px upward, including above the 1120 px container maximum. It stays within the
  shared container (`docs/design.md`).
  - Geometry note: a stop shows three slots below 768 px (one full card plus two peeks) and
    four slots at or above 768 px (two full cards plus two peeks). With five projects, no
    project appears twice at a stop, and two projects are off screen below 768 px and one at
    or above it. Three full cards plus two peeks would need five slots, which five projects
    could fill without repeating one, so repetition does not rule three out. Three is not
    used because the accepted cards-per-view decision is one and two.
- R12: With JavaScript running and the carousel hydrated, at every settled position at
  least 16 px and less than one full card of a neighboring card MUST be visible on each
  side. The loop makes this hold at every position.
- R13: With JavaScript running, the scrollbar MUST NOT be visible, and hiding it MUST NOT
  disable scrolling.
- R14: Previous and next arrows MUST be native buttons with Markdown-sourced accessible
  names, at least 44 px high and wide, with the shared focus outline and hover and pressed
  states. They MUST NOT overlap a full card's text or links. Each activation moves one
  stop, and focus stays on the arrow. The carousel slides with native smooth scrolling, and
  moves instantly under `prefers-reduced-motion: reduce`.
- R15: One horizontal wheel gesture from a tilted mouse wheel MUST move the carousel at
  least one stop and MUST NOT snap back to the starting card. Trackpad horizontal scrolling
  and Shift with vertical wheel MUST keep working. A small handler is permitted if native
  snapping alone does not meet this, and it MUST NOT intercept vertical wheel input.

### Island, hydration, and no-JS behavior

- R16: The carousel MUST be a React island declared with `client:load`. It MUST NOT use
  `client:only`. Cards MUST be rendered by Astro and reach the island as static slotted
  children, or sit outside it, so that card text, links, and images are in the built HTML
  and are not hydrated (Constitution §2). Card content MUST NOT be passed as island props,
  and Astro image components cannot run inside React in any case. The island's serialized
  props are limited to interface labels and configuration.
- R17: Hydration MUST be stable:
  - The server output and the first client render MUST match. Rendering MUST NOT read
    `window`, measure layout, or include clones.
  - Clones and the looped scroll position MUST be applied only after hydration, in the same
    frame as each other, so no card moves. `client:load` hydrates after first paint, so a
    layout effect alone cannot hide a difference: the server-rendered layout MUST already
    reserve the left peek and the arrow space. The left peek appears at hydration in its
    reserved space, and the first card's position and the section's height MUST NOT change.
  - Arrows MUST be in the server output and stay disabled until hydrated, so they are never
    silently inoperative.
- R18: With JavaScript disabled, the section MUST render all five cards in a wrapping layout
  with no horizontal scrolling, no arrows, and no clones, with all links working by every
  input method. This removes the hidden-scrollbar mouse gap without a visible scrollbar and
  without a loop. If JavaScript is enabled but the island fails to load, arrows stay disabled
  and the native scroller still works by touch, keyboard focus, and horizontal wheel. This
  residual gap for mouse-only users is accepted.

### Cards

- R19: Each card MUST follow the shared card style (`docs/design.md`) and show its image, name,
  summary, and technologies.
- R20: Each card MUST have exactly two links:
  - The detail link, first in DOM and visual order, using the `primary` button labeled
    "Más información" and pointing to `/proyectos/<slug>/`.
  - The GitHub link, using the `secondary` button labeled "GitHub" and pointing to
    `repositoryUrl`, opening in the same tab like the existing social links. The link is
    text only, with no GitHub mark.
- R21: Keyboard operation MUST follow DOM order, which MUST match visual order. Each link in
  a real card MUST be scrolled fully into the carousel's visible area when focused, with its
  focus outline unclipped and unobscured by the navigator. Every link's accessible name MUST
  start with its visible label and include the project name, and MUST be unique among exposed
  links, for example "Más información: OpenRazer" and "GitHub: OpenRazer". Accessible names
  are built only from Markdown strings.
- R22: Project images MUST be committed to this repository and processed through Astro's image
  pipeline as same-origin build assets, with no hotlinking. Each project image MUST have
  meaningful Spanish `alt` text from frontmatter. Every card MUST use one fixed image area with
  `width` and `height` set to prevent layout shift, showing the whole image without cropping or
  distortion.
- R23: A card with no project image MUST show one neutral default image, committed once to this
  repository and processed like project images. The image MUST:
  - Use only colors from the palette in `docs/design.md`, for the site's single light theme. An
    image file cannot read CSS custom properties, so its values MUST match the palette primitives
    in `src/styles/global.css`.
  - Contain no gradient, text, logo, trademark, or third-party artwork, and suggest no specific
    project.
  - Use empty `alt`, because the card's name already identifies the project (Constitution §7).
  - Fill the shared image area under R22 without cropping or distortion.

  The exact artwork is left to the plan.

- R24: Archived projects MUST show the Markdown-sourced label "Archivado" as text on the card
  and detail page. Non-archived projects show no status label.
- R25: Cards in the carousel MUST share a height, with both links aligned at the card's bottom.
  Text MUST NOT be truncated or clipped within a card, the carousel MUST NOT scroll vertically,
  and all cards and links MUST remain usable at 320 px. The clipping of peeking cards at the
  carousel's edge is the requested carousel behavior, and every clipped card remains reachable.
  This is how this spec applies the rule in `docs/design.md` against clipping overflowing content.

### Detail pages

- R26: Each project MUST have a static page at `/proyectos/<slug>/` using `SiteLayout`, with the
  name as the sole `h1` in the display variant, its technologies, the rendered Markdown body, a
  GitHub link, and a return link to `/#proyectos`. The page shows no project image. The
  license is shown only where `license` is set.
- R27: Markdown `h2` and `h3` in the detail body MUST computed-style to the `section` heading
  visual language (`docs/design.md`). This is verified on the rendered output, because a
  component-scoped style rule may not reach compiled Markdown.
- R28: Each real home card and its detail page MUST share a view-transition name, following the
  existing experience pattern. Navigating from a clone MUST still complete, with an ordinary page
  navigation as an acceptable fallback (`docs/design.md`). Reduced-motion behavior stays as defined
  in `docs/design.md`.

### Navigator

- R29: The navigator MUST expose three destinations in document order: Inicio, Trayectoria, and
  Proyectos, with the new label from Markdown. Every hardcoded two-destination assumption listed in
  Context MUST be removed. All existing behavior MUST continue to hold with three links, including
  `aria-current`, focus-obscuring, and reduced motion, and the indicator MUST settle aligned to one
  whole link for each of the three.
- R30: At 320 px, every navigator label MUST be fully visible, without clipping, truncation, or
  overflow, and each link MUST keep its 44 px minimum target. Controls MUST NOT be shrunk to force
  a fit (`docs/design.md`). The approach is left to the plan.
- R31: The projects section is now the home's final section. Every navigator destination MUST be
  able to become active by scrolling and by link activation at every viewport listed under
  Verification, including "Proyectos" through a section top able to reach the 16 px activation
  offset, and the end clearance MUST keep final content and focused controls clear of the navigator.

### SEO and sitemap

- R32: Each detail page MUST have a unique `<title>`, a meta description of at most 160 characters,
  and a canonical URL (Constitution §8). All five MUST appear in the sitemap. The sitemap derives
  from routes, so clones cannot affect it.
- R33: `lastmod` for `/` MUST include the projects content directory in its source set. `lastmod`
  for a project route MUST use the project detail page, the layout, and that project's Markdown file,
  with the existing build-date fallback and never throwing. Existing experience behavior MUST NOT
  change.

### Accessibility, design, and documentation

- R34: Pages MUST meet WCAG 2.2 AA (Constitution §7), with no horizontal page scroll at any viewport
  listed under Verification. Status MUST NOT rely on color alone.
- R35: UI MUST follow `docs/design.md` for color, typography, cards, badges, buttons, and motion.
- R36: `README.md` MUST be updated where it describes the content collections, pages, home, and the
  statement that React is used only for the floating navigator.

### Carousel position on return

- R37: With JavaScript running, returning to the home from a project detail page MUST show the carousel
  at the position the visitor left, with no visible jump. A real stop below is one of the N stops whose
  first full card is a real card, where N is the project count. The mechanism is left to the plan, within
  these rules:
  - **Recording**: each departure from the home to a project detail page MUST replace the record with two
    slugs: the project at the carousel's logical stop, meaning the one it is at or moving to, and the opened
    project. A departure is a link activation on a real card or a clone, including one where the router
    falls back to a full-document load, or a `ClientRouter` history traversal. A traversal that unloads the
    document and a departure before hydration need not record. A modified click that opens a new tab or
    window is not a departure.
  - **Entries that restore**: a `ClientRouter` entry from a `/proyectos/<slug>/` page, through the return
    link to `/#proyectos`, browser back, or browser forward, and a full-document history traversal into the
    home. Each applies a valid record, or starts at the first project without one.
  - **Entries that start at the first project**: a reload, a new visit in any tab, including by typed URL,
    external link, or `/#proyectos`, and a `ClientRouter` entry from any other page, such as an experience
    page. The implementation MUST NOT apply a record on these entries. It need not counter a browser that
    natively restores a nested scroller's offset on reload.
  - **Record lifetime**: every entry that swaps or loads the home consumes the record, whether or not it
    restores. A bfcache restoration re-applies nothing and keeps the page as it was. Hash moves within the
    home document are not entries and leave the carousel where it is.
  - **Restored stop**: at the width on return, the stop that has the recorded logical stop's project as its
    first full card MUST be kept when it shows the opened project's real card in full. Otherwise the
    restored stop is the nearest real stop that does, by linear stop distance, which is the selection
    `focusStop` in `helpers/carousel.ts` makes for a focused card. With one card per view, this is always the opened project's stop. With two, opening the second
    card keeps the stop, opening the last stop's first card keeps the last stop, opening the clone of the
    first project in the last stop's second slot restores stop 0, and opening a peeking card moves to the
    nearest stop that shows it in full. The restored stop MUST NOT be computed from a stored offset or index.
  - **Timing**: the position MUST be applied once per entry, with instant scrolling, never animated, under
    every motion preference. On a `ClientRouter` entry, it MUST be in place before the view transition
    captures the new state and before the new page's first painted frame. `astro:after-swap` runs inside
    that update and hydration may finish after it, so hydration alone is not sufficient. This MUST also hold
    when the detail page was loaded as a full document, so the island's module has not run in that document.
    On a full-document traversal, it MUST be in place before the first painted frame.
  - **No visible jump**: from the first painted frame after an entry, no real card may move by more than
    1 px until the visitor provides input, and the `h2` and arrows MUST NOT change size or position. The
    section's height MUST NOT change. Only clones may appear after that frame, and only in space already
    reserved. The arrows' change from disabled to enabled at hydration stays as in R17.
  - **Last stop before hydration**: with two cards per view, the server layout cannot reach the last stop,
    and R10 forbids clones before hydration. The plan MUST provide that stop without clones, for example
    with temporary empty end space that the clones replace at hydration. The empty second slot until
    hydration is accepted on the same terms as the blank left peek in R17.
  - **R17 compatibility**: server output and the first client render MUST NOT depend on the record, so
    rendering MUST NOT read it. A restored real stop is not a looped position under R17, and applying it
    before hydration is allowed. On an entry that restores, R17's first-card rule applies to the cards at
    the restored stop. AC15 keeps applying to loads with no restoration.
  - **View transition**: when the new state is captured and until the transition finishes, the opened
    project's real card MUST be fully inside the carousel's visible area at its settled position, so no wrap
    or realignment may move it. R28's clone fallback covers leaving from a clone and is not needed on return.
    Reduced-motion behavior stays as defined in `docs/design.md`.
  - **Focus**: restoration MUST NOT move focus or call `focus()`. Focus after an entry stays as the router
    leaves it, and later keyboard operation follows R21.
  - **After restoring**: restoration MUST NOT override input, including a stop the visitor reached before
    hydration. Arrows, wheel, and resize MUST continue from the restored stop under R9, R14, and R15.
  - **Vertical position**: restoration MUST change only the scroller's horizontal offset and MUST NOT use
    `scrollIntoView`, `focus()`, or window scrolling. The return link keeps the jump to `#proyectos`, and
    browser back keeps the vertical position the router restores. R8's vertical wheel rule stays in force.
  - **Storage**: the record holds only project slugs and stays in the browser for the tab's session, for
    example in `sessionStorage`, with nothing on the server or in island props (R16). Slugs are read from the
    built HTML, where a static data attribute on real cards is allowed. The plan MUST name the store and its
    format so that QA can seed and corrupt it. A failure to access, read, or write the store MUST be caught:
    navigation and the carousel keep working, with no uncaught error, and it counts as having no record. A
    malformed record, or one naming a slug that no rendered card has, MUST start at the first project.
  - **Without JavaScript**: behavior is unchanged, and R18 holds. If the island fails to load, R18's
    accepted gap stays, restoration is not required, and no uncaught error may result.
  - **Code outside the island**: code that this requirement needs outside the island, such as in
    `SiteLayout`, is limited to this behavior, adds no dependency, and MUST NOT change any other page's
    behavior.

## Acceptance criteria

### Content

- [x] AC1 (R1, R2): The build accepts the five entries. A test confirms that invalid frontmatter, a
      duplicate `slug`, a duplicate `order`, and an image without `alt` are each rejected.
- [x] AC2 (R3): Each entry's repository, archived state, license, and image values match R3
      exactly.
- [x] AC3 (R4, R5): Every entry's copy is in Spanish, satisfies R4, and has the maintainer's approval
      recorded in `tasks.md`.
- [x] AC4 (R6): Rendered strings change when the Markdown fields change, and new components contain
      no hardcoded portfolio strings.

### Home section and carousel

- [x] AC5 (R7): The section renders directly after the professional history with one `h1` on the page,
      an `h2` for the section, and one exposed `h3` per project, in `order` sequence.
- [x] AC6 (R8, R11): At each listed viewport, the carousel overflows, snaps through computed CSS scroll
      snap, settles on one of five logical stops, one per project, and shows the expected full card count.
      Vertical wheel input over the carousel scrolls the page.
- [x] AC7 (R9): Ten arrow activations in each direction land on the expected project each time. Crossing
      the wrap point changes no card's on-screen position beyond the movement itself and keeps focus
      where it was. The carousel does not move without input.
- [x] AC8 (R10): After hydration, the accessibility tree exposes exactly five list items, one per
      project, and each project's links once, no clone link is in the tab sequence, no `id` is duplicated, and all computed
      `view-transition-name` values other than `none` are unique. A pointer click on a visible clone's
      link navigates to the correct URL.
- [x] AC9 (R10): Home to detail to home through `ClientRouter`, and browser back, leaves the same clone
      count as a fresh load.
- [x] AC10 (R12): At every stop, each side shows at least 16 px and less than one full card of a
      neighboring card.
- [x] AC11 (R13): No scrollbar is visible in Chromium at any listed viewport after hydration, and the
      carousel still scrolls.
- [x] AC12 (R14): Using only pointer clicks on the arrows, every project's card can be brought fully into
      view. Arrows meet the 44 px minimum, overlap no full card's text or links, keep focus after
      activation, and move instantly under reduced motion.
- [x] AC13 (R15): A synthetic horizontal wheel gesture with `deltaX` of 120 settles on a different stop,
      in the input's direction. The maintainer confirms the behavior on a physical tilting wheel, recorded
      in `tasks.md`.

### Island, hydration, and no-JS behavior

- [x] AC14 (R16): The home's HTML declares the carousel island with `client:load` output, and built
      `dist/index.html` contains all five cards with their links and images. The island's serialized
      props contain no project name, summary, or URL.
- [x] AC15 (R17): A home load logs no React hydration error or warning. Comparing a load with the
      island's script blocked against a hydrated load, the first card's horizontal position and the
      section's height match within 1 px.
- [x] AC16 (R10, R17): Built `dist/index.html` contains exactly five cards and ten card links, with no
      clones.
- [x] AC17 (R18): With JavaScript disabled, all five cards are visible in a wrapping layout at each listed
      viewport with no horizontal scrolling, no arrows are shown, and all links work.

### Cards

- [x] AC18 (R19, R20): Each card shows the required content and exactly two links, the detail link before
      the GitHub link, with the correct URLs and button variants. The GitHub link contains text only.
- [x] AC19 (R21): Tabbing through the section visits links in DOM order. Each focused link and its 3 px
      outline with 3 px offset lie inside the carousel's visible area and are not obscured by the navigator.
- [x] AC20 (R21): All exposed link accessible names on the home are unique per destination, include the
      project name, and start with the visible label.
- [x] AC21 (R22): Every card image request is same-origin, every project image has non-empty frontmatter
      `alt`, and every card image has `width` and `height`, is uncropped, and fits the same image area.
- [x] AC22 (R23): Only cards with no project image show the neutral default image, with empty `alt`. Its
      committed file uses only palette colors and contains no gradient or text, and review confirms that it
      shows no logo or third-party artwork.
- [x] AC23 (R24): Exactly the three archived projects show the text label on the card and detail page, and
      the others show no status label.
- [x] AC24 (R25): Cards share a height, links align at the bottom, the carousel has no vertical scroll,
      and text is not clipped within a card at 320 px.

### Detail pages

- [x] AC25 (R26): Each of the five pages builds at its route with one `h1`, the required content and links,
      and a return link that lands on the projects section.
- [x] AC26 (R26): No page links to a published site, and only the openrazer page shows a license.
- [x] AC27 (R27): Markdown `h2` and `h3` computed styles match the section heading tokens.
- [x] AC28 (R28): Each real card and its detail page expose the same view-transition name, and navigating
      from a clone completes.

### Navigator

- [x] AC29 (R29): Three links render in document order with the required labels, the indicator aligns to one
      whole link for each, and `aria-current` follows the active section, including on upward scrolling and
      under reduced motion.
- [x] AC30 (R30): At 320 px, each label's full text fits within its link, and each link is at least 44 px
      high and wide.
- [x] AC31 (R31): At each listed viewport, each destination becomes active by scrolling and by activation,
      and final content and focused controls are not covered.

### SEO and sitemap

- [x] AC32 (R32): Each detail page has a unique title, a description within 160 characters, and a correct
      canonical URL, and the sitemap lists all five.
- [x] AC33 (R33): Unit tests confirm `lastmod` source sets for `/` and project routes, the build-date
      fallback, and unchanged experience behavior.

### Accessibility, design, and documentation

- [x] AC34 (R34): Axe reports no applicable WCAG A/AA violation on the hydrated home, the no-JS home, and all
      five detail pages, and no listed viewport has horizontal page scroll.
- [x] AC35 (R35): Computed styles for cards, labels, arrows, and links match `docs/design.md`, and contrast is
      at least 4.5:1 for text in the normal, hover, and pressed states.
- [x] AC36 (R36): `README.md` describes the projects collection, detail pages, and both React islands
      accurately.

### Carousel position on return

- [x] AC37 (R37): At each listed viewport, with each of the five projects at the stop, opening that stop's
      first full card and then returning settles on the same stop, within 1 px, through the return link and
      through browser back, each tested separately. The clone count and the five exposed list items match a
      fresh load.
- [x] AC38 (R37): At 768 px and 1280 px: opening the second card at stops 0 to 3 restores the same stop,
      opening the last stop's first card restores the last stop, and opening the clone in the last stop's
      second slot restores stop 0 with the real first project visible. Leaving at 1280 px from the second card
      of a stop and returning at 320 px restores the opened project's stop. Leaving at 320 px and returning at
      1280 px restores the same project at the stop. Unit tests confirm the selection for a peeking card.
- [x] AC39 (R37): Sampling every animation frame from the first frame after an entry until 1 s after it
      settles, at each listed viewport, at a middle stop and the last stop, for a return link, a browser back,
      a return after reloading the detail page, and a full-document traversal, with and without reduced motion:
      each real card's horizontal position stays within 1 px of its first sampled value, the `h2` and arrow
      rectangles and the section's height stay within 1 px, and no React hydration error or warning is logged.
- [x] AC40 (R37): Measured when the view transition's `ready` promise resolves and again when it finishes, on
      a return to a restored stop other than stop 0, the opened project's real card is fully inside the
      carousel's visible area and within 1 px of its settled position, and computed `view-transition-name`
      values stay unique. Under reduced motion, the return completes at the same position.
- [x] AC41 (R37): Each of these starts at stop 0 after a position was left on a stop other than stop 0: a home
      reload, a `page.goto` to `/` and to `/#proyectos` in the same tab, an entry from an experience page by
      link and by history, and a detail page's return link after a direct landing with no record.
- [x] AC42 (R37): A full-document history traversal into the home, confirmed by a `back_forward` navigation
      entry, restores the stop. Home to detail, back, an arrow move, forward, and back applies the newer record
      under R37's restored-stop rule: it keeps the newer stop only when that stop shows the opened project's
      real card in full, and otherwise restores the nearest real stop that does.
      Return link, back to the detail page, and forward to the home restores the stop. Scrolling to another
      section of the home through the navigator and going back leaves the carousel where it was.
- [x] AC43 (R37): With store access made to throw on read and on write, a malformed record, and a record naming
      an unknown slug, the page logs no uncaught error, the return completes at stop 0, and the arrows work.
      The record holds only slugs, and the island's serialized props stay as in AC14.
- [x] AC44 (R37): After a restoring entry, restoration has not moved focus, compared with a return that has no
      record. One next and one previous arrow activation land on the projects adjacent to the restored one,
      including across the wrap point, and a width change keeps the restored project. Tabbing still meets AC19.
- [x] AC45 (R37): At each listed viewport, after a return link the `#proyectos` top is within 1 px of its
      position on a return with no record, and after browser back `window.scrollY` is within 1 px of its value
      at departure. Neither changes until the visitor provides input, and vertical wheel input over the carousel
      still scrolls the page.
- [x] AC46 (R37): With JavaScript disabled, a detail page's return link lands on the wrapped layout of AC17.
      With the island's script blocked on a full load, the page logs no uncaught error and the scroller still
      scrolls natively.

## Verification

Viewports for all browser checks: 320×568, 767×1024, 768×1024, 1280×800, and 1920×1080.

Applicable gates under Constitution §6: lint, format, build, unit tests, accessibility, and integration,
because this increment changes rendering, routes, content, styles, and client behavior.

- **Unit and component tests (Dev, under `tests/unit/`)**: AC1, AC2, AC4, AC16, AC18, AC20, AC22, AC23, AC25,
  AC26, and AC33, using Vitest, the Astro Container API, and Testing Library for island logic that does not
  need layout.
- **SEO tests (QA)**: AC32, over rendered HTML and sitemap build output.
- **Accessibility tests (QA)**: AC5, AC20, and AC34, using Vitest with `axe-core` and `@axe-core/playwright`.
- **Browser integration tests (QA, Playwright with Chromium)**: AC6 to AC15, AC17, AC19, AC21, AC24, AC27 to
  AC31, and AC35. Geometry checks measure card rectangles against the carousel's rectangle at each settled
  stop. AC12 uses pointer clicks on arrows only. AC15 compares a load with the island's script blocked. AC17
  uses a context with JavaScript disabled and confirms that the chosen no-JS mechanism actually applies in that
  context.
- **Manual review (QA)**: keyboard pass through the section and reduced-motion review for AC12, AC19, and AC29,
  plus responsive screenshots for AC10 and AC35, and review of the neutral image's artwork for AC22. Scrollbar hiding outside Chromium is not covered by the approved
  automated stack, so it is checked manually where a browser is available and recorded as not verified otherwise.
- **Maintainer confirmation**: AC3 (copy) and the physical wheel check in AC13, recorded in `tasks.md`. QA confirms
  that each record exists and does not judge the copy.
- **Documentation review (QA)**: AC36.
- **Carousel position on return (R37)**:
  - Dev, under `tests/unit/**`: the restored-stop selection for AC38, including peeking cards and width
    changes, entry classification for AC41 and AC42, record parsing and store failures for AC43, and a render
    with a throwing store that shows the island's server and first client output do not read the record.
  - QA, under `tests/integration/**`: AC37 to AC46, against the build. AC39 samples rectangles from
    `requestAnimationFrame`. AC40 reads the transition from the `viewTransition` on `astro:before-swap`.
    AC42 asserts the navigation entry's type, so that a run that did not cross documents cannot pass. AC43
    corrupts the store that the plan names. AC46 uses a context with JavaScript disabled.
  - Manual review (QA): bfcache restoration and the look of the return transition, on a browser where
    bfcache is available, recorded as not verified otherwise. Automated tests MUST NOT assume that the
    automated browser enters bfcache.

Existing tests that encode replaced behavior MUST be updated by their owner: Dev under `tests/unit/**`, and QA
elsewhere under `tests/**`. One known case is `tests/integration/nav-liquid-glass.spec.ts`, which asserts exactly
two navigator links and their labels. That file also asserts a navigator width of at most 360 px, which R30 must
respect unless the plan obtains approval to change it. This increment needs no new dependency, tool, constitution
amendment, or `docs/design.md` change.
