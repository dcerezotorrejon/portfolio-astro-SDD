# Tasks: Home free scrolling

- **Spec**: `specs/030-home-scroll-snap/spec.md`
- **Plan**: `specs/030-home-scroll-snap/plan.md`
- **Branch**: `spec/030-home-scroll-snap`
- **Last updated**: 2026-10-12

A task is complete only with evidence from all applicable gates. Integration
applies to this increment (page rendering, styles, and client behavior change);
SEO is not applicable. Each QA entry records the latest result only, replacing
the previous one.

## Ownership and order

| ID  | Owner | Depends on | Scope                                                                                              |
| --- | ----- | ---------- | -------------------------------------------------------------------------------------------------- |
| T1  | Dev   | —          | Remove home scroll snapping; reconcile `docs/design.md`; update `tests/unit/design-assets.test.ts` |
| T2  | Dev   | —          | Instant navigator activation; retire indicator hold; update navigator unit tests                   |
| Q2  | QA    | T2         | Verify T2 and update `tests/integration/navigation.spec.ts`                                        |
| Q1  | QA    | T1, Q2     | Verify T1 and run the integration suite against the updated tests                                  |

T1 and T2 are file-disjoint and run in parallel. QA runs serially: Q2 first (it
rewrites the integration navigation tests for the new behavior), then Q1.

Model: default `opencode-go/deepseek-v4.1-flash` for every task; the work is
moderate and needs no override.

## T1 — Remove home scroll snapping and reconcile motion docs

- [ ] Owner: Dev. Files: `src/styles/global.css`,
      `src/layouts/SiteLayout.astro`, `src/pages/index.astro`,
      `docs/design.md`, `tests/unit/design-assets.test.ts`.
- [ ] `global.css`: delete the `html.home-page { scroll-snap-type: y proximity; }`
      rule and the `#inicio, #trayectoria { … scroll-snap-align: start; }` rule
      (with its comment). Keep `scroll-padding-block-start: var(--space-16)`.
- [ ] `SiteLayout.astro` / `index.astro`: remove the vestigial `home-page` class
      and the `isHome` prop/attribute.
- [ ] `docs/design.md`: remove the smooth-scroll wording from "Interaction and
      motion" (the `Smooth-scroll …` clause and `and smooth scrolling`).
- [ ] `tests/unit/design-assets.test.ts`: assert `global.css` has no
      `scroll-snap-type`, `scroll-snap-align`, or `scroll-behavior`, keep the
      16 px inset assertion, and assert `docs/design.md` no longer presents
      smooth scrolling as active behavior.
- [ ] Evidence (QA Q1): applicable gates — `pnpm lint`, `pnpm format:check`,
      `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`.
      SEO not applicable.

## T2 — Instant navigator activation and hold removal

- [ ] Owner: Dev. Files:
      `src/components/home/FloatingNav/FloatingNav.tsx`,
      `src/components/home/FloatingNav/helpers/navigation.ts`,
      `tests/unit/navigation.test.ts`, `tests/unit/floating-nav.test.tsx`,
      `tests/unit/floating-nav-threshold.test.tsx`.
- [ ] `helpers/navigation.ts`: `scrollToSection` always uses
      `{ block: "start", behavior: "auto" }`; delete `prefersReducedMotion` and
      `hasReachedActivation`.
- [ ] `FloatingNav.tsx`: remove `heldSectionIdRef`, `scheduleMeasureRef`, the
      held branch in `measure`, and the release-hold effect; simplify
      `handleLinkClick` to intercept plain clicks (`preventDefault`, `pushState`,
      instant `scrollToSection`, optimistic active section) while leaving
      modified/new-tab/middle clicks native; keep fragment pre-selection,
      `data-positioned`, and focus-obscured behavior.
- [ ] Unit tests updated: `scrollToSection` instant expectations; drop
      `hasReachedActivation`/`prefersReducedMotion` suites; instant activation +
      geometry-governed selection; remove hold-specific cases.
- [ ] Evidence (QA Q2): applicable gates — `pnpm lint`, `pnpm format:check`,
      `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`
      (with `tests/integration/navigation.spec.ts` updated). SEO not applicable.

## Q2 — Verify T2 and update integration navigation tests

- [ ] Owner: QA. Files: `tests/integration/navigation.spec.ts` plus Q2 evidence.
- [ ] Review Dev's unit tests for sufficiency against AC2–AC6, AC8.
- [ ] Update `navigation.spec.ts`: assert immediate positioning after activation
      (no animated progression), fragment update, and `aria-current` /
      `data-active-index` sync; cover modified/new-tab clicks and reduced motion;
      remove the obsolete in-flight-hold tests.
- [ ] Run all applicable gates and record the latest result.

### Q2 evidence (latest)

