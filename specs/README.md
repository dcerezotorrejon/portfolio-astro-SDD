# Specs

This directory holds the specs for the project. The project follows
**spec-anchored development**: an active increment's spec is kept in sync with
the code through closure. After closure with status `done`, the entire directory
is an immutable historical snapshot. See
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
5. At closure, write `summary.md`; the completed directory is then immutable.

## Files

- **`spec.md`** — the problem, requirements, and acceptance criteria. Anchors the
  expected behavior.
- **`plan.md`** — the technical approach: files to touch, decisions, trade-offs.
- **`tasks.md`** — checklist. A task is only marked `[x]` with evidence from all
  applicable unit, SEO, accessibility, and integration gates. Integration
  applicability and the Markdown-only exception follow Constitution §§5–6.
- **`summary.md`** — date, files changed, and functions/components changed. It
  does not include historical-spec relationships.

## Historical specifications

Agents MUST NOT read completed specification contents by default. An explicit
request from the maintainer or an agent with `mode: primary` may authorize all
participants in that feature, including subagents, to read completed specs.
Reading never authorizes writing: no file in a completed directory may be
changed. New increment artifacts MUST NOT identify or link completed specs, and
existing completed directories are left untouched. See
[Constitution §4.2](../docs/constitution.md#42-historical-specification-access-and-references).

## Conflict resolution

If code and spec diverge, the **code is the source of truth**. Analyze the
divergence and update the spec to re-anchor it. Do not silently change behavior.
