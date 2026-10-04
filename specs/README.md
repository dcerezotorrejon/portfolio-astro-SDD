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
└── summary.md   # files/functions changed + date
```

- `[NNN]`: zero-padded sequential number, starting at `001`.
- `[feature-slug]`: lowercase, hyphenated name of the main feature, **at most
  three words**, e.g. `001-content-collections`.
- The slug **may be repeated** across specs when the same behavior is modified;
  the number keeps each spec unique.

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
- **`summary.md`** — date, files changed, and functions/components changed.

## Conflict resolution

If code and spec diverge, the **code is the source of truth**. Analyze the
divergence and update the spec to re-anchor it. Do not silently change behavior.
