# Browser evidence — Portfolio home integration

- **Date:** 2026-10-05
- **QA model:** GPT-6 Luna (`openrouter/openai/gpt-6-luna`), configured default.
- **Build served:** `pnpm preview` at `http://127.0.0.1:4322`, after
  `pnpm build`; the built site contains `/`, both employment detail routes, and
  sitemap output.
- **Browser mechanism:** Chrome 154 via the repository's already installed
  Puppeteer 25.12.0 (transitive installation; no dependency or test tool was
  added). Chrome DevTools MCP lacked controls needed to disable JavaScript,
  emulate `prefers-reduced-motion`, and sample cross-document view-transition
  lifecycle events/animations, so those browser-only checks used Puppeteer. The
  a11y MCP was also run against all three final built-preview URLs. No HTML/CSS unit test is
  substituted for these browser measurements.
- **Screenshots:** PNG evidence is kept outside the repository under
  `/tmp/opencode/`.

## AC1–AC5, AC7, AC10 — Responsive layout, cards, details, visual and keyboard review

The built homepage was inspected at 900 px viewport height at every required
width. Container/card boxes, image boxes, flex direction, overflow, and image
radius were measured from rendered browser geometry:

| Width | Container x / width (px) | Profile image x / size (px) | Intro                                | Card widths (px) | Horizontal overflow |
| ----: | -----------------------: | --------------------------: | ------------------------------------ | ---------------: | ------------------- |
|   320 |                 16 / 288 |              60 / 200 × 200 | column; image centered, details left |         288, 288 | No                  |
|   375 |                 16 / 343 |            87.5 / 200 × 200 | column; image centered, details left |         343, 343 | No                  |
|   767 |                 16 / 735 |           283.5 / 200 × 200 | column; image centered, details left |         735, 735 | No                  |
|   768 |                 32 / 704 |              32 / 240 × 240 | row; image left, details left        |         704, 704 | No                  |
|  1024 |                 32 / 960 |              32 / 240 × 240 | row; image left, details left        |         960, 960 | No                  |
|  1440 |               160 / 1120 |             160 / 240 × 240 | row; image left, details left        |       1120, 1120 | No                  |

All six screenshot files show the actual rendered page at the stated viewport:

- `/tmp/opencode/spec004-320.png`
- `/tmp/opencode/spec004-375.png`
- `/tmp/opencode/spec004-767.png`
- `/tmp/opencode/spec004-768.png`
- `/tmp/opencode/spec004-1024.png`
- `/tmp/opencode/spec004-1440.png`

The image loaded from `/images/profile-placeholder.svg`; rendered radii were
24 px. The homepage rendered one `h1`, two full-content-width cards in newest-first
order, and a single floating navigator. At 320 px the detail route had 288 px
content width, no horizontal overflow, one `h1`, no floating navigator,
`flex-wrap: wrap` on the badge list (the two current badges fit on one row), and a
same-tab `/#trayectoria` return anchor. The latest source also includes
Markdown-configured company SVG icons beside the company names; those local images
loaded with descriptive `alt` text in the built browser, as required by approved
R14. The icon feature is in scope; a separate collection-backed Container render
issue currently blocks some unit/SEO/a11y tests, as described in `evidence-t6.md`.
The detail screenshot is
`/tmp/opencode/spec004-detail-2024-320.png` (the rendered body includes all detail
copy and controls).

Rendered component/SEO assertions for the exact profile text, links, card fields,
dates, ordering, metadata, canonicals, detail routes, and sitemap are in the
Vitest suites recorded in `evidence-t4.md` / `evidence-t5.md`; these are source
content checks, not this responsive evidence.

### Visual tokens, contrast, focus, and unobscured focus

Computed colors matched the global design tokens. Calculated WCAG contrast ratios
from rendered foreground/background colors were:

- Ink `#0F1419` on page `#EFF3F8`: **16.61:1**.
- Ink on white card: **18.51:1**.
- Link/focus `#075985` on page: **6.79:1**; on white: **7.56:1**.
- Dark button label on primary `#1D9BF0`: **6.17:1**.

Open Sans computed at 16 px and the browser reported the local variable face
(`400 700`) loaded. Body and control colors matched the design tokens. Keyboard
Tab reached the two social links, both experience actions, then both navigator
anchors in order. Focus-visible controls had a solid 3 px `#075985` outline. On
mobile, tabbing to the card actions scrolled them into view; the final action was
visible at y=631–675 px while the fixed navigator began at y=742 px (375 × 812),
so it did not cover that focused control. The focus screenshot is
`/tmp/opencode/spec004-keyboard-focus.png`.

`prefers-reduced-motion` styles use zero-duration navigator movement and
`scroll-behavior: auto`; see the actual emulation under AC11–AC12. The fixed bar
computed to 16 px from the viewport bottom with the browser's safe-area inset at
zero, and homepage end padding computed to 112 px. This desktop/mobile emulator
does not simulate a physical notch or nonzero safe-area inset; the actual-device
safe-area inset is **not independently measured**.

## AC8, AC13 — Static content, SEO, JavaScript-disabled behavior, fonts

With page JavaScript disabled in the built site, all homepage copy, the local
image, both employment cards and their detail anchors, and both section anchors
remained in the rendered document. Native anchor navigation reached a detail
route and its `Volver a la trayectoria` anchor returned to `/#trayectoria`; the
detail route had no floating navigator. JavaScript was disabled in the page
context; the browser automation triggered the default anchor action and did not
run app scripts. No SPA router was present.

