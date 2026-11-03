# Tasks — Projects section

- **Spec ID**: `033-projects-section`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

Tasks share one working tree and QA's gates cover the whole tree. The maintainer asked
on 2026-11-02 to run T2 and T4 in parallel, so a failure in one may come from the other
task's work in progress, and T4 keeps AC31 open until T2 closes.

## Checklist

- [x] T1: Content model and copy. Covers R1–R6, except the third navigation entry, and
      the two images. Criteria: AC1, AC2, AC4 (fields only). Model: `dev` sonnet (default).
  - Evidence (QA, re-verification on 2026-11-02 after the fifth project): branch
    `spec/033-projects-section`, revision `5cbbee9` plus uncommitted changes (T1: collection,
    schema, parsers, five project entries, hassio icon, default image, profile labels,
    `tests/unit/content.test.ts`, `tests/unit/projects.test.ts`). T2 work was in progress in the
    same checkout.
    - `pnpm lint`: pass. `pnpm format:check`: pass. `pnpm build`: pass (3 pages; the project pages
      belong to T2/T3). `pnpm test:run`: pass, 37 files, 354 tests. `pnpm test:a11y`: pass,
      4 files, 5 tests. No T2 failures were observed and no process was stopped.
    - `pnpm test:integration`: not repeated. This is a content-only re-check of a fifth entry and
      the earlier integration run is not affected by it.
    - AC2: `zot-quarantine-proxy.md` matches R3 (repository
      `https://github.com/dcerezotorrejon/zot-quarantine-proxy`, `archived: true`, no license,
      no image, `order: 5`; the site URL field was later removed from the model). The GitHub API confirms `archived: true`,
      `license: null`, `homepage: null`. The other four entries were re-read directly and still
      match R3 (portfolio 1, openrazer 2 with GPL-3.0, hassio-pacman 3 with the icon, custom-aur 4).
      `tests/unit/projects.test.ts` hardcodes the expected values for all five entries,
      independent of the files, and checks exact file set, ordering, uniqueness, and
      `seo.description` at most 160 characters. Sufficient for AC2.
    - R4 for zot-quarantine-proxy, checked against the README (as data; where its introduction
      says images are held in quarantine, the detailed sections prevail): `technologies` are
      exactly Python, Podman, Zot, Trivy, ClamAV. `seo.description` is 146 characters. The copy
      is in Spanish, says new images are served from the public registry, copied in the
      background, scanned with ClamAV and promoted at once with no CVE check or waiting period,
      and that updates wait 7 days by default (`QUARANTINE_DAYS`, from the origin build date),
      go through ClamAV and optional Trivy, and CVEs block only if `CVE_SEVERITY_THRESHOLD` is
      set (empty by default). It does not say new images are quarantined or CVE-checked, does
      not say CVEs always block, has no "espacio de cuarentena", and does not say "open source".
      No entry contains "open source"; custom-aur `technologies` has no HTML.
    - Observation (not a defect): the test does not assert the exact `technologies` of
      zot-quarantine-proxy or the R4 copy restrictions; those were checked here by hand.
    - AC1 (unit level only): schema and `assertUniqueProjects` rejections are covered by unit
      tests. Build-level proof is pending T2/T3; AC1 stays unticked.
    - AC4 fields: eight `projects*` labels are in `profile.md` and the schema; component use is
      T2/T3.
    - Earlier notes still apply: R23 artwork review is deferred to T2; the hassio image `alt`
      ("frente a su boca abierta") needs the maintainer's check against the rendered icon.
    - Status: no defects found. Approved.
