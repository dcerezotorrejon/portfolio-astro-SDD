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

This project follows **spec-anchored** development: the active increment's spec
is kept in sync with code through closure. When its code and spec diverge,
**the code is the source of truth** — analyze the divergence, then update the
active spec to re-anchor. On closure with status `done`, the entire spec directory
becomes an immutable historical snapshot; later changes use a new increment. See
[`docs/constitution.md` §3](./docs/constitution.md#3-spec-anchored-development).

Agents do not read completed specification contents by default. An explicit
request from the maintainer or an agent with `mode: primary` may authorize all
participants in that feature, including subagents, to read them. No agent may
modify a completed spec directory, and new increment artifacts do not link to
completed specs or record relationships to them. See Constitution §4.2.

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

Four custom agents are defined under `.opencode/agents/`. Their
role-specific responsibilities, procedures, and permission boundaries are
maintained in the corresponding agent prompts and are not duplicated here.

- Agent frontmatter is the source of configured model defaults: `dev-lead` and
  `spec-refiner` use `openrouter/openai/gpt-6.1-sol`, while `dev` and `qa` use
  `openrouter/openai/gpt-6-luna`. No reasoning variant is explicitly selected in
  those defaults. The Auto Router variants in `opencode.json` remain unchanged.
- The Dev Lead writes only assigned current planning artifacts. All implementation,
  including operational Markdown and repository configuration, is delegated to Dev
  with exact file ownership; QA independently verifies and owns assigned tests and
  evidence without editing production. See the current agent prompts for detailed
  role procedures and write boundaries.
- Agents are defined as Markdown + YAML frontmatter, the format shared by OpenCode
  and other agent tools (for example Claude Code reads `.claude/agents/`). The
  constitution and current agent prompts define their permissions and historical
  spec access policy.

### Shared feature branch and task handoffs

- Once a spec is agreed and planning begins, exactly one
  `spec/[NNN]-[slug]` branch is created and published, named from the complete
  spec directory.
  All feature implementation and verification work uses this branch; task or
  developer branches are not used.
- At most four tasks may be active. A task remains active from assignment through
  verification approval, evidence, and any rework. Parallelize only independent
  tasks with disjoint file scopes and no unfinished dependencies; serialize
  overlapping or dependent work.
- Work stays within the task's named ownership. Verification may update assigned
  tests and task evidence but not production code. Defects return to the same
  implementer on the shared branch; a task closes only after verification
  approval and recorded evidence.
- On a Git or change conflict, stop the affected operation, identify the
  conflicting branches/files and blocking state, and do not overwrite work or
  guess a resolution. Escalate decisions requiring judgment to the maintainer and
  resume only after an agreed resolution. Obtain and record maintainer approval
  before planning or delegating work affected by an unsettled material technical
  decision.
- Final feature commit(s) and push happen only after every task has verification
  approval and evidence and all quality gates pass. No per-task commit or push is
  permitted. Base-branch integration requires explicit affirmative maintainer
  approval, and the published feature branch is not deleted as part of this
  workflow.
- Role-specific procedures and write boundaries are defined in the applicable
  current agent prompts. The constitution is authoritative; see
  [Constitution §5.1](./docs/constitution.md#51-shared-feature-branch-workflow).

## Verification gates

No task is complete without evidence. Tasks and final spec closure must pass the
quality gates applicable under [Constitution §§5–6](./docs/constitution.md#5-task-lifecycle-and-verification-gates),
including its Markdown-only exception:

| Gate          | Command             |
| ------------- | ------------------- |
| Lint          | `pnpm lint`         |
| Format        | `pnpm format:check` |
| Build         | `pnpm build`        |
| Unit tests    | `pnpm test:run`     |
| Accessibility | `pnpm test:a11y`    |

See [Constitution §§5–8](./docs/constitution.md) for verification and quality
rules and the conditions under which gates apply.

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
