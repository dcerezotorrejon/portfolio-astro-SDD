# Agent Guide

Operational guide for agents working on this repository. The authoritative rules
live in [`docs/constitution.md`](./docs/constitution.md); this file records only
operational details not covered there and links to the details. On any conflict,
the constitution prevails.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Agents

Custom agents are defined under `.opencode/agents/` (Markdown + YAML frontmatter,
the format shared by OpenCode and other agent tools). Their responsibilities,
procedures, and permission boundaries live in those prompts and in the
constitution.

Agent frontmatter is the source of configured model defaults:

- `dev-lead` and `spec-refiner`: `opencode-go/deepseek-v4-pro`
- `dev`: `opencode-go/kimi-k2.7-code`
- `qa`: `opencode-go/deepseek-v4.1-flash`

No reasoning variant is explicitly selected in those defaults; the Auto Router
variants in `opencode.json` remain unchanged.

## Workflow

Work follows [spec-anchored development](./docs/constitution.md#3-spec-anchored-development)
on one shared `spec/[NNN]-[slug]` branch, with task lifecycle and verification
gates in [Constitution §5](./docs/constitution.md#5-task-lifecycle-and-verification-gates).
Historical specs are read-only
([§4.2](./docs/constitution.md#42-historical-specification-access-and-references)).
Conversation and artifact language rules are in
[§9](./docs/constitution.md#9-content-and-internationalization).

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