The local Open Sans font request was same-origin (`/fonts/open-sans-latin.woff2`);
browser network inspection found no third-party font/Google Fonts request. The
font face loaded successfully on the normal run. In a fresh browser context the
font request was deliberately aborted: the Open Sans face entered `error`, the
declared Arial/Helvetica/system fallback stack remained, the profile and history
text remained present (486 body-text characters), and the viewport did not
overflow. The fallback screenshot is
`/tmp/opencode/spec004-font-fallback-375.png`. Font redistribution/OFL is covered
by the asset unit check. The latest Vitest SEO Container renders currently fail
before metadata assertions because the new company-icon prop is undefined in
Container rendering. Direct inspection of final `dist/` HTML confirmed `lang="es"`,
each required distinct title/description/canonical (configured origin
`https://example.com`), and `dist/sitemap-0.xml` containing `/` and both detail
routes. The build and sitemap are therefore observed, but the SEO test gate remains
red until its Container inputs are repaired.

## AC11 — Actual MPA transition lifecycle and fallback: full-card target passes

On Chrome 154, the real same-origin card/detail and return-anchor navigations
fired cross-document `pageswap`/`pagereveal` events with an active view transition.
At outgoing `pageswap`, browser animation sampling observed running animations
with **200 ms** duration. Both slug identities were distinct and remained
consistent across the navigation:

- `experience-puesto-ejemplo-2024` from its homepage card to its detail page and
  on return.
- `experience-puesto-ejemplo-2022` from its homepage card to its detail page and
  on return.

The transitions did not route through an SPA. **Full-card target: PASS against the
current approved R9/AC10 and R10.** The outer
`article.experience-card.experience-detail-card` contains the complete visible
detail content and owns the matching slug-derived transition name and
`data-experience-slug`. Its nested `header.experience-detail-header` intentionally
has computed `view-transition-name: none`: the current requirement is a shared
transition from the overview card to the complete detail card, not specifically to
the detail header. The existing browser measurement is valid for that current
requirement; no new browser run was made for this QA correction. See the corrected
unit contract and scope note in `evidence-t6.md`.

For reduced motion, Puppeteer emulated `prefers-reduced-motion: reduce`. The
browser matched the media query, parsed `navigation: none`, reported auto scroll
behavior and 0 s indicator transition; a real card link still loaded the detail
route, with no active transition on `pageswap` or `pagereveal`.

To emulate the unsupported-transition fallback in this supporting browser, a
separate run overrode the opt-in with `@view-transition { navigation: none; }`.
`pageswap`/`pagereveal` had no active transition while the ordinary anchor still
performed full same-tab navigation. Page JavaScript was also disabled for a
separate run, and the native links still navigated. Chrome 154 supports the
transition API, so no genuinely unsupported legacy engine was available; the
fallback is described as emulated rather than as a test on an unsupported
browser.

## AC12 — Section navigation, scroll, indicator, and remaining failure

- A direct built-page load at `/#trayectoria` set `aria-current="location"` on
  `#trayectoria` and selected index 1. Native no-JS fragment navigation also
  loaded the section and retained the fragment.
- Activating `#inicio`, then allowing 350 ms for settling, left the indicator
  exactly on the active link at 1440 px: both bounds were x=545, y=835,
  175 × 44 px. After a smooth-scroll down/up interruption, the latest section was
  selected and the indicator again exactly matched its link bounds.
- A resize to 375 px preserved no overflow, the fixed bar's 16 px bottom
  clearance, and the section/indicator state. The navigator existed only on `/`.
- The source uses vertical `proximity` snapping at section starts. Browser
  computed style serialized the default proximity strictness as `y`; sections
  remained normal-flow/tall-content readable, without mandatory one-screen
  paging or clipping.
- The midpoint/tie/initial-selection rules are covered by the T3 unit tests. The
  earlier integration rerun reported T1–T3 suites passing; T4 homepage unit/SEO/axe
  renders failed because `ExperienceHistory` dereferenced missing
  `companyIcon.src` from the Container result. This is a separate approved R14
  company-icon/Container-render blocker, not evidence against the full-card
  transition. In the later bounded T6 QA correction, only
  `pnpm exec vitest run tests/unit/transitions.test.ts` was rerun; it passed (1 file,
  3 tests). Details are in `evidence-t6.md`.

**Failure:** at 1440 × 900, a direct `/#trayectoria` load ended at maximum document
scroll (`scrollY=452`) with the history section's top at y=178, not at the 16 px
scroll margin. It selected the right active link, but could not align the section
start because the current document has insufficient end scroll range. The
section-start requirement in R11/AC12 remains pending; relevant production
locations are `src/styles/global.css:95,98-101`. No production fix was made by QA.

The final built-preview axe MCP runs found no violations/incomplete checks: home
31 passes; each detail page 25 passes. This complements, but does not erase, the
failed `pnpm test:a11y` Container rendering gate.

## AC14 and final integration status

The constitution's 1.3.0 global-design amendment, `AGENTS.md` reference, design
document, and version/relationship assertions are covered by repository checks;
the configured sitemap and route build are confirmed. The final `specs/004` summary
artifact and task checklist synchronization are Lead-owned and were not edited by
QA under the assigned file scope. The full-card transition target passes AC11;
AC12 section-start alignment and full Container-backed test gates remain pending,
so final integration is **not all-pass**.
