# Tasks

- **Updated:** 2026-10-06
- **Branch:** `spec/014-playwright-integration`
- **Base revision:** `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`
- **Plan approval:** Maintainer approved on 2026-10-06. Later documentation
  condensation/deduplication is explicitly outside this increment.
- **Active tasks:** 1 — T4 (Dev assigned; QA/rework remains active).
- **Execution:** T1 complete; T2 and T3D independent and concurrent; T3B follows
  verified T2 and T3D, then T4. Serialize QA sessions/evidence; parallelize
  independent browser tests through Playwright workers. No task branches or
  commits/pushes. Maintainer requested parallel delegation on 2026-10-06.
- **Models:** Dev and QA configured defaults, `openai/gpt-6-luna`, no override;
  cost-efficient for these scoped tasks. Actual model reported at handoff.

## Checklist and exact ownership

- [x] **T1 — Applied home component relocation and regression imports**
  - **Dependencies:** Maintainer approval of plan.
  - **Dev source ownership:** `src/components/home/ExperienceHistory.astro`,
    `src/components/home/ProfileIntroduction.astro`,
    `src/components/home/TechnologyBadges.astro`,
    `src/components/home/FloatingNav/FloatingNav.tsx`,
    `src/components/home/FloatingNav/helpers/navigation.ts`,
    `src/pages/index.astro`, `src/pages/experiencia/[slug].astro`; verify the
    applied deletions at `src/components/ExperienceHistory.astro`,
    `src/components/ProfileIntroduction.astro`,
    `src/components/TechnologyBadges.astro`,
    `src/components/FloatingNav/FloatingNav.tsx`, and
    `src/components/FloatingNav/helpers/navigation.ts` stay removed.
  - **Dev work:** Preserve maintainer's relocation and imports, correct only
    defects in this named source scope if found, and format assigned extant files.
    Report implementation without self-verification. Do not rename entry point,
    move shared components, edit content, tests, or atoms/molecules.
  - **QA test ownership:** `tests/unit/transitions.test.ts`,
    `tests/unit/company-icon.test.ts`, `tests/unit/section-headings.test.ts`,
    `tests/unit/button-design.test.ts` (correct stale imports);
    `tests/a11y/floating-nav.test.ts`,
    `tests/unit/floating-nav-threshold.test.tsx`,
    `tests/unit/floating-nav.test.tsx`, `tests/unit/navigation.test.ts` (review
    applied import changes and correct only if needed). Preserve all assertions.
    Maintainer-approved additional ownership: `tests/unit/agents.test.ts` to
    update obsolete model/version/prompt expectations against current rules,
    keeping semantic safeguards and without changing production guidance.
  - **Verification:** All five existing gates, SEO tests/sitemap, source/import
    comparison and unchanged routes. Integration not available until T2; record
    deferred browser verification, not a Markdown-only exemption.
  - **Criteria:** R9/AC9 structural and existing-suite evidence; final AC9 marker
    deferred until T3 browser coverage is verified.
  - **Latest QA report:** Approved by QA (`openai/gpt-6-luna`) on
    `spec/014-playwright-integration` at shared revision
    `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`, with the assigned T1 source,
    relocation, and test changes present as uncommitted working-tree changes.
    Dev scope: the five relocated files under `src/components/home/`, the five
    removed former paths, and `src/pages/index.astro` plus
    `src/pages/experiencia/[slug].astro`. QA test scope: the four corrected
    imports in `tests/unit/transitions.test.ts`, `tests/unit/company-icon.test.ts`,
    `tests/unit/section-headings.test.ts`, and `tests/unit/button-design.test.ts`;
    reviewed existing relocated imports in `tests/a11y/floating-nav.test.ts`,
    `tests/unit/floating-nav-threshold.test.tsx`,
    `tests/unit/floating-nav.test.tsx`, and `tests/unit/navigation.test.ts`; and,
    by explicit maintainer-approved T1 ownership expansion, reviewed and updated
    obsolete workflow expectations in `tests/unit/agents.test.ts`. No production
    files were edited by QA. Guidance checks now follow current agent model
    defaults, current Constitution §4.2/§5.1 and role boundaries; stale exact
    wording/version and broad static-permission expectations were replaced with
    current semantic role safeguards, without weakening them. Latest gates:
    `pnpm lint` PASS; `pnpm format:check` PASS; `pnpm build` PASS (3 routes);
    `pnpm test:run` PASS (22 files, 144 tests); `pnpm test:a11y` PASS (4 files,
    5 tests). SEO: `pnpm exec vitest run tests/seo` PASS (2 files, 5 tests),
    covering rendered title, description, canonical, and built detail metadata.
    Sitemap: build emitted `dist/sitemap-index.xml` and `dist/sitemap-0.xml`; both
    current experience routes were confirmed in the sitemap. Integration is not
    yet available in T1 and is explicitly deferred to T2/T3, not treated as a
    Markdown-only exemption. AC9 remains unmarked pending browser regression
    evidence in T3. No current T1 defects; QA approval.

