# Playwright integration testing

- **Spec ID**: `014-playwright-integration`
- **Status**: done
- **Last updated**: 2026-10-07

## Context

Browser integration verification currently relies on agent-driven Chrome MCP
checks rather than a repository-owned, repeatable integration suite. The
repository has Vitest unit/component, SEO, and accessibility tests, but no
Playwright Test dependency or integration command. Its current pages are the
home page and the experience detail pages generated from content collections.

The maintainer approved Playwright Test with Chromium, coverage of every page,
the profile and experience sections, and the floating navigation. QA will author
and validate integration tests. Accessibility checks will use axe-core in the
browser, replacing the accessibility MCP dependency while retaining existing
Vitest checks. Chrome MCP may remain available for exploratory manual checks,
but is not integration-test evidence or a prerequisite for running the suite.

The maintainer also approved amending the verification gates and approved tooling
in the [Constitution](../../docs/constitution.md), including §§5–6 and §10, and
updating affected guidance. The amendment must be adopted before the new workflow
is treated as binding. Existing constitutional constraints remain applicable.

During refinement, the maintainer also applied component grouping under
`src/components/home/`. This increment includes that existing working-tree
change and its verification, rather than a further organizational redesign.
`ExperienceHistory.astro`, `ProfileIntroduction.astro`, `TechnologyBadges.astro`,
and the complete `FloatingNav/` directory moved there. The inspected component
changes are limited to relocation and import paths. `TechnologyBadges` remains
shared with the experience detail page despite its location under `home`.
The actual entry point remains `src/pages/index.astro`, serving `/`; no
`portfolio.astro` entry or new route has been introduced.

## Goals

- Make browser integration checks reproducible through Playwright Test.
- Cover real page navigation and component behavior that browserless unit tests
  cannot establish sufficiently.
- Make applicable integration verification an obligatory QA and closure gate.
- Run automated accessibility checks against real rendered browser pages.
- Preserve and verify the maintainer's applied component grouping without changing
  existing routes or behavior.

## Non-goals

- Replacing Vitest unit/component, SEO, or existing accessibility tests.
- Firefox, WebKit, visual snapshot testing, or exhaustive viewport coverage.
- Testing external social websites or requiring their network availability.
- Changing portfolio content, UI behavior, or the global visual design.
- Adding a Playwright MCP server or requiring any MCP server to execute tests.
- Adding CI infrastructure or changing agent ownership boundaries.
- Further component reorganization, relocating components under `src/pages/`,
  renaming the home entry point, or introducing `/portfolio` or a redirect.

## Requirements

- **R1 — Runner and command:** Add Playwright Test and a Chromium-only project.
  `pnpm test:integration` must build the site, serve the resulting static build,
  and run the integration suite without a manually started server or Chrome MCP.
  Build or test failure must produce a nonzero exit status. Document dependency
  and Chromium installation and the execution command for a fresh checkout.
- **R2 — Every page:** Cover `/` and every generated
  `/experiencia/[slug]/` route, including direct navigation to detail pages.
  Derive the expected detail-route set from current experience content, not a
  hardcoded subset. Verify successful loading and visible page-specific content;
  a status-code assertion alone is insufficient.
- **R3 — Profile section:** On the home page, verify visible profile identity and
  headline, successful loading of the profile image, and social links with
  accessible names and destinations matching current profile content. Do not
  navigate to or request the external destinations to establish correctness.
- **R4 — Experience section and navigation:** Verify that the experience list
  contains all current experience entries with their identifying role/company
  content and working detail links. For every entry, follow its link, verify the
  corresponding detail content, then use the return link to reach
  `/#trayectoria` with the experience section in view.
- **R5 — Floating navigation:** Verify the hydrated floating navigation between
  profile (`#inicio`) and experience (`#trayectoria`): activating either link
  updates the fragment, brings the target into view, and reflects the active
  section through `aria-current="location"`. Cover keyboard activation as well
  as pointer activation and confirm the experience link is active after returning
  from a detail page.
