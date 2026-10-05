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
| `qa`           | `subagent` | Tests a finished task against the quality gates and records evidence.      |

- The `spec-refiner` → `dev-lead` handoff is **manual**: switch the primary agent
  once the spec is agreed.
- The `dev-lead` launches `dev` and `qa` as subagents and picks the model per
  task, favoring cost-efficiency. `spec-refiner`/`dev-lead` use a medium-cost,
  medium/high-reasoning model; `dev`/`qa` use a lower-cost model that the lead may
  escalate for harder tasks.
- Agents are defined as Markdown + YAML frontmatter, the format shared by OpenCode
  and other agent tools (for example Claude Code reads `.claude/agents/`). See
  [`docs/constitution.md` §4](./docs/constitution.md#42-spec-relationships) for
  how specs record their relationships.

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
