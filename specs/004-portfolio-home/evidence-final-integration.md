# Final integration QA evidence — spec 004

- **Scope:** Final independent verification after fixes T7b (company-icon
  rendered-frontmatter fallback) and T6b (single 16 px anchor inset + React
  focus-overlap navigator hiding). Full gate run plus targeted browser retests
  of the previously failing AC12 criteria.
- **Date:** 2026-10-05
- **QA model:** Auto Router (`openrouter/auto`, routed as
  `openrouter/openrouter/auto#medium`), configured default; no override.
- **Build verified:** `pnpm build` (this run, exit 0) → `dist/` with `/`,
  `/experiencia/puesto-ejemplo-2022/`, `/experiencia/puesto-ejemplo-2024/`,
  and `sitemap-index.xml`/`sitemap-0.xml`. Served via the already-running
  preview at `http://127.0.0.1:4322`, which serves that fresh `dist/`
  directory.
- **Files touched by QA (tests/evidence only):**
  - `tests/unit/floating-nav.test.tsx` — added two tests for the T6b focus
    state (see below).
  - `specs/004-portfolio-home/evidence-scroll-fix.md`,
    `specs/004-portfolio-home/evidence-t6.md` — Prettier formatting only
    (content unchanged) so the repository-wide `format:check` gate passes.
  - This new file. **No production code, `tasks.md`, `spec.md`, `plan.md`, or
    acceptance checkboxes were edited** (Lead-owned).

## Tests added

`tests/unit/floating-nav.test.tsx` previously covered scroll/measure behavior
but nothing for the new focus-overlap hiding. Two tests were added:

1. **Hides for covered keyboard focus and restores inside the navigator:** a
   control overlapping the navigator (including the 8 px focus-outline margin)
   becomes `data-focus-obscured="true"` while focused; focusing a navigator
   link clears the attribute and the links keep no `tabindex` (opacity hiding,
   not removal from the tab order). jsdom has no `:focus-visible`, so
   `Element.prototype.matches` is mocked only for that selector and delegates
   all other selectors to the real implementation.
2. **No unnecessary hiding:** a focused control well above the navigator never
   sets `data-focus-obscured`.

File total after the addition: 9 tests, all passing.

## Final gates (exact order)

| Order | Command             | Result                                                                                                                                                                                                                                                                                                               |
| ----: | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     1 | `pnpm lint`         | **PASS**, exit 0 (`eslint .`)                                                                                                                                                                                                                                                                                        |
|     2 | `pnpm format:check` | **PASS**, exit 0 — after Prettier-formating the two QA evidence files above (initial run failed exit 1 on exactly those two files; no source or Lead-owned file was affected). Re-confirmed PASS at session end (a transient warning appeared while the Lead concurrently wrote `summary.md`; final state is clean). |
|     3 | `pnpm build`        | **PASS**, exit 0 — 3 pages + sitemap in 655 ms                                                                                                                                                                                                                                                                       |
|     4 | `pnpm test:run`     | **PASS**, exit 0 — **16 files / 90 tests** (includes the previously failing `agents.test.ts` model expectations, now re-anchored to Auto per spec 005, and the full icon/SEO/a11y-axe suite)                                                                                                                         |
|     5 | `pnpm test:a11y`    | **PASS**, exit 0 — 4 files / 5 tests                                                                                                                                                                                                                                                                                 |

## Browser retests (Puppeteer 25.12.0, Chrome 154 built-in, built preview)

### AC12 / T6b — section anchor inset (previously failing: y=178 at 1440×900)

Direct load of `/#trayectoria` and clicked navigator anchor, measured after
settle (scroll-snapping is `y proximity`):

| Viewport | Direct load top | Clicked anchor top | `aria-current` |
| -------: | --------------: | -----------------: | -------------- |
|  320×700 |     **15.6 px** |        **15.6 px** | `location`     |
|  375×812 |     **16.4 px** |        **16.4 px** | `location`     |
|  767×900 |     **16.0 px** |        **16.0 px** | `location`     |
| 1440×768 |     **15.6 px** |        **15.6 px** | `location`     |
| 1440×900 |     **16.0 px** |        **16.0 px** | `location`     |

All within the 16 px ±1 tolerance; the previous 32 px stacking and the
insufficient end-scroll-range failure (old y=178) are both resolved. The
document no longer ends at maximum scroll for these alignments
(e.g. 1440×900: scrollY 614 of 630 max).

### AC12 / T6b — keyboard focus vs. navigator

At **320×700**, scrolled to the bottom, Tab trace (GitHub → LinkedIn → first
"Más información" → last "Más información" → navigator links):

- Non-overlapping focused controls: `data-focus-obscured` absent, computed
  nav `opacity: 1`.