- **Verified**: T2 — instant navigator activation and hold removal, on
  `spec/030-home-scroll-snap` at `81986b8` plus the uncommitted T2 (and
  parallel T1) working-tree changes. No branch switch.
- **QA-owned change**: `tests/integration/navigation.spec.ts` rewritten. The
  three in-flight-hold tests are removed and replaced with an rAF position
  sampler that proves a plain click jumps straight to the target (no sample
  between the origin and the target; the jump completes within one frame),
  asserting the `#trayectoria` / `#inicio` fragment, `aria-current="location"`,
  and the matching `data-active-index`. The reduced-motion case now asserts the
  target is reached with the indicator `transition-property: none` (no wording
  about a native fragment jump or an animated scroll). The pointer/keyboard,
  client-side round-trip, and keyboard-focus tests are kept unchanged.
- **Unit review (Dev)**: sufficient for AC2–AC6 and AC8. `navigation.test.ts`
  asserts `scrollToSection` uses `behavior: "auto"`; `floating-nav.test.tsx`
  and `floating-nav-threshold.test.tsx` assert the instant jump,
  `pushState("#id")`, immediate selection, geometry-governed selection
  afterwards, and untouched modified/middle clicks. AC5 keyboard and AC6
  reduced motion are browser-level and covered by integration; AC8 is covered
  by `tests/unit/home.test.ts` (exactly one `FloatingNav` island).
- **Commands (latest)**:
  - `pnpm lint` — pass.
  - `pnpm format:check` — pass.
  - `pnpm build` — pass.
  - `pnpm test:run` — pass (30 files, 189 tests).
  - `pnpm test:a11y` — pass (4 files, 5 tests).
  - `pnpm test:integration` — pass (33 tests, Chromium).
- **SEO**: not applicable — titles, meta, canonical, and sitemap are unaffected.
- **Result**: approved. The earlier format blocker (Lead-owned `tasks.md` table
  alignment) was resolved by a whitespace-only normalization; all gates were
  re-run on the same shared branch and are green, and AC2–AC6 and AC8 are
  verified.

## Q1 — Verify T1

- [ ] Owner: QA. Files: Q1 evidence (no test-file edits expected; run the
      updated integration suite).
- [ ] Review Dev's unit tests for sufficiency against AC1, AC7.
- [ ] Run all applicable gates and record the latest result.

### Q1 evidence (latest)

- **Verified**: T1 — remove home scroll snapping and reconcile `docs/design.md`,
  on `spec/030-home-scroll-snap` at `81986b8` plus the uncommitted T1 (and
  parallel T2) working-tree changes. No branch switch.
- **Scope check**: `global.css` keeps `scroll-padding-block-start: var(--space-16)`
  and contains no `scroll-snap-type`, `scroll-snap-align`, or `scroll-behavior`;
  `SiteLayout.astro`/`index.astro` no longer emit the `home-page` class or the
  `isHome` prop; `docs/design.md` has no `Smooth-scroll`/`smooth scrolling`
  wording.
- **Unit review (Dev)**: sufficient for AC1 and AC7.
  `tests/unit/design-assets.test.ts` asserts `global.css` has no
  `scroll-snap-type`, no `scroll-snap-align`, and no `scroll-behavior` (AC1),
  keeps the 16 px `scroll-padding-block-start` inset, and asserts `docs/design.md`
  no longer matches `Smooth-scroll|smooth scrolling` (AC7).
- **Commands (latest)**:
  - `pnpm lint` — pass.
  - `pnpm format:check` — pass.
  - `pnpm build` — pass.
  - `pnpm test:run` — pass (30 files, 189 tests).
  - `pnpm test:a11y` — pass (4 files, 5 tests).
  - `pnpm test:integration` — pass (33 tests, Chromium).
- **SEO**: not applicable — titles, meta, canonical, and sitemap are unaffected
  by this change.
- **Result**: approved. AC1 and AC7 are verified; no defects.

## Final-gate report (latest)

Final feature gates for increment `030-home-scroll-snap` on
`spec/030-home-scroll-snap` (same working tree; uncommitted), covering the
complete feature increment relative to `main` — committed, staged, unstaged, and
untracked changes. The increment contains non-Markdown files, so the
Markdown-only exception does not apply.

- `pnpm lint` — pass.
- `pnpm format:check` — pass ("All matched files use Prettier code style!").
- `pnpm build` — pass (3 pages built; sitemap generated).
- `pnpm test:run` — pass (30 files, 189 tests).
- `pnpm test:a11y` — pass (4 files, 5 tests).
- `pnpm test:integration` — pass (33 tests, Chromium).
- **SEO**: not applicable — titles, meta, canonical, and sitemap are unaffected.

**Result**: all applicable final gates pass.
