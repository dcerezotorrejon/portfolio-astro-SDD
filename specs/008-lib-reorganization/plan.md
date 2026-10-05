# Plan — Library Module Reorganization

- **Spec ID**: `008-lib-reorganization`
- **Last updated**: 2026-10-06

## Approach

T1–T3 (agent edit permissions and library-module relocations) and T4 (the
constitutional amendment and workflow-guidance alignment) are complete,
QA-approved, and recorded in `tasks.md`. Their implementation is on the published
shared branch. The maintainer has since approved R11: QA may change only a verified
acceptance criterion's checkbox in the assigned current spec, after recording its
evidence. This requires one bounded follow-up task, T5, to align the QA prompt,
effective edit rules, tests, and task ownership with that permission.

The Constitution and Dev Lead prompt do not need further changes for R11: §5.1
already permits QA to update tests and task evidence while prohibiting production
edits, and the Lead's existing `spec.md` denial and no-spec-edit rule remain
correct. QA verifies the documented final-handoff procedure and acceptance
criteria before the Lead's final commit/push; there is no post-push QA task. After
the successful final push, the Lead explicitly asks the maintainer to merge the
branch into `main` and does not perform the merge or delete the branch.

T5 depends on the approved plan and completed T4. After T5 QA approval and
evidence, the Lead updates the final summary, reruns all five quality gates on the
integrated tree, then performs the final commit/push. No task-level commits or
pushes are permitted.

The shared branch `spec/008-lib-reorganization` already exists and is published
to `origin`. All follow-up work remains on this branch; no task branches, commits,
or pushes are allowed before all task QA and gates are complete.

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
- `docs/constitution.md` — condense §5.1 while preserving all binding safeguards;
  bump version `1.4.0` to `1.5.0` and set the actual amendment date.
- `AGENTS.md` — preserve existing operational details and add the explicit
  post-push maintainer merge request to the final-handoff instructions.
- `.opencode/agents/dev-lead.md` — add the required merge request after final
  commit/push; keep the prohibition on executing the merge or deleting the branch.
- `.opencode/agents/{spec-refiner,dev,qa}.md` — review for consistency with the
  condensed constitutional rules and edit only if necessary; retain existing
  correct role-specific workflow instructions.
- `tests/unit/agents.test.ts` — QA updates constitution-version, policy, agent
  boundary, and final-handoff assertions.
- `.opencode/agents/dev.md` — Dev updates edit permissions to allow any assigned
  repository path except `tests/**` and `specs/**`; preserve shell and role
  restrictions.
- `.opencode/agents/qa.md` — Dev updates edit permissions to allow `tests/**` and
  assigned `specs/*/tasks.md` evidence and the assigned current `spec.md` for
  checkbox-only acceptance-status updates. The QA prompt limits actual spec edits
  to evidence-backed `[ ]`→`[x]` changes in the assigned current spec and preserves
  all other restrictions.
- `AGENTS.md` — clarify that QA may mark only evidence-backed acceptance checkboxes
  in the assigned current spec; retain all task, role, branch, and commit/push
  boundaries.
- `specs/008-lib-reorganization/spec.md` — QA may change only verified acceptance
  checkbox markers in the assigned current spec; the Spec Refiner retains wording
  and metadata/status ownership. No other spec text may be edited by QA.
- `specs/008-lib-reorganization/plan.md` and `tasks.md` — Dev Lead plans T5 and
  owns its assignment and evidence coordination.
- `specs/008-lib-reorganization/summary.md` — Dev Lead records final verified
  scope and resolved spec relationships after T5.
- `README.md` — Dev updates the content schema path.
- `specs/001-sdd-baseline/summary.md`,
  `specs/003-agent-workflow/summary.md`,
  `specs/004-portfolio-home/summary.md`, and
  `specs/007-workflow-changes/summary.md` — the Dev Lead refreshes dates and
  `Related specs` records for their respective impacts. Do not change historical
  `spec.md` files or existing evidence.
