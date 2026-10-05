# Specs

This directory holds the specs for the project. The project follows
**spec-anchored development**: specs are living artifacts kept in sync with the
code for the entire life of a feature. See
[`docs/constitution.md`](../docs/constitution.md) for the binding rules.

> All files under `specs/` are written in **English**.

## Layout

Each feature gets its own folder:

```
specs/[NNN]-[feature-slug]/
├── spec.md      # requirements + acceptance criteria
├── plan.md      # technical approach
├── tasks.md     # checklist of tasks with verification evidence
└── summary.md   # files/functions changed + related specs + date
```

- `[NNN]`: zero-padded sequential number, starting at `001`.
- `[feature-slug]`: lowercase, hyphenated name of the main feature, **at most
  three words**, e.g. `001-content-collections`.
- The slug **may be repeated** across specs when the same behavior is modified;
  the number keeps each spec unique.

## Feature branch

After a spec is agreed and planning begins, the Dev Lead creates and publishes
one shared feature-work branch named `spec/[NNN]-[slug]`, using the complete spec
directory name (for example, `spec/007-workflow-changes`). Every Dev and QA task
for that feature uses this branch; task/developer branches are not created. See
[Constitution §5.1](../docs/constitution.md#51-shared-feature-branch-workflow)
for task concurrency, QA handoffs, and final commit/push rules.

## Creating a new spec

1. Copy `specs/_template/` to `specs/[NNN]-[feature-slug]/`.
2. Fill in `spec.md` (requirements and acceptance criteria).
3. Fill in `plan.md` (technical approach).
4. Break the work down in `tasks.md`.
5. When the work is done, write `summary.md` and keep it updated on later changes.

## Files

- **`spec.md`** — the problem, requirements, and acceptance criteria. Anchors the
  expected behavior.
- **`plan.md`** — the technical approach: files to touch, decisions, trade-offs.
- **`tasks.md`** — checklist. A task is only marked `[x]` with evidence from the
  unit test, SEO, and accessibility gates.
- **`summary.md`** — date, files changed, functions/components changed, and the
  **Related specs** section (§4.2).

## Historical spec files

Each incremental spec records anticipated relationships in its own `spec.md`.
Later increments MUST preserve earlier, historical `spec.md` files unchanged;
when an earlier feature is affected, update only its `summary.md` relationship
record. The current feature's `spec.md` remains a living artifact while that
feature evolves. See [Constitution §4.2](../docs/constitution.md#42-spec-relationships).

## Related specs

Features rarely change alone. Every `summary.md` includes a **Related specs**
section listing the specs this one affects or is affected by, with a short note
on each relationship. When a later change touches a feature, update the affected
spec's `summary.md` too. See
[Constitution §4.2](../docs/constitution.md#42-spec-relationships).

## Conflict resolution

If code and spec diverge, the **code is the source of truth**. Analyze the
divergence and update the spec to re-anchor it. Do not silently change behavior.