- [x] T2: Home section, cards, and carousel island. Depends on T1. Covers R7–R25. Criteria:
      AC4–AC24. Model: `dev` opus, because of the loop, hydration, and wheel behavior.
  - Evidence (QA, latest run on 2026-11-03, replaces the report of 2026-11-02): branch
    `spec/033-projects-section`, revision `5cbbee9` plus uncommitted changes (T1-T6 in the same
    tree; T2 files and the T6 changes to `helpers/carousel.ts` judged here). Five cards.
    Status: approved, no open defect. D-T2-1 is fixed.
    - Gates (2026-11-03): `pnpm lint` pass; `pnpm format:check` pass; `pnpm build` pass (8 pages);
      `pnpm test:run` pass (41 files, 436 tests); `pnpm test:a11y` pass (5 files, 9 tests).
      `pnpm test:integration` LITERAL (no dev server was running): 207 passed, 0 failed, 13.3 min,
      including the T3 `portfolio` case of `project-detail.spec.ts` that failed on 2026-11-02.
      (`tests/integration/projects-design.spec.ts`, T5, was written during that run and ran
      afterwards on its own: 12 passed.)
    - D-T2-1 (R21, R31, `docs/design.md` focus rule): FIXED. `FloatingNav.tsx` now listens to scroll with
      capture and re-checks when the scrolled element holds the focused control. The old
      single-viewport test passes. New test `D-T2-1/AC19` in `projects-carousel.spec.ts` runs at all
      five viewports: the first card's link is keyboard-focused and moved to the navigator's height
      before each of seven sideways wheel moves (-120, -120, then +120 four times, then -120). After each
      move, `data-focus-obscured` is true exactly when the link plus its 8 px outline margin overlaps
      the navigator, in both directions (hidden when covered, shown again when it moves away), and the
      link is `:focus-visible`. At least one move covered the link at every viewport (1 at 320, 767,
      1280, 1920; 2 at 768). 10 of 10 passed.
    - R9 at 320 px: after a wheel or a rapid series the focused link can sit in a card that is no
      longer visible. That is native scroller behavior; R9 only forbids the wrap from moving focus,
      and focus never moved. Not a defect.
    - AC4, AC5: pass (unit tests; `tests/a11y/projects.test.ts`; section directly after `#trayectoria`,
      one h1, one h2, five exposed h3 of 15 in the DOM).
    - AC6, AC10: pass at all five viewports: `x mandatory`, `start`, overflow, 1 or 2 full cards,
      peek 20 px below 768 px and 40 px from 768 px, with exactly one cut card per side at all five
      stops. Vertical wheel scrolls the page (dy 100, carousel dx 0).
    - AC7: pass, ten activations each way at each viewport land on the expected card with focus on
      the arrow, no pixel jump across the wrap and no movement without input. R9 rapid series of
      13, 17, -14, -21 clicks (and in-page bursts of 0, 16, 50 ms) land on the expected card with no
      backward frame (per-frame sampling).
    - AC8: pass. Five exposed links of each kind, no duplicate id, no duplicate non-`none`
      view-transition name (8 = 3 experiences + 5 projects), no clone link in the tab order, no
      `inert`, mouse down on a clone link at 1280 leaves focus on the arrow, and the click reaches
      `/proyectos/portfolio/` now that T3 exists. At one card per view a clone only peeks and no
      link is hittable, so the click is checked at 768+ only.
    - AC9: pass with two different detail pages (`openrazer`, `portfolio`): client-side navigation
      (window marker survives), 0 clones on the detail page, 10 after the return link and after
      back, forward and five round trips; arrows enabled. T6 will change what a return restores.
    - AC11: pass, horizontal bar height 0 and `scrollbar-width: none` at all five viewports after
      hydration; scrolling still works. Not checked outside Chromium: not verified.
    - AC12: pass. Arrows 44x44, 16 px above the scroller, focus stays on the arrow, instant under
      `reduced-motion` (one stop within 40 ms); every project is seen by arrows alone.
      Contrast of the arrow icon: 4.61:1 normal, 4.14:1 hover, 3.21:1 pressed (non-text, at least 3:1).
    - AC13: the synthetic part passes: `wheel(120,0)` moves one stop forward, `-120` back (with the
      wrap), Shift+wheel works at all widths, and trackpad-like small deltas stay native. Synthetic
      small deltas cannot show a real trackpad; they snap back. NOT marked: the maintainer's physical
      confirmation is pending.
    - AC14, AC16: pass on `dist`: `client="load"`, props only `previousLabel` and `nextLabel`,
      5 articles, 10 card links, 0 clones.
    - AC15: pass at the five viewports: with scripts blocked versus hydrated, first real card left
      and section height differ by 0.00 px; no console error or warning. (T6 restoration is excluded
      by the spec.)
    - AC17: pass at the five viewports with a JavaScript-disabled context and `(scripting: none)`
      matching: wrapping grid (1 or 2 columns), no overflow, no arrows, no clones, page overflow 0,
      ten links, a link navigates.
    - AC18, AC20, AC22, AC23: pass (Dev unit tests judged sufficient for the static parts, plus the
      browser checks). The default image `src/assets/project-default.svg` uses only #eff3f8, #ffffff,
      #cfd9de, #0c7abf and #075985, with no gradient, text or logo (checked from the source, not
      viewed as an image). Exactly the three archived cards show "Archivado".
    - AC19: pass (ticked). Tabbing: the ten links in DOM order (primary then GitHub), none a clone, all
      inside the scroller with the 6 px outline margin and clear of the navigator, at all five viewports
      (`AC19/AC21` test). Not hidden by the navigator after a horizontal move: D-T2-1 above.
      Re-checked after T6 with the Tab loop of `projects-return.spec.ts` AC44 at the five viewports.
    - AC21: pass, all images same-origin, `width`/`height` set, `object-fit: contain`, 16:9 area
      (e.g. 446x251 at 1280); alt non-empty for hassio, empty for the four default images.
    - AC24: pass, equal card height (808, 743, 740, 670 px), the last link at the same distance from the
      card bottom, no vertical scroll, no clipped text at 320 px.
    - Unit-test sufficiency (`tests/unit/projects-carousel.test.tsx`, `projects-section.test.ts`):
      sufficient for the maths, clones, wheel classifier, wrap on settle, hydration and unmount. Not
      covered, and I did not edit them: the `focusin` handler move (only `focusStop` is tested), the
      guard that skips a wrap when a focused real card would leave the screen, and the
      `ResizeObserver` realignment. Browser tests above cover the first two.
    - AC13, synthetic part, on the current tree (after the T6 changes to `helpers/carousel.ts`): pass.
      `wheel(120,0)` moves one stop forward, `-120` back with the wrap, Shift+wheel moves, a vertical wheel
      scrolls the page (all in the 207-test run). The physical part is the maintainer's: see
      "Maintainer confirmations".
    - AC7, AC9, AC15 revalidated after T6 in the literal run (all green): AC7 arrows and wrap at the
      five viewports, AC9 round trips with 0 clones on the detail page and 10 after returning, AC15 first
      card and height with scripts blocked against hydrated, 0.00 px.
    - Tests added: `tests/integration/projects-carousel.spec.ts` (AC6-AC12, AC13 synthetic, AC15,
      AC17, AC19, AC21, D-T2-1 at five viewports, AC9) and `tests/a11y/projects.test.ts` (AC5, AC20).
    - Not done: manual keyboard and screenshot review beyond the measurements above. Hover and pressed
      contrast of the card buttons: done in T5.
