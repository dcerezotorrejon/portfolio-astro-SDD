# Tasks — SVG icon atom

- **Spec ID**: `010-svg-icon`

> A task is only marked `[x]` with evidence from its applicable gates. State
> explicitly when a gate does not apply. Dev and QA assignments use the shared
> `spec/010-svg-icon` branch; no task branch, commit or push is permitted.

## Dependency graph

- **Wave 1:** T1 (Dev) — add the atom, map and public assets.
- **Wave 1 QA:** T2 (QA) — depends on T1; verifies only the atom/map/assets.
- **Wave 2:** T3 (Dev) — depends on T1 and T2; integrates the atom and updates
  the global color/design.
- **Wave 2 QA:** T4 (QA) — depends on T3; verifies the integrated page, styles,
  tests, accessibility and all applicable implementation gates.
- **Wave 3:** T5 (Dev Lead) — depends on T4; records actual current and affected
  summary relationships.
- **Wave 3 QA:** T6 (QA) — depends on T5; verifies the relationship records and
  summary-only task evidence.

Each implementation/governance task remains active through its named QA task,
evidence and any rework. T1/T2 and T3/T4 are serialized; T5/T6 start only after
the preceding wave closes. The maximum active-task count is two. QA sessions do
not overlap test or evidence files. Execution is pending maintainer approval of
the plan and task ownership.

## Checklist

- [x] **T1 (Dev): Add the reusable atom and public SVG symbols.** Implement R1
      and the asset portion of R2 as a static Astro feature, without migrating
      any consumer or editing tests.
  - **Dependencies**: None.
  - **File ownership**:
    - Dev: `src/components/atoms/Icon.astro`,
      `src/components/atoms/iconMap.ts`, `public/icons/github.svg`, and
      `public/icons/linkedin.svg`.
    - QA in T2: `tests/unit/icon.test.ts`,
      `tests/types/icon-name.typecheck.ts`, the T2 evidence entry here, and the
      evidence-backed AC1 checkbox in `specs/010-svg-icon/spec.md` only.
  - **Scope**: Derive the supported name type from the constant map; render
    `<svg><use href="..." /></svg>`; merge `icon` and caller classes; forward SVG
    attributes; preserve each current path in a same-origin public `#icon` symbol.
    No client script, consumer edit, test edit, or fallback icon.
  - **Model**: Dev uses configured `openrouter/openai/gpt-6-luna#medium` (default)
    for bounded Astro/TypeScript and asset work. QA uses configured
    `openrouter/openai/gpt-6-luna#medium` (default) for component and type tests.
  - **QA gates**: Because the task changes Astro, TypeScript and public SVG files,
    QA runs all five gates: `pnpm lint`, `pnpm format:check`, `pnpm build`,
    `pnpm test:run`, and `pnpm test:a11y`. SEO behavior is not directly changed;
    record that explicitly, while the existing SEO tests run in
    `pnpm test:run`.
- **Evidence**: Dev handoff lists the four assigned source/asset paths. Formatting
  used `pnpm exec prettier --write src/components/atoms/Icon.astro src/components/atoms/iconMap.ts public/icons/github.svg public/icons/linkedin.svg`; Prettier had no parser for the SVGs in that combined invocation (exit 2), then formatted/confirmed both with `pnpm exec prettier --write --parser html public/icons/github.svg public/icons/linkedin.svg` (pass). QA approval and all gate/test evidence are recorded under T2. T1 is approved; AC1 is checked. AC2 waits until the social call sites are integrated and browser-checked in T4.