- `docs/constitution.md` — reviewed for R11; no amendment is needed because its
  current QA permission and production-edit prohibition are compatible with the
  checkbox-only status update.
- `.opencode/agents/dev-lead.md` — reviewed for R11; no change is needed because
  the Lead continues to be barred from editing any `spec.md` and retains planning
  and summary ownership.

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
- **QA acceptance-status scope — maintainer-approved:** QA may edit the assigned
  current `spec.md` only to change verified acceptance checkboxes from `[ ]` to
  `[x]`, after evidence is recorded in its assigned `tasks.md` entry. QA may not
  edit criterion wording, spec metadata/status, other sections, or another spec.
  A permission-family glob is not authority to edit unassigned specs.
- **T5 operational-doc file scope — pending plan approval:** Propose a
  task-specific Dev assignment limited to `AGENTS.md` and
  `.opencode/agents/qa.md`; it overrides the existing `007`-only operational-doc
  exception for those two named files only. No other agent or operational
  document is in T5 scope.
- **QA-before-push sequence — maintainer-clarified:** QA verifies criteria,
  evidence, and all applicable gates before the Lead's final commit/push. The
  Lead's actual maintainer merge request is sent after that successful push; QA
  does not perform a post-push verification task.
- **Constitution and Dev Lead review:** No further Constitution amendment or
  `.opencode/agents/dev-lead.md` change is required for R11. The existing
  constitutional permission is compatible, and the Lead's no-spec-edit boundary
  remains unchanged.
- **Workflow policy — maintainer-approved:** Keep Constitution §5.1 concise but
  retain every binding safeguard. Existing operational detail in `AGENTS.md` and
  agent prompts is presumed valid unless review finds a specific inconsistency.
  The final Lead response after commit/push must explicitly request the maintainer
  merge; the Lead must not execute it or delete the branch.
- **Task sequencing:** T1 aligned the original Dev/QA permissions; T2 relocated
  FloatingNav/navigation; T3 relocated content parsers; T4 amended §5.1 and aligned
  final-merge guidance. T5 owns only the newly approved QA checkbox permission,
  QA prompt/guidance, tests, and verification. Dev owns the QA-agent definition;
  QA owns tests and its assigned task evidence plus only authorized checkbox
  markers in the current spec; the Lead owns planning and affected summaries.
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
  production/planning restrictions. Document that a spec-path permission allows
  only the assigned current spec's verified acceptance checkboxes, not its prose,
  metadata, other sections, or any unassigned spec; add assertions for these
  prompt boundaries.
- **Condensing §5.1 drops a binding safeguard or causes needless agent rewrites.**
  Mitigation: map every current constitutional safeguard into concise normative
  wording, keep procedural details in existing guidance, and change only guidance
  that is actually inconsistent or missing the final merge request.
- **Stale documentation or spec history.** Mitigation: update the README and the
  `001`/`003`/`004`/`007` summary relationship records; retain historical
  `spec.md` and evidence unchanged.

## Testing strategy

- **Focused unit/component tests:** T1 covers agent permission configuration and
  role boundaries (`tests/unit/agents.test.ts`); T2 runs navigation and
  FloatingNav coverage; T3 runs content schema, content utility, company-icon,
  and experience coverage. T4 extends the agent-configuration tests for the
  Constitution version/policy and final merge request. T5 extends those tests for
  the QA spec-checkbox permission and strict role boundary. QA owns all test edits.
  Each QA report records the full `pnpm test:run` result so unit and SEO suites
  are evidenced.
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
  the permission contracts in the existing agent tests. For T4, compare the
  concise §5.1 rules against every existing safeguard and verify that operational
  guidance retains correct role details. For T5, verify QA's permission matcher
  for the assigned current `spec.md`, QA's checkbox-only instructions, and that
  the Constitution and Dev Lead prompt remain consistent without unnecessary
  edits.
- **Final constitutional gates:** After T5 is QA-approved and evidence is
  recorded, rerun `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, and `pnpm test:a11y`. The earlier T4 run predates R11 and does
  not replace this final run. Commit/push only after all gates pass, using the
  repository's commit skill.
