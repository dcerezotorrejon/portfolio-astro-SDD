# Tasks — [Feature name]

- **Spec ID**: `[NNN]-[feature-slug]`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.

## Checklist

- [ ] T1: <task description>
  - Evidence: unit `<command>`, SEO `<check>`, a11y `<check>`
- [ ] T2: <task description>
  - Evidence: _pending_

## Gate summary

- [ ] Lint (`pnpm lint`)
- [ ] Format (`pnpm format:check`)
- [ ] Build (`pnpm build`)
- [ ] Unit tests (`pnpm test:run`)
- [ ] Accessibility (`pnpm test:a11y`)