- Last history action ("Más información", focus rect y 636–680 vs. nav top
  630): **`data-focus-obscured="true"`, computed nav `opacity: 0`**, focus
  outline `solid` on the control — the navigator no longer covers it.
- Next Tab into the navigator link "Inicio": attribute cleared, `opacity: 1`,
  links remain in tab order (no `tabindex`).
- Resulting keyboard focus outline style on every tab stop: `solid`.

At **375×812**: full Tab pass from bottom — **0 hidden steps** (no
unnecessary hiding); final focus reaches "Inicio" in the navigator.

### Responsive geometry (all six required widths)

|    Width | Container width | Nav                            | Horizontal overflow |
| -------: | --------------: | ------------------------------ | ------------------: |
|  320×700 |          288 px | 288×54, bottom 684 (16 px gap) |                  No |
|  375×812 |          343 px | 343×54, bottom 796 (16 px gap) |                  No |
|  767×900 |          735 px | 360×54, bottom 884             |                  No |
|  768×900 |          704 px | 360×54, bottom 884             |                  No |
| 1024×900 |          960 px | 360×54, bottom 884             |                  No |
| 1440×900 |         1120 px | 360×54, bottom 884             |                  No |

No `scrollWidth` exceeded `innerWidth` at any width. Snap is `y proximity`
with `start` alignment on both sections and the tall content scrolls normally.

### Company icons (T7/T7b)

- Homepage: **two** `.company-icon` elements, both
  `/images/companies/astro.svg`, `naturalWidth > 0` (loaded), rendered
  **40.0 × 40.0 px**, `alt="Icono provisional de Astro para Empresa de
ejemplo"`, adjacent `<span>Empresa de ejemplo</span>`, no right overflow.
- `/experiencia/puesto-ejemplo-2024/`: **one** icon with identical
  src/alt/size/adjacency and no overflow.

### Reduced motion

Emulated `prefers-reduced-motion: reduce`: match true, computed
`scroll-behavior: auto`, `#trayectoria` direct load still settles at top
**16 px**, snap type unchanged.

### View transitions (fresh light recheck)

For both slugs, forward and return: `pagereveal` fired with
`viewTransition` active; the detail article carries
`data-experience-slug` and
`view-transition-name: experience-<slug>`; return lands on `/#trayectoria`
with section top **16.0 px**. Sampled incoming-page animation durations were
250 ms in this Chrome build (R10 sets no required duration; the earlier
200 ms record in `browser-evidence.md` was the then-default). Reduced-motion
opt-out and unsupported-API/no-JS fallback behavior are **cited from the
existing real-browser evidence** in `browser-evidence.md` — the transition
CSS was not changed by T6b/T7b, only the section-anchor scroll inset, so this
is recorded as reuse, not a fresh rerun of those emulations.

### SEO / routes / sitemap (built output inspection)

- `lang="es"` on all routes.
- Home: `Nombre Apellidos | Portfolio profesional`, canonical
  `https://example.com/`.
- Detail 2024/2022: distinct titles and descriptions, canonicals
  `https://example.com/experiencia/puesto-ejemplo-2024/` /
  `.../puesto-ejemplo-2022/`.
- `sitemap-0.xml` lists `/` and both detail routes.

### MCP a11y audit on built preview

- `/`: 30 passes, 0 violations, 0 incomplete.
- `/experiencia/puesto-ejemplo-2024/`: 24 passes, 0 violations, 0 incomplete.
- `/experiencia/puesto-ejemplo-2022/`: 24 passes, 0 violations, 0 incomplete.

## Reused prior evidence (unchanged behaviors, not rerun)

From `browser-evidence.md` (same built pipeline, unchanged production areas):

- Open Sans local loading (`/fonts/open-sans-latin.woff2`), no third-party
  font requests, and the aborted-font fallback stack check.
- JavaScript-disabled navigation (anchors, detail route, return link, no SPA
  router) and the JS-off content presence check.
- Contrast ratio measurements, safe-area/16 px bottom clearance, and the
  indicator-on-link measurement.
- Unsupported-transition-API emulation (emulated in a supporting browser, as
  explicitly reported there — no genuinely unsupported engine is available).

The six-width layout table above is a fresh measurement, not reuse.

## Defects / blockers

**None found.** The previously recorded AC12 failures (32 px stacked inset,
covered keyboard focus, insufficient end scroll range) are resolved by T6b and
verified above; the `agents.test.ts` model expectations now pass under the
spec-005 Auto configuration; all five gates pass in the required order.

The stale model-cost paragraph in `AGENTS.md` was left untouched per the
maintainer's explicit deferral ("leave that for now").

## Checklist status for the Lead

Final integration gates and browser criteria all pass. Acceptance checkboxes
(AC11, AC12, AC9 and task checklist entries) remain Lead-owned and were not
edited by QA.
