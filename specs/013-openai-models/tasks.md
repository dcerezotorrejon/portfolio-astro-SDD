# Tasks

- **Spec ID**: `013-openai-models`
- **Last updated**: 2026-10-06
- **Shared branch**: `spec/013-openai-models`
- **Base revision**: `74d4e5a8bff00f25c8b655729114ccac7b1a1f37`
- **Execution status**: both tasks QA-approved; final closure verification
- **Active tasks**: 0

## Prerequisites

- [x] Maintainer approves the spec scope and direct OpenAI provider selection.
      Evidence: explicit confirmation of `openai/` references and request to proceed.
- [x] Shared branch created and published from the recorded `main` base.
      Evidence: `git switch -c spec/013-openai-models` and initial upstream push
      succeeded; existing uncommitted substitutions were preserved.
- [x] Maintainer confirms the technical plan before implementation assignment.
      Evidence: explicit affirmative confirmation on 2026-10-06.

## T1 — Direct OpenAI agent defaults

- [x] Implementation and independent QA approval with recorded evidence.
- **Status:** approved — QA evidence recorded.
- **Dependencies:** plan confirmation.
- **Implementer:** Dev.
- **Production ownership:** `.opencode/agents/dev-lead.md`,
  `.opencode/agents/spec-refiner.md`, `.opencode/agents/dev.md`,
  `.opencode/agents/qa.md`; only model substitutions and formatting.
- **Scope:** review and retain existing exact `openai/gpt-6.1-sol` primary-agent
  defaults and `openai/gpt-6-luna` subagent defaults without variants. Correct only
  assigned model fields if needed. Preserve all other behavior and format all
  four owned files before handoff.
- **QA ownership:** T1 latest report here; verified AC1, AC2, AC5 markers in
  current spec. Inspect catalog results for both references without live inference.
- **Model choice:** Dev and QA configured defaults, no overrides; small bounded
  frontmatter verification does not justify a higher-cost model.
- **Gates:** lint and format; build/unit/SEO/accessibility not run under the
  Markdown-only exception. Record exact results and catalog-verification limits.
- **Latest QA report:** Approved — T1 scope verified on shared branch
  `spec/013-openai-models`, HEAD
  `74d4e5a8bff00f25c8b655729114ccac7b1a1f37` (same as the recorded base).
  Reviewed the four assigned agent definitions and the full increment diff,
  including uncommitted changes; no unrelated changed files or credential/auth
  configuration additions were found. The four exact model fields are already
  correct: primary agents use `openai/gpt-6.1-sol` and Dev/QA use
  `openai/gpt-6-luna`, with no variant suffixes. OpenCode model catalog filtered
  to provider `openai` returned both exact identifiers as active:
  `openai/gpt-6.1-sol` and `openai/gpt-6-luna`. Authentication, account
  entitlements, and live inference were not verified or attempted.
  `pnpm lint` — PASS; `pnpm format:check` — PASS (Prettier reports all matched
  files formatted). Markdown-only exception applies to T1's four `.md` files:
  `pnpm build`, `pnpm test:run`, SEO checks, and `pnpm test:a11y` — NOT RUN / NOT
  APPLICABLE under Constitution §§5–6. No T1 defects found. No production changes
  or test changes were needed.

## T2 — Guide alignment and bounded full diff

- [x] Implementation and independent QA approval with recorded evidence.
- **Status:** approved — QA evidence recorded.
- **Dependencies:** T1 QA approval and evidence.
- **Implementer:** Dev.
- **Production ownership:** `AGENTS.md`; model-default references and formatting.
- **Scope:** review existing references against approved T1 defaults, retain
  frontmatter/source, no-variant, and unchanged-Auto-Router statements. Preserve
  every unrelated guide statement; format the owned file before handoff.
- **QA ownership:** T2 latest report here; verified AC3/AC4 markers in current
  spec. Inspect the whole increment diff against the recorded base for unrelated
  changes and credential/authentication additions; no tests or production writes.
- **Model choice:** Dev and QA configured defaults, no overrides; bounded guide
  and diff verification.
- **Gates:** lint and format; build/unit/SEO/accessibility not run under the
  Markdown-only exception. Record exact results.
