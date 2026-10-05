# T6 QA evidence — Native shared-element transitions

- **Task:** T6 (R10; transition verification for AC11)
- **Date:** 2026-10-05
- **QA model:** GPT-6 Luna (`openrouter/openai/gpt-6-luna`), configured default.
- **Dev report:** Slug-specific inline names on the overview experience cards and
  complete detail-card articles, `@view-transition { navigation: auto }`, a 200 ms
  transition, reduced-motion opt-out, and normal-link fallback without an SPA
  router.
- **Browser evidence:** [browser-evidence.md](./browser-evidence.md).

## Spec interpretation and result

The current maintainer-approved R9/AC10 requires the header, technologies,
expanded description, provisional notice, and return link to be contained by one
outer detail article/card. R10 requires a shared transition between the overview
card and the complete detail card in both directions. The detail article is the
correct shared-element target: its `data-experience-slug` and
`view-transition-name: experience-${slug}` identify the whole card. The nested
header intentionally has no transition name. A previous QA assertion that required
the header itself to carry the name was based on outdated target behavior and is
corrected here; it was not a production defect.

The existing real-browser evidence confirms that both entries transition from
overview to detail and back, with the matching slug identity and a measured **200
ms** animation. Therefore, the full-card transition behavior passes the current
AC11 target. Unsupported-transition fallback and reduced-motion behavior are also
covered by the previous browser evidence; unsupported behavior was emulated in a
supporting browser, not tested on a genuinely unsupported engine.

## Tests added/changed

Updated `tests/unit/transitions.test.ts` to render the collection-backed overview
and each detail route, then pair each overview article with the outer detail article
through the matching slug/link. The test now verifies:

1. Each overview card and its matching outer detail article have exactly the same
   slug-derived transition name; the detail article has the matching
   `data-experience-slug`.
2. The detail article is the only element in its rendered route with a transition
   name. Its semantic header and body (including technology list, expanded content,
   provisional notice, and return anchor) are descendants of that card; the header
   has no transition name of its own.
3. Native MPA opt-in, reduced-motion opt-out, and ordinary same-tab overview and
   return anchors are preserved.

The test supplies a local icon fallback only for this transition test's stale
Container collection snapshot; this does not change or repair company-icon/content
tests or the separate Container-render blocker.

## Commands and results

Only the requested targeted test was rerun for this QA correction:

```text
$ pnpm exec vitest run tests/unit/transitions.test.ts

 RUN  v5.0.3 /home/dcerezo/Proyectos/IA/portfolio-sdd

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  11:18:19
   Duration  1.42s (import 53%, transform 38%, tests 9%)
```

No lint, format, build, full unit, or accessibility command was rerun for this
bounded correction. The last previously recorded integration run in this evidence
set reported lint, format, and build passing; `pnpm test:run` and `pnpm test:a11y`
failed because collection-backed Container renders lacked `companyIcon`. Those
results are historical and are not represented as current passes. The transition
test's old header-target failure is superseded by the targeted pass above; the full
suite remains unverified after this correction and is still blocked by the separate
Container-render issue.

| Gate / check                                      | Status                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Targeted transitions unit test                    | **PASS** — 1 file, 3 tests                                                   |
| `pnpm lint`                                       | Not rerun for this correction; prior integration run passed                  |
| `pnpm format:check`                               | Not rerun for this correction; prior integration run passed                  |
| `pnpm build`                                      | Not rerun for this correction; prior integration run passed                  |
| `pnpm test:run`                                   | Not rerun; last integration run failed on Container renders                  |
| `pnpm test:a11y`                                  | Not rerun; last integration run failed on Container renders                  |
| Browser transition evidence                       | **PASS** — existing Chrome 154 evidence; both slugs, both directions, 200 ms |
| SEO / accessibility for this test-only correction | No production markup change; full rendered suites remain blocked as above    |

## Remaining blockers and status

- **AC12 / section-start alignment remains pending.** Existing browser evidence at
  1440 × 900 found direct `/#trayectoria` loading at maximum document scroll with
  the history section top at y=178 rather than the 16 px scroll margin. Dev is
  fixing the CSS asynchronously; it has not been retested or claimed resolved.
- **Container-render suite blocker remains separate from T6.** The previous full
  unit/SEO/a11y runs failed while collection-backed page renders read an undefined
  `companyIcon`. Local company icons and their required schema/data are approved by
  R14; they are not out of scope. Company-icon/content tests were not changed in
  this QA correction.
- **AC9 and overall integration remain pending.** Full gates are not all passing,
  and AC12 has an unresolved browser defect. Do not mark AC9, AC12, T6 checklist
  completion, or the overall feature complete on the basis of this targeted test.

No production code, spec, plan, task checklist, or company-icon/content tests were
changed. No new browser session was run; the existing browser-evidence record was
corrected to align its interpretation with the current approved spec.