- [x] **T2 (QA): Verify T1's atom and symbol contract.** This QA task verifies T1
      before any page consumer is changed.
  - **Dependencies**: T1 implementation handoff.
  - **File ownership**: QA exclusively owns the two test files named in T1 and
    this T2 evidence entry. It may mark only AC1 in the assigned current spec
    after recording evidence; it does not edit production files or any summary.
  - **Model**: QA uses configured `openrouter/openai/gpt-6-luna#medium` (default).
  - **Evidence**: T2 QA approved T1 on shared branch `spec/010-svg-icon` at
    `5e1142c34b24a4136680b5bd255a9f3ba7e861de` (HEAD; no commit created). T1's
    four implementation paths and the two QA-owned tests below remain uncommitted;
    the spec/plan/task documents are also untracked at this revision. Scope
    verified: `src/components/atoms/Icon.astro`,
    `src/components/atoms/iconMap.ts`, `public/icons/github.svg`, and
    `public/icons/linkedin.svg`. Exact QA test files changed:
    `tests/unit/icon.test.ts` and `tests/types/icon-name.typecheck.ts`.
    `tests/unit/icon.test.ts` renders both supported names and asserts one root
    `<svg>`, matching external `<use href>`, class merge, forwarded style/size/
    role/ARIA/focusable attributes, and no injected viewBox/fill/accessibility
    attributes. It verifies the exact map entries, map-derived `IconName`, and
    absence of scripts/hydration directives. SVG asset checks assert one `#icon`
    symbol per file, `viewBox="0 0 24 24"`, one `currentColor` path, and exact
    preservation of the existing GitHub and LinkedIn path data. The isolated type
    fixture accepts `github` and `linkedin` and uses `@ts-expect-error` to prove
    `mastodon` is rejected. Isolated type check passes with the installed
    TypeScript's config bypass:
    `pnpm exec tsc --ignoreConfig --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler tests/types/icon-name.typecheck.ts`.
    Latest applicable gates all passed: `pnpm lint`; `pnpm format:check`;
    `pnpm build` (3 static pages and sitemap built); `pnpm test:run` (22 files,
    143 tests passed, including existing SEO tests); and `pnpm test:a11y` (4 files,
    5 tests passed). SEO behavior is not directly applicable because T1 adds only
    a reusable atom and public assets and changes no routes or metadata; existing
    SEO tests ran in the full unit suite. No implementation defects found; T1 is
    approved. AC1 evidence is recorded in this report; AC2 remains unchecked for
    T4 integration/browser verification.

- [x] **T3 (Dev): Migrate the social buttons and unify the global accent.**
      Implement R3–R6 after the atom contract is verified.
  - **Dependencies**: T1 and T2 must pass QA so the stable atom API and public
    references are established before page integration.
  - **File ownership**:
    - Dev: `src/components/ProfileIntroduction.astro`,
      `src/styles/global.css`, and `docs/design.md`.
    - QA in T4: `tests/unit/home.test.ts`,
      `tests/unit/button-design.test.ts`, `tests/unit/design-assets.test.ts`, the
      T4 evidence entry here, and evidence-backed AC2–AC6 checkboxes in
      `specs/010-svg-icon/spec.md` only.
  - **Scope**: Replace only the two social inline SVGs; pass names from their
    platform values and pass `aria-hidden`, `focusable`, and Tailwind `text-white`.
    Implement the default `.icon` 1rem size/color and place it in Tailwind's
    `components` cascade layer so the utility overrides it. Unify
    `--color-primary` and `--color-button` at the one `#0C7ABF` primitive, update
    the global design document, and preserve all other button states/semantics.
  - **Model**: Dev uses configured `openrouter/openai/gpt-6-luna#medium` (default)
    for the bounded consumer, CSS and design-document edits. QA uses configured
    `openrouter/openai/gpt-6-luna#medium` (default) for integration tests and
    browser verification.
  - **Dev formatter handoff**: Before QA, run
    `pnpm exec prettier --write src/components/ProfileIntroduction.astro src/styles/global.css docs/design.md`.
    Report the exact command, complete file list, and formatter result.
  - **QA gates**: This task changes Astro, CSS and Markdown, so QA runs all five:
    `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`, and
    `pnpm test:a11y`. SEO metadata/routes are unchanged; record that scope, and
    run the existing SEO tests as part of the full unit suite.
  - **Evidence**: Dev changed only the three assigned files and ran
    `pnpm exec prettier --write src/components/ProfileIntroduction.astro src/styles/global.css docs/design.md` after the initial implementation and again after a Lead-requested correction. The correction aligned the canonical primitive with the approved plan (`--palette-action-blue`); the final code keeps `.icon` in Tailwind's `components` layer and aliases both semantic color roles to the shared primitive. QA approved T3 and recorded the detailed rendered tests, Chrome computed styles, external-resource checks, no-JavaScript behavior, button states/focus and all five passing gates under T4. No QA defects remain. T3 is approved; AC2–AC6 have recorded evidence and are checked.

