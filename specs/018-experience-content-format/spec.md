# Experience SEO description: enforce a 160-character maximum

- **Spec ID**: `018-experience-content-format`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The `profile` and `experience` collections share one `seoSchema` in
`src/content/parsers/content-schema.ts`. Its `description` field is currently
validated only as non-empty, with no upper bound.

SEO meta descriptions should be concise; see the SEO rules in
[`docs/constitution.md`](../../docs/constitution.md#8-seo). A maximum length is
therefore enforced so an overly long description fails collection validation.

## Goals

- Enforce a hard maximum length of 160 characters on `seo.description` through
  the shared `seoSchema`, applying to both `profile` and `experience`.

## Non-goals

- Do not change any content wording or existing field values.
- Do not change rendering, routing, `seo.title`, or any other schema field.

## Requirements

- R1: `seo.description` must be non-empty and at most 160 characters.
- R2: The 160-character limit is enforced as hard validation in the shared
  `seoSchema`, so it also covers `profile`.

## Acceptance criteria

- [x] AC1: The shared `seoSchema` rejects a `description` longer than 160
      characters.
- [x] AC2: The shared `seoSchema` accepts a `description` of exactly 160
      characters and one shorter than 160.

## Verification

- AC1/AC2 — verified by a unit test in `tests/unit/content.test.ts` using
  `safeParse` over the shared `seoSchema`. Run via `pnpm test:run`.
- Build — `pnpm build` still succeeds; the existing sample descriptions are
  already within the limit (143 and 92 characters), so no content changes.

> Applicable quality gates: lint, format, build, unit tests, and accessibility.
> Integration is not applicable (no rendering, routing, content, styles, or
> client-behavior change) and is recorded as such.