- [x] **T2 — Playwright tooling and content-derived page integration tests**
  - **Dependencies:** T1 approved with evidence.
  - **Dev ownership:** `package.json`, `pnpm-lock.yaml`, `playwright.config.ts`,
    `vitest.config.ts`, `.gitignore`, `.prettierignore`, `eslint.config.js`,
    `opencode.json`. Only gate/runner/dependency isolation and generated-output
    exclusions; preserve unrelated configuration.
  - **Dev work:** Install approved test dependencies, remove `a11y-mcp` and its
    project MCP server, configure Chromium and build→managed Astro preview→tests,
    runner discovery separation, report/failure diagnostics and output ignores.
    Format all modified owned files before handoff; do not author tests.
  - **QA test ownership:** `tests/integration/helpers/content.ts`,
    `tests/integration/pages.spec.ts`, `tests/integration/profile.spec.ts`,
    `tests/integration/experience.spec.ts`, `tests/unit/integration-tooling.test.ts`.
  - **QA work:** Author expected values/routes from current content and tests
    for direct loads, profile image/social links, complete experience list and
    every detail/return flow. Verify discovery isolation and no external-site
    dependence. If a new parsing dependency/interface is needed, stop for approval.
  - **Verification:** All five existing gates plus `pnpm test:integration`;
    inspect Chromium-only setup, production-server lifecycle, current route list,
    ignored output, controlled test-failure/nonzero reporting and build-failure
    propagation without editing production config. Restore controlled failures
    and rerun passing. SEO tests/sitemap remain required.
  - **Criteria:** AC1–AC4, AC8; AC6 dependency removal partial evidence only.
  - **Latest QA report:** Approved by QA (`openai/gpt-6-luna`) on
    `spec/014-playwright-integration` at shared revision
    `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`, with the latest Dev configuration,
    existing T1/T3D work and QA-owned tests present as uncommitted changes. Dev
    scope: `package.json`, `pnpm-lock.yaml`, `playwright.config.ts`,
    `vitest.config.ts`, `.gitignore`, `.prettierignore`, `eslint.config.js`, and
    `opencode.json`. QA test scope: `tests/integration/helpers/content.ts`,
    `tests/integration/pages.spec.ts`, `tests/integration/profile.spec.ts`,
    `tests/integration/experience.spec.ts`, and
    `tests/unit/integration-tooling.test.ts`; the latter was strengthened to
    assert Astro's foreground environment and graceful SIGTERM cleanup settings.
    Actual installed Astro 7.3.5 source inspection confirms
    `ASTRO_PREVIEW_BACKGROUND` disables agent detection/auto-backgrounding in
    `dist/cli/preview/index.js` and sets `background: !!process.env...` in
    `dist/cli/preview/index.js`; the server CLI checks the env var in
    `dist/cli/server.js`. With the latest environment and Playwright
    `gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 }`, two consecutive
    normal `pnpm test:integration` invocations each built and passed all 3
    Chromium tests and each left no listener on 4321 and no `astro preview`
    process. Final restored `pnpm test:integration` also passed 3/3 and left no
    server. Content-derived route set and verified pages: `/`,
    `/experiencia/puesto-ejemplo-2022/`, and
    `/experiencia/puesto-ejemplo-2024/`. Browser checks passed for direct route
    loads/visible identifying detail content; profile name, headline, successfully
    loaded image, named social links and content-matching destinations without
    external navigation; and every experience entry's matching detail and return
    to visible `/#trayectoria`. A temporary QA-owned failing assertion produced
    identifiable diagnostics naming `pages.spec.ts` and `toBeHidden`, returned
    exit 1, and left no preview listener/process; the assertion was restored and
    the suite passed. Controlled nested build failure propagated exit 37. With a
    temporary QA-owned HTTP listener occupying 4321, the run failed clearly with
    “already used”/exit 1, left that fixture alive, and did not kill it; QA then
    stopped only its fixture. Generated `playwright-report/` and `test-results/`
    are ignored by Git. Gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 routes); `pnpm test:run` PASS (23 files, 146 tests);
    `pnpm test:a11y` PASS (4 files, 5 tests); `pnpm exec vitest run tests/seo`
    PASS (2 files, 5 tests); sitemap output PASS and contains all three routes.
    No current defects. T2 approved.

