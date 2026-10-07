# Tasks — Experience SEO description: enforce a 160-character maximum

- **Spec ID**: `018-experience-content-format`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly.
> The change set contains non-Markdown files, so the Markdown-only exception
> does not apply.

## Checklist

- [x] T1: Add a hard `≤160` limit to the shared `seoSchema.description` and a
      unit test for the boundary.
  - Ownership (Dev): `src/content/parsers/content-schema.ts`,
    `tests/unit/content.test.ts`.
  - Evidence: **QA approved** (branch `spec/018-experience-content-format`,
    revision `0a3be1b` plus uncommitted task changes in
    `src/content/parsers/content-schema.ts` and `tests/unit/content.test.ts`).
    Unit-test sufficiency reviewed: the new boundary test in
    `tests/unit/content.test.ts` rejects a 161-char `seo.description` (AC1) and
    accepts exactly 160 chars (AC2); shorter-than-160 acceptance is covered by
    the passing approved-profile/experience parse cases. Gates: `pnpm lint`
    pass; `pnpm format:check` pass; `pnpm build` pass (3 pages); `pnpm test:run`
    pass (24 files, 150 tests); `pnpm test:a11y` pass (4 files, 5 tests).
    Integration not applicable (no rendering/routing/content/styles/
    client-behavior change; schema validation plus a unit test only). No
    defects.
- [x] T2: Bring the stale workflow-governance tests in sync with the current
      constitution (v1.11.2) and agent definitions.
  - Ownership (Dev): `tests/unit/agents.test.ts`,
    `tests/unit/integration-governance.test.ts`.
  - Evidence: **QA approved** (branch `spec/018-experience-content-format`,
    revision `0a3be1b` plus uncommitted task changes in
    `tests/unit/agents.test.ts` and `tests/unit/integration-governance.test.ts`).
    Every reworded assertion matches the current workflow files (constitution
    `1.11.2`, `**Last amended**: 2026-10-07`; `AGENTS.md`;
    `.opencode/agents/{dev,dev-lead,qa,spec-refiner}.md`): Dev `edit`
    `docs/constitution.md` → `deny` (dev.md 41-42), Dev `edit` `tests/unit/**` →
    `allow` (dev.md 19-21), QA tuple `["edit","tests/unit/**","deny"]` (qa.md
    14-15) and QA `edit` `tests/unit/agents.test.ts` → `deny`; Lead now owns
    `AGENTS.md`, `docs/constitution.md`, `.opencode/agents/*.md` (dev-lead.md
    40-48) so they left the Lead's denied list; all reworded prompt fragments
    (dev, dev-lead, qa, spec-refiner) match the current prompts. No assertion
    deleted or trivialized; the §5.1 `QA MUST` target moved to `AGENTS.md`, which
    is correct because §5.1 now legitimately contains "QA MUST NOT edit
    `tests/unit/**`". Gates: `pnpm lint` pass; `pnpm format:check` pass
    (All matched files use Prettier code style); `pnpm build` pass (3 pages);
    `pnpm test:run` pass (24 files, 150 tests; the 2 assigned files: 20 tests);
    `pnpm test:a11y` pass (4 files, 5 tests). Integration not applicable (test
    assertion updates only; no rendering/routing/content/styles/client-behavior
    change). No defects.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`)
- [x] Accessibility (`pnpm test:a11y`)
- [x] Integration (`pnpm test:integration`) — not applicable (no rendering/content change); recorded as not applicable