- [x] T3: Detail pages, sitemap, and README. Depends on T1. Covers R26–R28, R32, R33, R36.
      Criteria: AC25–AC28, AC32, AC33, AC36. Model: `dev` sonnet (default).
  - Evidence (QA, 2026-11-02): branch `spec/033-projects-section`, revision `5cbbee9` plus
    uncommitted changes. Scope: `src/pages/proyectos/[slug].astro`, `src/lib/sitemap-lastmod.ts`,
    `README.md`, `tests/unit/sitemap-lastmod.test.ts`, `tests/unit/project-detail.test.ts`. T2 and T4
    work was in progress in the same checkout.
    - Tests added by QA: `tests/integration/project-detail.spec.ts`,
      `tests/integration/project-markdown.spec.ts`, `tests/a11y/projects.test.ts`,
      `tests/seo/projects.test.ts`. Updated for the eight sitemap URLs and the new routes:
      `tests/integration/sitemap.spec.ts`, `robots.spec.ts`, `accessibility.spec.ts`,
      `helpers/content.ts` (adds `projects`).
    - `pnpm lint`: pass. `pnpm format:check`: pass. `pnpm build`: pass (8 pages).
      `pnpm test:run`: pass, 40 files, 382 tests. `pnpm test:a11y`: pass, 9 tests
      (re-run on 2026-11-02 after the site link was removed).
    - `pnpm test:integration` (literal): not runnable. The maintainer's dev server holds
      `[::1]:4321` (pid 86836); `astro preview` then moves to 4322 despite `--strictPort`, so
      Playwright times out waiting for `127.0.0.1:4321` (30 s). EQUIVALENT RUN, not the literal
      script: the same specs with an equivalent config, against a copy of `dist` served by
      `astro preview` on port 4350. Excluding `projects-carousel.spec.ts` (T2): 107 of 107 passed. A
      run that included it: 122 passed, and the failures were all in `projects-carousel.spec.ts`
      (T2, written while this check ran), none in a T3 file. After the site link was removed, the T3
      specs (`project-detail`, `project-markdown`, `sitemap`, `robots`, `accessibility`) were re-run
      the same way: 37 of 37 passed. Temporary directories removed and the preview stopped.
    - AC25: pass. Unit (Container) and browser checks for the five pages: one `h1` with the name,
      no image, technologies, body, GitHub link, return link to `/#proyectos` that lands on
      `section#proyectos` in the viewport.
    - AC26: pass (re-verified after the removal of the published-site link). No page links to a
      published site: on all five built pages, including `portfolio`, the only external link in
      the content is the GitHub repository and no link targets `portfolio.dcerezo.com`; the built
      `portfolio` page contains that domain only in its canonical URL. Only openrazer shows a
      license (unit and browser); archived label present only on archived entries.
    - AC27: pass. No real body has `h2`/`h3`, so `project-markdown.spec.ts` builds a throwaway
      copy of the site (under `node_modules/.cache`, removed afterwards) with a fixture project
      containing Markdown `h2` and `h3`. At 320, 767, 768, 1280 and 1920 px the compiled `h2` and
      `h3` computed to exactly the same font size, weight, line height, color, bottom margin,
      family, letter spacing, case and alignment as the real `section` Heading from the same
      build, and to 24/32 px, 700, 30/40 px and a 24 px gap from `docs/design.md`.
    - AC28: pass. A real card and its detail page compute the same `view-transition-name`
      (`project-transition-<slug>`). With a spy on `document.startViewTransition`, a real card
      click, a visible clone click (last stop) and the browser back from each ended with `ready`
      and `finished` fulfilled and the correct URL; the clone count after the return is 10.
      Clones carry no transition name, so a shared-element morph from a clone is not shown, which
      the spec accepts.
    - AC32: pass. Each page has the frontmatter title, one description of at most 160
      characters, one canonical of the form `<site>/proyectos/<slug>/`, one sitemap link and no
      island. The five values are unique across pages, the five routes exist in `dist` and appear
      once each in `sitemap-0.xml`.
    - AC33: pass at unit level, as specified. `tests/unit/sitemap-lastmod.test.ts` confirms the
      `/` set includes `src/content/projects/`, the project set is `[slug].astro`, the layout and
      the slug-matched file (matched by frontmatter, not file name), base stripping, the fallback
      for unknown or failing slugs, and that an experience slug is not resolved as a project and
      the reverse. The refactor to `createSlugReader` leaves the experience tests and the
      experience source set unchanged; run against the real tree, both readers return the
      expected files. With a fake clock set to 2030, `/proyectos/portfolio/` resolved to
      2026-11-02 through Git and `/proyectos/nope/` to the build date. `sitemap.spec.ts` now
      expects the eight URLs and computes each `lastmod` independently from `git log`.
      LEFT FOR AFTER THE COMMIT: the built `lastmod` of the project routes is not proof of R33
      today, because the project files are untracked and 2026-11-02 is both the build date and
      the layout's commit date. After the Lead's commit, check that each `/proyectos/<slug>/`
      `lastmod` equals the commit date of its own Markdown file (the `sitemap.spec.ts` AC13 test
      does this).
    - AC36: pass. `README.md` describes the projects collection and its fields, the
      `/proyectos/<slug>/` pages with no index page, the home carousel, the two React islands
      (navigator and carousel, server-rendered then hydrated), and the structure tree. The collection fields no longer list a published-site URL (re-checked after its removal). Observation
      (not a defect): the browser-test paragraph still says "every content-derived experience
      detail page" and the provisional-content note does not name projects.
    - AC1 (build level): pass. `project-markdown.spec.ts` builds a copy with (a) an extra entry
      with `order: 1`, (b) a second entry with slug `portfolio`, and (c) an image with empty `alt`;
      each build fails (a and b with `Duplicate project order 1` and `Duplicate project slug
"portfolio"` from `assertUniqueProjects`, in `[slug].astro` and `index.astro`; c with the
      schema error), and the unmodified copy builds. With the unit tests from T1, AC1 is proven.
    - Observation: no unit test exercises `createExperienceReader` and `createProjectReader`
      against the real file system; the checks above cover them by hand and through the build.
    - Status: no defects found. Approved. T4's `AC31` and T2's criteria are not part of this entry.