- **Latest QA report:** Approved — T2 scope verified on shared branch
  `spec/013-openai-models`, HEAD
  `74d4e5a8bff00f25c8b655729114ccac7b1a1f37` (same as the recorded base), with
  the complete uncommitted increment changes included. In `AGENTS.md`, the
  guide consistently assigns `openai/gpt-6.1-sol` to Dev Lead and Spec Refiner
  and `openai/gpt-6-luna` to Dev and QA. It states frontmatter is the source of
  configured defaults, no reasoning variant is explicitly selected, and
  Auto Router variants remain unchanged. All four corresponding agent
  frontmatter values match exactly and have no variant suffix.
  Compared the complete tracked diff and current untracked increment artifacts
  against the recorded base. Tracked changes are limited to the four specified
  agent model fields and the corresponding guide references. No other tracked
  files, including `opencode.json`, operational or application files, changed;
  the untracked files are only this increment's Markdown artifacts. No
  credentials or account-specific authentication settings were introduced.
  `pnpm exec prettier --write specs/013-openai-models/tasks.md` — PASS (unchanged);
  `pnpm lint` — PASS; `pnpm format:check` — PASS. The complete increment change
  set is Markdown-only outside `src/content/**`: `pnpm build`, `pnpm test:run`,
  SEO checks, and `pnpm test:a11y` — NOT RUN / NOT APPLICABLE under Constitution
  §§5–6. No T2 defects found; no production or test files changed by QA.

## Closure checklist

- [x] Both tasks have independent QA approval and recorded evidence; active tasks 0.
      Evidence: T1 and T2 latest QA reports above, both approved.
- [x] AC1–AC5 have QA-backed completion; substantive re-anchoring is resolved.
      Evidence: T1 verified AC1/AC2/AC5; T2 verified AC3/AC4. No substantive
      divergence or requirement change was found.
- [x] Finalize current planning, checklist, and summary while active.
      Evidence: all current artifacts reflect the actual reviewed substitutions
      and QA approvals; subsequent QA final evidence precedes metadata freeze.
- [x] Lead recomputes full scope and runs every applicable final gate.
      Evidence: nine Markdown paths outside content (five tracked production paths
      and four new increment artifacts); no staged changes. `pnpm lint`,
      `pnpm format:check`, and `git diff --check` passed after artifact finalization.
      Build/unit/SEO/accessibility not run under Constitution §§5–6.
- [x] QA records the latest final-gate evidence before the metadata freeze.
      Evidence: latest final-gate report below, recorded while the increment is
      active and before the Lead's metadata transition.

Final closure metadata, feature commit/push, and any integration follow only after
all prerequisites pass. Report actual later Git outcomes externally; do not
pre-record them or edit the directory after `done`. Integration requires new
explicit approval after final push; retain the branch.

## Latest final-gate report

Approved — final closure scope verified on shared branch
`spec/013-openai-models`, HEAD/base revision
`74d4e5a8bff00f25c8b655729114ccac7b1a1f37`. Both tasks are approved with
recorded evidence; active tasks: 0. AC1–AC5 have QA-backed completion. Independently
reviewed all four current artifacts and the complete increment diff against the
recorded base, including uncommitted changes: five tracked production Markdown
paths (four agent definitions and `AGENTS.md`) plus four new current-spec Markdown
artifacts, nine paths total, all outside `src/content/**`; no staged changes.
The production diff is limited to the specified model-reference substitutions;
no substantive spec/implementation mismatch or re-anchoring blocker was found.
No credentials or account-specific authentication configuration were introduced.
Catalog results recorded in T1 list both exact references as active:
`openai/gpt-6.1-sol` and `openai/gpt-6-luna`. Authentication, account
entitlements, and live inference were not verified or attempted.

Final-gate results supplied by the Dev Lead after artifact finalization:
`pnpm lint` — PASS; `pnpm format:check` — PASS;
`git diff --check` — PASS after the latest checklist update. QA then ran
`pnpm exec prettier --write specs/013-openai-models/tasks.md` — PASS (unchanged),
`pnpm lint` — PASS, `pnpm format:check` — PASS, and `git diff --check` — PASS.
Build, unit tests, SEO, and accessibility (`pnpm build`, `pnpm test:run`, SEO
checks, `pnpm test:a11y`) — NOT RUN / NOT APPLICABLE under Constitution §§5–6's
Markdown-only exception. All current artifacts are finalized while active.
No defect found; the Lead may perform the authorized final metadata transition
after confirming the post-report formatting and lint/format results. No future
commit, push, merge, or other Git outcome is claimed or pre-recorded.
