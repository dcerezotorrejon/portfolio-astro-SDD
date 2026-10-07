# Plan — Experience SEO description: enforce a 160-character maximum

- **Spec ID**: `018-experience-content-format`
- **Last updated**: 2026-10-07

## Approach

1. Add a `.max(160)` bound to `seo.description` in the shared `seoSchema`
   (`nonEmptyString` already trims and requires non-empty).
2. Add unit tests asserting the shared schema rejects a description longer than
   160 characters and accepts one of exactly 160 and one shorter.

No content, rendering, or routing changes; the existing sample descriptions (143
and 92 characters) already comply.

Maintainer-approved scope expansion: bring the stale workflow-governance tests
(`tests/unit/agents.test.ts`, `tests/unit/integration-governance.test.ts`) in
sync with the current constitution (v1.11.2, amended 2026-10-07) and agent
definitions. The workflow files themselves are the approved source of truth and
are not modified; only the stale test assertions are updated.

## Files to change

- `src/content/parsers/content-schema.ts` — add `.max(160)` to
  `seoSchema.description` (shared by `profileSchema` and `experienceSchema`).
- `tests/unit/content.test.ts` — add boundary cases for the shared `seoSchema`.
- `tests/unit/agents.test.ts` — sync stale version/date, permission, and prompt
  assertions with the current constitution/agent definitions (T2).
- `tests/unit/integration-governance.test.ts` — sync stale version/date and
  prompt assertions (T2).

## Key decisions

- **Hard `≤160` limit** on `seo.description`, enforced in the shared
  `seoSchema`, covering both `profile` and `experience`. Maintainer-approved.
- **Scope reduced to only the length limit** — content rewrites and the
  distinctness rules discussed earlier are out of scope. Maintainer-approved.

## Risks

- A future description longer than 160 characters is rejected at
  collection/build time (intended behavior).
- Minimal blast radius: no rendered-output changes.

## Testing strategy

- Unit tests (`pnpm test:run`): boundary cases in `tests/unit/content.test.ts`.
- Build (`pnpm build`): confirms collection validation still passes with the
  existing sample content.
- Accessibility (`pnpm test:a11y`): run (no markup change; expected to pass).
- Integration (`pnpm test:integration`): not applicable (no rendering/content
  change); recorded explicitly.
