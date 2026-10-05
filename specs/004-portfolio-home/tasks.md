# Tasks — Portfolio home

- **Spec ID**: `004-portfolio-home`
- **Last updated**: 2026-10-05

All tasks are complete. Evidence and final gates are recorded in the linked
per-task evidence files and [`evidence-final2.md`](./evidence-final2.md). Dev/QA
used their configured model defaults; later tasks ran through the Auto Router
medium variant without reference overrides.

## Checklist

- [x] T1: Markdown collections and validated helpers (R6, AC6).
  - Evidence: `content.test.ts` plus governance consistency; see
    [`evidence-t1.md`](./evidence-t1.md).
- [x] T2: Styles, local Open Sans and placeholder (R1, R3, R7, R12).
  - Evidence: `design-assets.test.ts`; see [`evidence-t2.md`](./evidence-t2.md).
- [x] T3: React floating navigator and section-position helper (R8, R11).
  - Evidence: `navigation.test.ts`, `floating-nav.test.tsx`,
    `floating-nav-threshold.test.tsx`, navigator axe; see
    [`evidence-t3.md`](./evidence-t3.md), [`evidence-t8.md`](./evidence-t8.md),
    [`evidence-nav-regression-update.md`](./evidence-nav-regression-update.md).
- [x] T4: Shared layout and homepage (R1–R8).
  - Evidence: home unit/SEO/a11y; see [`evidence-t4.md`](./evidence-t4.md).
- [x] T5: Static employment detail pages (R9).
  - Evidence: detail unit/SEO/a11y and built routes; see
    [`evidence-t5.md`](./evidence-t5.md).
- [x] T5a: All detail content inside one rounded card (R9/R10, AC10/AC11).
  - Evidence: containment and detail gates; see
    [`evidence-t5a.md`](./evidence-t5a.md).
- [x] T6: Native shared-element transitions (R10).
  - Evidence: full-card pairing tests and real browser transitions; see
    [`evidence-t6.md`](./evidence-t6.md).
- [x] T6b: Single 16 px anchor inset and focus clearance (R11, AC12).
  - Evidence: browser retest at 15.6–16.4 px and nav hiding for covered focus;
    see [`evidence-scroll-fix.md`](./evidence-scroll-fix.md).
- [x] T6c: Explicit 200 ms native transition timing (R10, AC11/AC13).
  - Evidence: final browser sampling measured real 200 ms both directions and
    `::view-transition-group(*)` computed to `0.2s`; see
    [`evidence-final2.md`](./evidence-final2.md).
- [x] T7: Local Markdown-configurable company icons (R6, R9, R14; AC5/AC6/AC10/AC15).
  - Evidence: schema/Markdown/rendered views reviewed; see
    [`evidence-t7.md`](./evidence-t7.md).
- [x] T7b: Validated company-icon fallback for Astro's persisted store (AC5–AC15).
  - Evidence: helper branch tests and integration renders; see
    [`evidence-t7b.md`](./evidence-t7b.md).
- [x] T8: Section-start threshold activation (R11, AC12).
  - Evidence: boundary/reversal/DOM-order tests; see
    [`evidence-t8.md`](./evidence-t8.md).
- [x] T9: White primary-button labels/icons on accessible blue (R7, AC7).
  - Evidence: contrast and rendered checks; see [`evidence-t9.md`](./evidence-t9.md).
- [x] T10: Primitive/semantic/component token hierarchy (R15, AC16).
  - Evidence: recursive-resolver tests and zero computed-style differences; see
    [`evidence-t10.md`](./evidence-t10.md).
- [x] T11: White active navigator label, dark inactive label (R7/R11, AC7/AC12).
  - Evidence: browser active/inactive colors and indicator alignment; see
    [`evidence-final2.md`](./evidence-final2.md).
- [x] T12: Emphasized section headings via shared tokens (R16, AC17).
  - Evidence: computed 24/32 px, weight 700, line-height 1.25, 24 px gap; see
    [`evidence-final2.md`](./evidence-final2.md).

## Lead synchronization

- [x] T13: Approved §2.1 global-design amendment, constitution `1.3.0`, and
      dependent guidance/summaries (R13, AC14).
  - Evidence: constitution/AGENTS references, agent consistency test, related
    summaries. The deferred `AGENTS.md` model-cost paragraph is noted as a known
    documentation discrepancy below.
- [x] T14: Collect AC1–AC17 evidence and finalize `summary.md`.
  - Evidence: this checklist, `summary.md`, `evidence-final2.md` and the per-task
    evidence files.

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
    F1 reported the 5 expected test failures for re-anchoring.
  - F2 (QA): re-anchored `tests/unit/design-assets.test.ts`,
    `floating-nav.test.tsx` and `floating-nav-threshold.test.tsx`, and added
    `prefersReducedMotion()` / `scrollToSection()` tests to
    `tests/unit/navigation.test.ts` (net +228/−19 lines). Real browser evidence
    (instant fragment landing with a single `scrollY` value, intercepted smooth
    click, reduced-motion immediate jump, cross-document transition
    `activation: true`) is recorded in [`evidence-f2.md`](./evidence-f2.md).

## Final gates

- [x] `pnpm lint`.
- [x] `pnpm format:check`.
- [x] `pnpm build`: three routes and sitemap.
- [x] `pnpm test:run`: 19 files / 118 tests.
- [x] `pnpm test:a11y`: 4 files / 5 tests.
- [x] Browser responsive/font/transition/snap/indicator/motion evidence; MCP axe
      0 violations on all three routes.
- [x] F2 re-verification on the current source (2026-10-05): `pnpm lint`,
      `pnpm format:check`, `pnpm build` (3 routes + sitemap), `pnpm test:run`
      (21 files / 149 tests) and `pnpm test:a11y` (4 files / 5 tests) all pass.
      Browser fragment-flicker, click interception, reduced-motion and
      cross-document transition checks are recorded in
      [`evidence-f2.md`](./evidence-f2.md). F1/F2 change no rendered markup, so
      the MCP axe result is cited from T11/T12 while `pnpm test:a11y` was re-run.

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
  change. Reduced motion was JS-emulated, not an OS/CDP media override. See
  [`evidence-f2.md`](./evidence-f2.md).
