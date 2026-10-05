# Plan — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Last updated**: 2026-10-05

## Approach

First align the Dev and QA agents' edit-tool permissions with their established
responsibilities, without changing role instructions, file-scope ownership, or
Git restrictions. Then move the existing modules, retaining file contents and
exported contracts while updating application and test imports. Keep the content
schema and content utility modules together under `src/content/parsers/`. Give
the floating navigation component its own directory and place its navigation
helper under that component's `helpers/` directory. Update the README path and,
after implementation, refresh the related summaries for `004-portfolio-home` and
`007-workflow-changes`. Do not rewrite historical spec files or evidence.

Tasks are serialized. T1 changes the agent configuration and its QA-owned agent
consistency test. T2 and T3 both change `src/pages/index.astro`; T3 depends on T2
being QA-approved to avoid concurrent edits. T2 also depends on T1 because the
new Dev edit permissions are needed before source implementation begins.

The shared branch `spec/008-lib-reorganization` was created from `main` and
published to `origin` before planning artifacts were written. Dev and QA use this
branch; no task branches, commits, or pushes are permitted.

## Files to change

- `src/components/FloatingNav.tsx` →
  `src/components/FloatingNav/FloatingNav.tsx` — relocate the component without
  changing its exports, props, behavior, or explicit homepage hydration.
- `src/lib/navigation.ts` →
  `src/components/FloatingNav/helpers/navigation.ts` — relocate the helper and
  preserve all exports and behavior.
- `src/lib/content.ts` → `src/content/parsers/content.ts` — relocate existing
  content utility exports without changing their algorithms.
- `src/lib/content-schema.ts` → `src/content/parsers/content-schema.ts` — relocate
  existing schemas and types without changing validation.
- `src/pages/index.astro` — update imports for the relocated navigator and content
  utilities.
- `src/content.config.ts`, `src/components/ExperienceHistory.astro`,
  `src/components/ProfileIntroduction.astro`, and
  `src/pages/experiencia/[slug].astro` — update imports for the relocated content
  parsers, schemas, and types.
- `tests/unit/floating-nav.test.tsx`,
  `tests/unit/floating-nav-threshold.test.tsx`,
  `tests/a11y/floating-nav.test.ts`, and `tests/unit/navigation.test.ts` — QA
  updates imports for the relocated navigator and navigation helper; preserve
  assertions.
- `tests/unit/content.test.ts`, `tests/unit/company-icon.test.ts`, and
  `tests/unit/experience.test.ts` — QA updates imports for relocated content
  modules; preserve assertions.
- `tests/unit/agents.test.ts` — QA updates permission-configuration assertions
  without weakening existing workflow checks.
- `.opencode/agents/dev.md` — Dev updates edit permissions to allow any assigned
  repository path except `tests/**` and `specs/**`; preserve shell and role
  restrictions.
- `.opencode/agents/qa.md` — Dev updates edit permissions to allow `tests/**` and
  assigned `specs/*/tasks.md` evidence only; preserve all other restrictions.
- `README.md` — Dev updates the content schema path.
- `specs/004-portfolio-home/summary.md` and
  `specs/007-workflow-changes/summary.md` — the Dev Lead refreshes their dates and
  `Related specs` records to describe the respective impacts. Do not change either
  historical `spec.md` or existing evidence.
- `specs/008-lib-reorganization/tasks.md` and `summary.md` — record QA evidence
  and final feature summary. The current feature's `spec.md` is owned by the Spec
  Refiner and must not be edited by the Dev Lead.

No other files are in scope. In particular, unrelated contents of `src/lib/`,
`src/components/`, and historical specs/evidence stay untouched.

## Key decisions

- **Destination paths and module scope — maintainer-approved:** Put
  `content.ts` and `content-schema.ts` together under
  `src/content/parsers/`; move the full existing `navigation.ts` module to
  `src/components/FloatingNav/helpers/navigation.ts`; place the component at
  `src/components/FloatingNav/FloatingNav.tsx`.
- **Compatibility — maintainer-approved:** Preserve exported names, signatures,
  and behavior, but update consumers to the new locations and do not add legacy
  re-exports under `src/lib/`.
- **Scope — maintainer-approved:** Relocate existing modules and update
  application/test imports and the README's schema path, plus align the Dev/QA
  edit-tool permissions as required by this spec. Do not change UI, schemas,
  algorithms, hydration, or the agents' role/branch/commit authority.
- **Tool permissions — maintainer-approved:** Dev's effective edit permission
  covers repository paths except `tests/**` and `specs/**`; QA's effective edit
  permission covers `tests/**` and assigned `specs/*/tasks.md` evidence. Existing
  instructions still limit actual edits to assigned task scope and retain role,
  branch, and commit/push restrictions.
- **Task sequencing:** T1 owns permission configuration and its QA-owned agent
  consistency test. T2 owns the FloatingNav/navigation move, including its
  `src/pages/index.astro` import. T3 owns the content module move, content
  imports, and README path. T2 follows T1 QA, and T3 follows T2 QA because the
  page file is shared. The Lead maintains the affected summaries after task QA.
- **Models:** Use the configured `openrouter/openai/gpt-6-luna#medium` default for
  all Dev and QA assignments. The tasks have explicit file ownership and
  regression suites; a model override is not warranted.

## Risks

- **Missed relative import after moving a module.** Mitigation: enumerate active
  source and test consumers in the task scopes, search for the old paths, and run
  the full test suite and build.
- **Relative paths inside relocated files become invalid.** Mitigation: verify
  the content utility's schema import remains valid when both modules move
  together, update the navigator's helper import, and review build output.
- **Accidental behavior drift in a pure move.** Mitigation: keep module bodies
  unchanged except necessary relative/import-path edits and run existing focused
  tests without weakening assertions.
- **Concurrent edits to `src/pages/index.astro`.** Mitigation: do not assign T2
  until T1 is approved and T3 until T2 has QA approval and evidence.
- **Permission changes accidentally expand role authority.** Mitigation: preserve
  Dev's no-tests/no-specs, assigned-scope, and Git restrictions; preserve QA's
  production/planning restrictions and grant task-file access only for evidence.
- **Stale documentation or spec history.** Mitigation: update the README and the
  `004`/`007` summary relationship records only; retain historical `spec.md` and
  evidence unchanged.

## Testing strategy

- **Focused unit/component tests:** T1 covers agent permission configuration and
  role boundaries (`tests/unit/agents.test.ts`); T2 runs navigation and
  FloatingNav coverage; T3 runs content schema, content utility, company-icon,
  and experience coverage. QA owns all test edits. Each QA report records the full
  `pnpm test:run` result so unit and SEO suites are evidenced.
- **SEO checks:** There are no intended rendered or metadata changes. Verify
  `pnpm test:run` continues to pass the existing SEO tests for home and experience
  routes; record that the scope did not change SEO behavior.
- **Accessibility checks:** Run `pnpm test:a11y` for each task's QA evidence and
  record that the HTML and interaction behavior are unchanged. No browser visual
  redesign or manual visual check is required for this path-only refactor.
- **Structural checks:** Confirm destination files exist, old module files and
  compatibility re-exports are absent, active imports no longer reference the
  removed paths, and the README names the new schema path. Verify effective Dev
  and QA edit permissions against representative allowed/denied paths and assert
  the permission contracts in the existing agent tests.
- **Final constitutional gates:** After all three tasks are QA-approved and evidence
  is recorded, run `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y`. Commit/push only after all gates pass,
  using the repository's commit skill.
