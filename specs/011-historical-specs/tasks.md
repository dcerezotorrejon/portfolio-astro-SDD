# Tasks: Historical Specs

## T1 — Amend the constitution

- [x] Implement the active-versus-historical model and code-as-current-truth
      policy; remove historical read, write, and relationship-maintenance
      requirements. Increment the constitution version and amendment date.
- **Status:** Closed — QA approved; evidence recorded.
- **Dependencies:** None.
- **Implementation owner / file scope:** Dev Lead — `docs/constitution.md` only.
- **QA ownership:** Verify this task and record evidence here. QA may update only
  this task entry and evidence-backed acceptance checkboxes in the current
  `specs/011-historical-specs/spec.md`.
- **Evidence:** T1 reverified and approved on the shared branch
  `spec/011-historical-specs` at HEAD
  `ffae16d26b203c2196cfcb51f69b3694a7b6e13e`; task changes remain uncommitted.
  The complete T1 production scope is `docs/constitution.md` only, a Markdown
  file outside `src/content/**`. Reviewed that file: §3 defines the active
  increment, closure with status `done`, immutability, code as current truth,
  and later changes in new increments. The constitution is version 1.7.0, last
  amended 2026-10-06. §4.1 removes historical relationship-list requirements
  and freezes the summary at closure, with a single “Functions / components
  changed” bullet. §4.2 states the default no-read rule, the explicit request
  exception, the no-write rule, and the prohibition on historical relationship
  maintenance. §5.1 keeps current workflow governed by this constitution and
  current agent prompts, not completed specs. AC1 remains verified. `pnpm lint`
  passed; `pnpm format:check` passed (all matched files formatted). Build, unit
  tests, SEO, and accessibility were not run and are not applicable under the
  Markdown-only exception in Constitution §§5–6. No task-specific tests apply
  to this documentation-only change. No remaining T1 defects.

## T2 — Align agent prompts

- [x] Update all four agent prompts to prohibit default reads and all writes to
      completed specification directories, express the approved explicit-request
      exception, and remove historical relationship review or maintenance duties.
- **Status:** Closed — QA re-approved after rework; latest evidence recorded.
- **Dependencies:** None; the agreed spec fixes the policy and the file scope is
  disjoint from T1 and T3.