- [x] **T3D — Independent setup and coverage documentation**
  - **Dependencies:** T1 approved; independent of T2 implementation files.
  - **Dev ownership:** `README.md` only.
  - **Dev work:** Document Chromium setup, `pnpm test:integration`, built-site
    execution, diagnostics, actual coverage and the applied `home` component
    layout. Describe specified commands and coverage without claiming future
    execution success. Do not introduce unrelated cleanup. Format before handoff.
  - **QA ownership:** No tests; this task's latest evidence only, after other
    QA sessions finish. Verify documented specified behavior/setup and formatter.
  - **Verification:** Markdown-only outside content; `pnpm lint` and
    `pnpm format:check`. Build, unit, SEO, accessibility and integration not run
    under the Constitution §§5–6 exception. T2/T3B validate actual runner/coverage.
  - **Criteria:** AC1 documentation support; full runner criterion owned by T2.
  - **Latest QA report:** Verified and approved by QA (`openai/gpt-6-luna`)
    on `spec/014-playwright-integration` at shared revision
    `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`; the assigned README change is
    present as an uncommitted working-tree change. T3D scope verified: `README.md`
    only. The setup documents dependency installation, Chromium installation,
    Linux browser dependencies, and `pnpm test:integration`; it describes the
    build plus managed-preview workflow and the specified route, profile,
    experience, navigation, and axe coverage without claiming that tests have
    passed. Diagnostics defer exact output paths to the runner configuration and
    label conventional examples as non-guaranteed. The `home` component grouping
    and existing Vitest suites are also described. `pnpm lint` PASS;
    `pnpm format:check` PASS (README formatting unchanged). Build, unit, SEO,
    accessibility, and integration gates NOT RUN under the Markdown-only
    exception in Constitution §§5–6; T2/T3B own runner and actual coverage
    verification. No T3D documentation defects. No test or production files
    changed by QA; T3D approved.

