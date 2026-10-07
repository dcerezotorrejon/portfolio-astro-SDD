# Summary — Experience SEO description: enforce a 160-character maximum

- **Spec ID**: `018-experience-content-format`
- **Date**: 2026-10-08

## Files changed

- `src/content/parsers/content-schema.ts`
- `tests/unit/content.test.ts`
- `tests/unit/agents.test.ts`
- `tests/unit/integration-governance.test.ts`

## Functions / components changed

- `seoSchema` (in `src/content/parsers/content-schema.ts`) — `description` now
  enforces a hard 160-character maximum via `.max(160)`, shared by the `profile`
  and `experience` collections.
- `tests/unit/content.test.ts` — added a boundary test asserting the shared
  schema rejects a 161-character description and accepts one of exactly 160.
- `tests/unit/agents.test.ts` and `tests/unit/integration-governance.test.ts` —
  synced stale governance assertions with the current constitution (v1.11.2,
  amended 2026-10-07) and agent definitions: Dev/QA `tests/unit/**` ownership,
  Dev Lead workflow-Markdown ownership, and reworded prompt fragments.
