# Tasks — Portfolio home

- **Spec ID**: `004-portfolio-home`
- **Last updated**: 2026-10-05

All tasks are complete. The latest relevant evidence for each task and the latest
complete final-gate result are consolidated in the entries below. Dev/QA used
their configured model defaults; later tasks ran through the Auto Router medium
variant without reference overrides.

## Checklist

- [x] T1: Markdown collections and validated helpers (R6, AC6).
  - Latest evidence: `tests/unit/content.test.ts` verifies approved profile and
    experience data, schema validation, safe URLs, date handling, sorting,
    duplicate slugs, and Spanish formatting; `tests/unit/agents.test.ts` verifies
    the constitutional global-design reference. Targeted result: 2 files / 27
    tests pass. Collection infrastructure adds no route or rendered-page change;
    applicable page SEO/axe verification is recorded with T4/T5 and the latest
    complete integration gates below.
- [x] T2: Styles, local Open Sans and placeholder (R1, R3, R7, R12).
  - Latest evidence: `tests/unit/design-assets.test.ts` and subsequent token
    contract coverage verify local font/license/source, placeholder, design and
    CSS contracts, responsive-token values, focus/motion, and assets. The latest
    focused token/asset verification passed 27 tests across three files. Browser
    integration measured layout/font behavior; T10's before/after computed-style
    comparison found zero differences on all three routes at mobile and desktop.
- [x] T3: React floating navigator and section-position helper (R8, R11).
  - Latest evidence: `tests/unit/navigation.test.ts`,
    `tests/unit/floating-nav.test.tsx`, and
    `tests/unit/floating-nav-threshold.test.tsx` cover geometry-driven
    section-start activation, DOM order, reversal, observers, rAF cleanup,
    fragments, focus protection and reduced motion; `tests/a11y/floating-nav.test.ts`
    passes axe. The latest targeted regression run passed 3 files / 23 tests.
    Integrated browser checks verify fragment/anchor navigation, alignment,
    active state, safe-area spacing and focus clearance; details are summarized
    under T6b/T8 and in the latest integrated evidence below.
- [x] T4: Shared layout and homepage (R1–R8).
  - Latest evidence: the real-collection homepage render tests verify approved
    content, structure, links, single `h1`, and client-island boundary;
    `tests/seo/home.test.ts` verifies Spanish language, title, description and
    canonical; `tests/a11y/home.test.ts` passes axe. Integrated browser evidence
    verifies the six responsive widths, layout, overflow, keyboard focus and
    content behavior. All applicable repository gates pass in the latest complete
    run below.
- [x] T5: Static employment detail pages (R9).
  - Latest evidence: `tests/unit/experience.test.ts` checks both collection-backed
    detail routes, matching content, headings, links and absence of homepage-only
    navigation; `tests/seo/experience.test.ts` verifies route metadata and
    canonicals; `tests/a11y/experience.test.ts` passes axe for both routes. The
    build generates both detail pages and the sitemap.
- [x] T5a: All detail content inside one rounded card (R9/R10, AC10/AC11).
  - Latest evidence: rendered tests verify the outer `article.experience-detail-card`
    contains both header and body, including badges, expanded Markdown, notice
    and return link; the outer article owns the matching transition identity.
    Detail SEO and axe tests pass; the latest integrated browser run confirms
    full-card transitions for matching slugs in both directions.
- [x] T6: Native shared-element transitions (R10).
  - Latest evidence: `tests/unit/transitions.test.ts` pairs overview cards to
    outer detail articles by slug and verifies a unique matching transition name,
    full-card containment, MPA navigation and reduced-motion rules. The targeted
    transition suite passes 3 tests; the latest integrated browser run measured
    real 200 ms transitions for both entries in both directions.
- [x] T6b: Single 16 px anchor inset and focus clearance (R11, AC12).
  - Latest evidence: browser retests measured the `#trayectoria` section top at
    15.6–16.4 px across tested mobile/desktop widths (within 16 px ±1 px).
    At 320×700 the navigator hides while overlapping a keyboard-focused final
    card action, restores when focus enters the navigator, and remains visible
    for unobscured focus. The integrated focus tests and five repository gates
    pass.
- [x] T6c: Explicit 200 ms native transition timing (R10, AC11/AC13).
  - Latest evidence: final browser sampling measured real 200 ms native
    transitions in both directions; `::view-transition-group(*)` computed to
    `0.2s`. Reduced-motion emulation confirmed no active view transition and
    zero-duration animation.
- [x] T7: Local Markdown-configurable company icons (R6, R9, R14; AC5/AC6/AC10/AC15).
  - Latest evidence: schema and both Markdown entries provide validated local
    icon path/alt; the overview and detail render the same 40×40 icon beside the
    visible company name. The build/browser checks confirm image loading and no
    overflow. Runtime resolution handles Astro's normalized-store omission by
    using validated rendered frontmatter when needed.
- [x] T7b: Validated company-icon fallback for Astro's persisted store (AC5–AC15).
  - Latest evidence: `resolveCompanyIcon()` prefers valid normalized data,
    falls back to rendered Markdown frontmatter only when normalized data is
    absent, and rejects invalid values. Helper, schema, real collection, rendered
    home/detail, and replacement tests pass; targeted integration passed 8 files /
    32 tests including SEO and axe. Browser inspection confirmed matching local
    path/alt, dimensions and adjacency on home and detail pages.
