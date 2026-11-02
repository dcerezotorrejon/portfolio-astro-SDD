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

Custom agents are defined under `.claude/agents/` (Markdown + YAML frontmatter)
and skills under `.claude/skills/`. Their responsibilities,
procedures, and permission boundaries live in those prompts and in the
constitution.

Agent frontmatter is the source of configured model defaults:

- `spec-refiner`: `opus`, effort `high`
- `dev-lead`: `opus`, effort `medium`
- `dev`: `sonnet`, effort `medium`
- `qa`: `sonnet`, effort `medium`

Run the primary agents in separate sessions with `claude --agent spec-refiner`
and `claude --agent dev-lead`. `dev` and `qa` run as subagents of `dev-lead`.

Per-agent edit and shell rules live in `.claude/agent-permissions.json` (ordered;
the last matching rule wins) and are enforced by the `PreToolUse` hook in
`.claude/hooks/enforce-agent-permissions.mjs`. The hook also denies agent edits
inside any spec directory whose `spec.md` has `Status: done`. A plain `claude`
session has no agent rules. The hook does not intercept indirect writes through
Bash; the agent prompts still prohibit them.

## Workflow

Work follows [spec-anchored development](./docs/constitution.md#3-spec-anchored-development)
on one shared `spec/[NNN]-[slug]` branch, with task lifecycle and verification
gates in [Constitution §5](./docs/constitution.md#5-task-lifecycle-and-verification-gates).
Historical specs are read-only
([§4.2](./docs/constitution.md#42-historical-specification-access-and-references)).
Conversation and artifact language rules are in
[§9](./docs/constitution.md#9-content-and-internationalization).
Configuration changes that do not alter site behavior do not need a spec
([§5.2](./docs/constitution.md#52-project-configuration-changes)).

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