- **Implementation owner / file scope:** Dev Lead —
  `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, `.opencode/agents/qa.md` only.
- **QA ownership:** Verify this task and record evidence here. QA may update only
  this task entry and evidence-backed acceptance checkboxes in the current
  `specs/011-historical-specs/spec.md`.
- **Evidence:** T2 reverified and approved after rework on the shared branch
  `spec/011-historical-specs` at HEAD
  `ffae16d26b203c2196cfcb51f69b3694a7b6e13e`; task changes remain uncommitted.
  The complete T2 implementation scope remains
  `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev-lead.md`,
  `.opencode/agents/dev.md`, and `.opencode/agents/qa.md` only. Reviewed all
  four prompts against the agreed policy: completed specs are not read by
  default; an explicit request from the maintainer or a `mode: primary` agent
  may authorize all feature participants, including subagents, to read them;
  and that authorization never permits writes to completed directories. The
  Dev Lead prompt no longer contains the ineffective template-spec permission
  allow; its role boundary and later deny remain consistent with the prohibition
  on editing any `spec.md`. The prompts do not assign historical relationship
  discovery, recording, or maintenance, or earlier-summary updates, and retain
  their current-task ownership boundaries. The constitution portion of AC2 is
  supported by the already-recorded T1 review of §4.2 (above). No completed
  specification contents were read, and no tests apply to these prompt-only
  Markdown changes. `pnpm lint` passed; `pnpm format:check` passed (all matched
  files formatted); `git diff --check` passed. Build, unit tests, SEO, and
  accessibility were not run and are not applicable under the Markdown-only
  exception in Constitution §§5–6. No remaining T2 defects.

## T3 — Align repository guidance and template

- [x] Update `AGENTS.md`, `specs/README.md`, and `specs/_template/spec.md` to
      describe the new active/historical lifecycle, remove historical relationship
      requirements, and leave existing completed directories untouched.
- **Status:** Closed — QA approved after rework; latest evidence recorded.
- **Dependencies:** None; the agreed spec fixes the policy and the file scope is
  disjoint from T1 and T2.
- **Implementation owner / file scope:** Dev Lead — `AGENTS.md` and
  `specs/README.md`; maintainer — `specs/_template/spec.md` (execution explicitly
  delegated to Dev Lead by the maintainer).
- **QA ownership:** Verify this task and record evidence here. QA may update only
  this task entry and evidence-backed acceptance checkboxes in the current
  `specs/011-historical-specs/spec.md`.
- **Evidence:** T3 reverified on the shared branch `spec/011-historical-specs` at
  HEAD `ffae16d26b203c2196cfcb51f69b3694a7b6e13e`; changes remain uncommitted.
  The complete T3 scope is `AGENTS.md`, `specs/README.md`, and
  `specs/_template/spec.md`. `AGENTS.md` and `specs/README.md` match the prior
  review. They describe the active/historical lifecycle, omit historical
  relationship-list requirements, and leave completed directories untouched.
  The template now states that active specs remain code-anchored; closure with
  status `done` freezes the whole directory as historical; code remains the
  source of truth; later changes use a new increment; new artifacts omit
  historical relationship lists; and completed directories remain untouched
  (`specs/_template/spec.md:7-11`).

  AC3 is verified across the constitution, all four current agent prompts,
  `AGENTS.md`, `specs/README.md`, and the template: none instructs agents to
  inspect completed specs, update earlier summaries, or maintain historical
  relationships. AC4 is verified: the constitution and README remove the
  relationship-list/`Related specs` requirements and explicitly preserve
  completed directories and existing references; the template has no such
  section or requirement and tells authors to leave completed directories
  untouched. AC5 is verified by the complete tracked and untracked path listing:
  all changed paths are Markdown outside `src/content/**`; no completed
  specification directory and no `opencode.json` path is changed. No completed
  specification contents were read. For AC6, the current ownership split keeps
  `specs/_template/spec.md` maintainer-owned and outside the Dev Lead's assigned
  file scope; the plan and task record the maintainer's explicit delegation of
  execution. QA reviewed the named files and gates without editing governance
  guidance.

  AC7 is verified against the assigned governance sources. Constitution §3
  keeps the active increment spec code-anchored through closure and makes a
  directory closed with status `done` an immutable historical snapshot, with
  code authoritative for current behavior and later changes assigned to a new
  increment. Constitution §5.1 explicitly says completed specs MUST NOT
  establish or override current workflow rules, permissions, role boundaries,
  or behavior; current workflow authority remains the constitution and
  consistent current agent prompts. `AGENTS.md`, `specs/README.md`, and the
  template preserve the active/historical lifecycle, while the four current
  agent prompts define current role procedures and do not assign authority to
  completed specs. No completed specification contents were read.

  Applicable Markdown-only gates, rerun for this verification: `pnpm lint`
  passed; `pnpm format:check` passed (all matched files use Prettier formatting);
  `git diff --check` passed. Build, unit tests, SEO, and accessibility were not
  run and are not applicable under Constitution §§5–6. No task-specific tests
  apply to these documentation-only changes. No remaining T3 defects.

## Final quality gates

- **Scope:** Verified the complete tracked and untracked changed-path set:
  `.opencode/agents/dev-lead.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`, `.opencode/agents/spec-refiner.md`, `AGENTS.md`,
  `docs/constitution.md`, `specs/README.md`, `specs/_template/spec.md`,
  `specs/011-historical-specs/spec.md`,
  `specs/011-historical-specs/plan.md`,
  `specs/011-historical-specs/tasks.md`, and
  `specs/011-historical-specs/summary.md`. All are Markdown outside
  `src/content/**`; no completed specification directory or `opencode.json` is
  changed. The active summary records the date, complete changed-file list, and
  no functions/components; it has no historical relationship section.
- **Shared-branch revision:** `spec/011-historical-specs` at HEAD
  `ffae16d26b203c2196cfcb51f69b3694a7b6e13e`; final-gate results supplied by the
  Dev Lead for this uncommitted HEAD.
- **`pnpm lint`:** PASS (Dev Lead final gate).
- **`pnpm format:check`:** PASS (Dev Lead final gate).
- **`git diff --check`:** PASS (Dev Lead final gate).
- **Build, unit, SEO, accessibility:** Not run; not applicable under the
  Markdown-only exception in Constitution §§5–6.
- **Defects or approval:** All acceptance criteria AC1–AC7 are checked, T1–T3
  are approved with evidence, the active summary meets Constitution §4.1, and
  all applicable final gates pass. QA approves final closure; no remaining
  defects. The spec's status metadata remains `draft`; QA did not change it in
  this final-report-only verification.
