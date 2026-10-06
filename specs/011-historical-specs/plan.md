# Plan: Historical Specs

## Approach

Update the constitution, agent prompts, and repository-facing guidance in
parallel. The agreed specification is the implementation contract, so no task
depends on another task's unfinished edits. The tasks own disjoint files and
introduce no material technical decision beyond those already approved. Keep
this increment strictly to the named Markdown governance files. Do not inspect,
edit, migrate, or cross-link completed specification directories. Preserve
spec-anchored work while an increment is active; on closure with status `done`,
its directory becomes an immutable record and code remains authoritative for
current behavior.

## Files to change

- `docs/constitution.md`
- `AGENTS.md`
- `.opencode/agents/spec-refiner.md`
- `.opencode/agents/dev-lead.md`
- `.opencode/agents/dev.md`
- `.opencode/agents/qa.md`
- `specs/README.md`
- `specs/_template/spec.md` — maintainer-owned edit; excluded from Dev Lead
  implementation scope
- `specs/011-historical-specs/tasks.md` for QA evidence and task status
- `specs/011-historical-specs/spec.md` only for evidence-backed acceptance
  checkboxes changed by QA
- `specs/011-historical-specs/summary.md` at feature closure

No completed specification directory and no `opencode.json` file is in scope.
The feature summary will omit a historical-spec relationship section.

## Approved decisions and trade-offs

- **Historical boundary:** A specification directory becomes historical when
  its increment is closed with status `done`. The entire directory is immutable;
  later work gets a new increment.
- **Read authorization:** Agents do not read completed specification contents by
  default. An explicit request from the maintainer or an agent configured with
  `mode: primary` may authorize all participants in that feature, including
  subagents, to read them; the request need not identify paths or purpose.
- **Write authorization:** Reading authorization never grants write access to a
  completed directory. No summary or relationship-maintenance exception exists.
- **Cross-references:** New increment artifacts omit historical IDs, paths,
  titles, and relationship lists. Existing completed artifacts are not migrated.
- **Scope:** Update the constitution, `AGENTS.md`, all four agent prompts, the
  specs README, and the new-spec template. Leave `opencode.json` unchanged.
- **Constitution amendment:** The maintainer approved the intent to amend the
  constitution once the feature specification was agreed. Increment its version
  and amendment date as required by §11.
- **Implementation ownership:** The Dev Lead owns all named governance files
  except `specs/_template/spec.md`, which remains maintainer-owned because the
  Dev Lead role and effective tool permissions prohibit editing any `spec.md`.
  The maintainer may explicitly delegate the execution of that edit to the Dev
  Lead, as done for this increment. QA verifies all changed files and records
  evidence without editing governance guidance. This split is reflected in the
  re-anchored R8/AC6.
- **Model choice:** The Dev Lead handles its bounded governance edits directly,
  including the template edit under the maintainer's explicit delegation. No Dev
  implementation subagent is needed. QA uses its configured GPT-6 Luna medium
  model for independent verification.

## Risks and mitigations

- **Policy drift across sources:** The constitution is amended first, then every
  agent prompt and repository guide is checked against the same explicit
  authorization wording.
- **Overblocking active work:** State clearly that the no-read rule applies to
  completed directories; the assigned current increment remains readable and
  code-anchored.
- **Accidental historical access or changes:** QA checks changed paths using
  path listings only. No historical file contents need to be opened for this
  check.
- **Confusion about existing links:** Say that already-completed files stay
  untouched even if they contain relationship records; no backfill or cleanup is
  part of this increment.

## Testing and verification strategy

- QA reviews the constitutional policy and all dependent guidance for consistent
  default read prohibition, explicit-request exception, no-write restriction,
  and removal of historical relationship maintenance.
- QA checks changed path names, including untracked files, to ensure the scope
  excludes completed specification directories and `opencode.json`; this check
  must not read their contents.
- For each task and final closure, run `pnpm lint` and `pnpm format:check`.
  Record build, unit, SEO, and accessibility gates as not run under the
  Markdown-only exception in Constitution §§5–6.
- All three implementation tasks have no dependencies and may be active at once;
  their production file ownership is disjoint. The Dev Lead applies its assigned
  governance changes concurrently; the maintainer's template edit is isolated
  to its named path. QA sessions remain serialized because they update evidence
  in the same `tasks.md` and acceptance checkboxes in the same current `spec.md`.
