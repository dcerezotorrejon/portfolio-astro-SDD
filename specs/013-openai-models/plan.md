# Technical plan

- **Spec ID**: `013-openai-models`
- **Last updated**: 2026-10-06
- **Status**: implementation and task verification complete
- **Shared branch**: `spec/013-openai-models`
- **Base revision**: `74d4e5a8bff00f25c8b655729114ccac7b1a1f37`

## Approach and approved decisions

The maintainer explicitly confirmed this technical plan on 2026-10-06 before
task assignment.

The maintainer approved direct `openai/` references with the same model identities,
role allocation, and no variant suffix. Preserve the existing uncommitted
substitutions; do not reset or overwrite them. The shared branch was created from
`main` at the recorded base and published before implementation assignment.

Dev reviews the four agent frontmatter substitutions in one task and the guide
substitutions in a second dependent task. Both are bounded operational Markdown
implementation tasks even if no additional content edit is needed. Dev formats
only its assigned files before independent QA. QA checks catalog availability,
exact defaults, preservation of unrelated settings, and the complete feature diff.

## Files and ownership

- Dev T1: `.opencode/agents/dev-lead.md`, `.opencode/agents/spec-refiner.md`,
  `.opencode/agents/dev.md`, and `.opencode/agents/qa.md`; model fields only, plus
  required formatting.
- Dev T2: `AGENTS.md`; model-default references only, plus required formatting.
- QA: assigned reports in this increment's `tasks.md` and evidence-backed
  acceptance markers in its `spec.md`. No production or test changes assigned.
- Lead: this increment's `plan.md`, `tasks.md`, and `summary.md`; only final
  `Status` and `Last updated` in its spec after every closure prerequisite passes.

## Trade-offs and risks

Keep `opencode.json`, its OpenRouter configuration, and Auto Router variants
unchanged. No provider alias, dependency, account authentication, or credential
change is needed for this repository selection task. The OpenCode catalog lists
both exact OpenAI model references; this does not prove account entitlements or
successful inference. Account connection remains outside this increment.

Existing substitutions have not yet received independent task QA. Loaded agent
defaults may differ from edited frontmatter until sessions reload; verification
must distinguish repository configuration from session configuration. Do not
silently replace unavailable models or write outside the assigned scopes.

## Verification and closure

T1 and T2 are independently QA-approved with evidence; AC1–AC5 are marked only by
QA. Dev reviewed the existing substitutions without content corrections and
formatted its assigned files. Both task lint/format checks passed. Account
authentication, entitlements, and inference were not verified.

QA checks AC1/AC2/AC5 for T1 and AC3/AC4 for T2. It inspects the complete diff
against the recorded base including uncommitted/untracked artifacts. For this
Markdown-only increment outside `src/content/**`, task and final gates are
`pnpm lint` and `pnpm format:check`; build, unit, SEO, and accessibility are not
run and not applicable under Constitution §§5–6. Recompute scope before closure.

After task approvals, finalize plan, checklist, and summary while active. The
Lead runs final gates and QA records the latest final report and criterion markers
before freeze. Any failed gate, incomplete criterion, missing evidence, or
substantive mismatch leaves the increment active. Request Spec Refiner for any
substantive re-anchoring; the Lead does not author it.

The Lead's final directory edit changes only spec `Status` to `done` and
`Last updated` to the closure date. No directory writes follow. Final commit/push
uses the commit skill after gates; actual Git outcomes are reported externally.
After successful push, request new affirmative permission to merge into `main`
and retain the feature branch regardless of integration approval.
