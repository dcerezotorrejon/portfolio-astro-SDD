# Technical plan

- **Date:** 2026-10-06
- **Status:** Approved by the maintainer on 2026-10-06; T1/T2/T3D/T3B verified, T4 active.
- **Branch:** `spec/014-playwright-integration` (created and published).
- **Base:** `main` at `ae5c691b02bebe99d7b85dd1ead5aa51c5fda25a`.

## Scope and approved decisions

Implement the current [spec](./spec.md), including the maintainer's existing
uncommitted component relocation. Preserve `/`, the experience detail routes,
and all existing behavior. Do not introduce `Portfolio.astro`, `/portfolio`,
redirects, a new component organization, or UI changes.

The maintainer approved Playwright Test, Chromium only, tests of every page and
the profile/experience sections, floating navigation, browser axe checks, and
mandatory applicable integration verification owned by QA. The approved
constitutional amendment covers §§5–6 and §10 and consistent dependent guidance.
Remove the project accessibility MCP configuration and `a11y-mcp` dependency;
retain existing Vitest accessibility/SEO checks and `axe-core`. Do not modify
global Chrome MCP configuration or unrelated OpenCode provider settings.

No additional dependencies, interfaces, or architectural changes are authorized.
If implementation requires a material choice beyond the agreed stack and current
conventions, stop and obtain approval before affected work proceeds.

The maintainer authorized QA on 2026-10-06 to expand T1 to review and correct
obsolete expectations in `tests/unit/agents.test.ts` against the current
constitution and prompts, without changing rules to satisfy tests or weakening
their safeguards. The maintainer also confirmed the unexpected staging was
their own action and subsequently removed it; read-only Git inspection confirms
the index is empty. Preserve all existing working-tree changes and resume T1.
The later request to condense/deduplicate operational documents is not in scope.

## Approach

### 1. Preserve and verify applied relocation

The applied source changes move five files into `src/components/home/` and
update home/detail imports. Dev reviews its assigned source paths and formats
them without reorganizing or reverting maintainer work. QA corrects four stale
component imports and checks the four already updated tests without weakening
assertions. `TechnologyBadges` deliberately remains in `home` and shared with
the detail page. Atoms/molecules are unchanged. Route and browser regression
coverage will also verify this relocation when the runner is available.

### 2. Repository-owned browser runner and page coverage

Dev adds `@playwright/test` and `@axe-core/playwright` as development dependencies,
removes the dedicated MCP dependency/server, and introduces
`playwright.config.ts`. Use Astro's existing production build and preview
commands: `pnpm test:integration` must build first, then Playwright manages a
local preview server, including startup and shutdown. Do not reuse an arbitrary
already running server or stale build. Configure only Chromium and a loopback
base URL; server conflicts must fail clearly, not test unrelated content.

Keep Vitest's existing discovery separate from `tests/integration/`. Ignore
Playwright reports/results in Git, ESLint, and Prettier without ignoring tests
or source. Retain failure diagnostics and an identifiable test report.

QA authors a content-derived expectation helper and tests for direct page loads,
profile content/image/social destinations, every experience link/detail/return,
and suite isolation. Expected experience routes must come from current Markdown
content, not merely the DOM links being tested. Do not add a frontmatter-parser
dependency or a custom production endpoint without a separate approved decision.
QA should flag any inability to read the current content using the approved
stack/conventions instead of inventing an interface.

### 3. Browser-dependent interactions and accessibility

QA adds floating-navigation pointer/keyboard tests and verifies fragments,
viewport intersection, `aria-current`, hydration, and detail-return state. Use
Playwright assertions and browser readiness signals instead of fixed sleeps.
Test external-link attributes without opening third-party sites.

Use `@axe-core/playwright` against the home after hydration and all generated
detail routes, with applicable WCAG A/AA tags through 2.2. Do not disable failing
rules or weaken assertions to obtain a pass. Any genuine production defect is
reported to the same assigned Dev; changes outside named ownership require
explicit reassignment and, if substantive, Spec Refiner re-anchoring.