- [x] **T4 (QA): Verify the integrated homepage and shared color contract.** This
      task owns all QA test changes and evidence for T3.
  - **Dependencies**: T3 implementation handoff.
  - **File ownership**: QA exclusively owns
    `tests/unit/home.test.ts`, `tests/unit/button-design.test.ts`,
    `tests/unit/design-assets.test.ts`, this T4 evidence entry, and the assigned
    current-spec checkbox markers AC2–AC6. No application/style/docs edits.
  - **Model**: QA uses configured `openrouter/openai/gpt-6-luna#medium` (default).
  - **Evidence**: T4 QA approved T3 on shared branch `spec/010-svg-icon` at
    `5e1142c34b24a4136680b5bd255a9f3ba7e861de` (HEAD; no commit created). The
    verified Dev-owned T3 files are the uncommitted changes in
    `src/components/ProfileIntroduction.astro`, `src/styles/global.css`, and
    `docs/design.md`; the QA-owned changes are the three tests listed below. The
    earlier T1 atom/assets/type fixture/test and this untracked spec directory
    remain uncommitted at the same revision; T4 did not modify T1 files. Exact QA
    test files changed: `tests/unit/home.test.ts`,
    `tests/unit/button-design.test.ts`, and `tests/unit/design-assets.test.ts`.
    The homepage test asserts the two social links' visible labels, exact external
    destinations and order, no `target` or redundant `aria-label`, correct
    GitHub/LinkedIn external `<use>` fragment, `text-white` class, and the
    consumer-supplied `aria-hidden="true"` / `focusable="false"` attributes.
    The button-design test preserves normal/hover/active white-label contrast and
    asserts the unified primary/button token chain, 1rem `.icon` declarations in
    Tailwind's `components` layer, rendered external icon attributes, and the
    visible 3px focus outline/offset. The design-assets test re-anchors the primary
    accent to the single `--palette-action-blue` primitive, checks both semantic
    aliases and the design-document description, and rejects the obsolete
    `#1D9BF0` token/documentation value. Full test suite includes the existing SEO
    tests; SEO behavior is not directly changed because routes and metadata are
    unchanged.

    Real-browser verification used Chrome 154 headless against the built site
    served by `pnpm preview` at `http://127.0.0.1:4321/`. A bare `.icon` computed
    to `rgb(12, 122, 191)` (`#0C7ABF`) and `16px × 16px`; both social icons computed
    to `rgb(255, 255, 255)` with `16px × 16px`. Both same-origin
    `/icons/github.svg` and `/icons/linkedin.svg` fetched with HTTP 200 and contain
    the `#icon` 24×24 symbol with one `currentColor` path. The rendered `<use>`s
    have non-zero SVG bounding boxes, confirming both external symbols render.
    The links retained GitHub then LinkedIn labels/destinations, same-tab behavior,
    and decorative SVG semantics. Browser-computed primary-button backgrounds
    were `rgb(12, 122, 191)` normal, `rgb(9, 106, 167)` hover, and
    `rgb(7, 89, 133)` pressed; white labels were retained. Keyboard Tab reached
    the LinkedIn link with a solid `3px` `rgb(7, 89, 133)` outline and `3px` offset.
    With script execution disabled, the homepage sections, social links, external
    symbols, and their styles remained rendered and available as static HTML.

    Latest applicable gates all passed: `pnpm lint`; `pnpm format:check`;
    `pnpm build` (3 static pages and sitemap built); `pnpm test:run` (22 files,
    144 tests passed, including existing SEO tests); and `pnpm test:a11y` (4 files,
    5 tests passed). No T3 defects found; T4 is approved. AC2–AC6 supporting
    evidence is recorded here and those criteria are checked in the current spec.

- [x] **T5 (Dev Lead): Resolve actual spec relationships in summaries.** Record
      the effects found in the implementation and update the current feature
      summary.
  - **Dependencies**: T1–T4 must be implemented and QA-approved; this task uses
    the actual changed-file set and approved outcome, not anticipated scope alone.
  - **File ownership**: Dev Lead owns
    `specs/010-svg-icon/summary.md`, `specs/004-portfolio-home/summary.md`, and
    `specs/006-common-molecules/summary.md`. Update prior summaries only for their
    current date and the relationship to 010; do not rewrite their other content
    or edit their historical `spec.md` files. Dev Lead formats its assigned
    Markdown before QA.
  - **Model**: Dev Lead uses configured `openrouter/openai/gpt-6-luna#high` for
    actual relationship resolution and accurate summary records.
  - **Evidence**: Dev Lead created `specs/010-svg-icon/summary.md` and added an
    accurate `010-svg-icon` relationship to
    `specs/004-portfolio-home/summary.md` and
    `specs/006-common-molecules/summary.md`. The current summary records actual
    files/components and all resolved relationships; the two earlier summaries
    record the expected impact direction and leave unrelated content intact. The
    004 date was already `2026-10-06`; 006's `Last updated` was refreshed to
    `2026-10-06`. No historical `spec.md` was changed. Formatter command:
    `pnpm exec prettier --write specs/010-svg-icon/summary.md specs/004-portfolio-home/summary.md specs/006-common-molecules/summary.md` — all three files unchanged after formatting. T5 is approved by QA in T6.