- **R6 — Browser accessibility:** Use `@axe-core/playwright` to audit every page
  in R2, with the home-page audit performed after navigation hydration. Enable
  the axe WCAG A/AA tags applicable through WCAG 2.2 and fail on reported
  violations. These automated checks do not establish complete WCAG conformance;
  keyboard interaction coverage in R5 remains required. Remove the repository's
  accessibility MCP server configuration and its dedicated `a11y-mcp`
  dependency, while retaining `axe-core` and existing Vitest accessibility tests.
- **R7 — Mandatory gate and guidance:** Adopt the approved constitutional
  amendment to add `pnpm test:integration` as a required gate for tasks affecting
  pages or browser-dependent complex components, and for final closure of any
  increment affecting those areas. Page rendering, routing, content, styles, and
  client behavior changes affecting these areas are included. A complex component
  is one whose user-visible behavior needs a real browser to verify sufficiently
  (for example hydration, scrolling, focus, or navigation). Integration is also
  required when the integration suite or its tooling changes, including this
  increment. For other scopes, record why the gate is not applicable; preserve
  the existing Markdown-only exception. Update affected agent instructions and
  operational guidance consistently, with QA owning integration test creation,
  maintenance, execution, and task evidence, and the Lead running the applicable
  final gate. Include Playwright Test and browser axe tooling in the approved
  stack, and remove accessibility MCP as a required or alternative gate tool.
- **R8 — Suite separation and reliable evidence:** Keep Playwright integration
  tests under `tests/integration/`, outside Vitest discovery, without weakening
  existing suites or gates. Use browser-observable assertions and Playwright's
  waiting mechanisms rather than fixed sleeps. Produce a test report and failure
  diagnostics identifying the failed test; generated results must not be tracked
  in Git. QA evidence must state the command, current route coverage, results,
  and any defects rather than substituting manual MCP observations.
- **R9 — Applied component grouping:** Preserve the maintainer's grouping of
  `ExperienceHistory.astro`, `ProfileIntroduction.astro`, `TechnologyBadges.astro`,
  and `FloatingNav/` (including its navigation helper) under
  `src/components/home/`. Keep shared atoms and molecules in their existing
  directories. Both the home page and experience detail page must resolve their
  imports to the relocated files; the detail page continues to consume
  `home/TechnologyBadges.astro`. Update test imports to resolve relocated
  components without weakening assertions. This relocation must preserve
  rendering, navigation, and public routes. Keep `src/pages/index.astro` as the
  `/` entry and all auxiliary components outside `src/pages/`.

## Acceptance criteria

- [x] **AC1 (R1):** Following the documented setup on a checkout without a running server, `pnpm test:integration` builds and tests the static site using only the configured Chromium project. Build and assertion failures propagate a nonzero exit status.
- [x] **AC2 (R2):** The suite loads `/` and every detail route derived from the current content, verifying visible page-specific content on direct loads; no generated experience route is omitted.
- [x] **AC3 (R3):** Browser tests verify the profile identity, headline, loaded image, and named social links against current content without depending on external sites.
- [x] **AC4 (R4):** Browser tests verify the complete experience list and successfully navigate from each entry to its matching detail page and back to the visible home experience section at `/#trayectoria`.
- [x] **AC5 (R5):** Pointer and keyboard activation of floating-navigation links verify the target fragment, section visibility, and active-link semantics for profile and experience, including the active experience link after detail-page return.
- [x] **AC6 (R6):** Browser axe audits pass on every covered page with the required WCAG tags. Existing Vitest accessibility tests remain intact, and the dedicated accessibility MCP configuration and dependency are removed.
- [x] **AC7 (R7):** The versioned constitutional amendment and affected guidance consistently define the integration gate, applicability, explicit non-applicability reporting, approved tooling, QA test ownership, and Lead final-gate responsibility. QA and final-gate evidence for this increment include a passing integration run, verified by the Lead on 2026-10-07.
- [x] **AC8 (R8):** Playwright tests are excluded from Vitest discovery, existing suites still pass, and a controlled failing integration assertion yields an identifiable failed-test report and nonzero exit status. Generated reports/results remain untracked, and QA records route coverage and current results.
- [x] **AC9 (R9):** The relocated components and helper exist under `src/components/home/`, with their former files removed and all importing source/test files resolving correctly. Atoms and molecules retain their existing locations, `/` and the experience routes are unchanged, and existing tests, build, and browser integration checks pass without weakened assertions.

## Verification

