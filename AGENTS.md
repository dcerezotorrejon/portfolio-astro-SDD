# Agent Guide

Operational guide for agents working on this repository. The authoritative rules
live in [`docs/constitution.md`](./docs/constitution.md); this file only summarizes
how to work here and links to the details.

## Project

A personal **portfolio built with Astro**. Content is hydrated from Markdown files
through Astro content collections — components render content, they do not hardcode
it. See [Constitution §2](./docs/constitution.md#2-project-nature).

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