- [x] T4: Navigator and end clearance. Depends on T2. Covers R29–R31. Criteria: AC29–AC31.
      Model: `dev` sonnet (default).
  - Evidence (QA, partial, reported on 2026-11-02 and recorded by the coordinating session):
    branch `spec/033-projects-section`, revision `5cbbee9` plus uncommitted changes, with
    T2 still in progress.
    - D1 (the indicator jumped because its transition did not cover `translate`) and D2
      (unused tokens that hardcoded the link count) were returned to Dev, fixed, and re-verified.
    - AC29: approved. The indicator passes through intermediate positions, settles within 1 px
      of each of the three links at the five viewports, and has no transition under reduced motion.
    - AC30: approved. Measured at 320 px with the real component, including the fallback font.
    - AC31: approved (QA re-measurement on 2026-11-02, five cards, T2 layout, revision `5cbbee9`
      plus uncommitted changes). `#proyectos` height: 922.2 px (320x568), 857.1 (767x1024),
      864.4 (768x1024), 794.25 (1280x800 and 1920x1080), the same with Open Sans blocked. With
      `810px` the section top at maximum scroll is -465.9, -47.0, -54.0, -106.6 and 15.4 px, so the
      16 px activation offset is reached everywhere and "Proyectos" becomes active at every
      viewport; the tightest case, 1920x1080, has 0.63 px of slack. A taller section only gains
      slack; the risk is a section shorter than about 793.6 px at 1920x1080 (for example a shorter
      tallest card summary after the copy approval), which would leave Proyectos unreachable by
      scrolling. Recommendation, not a defect: a smaller constant (such as 780px) gives about 30 px of
      slack. Activation by link, and clearance of final content and focused controls, pass in
      `navigator-projects.spec.ts` (all passed in the 153-test run).
    - `pnpm build`: pass. `pnpm lint`: pass. `pnpm test:run`: pass, 35 files, 276 tests.
      `pnpm test:a11y`: pass, 5 tests.
    - `pnpm format:check`: fails only on `src/components/home/ProjectCard.astro` (T2).
    - `pnpm test:integration` (literal): not runnable, because `astro preview` refused to start
      while another preview held the project lock on port 4331. EQUIVALENT RUN, not the literal
      script: Playwright against a copy of `dist` on port 4330, 83 of 83 passed.
    - Latest gates (2026-11-02, same tree): `pnpm lint`, `pnpm format:check` and `pnpm build` pass;
      `pnpm test:run` 40 files, 382 tests pass; `pnpm test:a11y` 9 tests pass. The earlier
      `format:check` failure on `ProjectCard.astro` is gone. The literal integration script is
      still not runnable (see T2); the equivalent run on port 4331 passed all `navigator-projects`
      tests.
    - AC31 re-measured on 2026-11-03 with `--home-end-scroll-space: max(112px, calc(100svh - 780px))`
      (`global.css` line 301), after T6: `#proyectos` height 922.22 (320x568), 857.09 (767x1024), 864.44
      (768x1024), 794.25 (1280x800 and 1920x1080). With the page scrolled to the end the section top is
      -465.86, -77.03, -84.03, -106.62 and -14.62 px, so the 16 px activation offset is reached with 481.9,
      93.0, 100.0, 122.6 and 30.62 px of slack, and "Proyectos" is the `aria-current` link at every
      viewport. Dev's 30.63 px at 1920x1080 is confirmed (30.62). `navigator-projects.spec.ts` passed in
      the literal 207-test run (activation by link and clearance of final content and focused controls).
      T4 stays ticked.
    - Status: no defects in T4. Approved. D-T2-1 (fixed, see T2) (a focused link under the navigator after a
      horizontal carousel move) is a T2 defect (now fixed) and was never counted here.
    - Not done: manual keyboard and screenshot review.