### Ownership and feasibility

The current [Dev](../../.opencode/agents/dev.md),
[QA](../../.opencode/agents/qa.md), and
[Dev Lead](../../.opencode/agents/dev-lead.md) prompts permit the following
division without transferring test or production-file ownership:

- **Dev:** dependency/configuration changes in `package.json`, `pnpm-lock.yaml`,
  `playwright.config.ts`, `vitest.config.ts`, `.gitignore`, and `opencode.json`;
  the approved amendment in `docs/constitution.md`; affected guidance in
  `AGENTS.md`, root `README.md` if applicable, `.opencode/agents/qa.md`, and
  `.opencode/agents/dev-lead.md`. The Lead must name the exact assigned paths in
  the plan before delegation. Dev does not author integration tests.
- **Applied source changes:** The maintainer has already changed the named files
  in `src/components/home/`, removed their former paths, and updated
  `src/pages/index.astro` and `src/pages/experiencia/[slug].astro`. Any source
  corrections must be assigned to Dev with exact file ownership, not made by QA
  or the Spec Refiner. Preserve the maintainer's work.
- **QA:** assigned integration tests and helpers under `tests/integration/`,
  assigned verification tests for tooling/guidance where needed under `tests/`,
  task evidence, and verified acceptance markers. QA can author and execute
  Playwright tests under current test-file permissions, but cannot edit runner
  configuration, package management, or agent definitions.
  Relocation verification includes the updated
  `tests/a11y/floating-nav.test.ts`,
  `tests/unit/floating-nav-threshold.test.tsx`,
  `tests/unit/floating-nav.test.tsx`, and `tests/unit/navigation.test.ts`, plus
  import corrections in `tests/unit/transitions.test.ts`,
  `tests/unit/company-icon.test.ts`, `tests/unit/section-headings.test.ts`, and
  `tests/unit/button-design.test.ts`. These last four still import removed
  component paths in the inspected working tree and require QA correction before
  verification can pass. Path strings used only as permission-policy examples
  in `tests/unit/agents.test.ts` are not component imports.
- **Dev Lead:** planning, exact task ownership, final applicable gate execution,
  and closure under the linked constitution and current prompt.

The amendment and guidance adoption must precede verification under the updated
mandatory-gate instructions. Updated affected prompts must be loaded for their
subsequent work. No new file/tool authority or historical-spec access is needed.

### Criterion verification

| Criteria | Verification method                                                                                                                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1      | QA follows the documented install/setup, runs the command without a pre-existing server, inspects the Chromium-only configuration, and verifies command failure propagation.                                                                                                      |
| AC2      | QA compares discovered tests/routes with the current content-derived route set and runs direct-load browser assertions for each page.                                                                                                                                             |
| AC3      | QA runs profile browser assertions against current profile content and confirms no external-site navigation is required.                                                                                                                                                          |
| AC4      | QA runs the complete entry-to-detail-to-home navigation tests and checks content identity, URL fragment, and section visibility.                                                                                                                                                  |
| AC5      | QA runs pointer and keyboard tests after hydration, asserting fragment, target visibility, and active-link semantics.                                                                                                                                                             |
| AC6      | QA inspects axe tag configuration, runs browser audits on all routes and existing `pnpm test:a11y`, and verifies removal of the dedicated MCP configuration/dependency.                                                                                                           |
| AC7      | QA checks amendment version/date and consistent gate definitions and ownership in affected guidance; records task evidence and the Lead's latest final integration result.                                                                                                        |
| AC8      | QA checks runner discovery isolation, runs existing Vitest suites, and temporarily introduces a failing assertion in a QA-owned integration test to verify reporting and exit status, then restores it and reruns successfully. QA verifies generated outputs are ignored by Git. |
| AC9      | QA reviews moved files and source/test imports, corrects the named stale test imports, and runs the existing suites, build, and integration gate to verify unchanged routes and behavior.                                                                                         |

Run applicable existing gates under the
[Constitution](../../docs/constitution.md#6-quality-gates), plus the approved
integration gate once adopted. SEO verification continues through existing
rendered-HTML tests and sitemap build checks; this increment does not replace
them. Record latest verification evidence in the assigned current `tasks.md`.
This spec leaves all acceptance markers pending for QA.