Dev documents setup, Chromium installation, invocation, coverage, diagnostics,
and the existing component layout in `README.md`. Browser-download/system-library
or network failures are blockers, not skipped gates.

### 4. Adopt approved governance changes

After the runner and suite work, Dev applies the approved amendment, increments
the constitution version, and uses the actual amendment date. Align `AGENTS.md`,
`specs/README.md`, and the QA/Lead prompts without changing models, permissions,
historical-access rules, freeze/closure authority, or Dev's test prohibition.

The integration gate applies to page/complex browser-component changes and
integration tooling/tests; non-applicability must be recorded explicitly. The
existing Markdown-only exception remains intact. Remove accessibility MCP as a
gate alternative while preserving Vitest accessibility verification. QA owns
test implementation/maintenance and task runs; Lead owns final gate execution.
Reload updated role guidance before subsequent work under it.

Before adoption, integration runs for this feature are specification-required
verification, not an assertion that the unamended constitution already mandates
the new command. After adoption, the new gate is binding for applicable work.

## Ownership and sequencing

Exact file ownership, dependencies, criterion mapping, and evidence are in
[tasks.md](./tasks.md). On 2026-10-06 the maintainer requested parallel delegation.
Split documentation from browser QA: T2 tooling and T3D documentation implement
concurrently with disjoint files and no unfinished dependency between them.
T3D describes approved setup/coverage without depending on test implementation or
claiming success. T3B browser navigation/axe follows both approvals; T4 follows
T3B. Every Dev handoff is independently reviewed by QA. Serialize QA sessions
because their evidence files overlap; do not exceed four active tasks including
verification/rework. Browser cases with isolated contexts may run in parallel
within one Playwright invocation using bounded workers and one managed preview
server. Do not run conflicting concurrent builds or preview processes.

All subagents use their configured default `openai/gpt-6-luna`, without an
override: scoped relocation, configuration, documentation, and tests do not
justify extra cost. Record actual models and results in each task report.

## Risks and trade-offs

- Applied changes include tracked deletions and untracked replacements; assess
  the complete increment against the base, never just tracked/staged diffs.
- Four stale test imports currently prevent a clean unit baseline. Resolve them
  through QA, preserving existing test logic and maintainer edits.
- Hydration, scroll animation, viewport geometry, and focus require readiness
  assertions. Browserless unit tests alone cannot establish those behaviors.
- Browser axe may expose violations missed by jsdom. Report defects; no blanket
  exclusions or automatic claim of complete WCAG conformance.
- Chromium-only coverage is intentionally narrower and faster than cross-browser
  coverage; no Firefox/WebKit project or exhaustive viewport matrix is in scope.
- A suite command rebuilding each time costs time but prevents stale-site evidence.
- Narrow source-derived test expectations must remain correct for the schema;
  avoid relying on undeclared transitive packages or a brittle silent fallback.

## Verification and closure

QA records only the latest report for each task, including failures, revision,
uncommitted scope, exact commands, applicability, defects, and approvals. Full
task gates apply whenever the task includes source/configuration/tests. Browser
integration runs are required as soon as the runner exists for this increment.
Task 1 records integration as not yet available and deferred to later feature
verification, without claiming AC9 complete.

For final closure, the full increment is not Markdown-only: run `pnpm lint`,
`pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and
`pnpm test:integration`. Verify existing SEO tests and sitemap output. QA also
checks failure propagation and ignored reports using controlled QA-owned failing
assertions, restoring tests and rerunning successfully before approval.

Finalize plan, task checklist, summary, criterion markers, and QA's latest final
gate evidence while active. Resolve any substantive re-anchoring with Spec
Refiner. Only after every prerequisite passes does Lead set closure metadata,
then use the commit skill for feature commit(s)/push. No task commits/pushes.
Ask for new affirmative merge permission after successful final push; keep the
shared branch and report later Git outcomes externally, not in frozen artifacts.