- [x] T5: Whole-page checks after T1–T4 and T6. Covers R34, R35. Criteria: AC34, AC35. QA only.
  - Evidence (QA, 2026-11-03): branch `spec/033-projects-section`, revision `5cbbee9` plus uncommitted
    changes (T1–T6 in the same tree). Test file: `tests/integration/projects-design.spec.ts` (17 tests, all
    passed in the literal run; QA added the 5 per-viewport `AC35 at <width>px` tests today).
    - AC34: pass. `@axe-core/playwright` with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`
      reports 0 violations on the hydrated home (10 clones present, navigator positioned) and on the five
      detail pages at 320, 767, 768, 1280 and 1920 px, and `scrollWidth - innerWidth <= 0` on each. The no-JS
      home cannot be audited in a context with scripting off (axe needs to run script), so the audit uses the
      served HTML with every `<script>` removed (0 scripts, 5 articles, 0 clones, 0 violations) and the
      overflow is measured separately in a real `javaScriptEnabled: false` context: 0 at all five widths.
      Status is not conveyed by color alone: "Archivado" is text.
    - AC35: pass. At 1280 px the card computes to #FFFFFF, 1 px #CFD9DE, radius 24 px, padding 24 px; the
      `h3` to 20/27 px, 700, ink #0F1419; the `h2` to 32/40 px, 700; badges to white, 1 px border, pill radius;
      arrows to 44x44 with a radius above 20 px; both card buttons to at least 44 px high with a pill radius.
      Added today at every viewport: `h2` 24 px below 768 px and 32 px from 768 px, `h3` 20 px, Open Sans on
      cards, links, badges, labels and arrows, `background-image: none` on all of them (no gradient), and the
      keyboard focus outline (`:focus-visible`, solid, 3 px, #075985) on an arrow and on a card link, read
      after the 200 ms transition. Contrast (computed, WCAG formula): archived label and summary at least
      4.5:1; primary button normal #0C7ABF/white, hover #096AA7, pressed #075985; secondary normal #FFFFFF,
      hover #EFF3F8, pressed #CFD9DE with ink label; each state at least 4.5:1, with real hover and mouse-down.
      Arrow icon (non-text): 4.61 normal, 4.14 hover, 3.21 pressed, recorded in T2.
    - Test sufficiency: the AC35 tests assert exact design tokens, not just thresholds. Not covered: pixel
      review of screenshots (not done), and hover contrast of the archived label (it has no hover state).
    - Status: no defects. Approved.
- [x] T6: Carousel position on return. Depends on T2 and T3, and starts after QA finishes T2. Covers
      R37. Criteria: AC37–AC46. Model: `dev` opus, because of router timing and hydration.
  - Evidence (QA, 2026-11-03): branch `spec/033-projects-section`, revision `5cbbee9` plus uncommitted
    changes. Production: `helpers/return-position.ts`, `helpers/return-listeners.ts`, the `SiteLayout.astro`
    module, the inline script in `ProjectsSection.astro`, `ProjectsCarousel.tsx`, `data-carousel-end-space`.
    Tests: Dev's `tests/unit/projects-return.test.tsx` (peeking cards, width on return, classification,
    storage failures, self-contained script, hydration; judged sufficient) and QA's
    `tests/integration/projects-return.spec.ts` (47 tests, all passed in the literal run).
    - Audit of the QA test changes made by the stopped session (against `pr.bak`, the current file and the
      build). `robots.spec.ts`: the 8 failures expected one external script and got two. The build ships
      the router module and a `SiteLayout` module (`dist/index.html` and every detail page), which is the
      plan's decision for R37 (router entries must be handled when the island's module never ran). It was a
      stale test, not a production defect. The assertion is now stricter, not looser: it checks both script
      sources by name, the two island component URLs in order, exactly four inline scripts on the home
      (island runtime, `load`, `only` and the return script, identified by its key) and none elsewhere. The
      comment now states the real counts. `projects-return.spec.ts`: the failures that I could attribute are
      test defects. (a) Time: with the file's tests all passing, AC41 takes 28 to 34 s, AC38 27 to 34 s and
      AC42 29 s, and AC39 more, against a 30 s default; the added `test.describe.configure({ timeout:
120_000 })` changes no assertion. (b) The "before hydration" test opened the card before routing the
      fetch to fail, so the detail page was a router navigation and the back was not a full-document
      traversal; it now aborts the router's fetch first and asserts `back_forward`. (c) `onDetailPage`
      waits until the detail page is on screen before going back (a race on the URL changing before the
      swap). (d) The console filter ignores only the message `Failed to load resource: net::ERR_FAILED` for
      a URL under `/proyectos/`, which the tests cause by aborting the fetch; every other error or warning
      still fails. No assertion was loosened without reason. One was: the sampler measured the `h2` and
      arrows relative to the section's top, to avoid a late-loading web font. I restored absolute
      positions (as AC39 states) and re-ran AC39: 10 of 10 passed, then the literal run passed. I cannot see
      the original version of the file (it is untracked), so what I can state is the state of the current
      file and `pr.bak`.
    - Mutation checks, on a copy of `dist` served on another port (deleted afterwards): changing the built
      inline script so that it never restores (`back_forward` test false) is caught by AC42, by the first
      paint test and by the AC39 full-document case; removing the end-space attribute is caught by the
      three "before hydration" tests. The tests do bite.
    - Gates and the literal run: see the Final-gate report. `projects-return.spec.ts` 47 passed.
    - AC37: pass at five viewports, all five projects at the stop, return link and browser back, within 1 px,
      same clone count and five list items, record consumed. AC38: pass at 768 and 1280 (second card of stops
      0 to 3, last stop, clone in the second slot gives stop 0 with the real first card) and across widths
      (1280 to 320 and 320 to 1280); the peeking card is covered by the unit test. AC39: pass, five viewports,
      stops 2 and 4, return link, back, after reload of the detail page, full-document traversal, with and
      without reduced motion, every animation frame sampled from the first frame, no console error or
      warning; the full-document case asserts a `back_forward` navigation entry. AC40: pass at 1280: at
      `ready` and at `finished` the opened card is inside the scroller and the two positions differ by at
      most 1 px, view-transition names unique; same position under reduced motion. AC41: pass at five
      viewports (reload, `goto` `/` and `/#proyectos`, experience link and history, direct landing). AC42:
      pass (1280): `back_forward` confirmed, newer record under the stop rule (arrow previous gives
      `hassio-pacman`, next keeps `custom-aur`), return link then back then forward, navigator move leaves
      the carousel. AC43: pass (throwing store, malformed, wrong types, unknown slugs; only the two slugs
      are stored; the island props are as in AC14). AC44: pass at five viewports (focus equal to a return
      with no record, arrows adjacent across the wrap point, width change keeps the project, 10 Tab presses
      keep each link inside the carousel). AC45: pass at five viewports (`#proyectos` top within 1 px of a
      return with no record and stable, `scrollY` within 1 px after back, vertical wheel scrolls the page).
      AC46: pass (no JS gives the wrapped layout; with the island chunks blocked there is no `pageerror` and
      the scroller scrolls).
    - Coverage asked for. Real `back_forward` at every viewport and under reduced motion: yes (AC39, the
      type is asserted); AC42 at 1280 only. Last stop on a full-document traversal before hydration: yes at
      768, 1280 and 1920 (no clones, `data-carousel-end-space`, last card 0 to 80 px from the left, arrows
      disabled, island delayed 2.5 s). At 320 and 767 there is one card per view and no end space is
      needed; the last stop on a full-document return is covered there only after hydration. Exit through a
      real full-document fallback: yes, by aborting the router's fetch so that it takes its own fallback
      (not a naturally failing server). User input before hydration: a real sideways mouse wheel at the
      three two-card widths; touch and keyboard input before hydration are not verified. Focus after return
      and Tab at all five widths: yes. Inline script before the first paint: the first sampled frame of a
      full-document traversal already shows the restored stop (1280 only). The script runs while the
      parser reaches it, after the section and before the load event, but it is not `blocking="render"`:
      the remaining risk is that a browser paints a partial document before the parser gets to the script
      (a slow or chunked response of the 53 KB page, or a background tab), which would show stop 0 for a
      frame; not reproducible here, so not verified. The `Function#toString` script in the minified build:
      the built `dist/index.html` carries a readable, self-contained function with its helpers inlined
      (`parseReturnRecord`, `restoredStop`, `focusStop`, `visibleCardCount`), and every full-document test runs
      against that built output; a unit test also checks that it is self-contained. bfcache: not verified
      (no test exercises it). The look of
      the transition: not verified by eye; only positions at `ready` and `finished` are measured.
    - AC7, AC9, AC15 after T6: pass in the literal run (arrows and wrap at five viewports, round trips with
      0 clones on the detail page and 10 after returning, first card and height with scripts blocked
      against hydrated at 0.00 px).
    - Status: no defects. Approved.

