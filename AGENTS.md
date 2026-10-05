# Agent Guide

Operational guide for agents working on this repository. The authoritative rules
live in [`docs/constitution.md`](./docs/constitution.md); this file only summarizes
how to work here and links to the details.

## Project

A personal **portfolio built with Astro**, styled with **Tailwind CSS v4**. Content is hydrated from Markdown files
through Astro content collections — components render content, they do not hardcode
it. The site is static by default with zero client JavaScript; React components are used exclusively for interactive islands with explicit `client:*` directives. See [Constitution §2](./docs/constitution.md#2-project-nature).

UI work must follow [the global design](./docs/design.md) and [Constitution §2.1](./docs/constitution.md#21-global-design).

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Workflow: spec-anchored development

This project follows **spec-anchored** development: specs are living documents kept
in sync with the code for the whole life of a feature. When code and spec diverge,
**the code is the source of truth** — analyze the divergence, then update the spec
to re-anchor. See [`docs/constitution.md` §3](./docs/constitution.md#3-spec-anchored-development).

Every spec lives in its own folder with four files:

```
specs/[NNN]-[feature-slug]/
├── spec.md
├── plan.md
├── tasks.md
└── summary.md
```

`[NNN]` is a zero-padded number; `[feature-slug]` is at most three words and may be
reused when the same behavior is modified. All spec files are in English. Read
[`specs/README.md`](./specs/README.md) for the full convention, and start from
`specs/_template/` for new specs.

## Agent workflow

Development is split across four specialized agents defined under
`.opencode/agents/`:

| Agent          | Mode       | Role                                                                       |
| -------------- | ---------- | -------------------------------------------------------------------------- |
| `spec-refiner` | `primary`  | Clarifies the feature with you and writes `spec.md`.                       |
| `dev-lead`     | `primary`  | Turns the spec into `plan.md`/`tasks.md` and orchestrates `dev` then `qa`. |
| `dev`          | `subagent` | Implements one task. Does not validate its own work.                       |
| `qa`           | `subagent` | Tests, records evidence, marks only evidenced acceptance boxes.            |

- The `spec-refiner` → `dev-lead` handoff is **manual**: switch the primary agent
  once the spec is agreed.
- The workflow agents use pinned model references: `dev-lead` uses
  `openrouter/openai/gpt-6-luna#high`; `spec-refiner`, `dev`, and `qa` use
  `openrouter/openai/gpt-6-luna#medium`. The Auto Router variants in
  `opencode.json` remain unchanged.
- Agents are defined as Markdown + YAML frontmatter, the format shared by OpenCode
  and other agent tools (for example Claude Code reads `.claude/agents/`). See
  [`docs/constitution.md` §4](./docs/constitution.md#42-spec-relationships) for
  how specs record their relationships.

### Shared feature branch and task handoffs

- Once a spec is agreed and planning begins, the Dev Lead creates and publishes
  exactly one `spec/[NNN]-[slug]` branch, named from the complete spec directory.
  All Dev and QA work for the feature uses this branch; task/developer branches
  such as `dev/...` are not used.
- The Lead may assign up to four active tasks at a time. A task remains active
  from assignment through QA approval and evidence, including any rework. Only
  independent tasks with disjoint file scopes and no unfinished dependencies run
  in parallel; overlapping or dependent tasks are serialized.
- Dev implements only the assigned task scope and does not commit or push. QA
  verifies on the shared branch and may update assigned tests and task evidence.
  After verifying an acceptance criterion and recording its evidence in the
  assigned task entry, QA may change only that criterion's `[ ]` checkbox to
  `[x]` in the assigned current spec; QA may not edit criterion wording, spec
  status or metadata, any other spec content, or an unassigned spec. QA does not
  edit production code or commit/push. QA returns defects to the same Dev, who
  reworks them on that branch; the task closes only after QA approval and
  recorded evidence. QA completes verification before the Lead's final commit and
  push; no post-push QA task is introduced.
- On a Git or change conflict, stop the affected operation and notify the Lead
  with the conflicting branches/files and blocking state. Do not overwrite work
  or guess at a resolution. The Lead escalates decisions to the maintainer when
  needed; resume only after an agreed resolution.
- The Lead gets maintainer approval for material technical decisions before
  planning or delegating the affected implementation, and records the decision
  in the relevant planning artifact.
- After all task QA approvals and evidence are recorded and final gates pass, the
  Lead alone uses the commit skill for final feature commit(s) and push. This
  workflow does not merge the feature branch into the base branch or delete it.
  After a successful final push, the Lead explicitly asks the maintainer to merge
  the published feature branch into `main`; base-branch integration remains
  maintainer-managed.
- Writing boundaries: the Spec Refiner owns current `spec.md` wording and
  status/metadata; QA has only the evidence-backed acceptance-checkbox exception
  described above. The Lead does not write `spec.md` and owns planning/task/summary
  artifacts. Dev and QA stay within their assigned task responsibilities; QA's
  test/evidence work does not grant production-code authority.

## Verification gates

No task is complete without evidence, and every task is verified against unit
tests, SEO, and accessibility. Before closing a spec, all gates must pass:

| Gate          | Command             |
| ------------- | ------------------- |
| Lint          | `pnpm lint`         |
| Format        | `pnpm format:check` |
| Build         | `pnpm build`        |
| Unit tests    | `pnpm test:run`     |
| Accessibility | `pnpm test:a11y`    |

See [Constitution §5–§8](./docs/constitution.md) for verification and quality rules.

## Language policy

Talk to the maintainer in **Spanish**. Write all committed artifacts — including
everything under `specs/` — in **English**.

## Documentation

Full Astro documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Notes

- `CLAUDE.md` is a symlink to this file, so they never drift out of sync.