- [x] T8: Section-start threshold activation (R11, AC12).
  - Latest evidence: helper/component tests verify the 16 px start threshold
    with 1 px tolerance, DOM-order ties, reversal, geometry-driven state,
    coalescing, observer updates and cleanup. Integrated browser evidence confirms
    direct fragment and anchor landing within 16 px ±1 px and the correct active
    section; no horizontal overflow was observed.
- [x] T9: White primary-button labels/icons on accessible blue (R7, AC7).
  - Latest evidence: six button tests verify white foreground and state tokens;
    calculated contrast is 4.61:1 normal, 5.78:1 hover and 7.56:1 pressed.
    Integrated browser sampling confirms white active/button labels on `#0C7ABF`
    and dark inactive navigator labels, with axe and latest repository gates
    passing.
- [x] T10: Primitive/semantic/component token hierarchy (R15, AC16).
  - Latest evidence: token tests resolve aliases, reject missing/cyclic values,
    and verify approved values and geometry. Browser before/after comparisons
    found zero computed-style differences across all three routes at mobile and
    desktop, including normal, hover, active, focus-visible and reduced-motion
    states; axe remained clear.
- [x] T11: White active navigator label, dark inactive label (R7/R11, AC7/AC12).
  - Latest evidence: browser sampling at 320×700 and 1440×900 measured active
    labels white, inactive labels dark ink, and the indicator on `#0C7ABF`.
    After selection settles, indicator/link x and width differences were 0 px
    in both directions and after anchor activation.
- [x] T12: Emphasized section headings via shared tokens (R16, AC17).
  - Latest evidence: browser computed styles show 24 px mobile / 32 px desktop,
    weight 700, line-height 1.25 and 24 px gap for section and Markdown headings;
    card headings remain distinct. At 320 px headings wrap without overflow.

## Lead synchronization

- [x] T13: Approved §2.1 global-design amendment, constitution `1.3.0`, and
      dependent guidance/summaries (R13, AC14).
  - Latest evidence: Constitution §2.1 references `docs/design.md`, establishes
    its shared scope and constitutional subordination; `AGENTS.md` points UI work
    to the same design guidance. Version/date and consistency are checked by the
    agent tests; related-summary records are retained for T3's summary work.
- [x] T14: Collect AC1–AC17 evidence and finalize `summary.md`.
  - Latest evidence: this task checklist and `summary.md` record feature closure;
    the latest complete gate run and integrated browser evidence are consolidated
    below. No standalone per-run report is needed to establish current status.

## Later fix

- [x] F1/F2: Eliminate the `/#trayectoria` return flicker and re-anchor the
      affected tests (R10, R11; AC11, AC12).
  - F1 (dev): removed `scroll-behavior: smooth` from `html.home-page`, added the
    pre-position indicator transition suppression
    (`.floating-nav:not([data-positioned="true"]) .floating-nav-indicator`),
    pre-selects the active section from `location.hash` in `FloatingNav.tsx`
    before paint, exposes `data-positioned`, intercepts plain clicks to smooth
    scroll with `scrollIntoView` + `history.pushState`, and adds
    `prefersReducedMotion()` / `scrollToSection()` in `src/lib/navigation.ts`.
    The re-anchored tests verify fragment preselection, smooth in-page clicks,
    and immediate reduced-motion navigation.
  - F2 (QA): re-anchored `tests/unit/design-assets.test.ts`,
    `floating-nav.test.tsx` and `floating-nav-threshold.test.tsx`, and added
    `prefersReducedMotion()` / `scrollToSection()` tests to
    `tests/unit/navigation.test.ts` (net +228/−19 lines). Real browser evidence
    (instant fragment landing with a single `scrollY` value, intercepted smooth
    click, reduced-motion immediate jump, cross-document transition
    `activation: true`). `/#trayectoria` lands at the 16 px inset and selects
    `Trayectoria`; the indicator transition remains suppressed until positioned.

## Final gates

- [x] `pnpm lint` — PASS (latest complete integrated run, 2026-10-05).
- [x] `pnpm format:check` — PASS (same latest complete run).
- [x] `pnpm build` — PASS (3 pages + sitemap).
- [x] `pnpm test:run` — PASS (19 files / 118 tests).
- [x] `pnpm test:a11y` — PASS (4 files / 5 tests).
- [x] Browser responsive/font/transition/snap/indicator/motion evidence; MCP axe
      0 violations on all three routes.

## Known remaining limits

- `AGENTS.md` still describes the original model-cost tiers; the maintainer
  explicitly deferred that edit. Current agent routing is documented by
  `005-auto-router-agents`.
- Unsupported transition behavior was emulated in a supporting Chromium browser;
  a physical nonzero safe-area inset was not independently measured.
- `https://example.com` remains the configured site origin.
- F2: the MCP browser exposed no paint-timing entries, so the ~12 ms window
  between the server-rendered default `Inicio` active state and the hydration
  correction to `Trayectoria` could not be confirmed as painted or not. The
  animated flicker is gone (single `scrollY` value; indicator transition
  suppressed), but a one-frame label-color harden (suppress the active label
  until `[data-positioned="true"]`) remains a possible follow-up production
  change. Reduced motion was JS-emulated, not an OS/CDP media override.