- [x] **T6 (QA): Verify summary relationships and closeout evidence.** Verify
      T5 without modifying production or summary files.
  - **Dependencies**: T5 summary handoff.
  - **File ownership**: QA owns only this T6 evidence entry and the latest
    relationship/gate evidence in `specs/010-svg-icon/tasks.md`; it does not edit
    `summary.md` files or any earlier/current `spec.md` checkbox.
  - **Model**: QA uses configured `openrouter/openai/gpt-6-luna#medium` (default).
  - **Task gates**: T6's complete changed-file set is Markdown-only and outside
    `src/content/**`. Under Constitution §§5–6 QA runs only `pnpm lint` and
    `pnpm format:check`; build, unit/SEO, and accessibility are not run for this
    task and must be recorded as not applicable under that exception. The full
    feature still requires all five final gates because it contains non-Markdown
    source, tests and public assets.
  - **Evidence**: T6 QA verified T5 on shared branch `spec/010-svg-icon` at
    revision `5e1142c34b24a4136680b5bd255a9f3ba7e861de` (HEAD, same as `main`;
    task changes are uncommitted). T5 scope is exactly
    `specs/010-svg-icon/summary.md`,
    `specs/004-portfolio-home/summary.md`, and
    `specs/006-common-molecules/summary.md`; the T6 evidence update is this
    `tasks.md` entry. The 010 summary has its required current date
    (`2026-10-06`), changed-file and component/function descriptions, and a
    `Related specs` section. Its file/component inventory agrees with the actual
    implementation and QA changes: the Icon atom/map and public symbols, the two
    social-icon call sites and shared color/design updates, the named unit/type
    tests, and the spec artifacts. It records 004 and 006 as modified, and the
    listed 002/007/009 relationships as dependencies. The 004 relationship
    accurately limits impact to the introduction's GitHub/LinkedIn icons and
    primary-accent unification, with destinations, labels, routes, content and
    SEO unchanged; its date was already `2026-10-06`. The 006 relationship
    accurately records the adjacent static Icon atom, shared color/design update,
    and no dependency/client-JS addition; its date was refreshed to
    `2026-10-06`. Neither prior summary's unrelated content was rewritten.
    `specs/004-portfolio-home/spec.md` and
    `specs/006-common-molecules/spec.md` are unchanged relative to `main` (both
    historical blobs verified equal). No defects found; T5 is approved.

    Latest applicable T6 gates: `pnpm lint` — pass; `pnpm format:check` — pass
    (all matched files formatted). The complete T5 changed-file set is the three
    Markdown summaries above, all outside `src/content/**`, so under Constitution
    §§5–6 these are the only applicable task gates. `pnpm build` — not run (not
    applicable under the Markdown-only exception); `pnpm test:run` including unit
    and SEO — not run (not applicable); `pnpm test:a11y` — not run (not
    applicable). The subsequent Dev Lead report for the final integrated five
    gates is recorded in the Gate summary below. No spec checkbox or summary file
    was edited by QA.

## Gate summary

**Final integrated report supplied by the Dev Lead:** after all six tasks had QA
approval, the complete uncommitted feature increment on shared branch
`spec/010-svg-icon`, HEAD
`5e1142c34b24a4136680b5bd255a9f3ba7e861de`, passed all five applicable gates:

- [x] Lint (`pnpm lint`) — PASS.
- [x] Format (`pnpm format:check`) — PASS.
- [x] Build (`pnpm build`) — PASS (3 static pages and sitemap).
- [x] Unit tests (`pnpm test:run`) — PASS (22 files, 144 tests; includes the
      existing SEO suites).
- [x] Accessibility (`pnpm test:a11y`) — PASS (4 files, 5 tests; rendered-HTML
      accessibility coverage passed).
- **SEO / rendered-page notes**: The existing SEO suites ran and passed as part
  of the reported unit-test run. The reported accessibility suite exercises
  rendered HTML and passed; no separate URL-based MCP audit result was supplied
  as part of this final-gate report.
- **Final gate evidence**: Exact latest Dev Lead results recorded above for the
  complete uncommitted feature increment at the stated branch revision. No gate
  defects reported; all five final gates pass.
