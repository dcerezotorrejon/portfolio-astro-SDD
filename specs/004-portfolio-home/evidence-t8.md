# T8 QA evidence — section-start threshold activation (R11 / AC12)

Independent QA verification of T8 ("Replace midpoint selection with section-start
threshold activation"). Per task instructions, production/spec/tasks docs were
not modified; this file records evidence only.

## Scope

- `src/lib/navigation.ts`: `SectionStart { id, top }`,
  `getActiveSectionIndex(sections, activationOffset = 16, tolerance = 1)` —
  last DOM-order section with `top <= activationOffset + tolerance` wins.
- `src/components/FloatingNav.tsx`: sorts resolved elements with
  `compareDocumentPosition` before measuring, keeps focus-protection listeners,
  measures via `getBoundingClientRect().top` on a coalesced rAF.

## Tests added / replaced

- `tests/unit/navigation.test.ts` — **replaced** (old midpoint contract removed):
  - tall earlier section with center near viewport center is NOT active when a
    later section passed the inset (no midpoint logic);
  - threshold boundaries: `16`, `16.4`, `17` qualify; `17.1` does not
    (16 px inset + 1 px tolerance);
  - upward scroll reversal;
  - ties resolved by later DOM-order section;
  - nothing qualified / empty list → first section / index 0;
  - custom `activationOffset` and `tolerance` (90/101/122 tops vs 100±tol, 120±5).
- `tests/unit/floating-nav-threshold.test.tsx` — **new** (jsdom + Testing Library,
  mocked rAF/`ResizeObserver`/`document.fonts`, real `getBoundingClientRect`
  mocks on real DOM sections):
  - state before vs after threshold (`17.1` → `16.4`) across scroll;
  - last-passed wins while a tall earlier section still covers the viewport
    center (`data-active-index` follows prop order, not DOM order);
  - upward reversal + rAF coalescing (one pending frame per effect across a
    burst of scroll events);
  - reversed `sections` props with all-tied tops → last DOM-order id wins and
    the rendered index maps the id back to prop order (`0` for `contacto`
    when listed first) — confirms the helper's DOM-order mapping is correct;
  - resize / hashchange / ResizeObserver-entry re-measure, and a bare
    hashchange with unchanged geometry does not move the selection;
  - link click does not change selection (geometry-driven, not click-driven);
  - remount starts from `sections[0]` before first measure, then measures;
    unmount cancels pending frames and disconnects the observer;
  - no section qualified → first section stays active.

`tests/unit/floating-nav.test.tsx` was intentionally **not edited** (owned by
another concurrent final-QA task).

## Commands run

- `pnpm vitest run tests/unit/navigation.test.ts tests/unit/floating-nav-threshold.test.tsx`
  — **2 files / 14 tests passed** (targeted; legacy file excluded, see below).
- `pnpm lint` — **passed** (no output).
- `pnpm format:check` — **passed** after Prettier-formatting the new test file
  (initial run flagged it; only `tests/unit/floating-nav-threshold.test.tsx`
  was reformatted).

### Gates not run / deferred (per task constraints)

- `pnpm build`, full `pnpm test:run`, `pnpm test:a11y`, browser/Chrome audit:
  deferred to final integration QA. Browser ownership rests with the other
  concurrent final-QA task; **browser evidence for T8 is pending**.

## Known expected failure (not a defect of T8)

`tests/unit/floating-nav.test.tsx` still asserts the **old midpoint contract**
(old helper signature with `center`/previous-selection args). It will fail until
a separate follow-up updates it after the other QA final completes. Not fixed
here per instructions; to be reported and resolved in the follow-up task.

## Defects found

None. In particular, the suspected DOM-order mapping was verified correct:
the component sorts elements into actual document order before calling the
helper, maps the returned index back to the element's `id` (not a prop index),
and renders `data-active-index` from the prop order — proven by the
reversed-props tie test.