## Maintainer confirmations

- [x] AC3: Project copy approved by the maintainer.
  - Record: on 2026-11-02 the maintainer approved the `zot-quarantine-proxy` copy, with the
    "espacio de cuarentena" mention removed from its second paragraph, its last position in
    the card order, and its `technologies` list. On 2026-11-03 the maintainer wrote, verbatim:
    "AC3 y AC13 estan ok". That is a general approval; it does not name the copy of the other
    four entries or the hassio image `alt` separately, so it is read as covering them. QA
    re-read all five entries on 2026-11-03: Spanish, no "open source", no license claim where
    none exists, custom-aur `technologies` without HTML, zot-quarantine-proxy as R4 requires.
- [x] AC13: Physical tilt-wheel behavior confirmed by the maintainer.
  - Record: on 2026-11-03 the maintainer wrote, verbatim: "AC3 y AC13 estan ok". QA re-checked
    the synthetic part on the current tree (after the T6 changes to `helpers/carousel.ts`):
    `wheel(120,0)` one stop forward, `-120` one stop back with the wrap, Shift+wheel, small
    deltas native, a vertical wheel scrolls the page; all passed in the literal run of
    2026-11-03 (224 tests).

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`) when applicable

## Final-gate report

QA, 2026-11-03. Branch `spec/033-projects-section`, revision `5cbbee9` plus uncommitted changes
(all tasks, T1–T6, in one tree). Every run below is LITERAL, the script as written in `package.json`:
no dev server or preview was listening on 4321 or 4322 before the integration run.

- `pnpm lint`: pass.
- `pnpm format:check`: pass (after the QA test edits of today).
- `pnpm build`: pass, 8 pages (run on its own, and again inside `pnpm test:integration`).
- `pnpm test:run`: pass, 41 files, 436 tests.
- `pnpm test:a11y`: pass, 5 files, 9 tests.
- `pnpm test:integration`: pass, 224 passed, 0 failed, 0 flaky, 13.4 min, after the last test edit. This
  run includes `projects-design.spec.ts` (T5, 17 tests), `projects-return.spec.ts` (T6, 47 tests) and
  `robots.spec.ts` (all 8 pages pass with two module scripts each).
- Not run: nothing is exempt; the Markdown-only exception does not apply.
- Criteria: AC1 to AC46 are ticked in `spec.md`, including AC3 and AC13 with the maintainer's record.
  Not verified, and not claimed: bfcache restoration, the visual look of the view transition,
  touch and keyboard input before hydration, a partial-document first paint of the inline script, and
  scrollbar hiding outside Chromium. AC33's built `lastmod` for the project routes remains to be
  re-checked after the Lead's commit (see T3).