- [x] **T3B — Browser navigation and axe audit verification**
  - **Dependencies:** T2 and T3D approved with evidence.
  - **Dev ownership:** `README.md`, limited to correcting coverage/diagnostics
    documentation if implementation reveals inaccuracies; preserve T3D work.
    No source/configuration edits authorized by this task. Format before handoff.
  - **QA test ownership:** `tests/integration/navigation.spec.ts`,
    `tests/integration/accessibility.spec.ts`; read-only reuse of
    `tests/integration/helpers/content.ts` from T2. If that helper needs edits,
    request explicit reassignment before editing.
  - **QA work:** Implement pointer/keyboard navigation, visible target and
    active-link assertions after hydration/detail return; browser axe on home
    and every content-derived detail route, required WCAG A/AA tags through 2.2.
    No sleeps, rule suppression, or weakened assertions. Report production defects
    to Lead for same-Dev rework in explicit assigned scope.
  - **Verification:** Task includes non-Markdown QA tests: all five existing
    gates plus integration, required keyboard/browser assertions, complete axe
    route set, README setup accuracy, existing SEO/sitemap checks.
  - **Criteria:** AC5, AC6; complete AC9 using T1 structural evidence plus passing
    browser regression coverage. AC7 remains pending governance/final evidence.
  - **Latest QA report:** Approved by QA (`openai/gpt-6-luna`) on shared branch
    `spec/014-playwright-integration`, revision
    `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`; all work remains uncommitted.
    Dev scope verified: `README.md` only. README now accurately describes the
    implemented pointer/keyboard navigation and browser axe coverage, fresh
    Chromium setup, managed build preview without a separately started server,
    and actual HTML report (`playwright-report/`) and failure diagnostic
    (`test-results/`) locations. Byte check confirms 0 NUL bytes, valid UTF-8,
    and a final newline; its diff from the base contains the expected increment
    documentation. QA test files: `tests/integration/navigation.spec.ts` and
    `tests/integration/accessibility.spec.ts`; read-only helper:
    `tests/integration/helpers/content.ts`. Navigation tests wait for hydration
    and assert pointer and Enter activation in both directions, URL fragments,
    target visibility, `aria-current="location"`, and active state after detail
    return. Axe audits run after homepage hydration and on every content-derived
    detail route with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa`
    tags, without rule suppression. Verified routes: `/`,
    `/experiencia/puesto-ejemplo-2022/`, and
    `/experiencia/puesto-ejemplo-2024/`. Latest gates: `pnpm lint` PASS;
    `pnpm format:check` PASS; `pnpm build` PASS (3 pages, sitemap generated);
    `pnpm test:run` PASS (23 files, 146 tests); `pnpm test:a11y` PASS (4 files,
    5 tests); `pnpm test:integration` PASS (5 Chromium tests); and
    `pnpm exec vitest run tests/seo` PASS (2 files, 5 tests). Sitemap includes
    `/` and both detail routes. `git check-ignore` confirms
    `playwright-report/index.html` and `test-results/.last-run.json` are ignored.
    AC5, AC6, and AC9 remain valid with their existing QA-backed markers and
    evidence. No current T3B defects; QA approval.

- [ ] **T4 — Approved constitutional amendment and consistent agent guidance**
  - **Dependencies:** T3B approved with evidence; explicit maintainer amendment
    approval recorded in conversation and current spec R7.
  - **Dev ownership:** `docs/constitution.md`, `AGENTS.md`, `specs/README.md`,
    `.opencode/agents/qa.md`, `.opencode/agents/dev-lead.md`.
  - **Dev work:** Increment version/date; adopt integration applicability and
    mandatory gate; approved Playwright/browser axe stack; remove accessibility
    MCP gate alternatives; align summaries and QA/Lead instructions. Keep
    Markdown-only exception, permissions/models and closure boundaries intact.
    Format only assigned files before handoff.
  - **QA test ownership:** `tests/unit/agents.test.ts` and
    `tests/unit/integration-governance.test.ts`; preserve unrelated assertions and
    test role/gate consistency. Reload affected QA prompt before verification.
  - **Verification:** All five existing gates plus integration (task includes
    non-Markdown QA tests); amendment and guidance requirement checks, SEO tests
    and sitemap. Lead reloads amended guidance before final-gate work.
  - **Criteria:** AC7 governance/task evidence; its marker is deferred until
    passing final-gate evidence is recorded. All remaining criteria must already
    have QA evidence and markers before closure.
  - **Latest QA report:** Verified by QA (`openai/gpt-6-luna`) on shared branch
    `spec/014-playwright-integration` at revision
    `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`, with the complete feature still
    present as uncommitted changes. T4 Dev scope verified: `docs/constitution.md`,
    `AGENTS.md`, `specs/README.md`, `.opencode/agents/qa.md`, and
    `.opencode/agents/dev-lead.md`; QA test scope: `tests/unit/agents.test.ts`
    and `tests/unit/integration-governance.test.ts`. Constitution is version
    1.10.0, dated 2026-10-06, and defines integration applicability for rendering,
    routes, content, styles, client behavior, browser-complex components, and
    integration suite/tooling; other scopes require explicit non-applicability.
    The Markdown-only exception excludes integration, approved browser tooling
    uses Playwright Test/Chromium and `@axe-core/playwright` with applicable WCAG
    A/AA tags through 2.2 while retaining Vitest axe checks, QA owns integration
    tests and task evidence, and the Lead owns applicable final gates. Current
    QA/Lead prompts and operational summaries align; models, permissions,
    historical access, and closure safeguards remain constrained. Tests check
    the amended gate policy across constitution/guidance and retain agent-role
    safeguards. Latest gates: `pnpm lint` PASS; `pnpm format:check` PASS;
    `pnpm build` PASS (3 pages); `pnpm test:run` PASS (24 files, 149 tests);
    `pnpm test:a11y` PASS (4 files, 5 tests); `pnpm test:integration` PASS
    (5 Chromium tests); `pnpm exec vitest run tests/seo` PASS (2 files, 5 tests).
    Sitemap build output PASS; `dist/sitemap-index.xml` exists and sitemap URLs
    include `/` and both current experience routes. Integration applies to this
    increment because page behavior and integration tooling/tests changed; the
    Markdown-only exception does not apply. No current T4 defects. Task approval
    granted. AC7 marker recorded on 2026-10-07 with passing final-gate results supplied by the Lead; all criteria have QA-backed completion and every task has QA approval and evidence.

## Evidence rules

Each task remains active through Dev, QA, evidence and rework. QA writes only the
assigned task's latest report here and evidence-backed acceptance markers in the
current spec. Reports name exact touched files, actual model, branch/revision,
uncommitted scope, commands/results, gate applicability, approval or defects.
Lead controls checklist completion after QA approval/evidence. Serialize evidence
updates and never overwrite another agent's work.

Source/configuration defects return to the same Dev. QA owns all test corrections;
Lead never implements. New file scope or material choices require explicit
authorization before edits. No completed spec reads/writes are authorized.

## Final feature gates

**Status:** RUN AND PASS by the Lead on 2026-10-07. Complete feature change set
includes source, configuration, tests, and guidance; the Markdown-only
exception does not apply. Integration applies (page rendering, routing, client
behavior, integration suite/tooling). All results below are the latest and
supplied to QA for final evidence recording while the increment is active.

| Gate | Command | Result |
| --- | --- | --- |
| Lint | `pnpm lint` | PASS |
| Format | `pnpm format:check` | PASS — all matched files use Prettier code style |
| Build | `pnpm build` | PASS — 3 pages built, `dist/sitemap-index.xml` generated |
| Unit tests | `pnpm test:run` | PASS — 24 files, 149 tests |
| Accessibility | `pnpm test:a11y` | PASS — 4 files, 5 tests |
| Integration | `pnpm test:integration` | PASS — 5 Chromium tests, 2 workers, managed preview cleanup confirmed |
| SEO | `pnpm exec vitest run tests/seo` | PASS — 2 files, 5 tests |
| Sitemap | `pnpm build` output | PASS — `dist/sitemap-index.xml` contains `/` and both content-derived experience routes |
| Ignored outputs | `git check-ignore` | PASS — `playwright-report/` and `test-results/` ignored |

**Latest final-gate QA report:** Pending QA recording. Before closure, QA records
this final passing report, finishes the remaining evidence-backed criterion
markers (AC7), and the Lead writes `summary.md` and closes the directory
metadata. Closure metadata is the last directory edit; subsequent actual Git
outcomes are reported externally.
