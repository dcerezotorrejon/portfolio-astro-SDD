# T7b QA evidence — Collection company-icon fallback

- **Task:** T7b (R6, R9; AC5, AC6, AC10, AC15)
- **Date:** 2026-10-05
- **QA model:** Auto Router (`openrouter/auto`), configured default; no override.
- **Scope:** Verify the Dev fix that resolves the company icon from the Markdown
  `rendered.metadata.frontmatter` when Astro's persisted normalized `data` omits
  `companyIcon`. Owned file: `tests/unit/company-icon.test.ts`. New evidence file:
  this document. No production, spec, or `tasks.md` changes.

## Dev implementation reviewed

`src/lib/content.ts` `resolveCompanyIcon(experience)` reads
`rendered.metadata.frontmatter.companyIcon` and uses the normalized
`data.companyIcon` only when it is present (`=== undefined` check), then validates
the chosen value with `companyIconSchema.safeParse`. On failure it throws
`Invalid companyIcon for experience entry id "<id>", slug "<slug>": <zod message>`.
`ExperienceHistory.astro:24` and `experiencia/[slug].astro:36` call the helper, so
both views resolve the same icon.

## Persisted-store diagnosis (read-only)

`.astro/data-store.json` confirms the T7b condition for both real entries:
normalized `data` keys are `slug, role, company, startDate, [endDate,] summary,
technologies, seo` (no `companyIcon`), while
`rendered.metadata.frontmatter.companyIcon` holds
`{ src: "/images/companies/astro.svg", alt: "Icono provisional de Astro para
Empresa de ejemplo" }`. The helper therefore exercises the rendered-frontmatter
fallback for the real collection entries in this workspace.

## Tests added / changed

Reworked the QA-owned `tests/unit/company-icon.test.ts` (9 tests):

1. **Helper branch tests (new):**
   - Valid normalized `data` icon wins over a different rendered-frontmatter copy.
   - Absent normalized data falls back to `rendered.metadata.frontmatter.companyIcon`.
   - Neither source present throws and the message names both
     `entry id "puesto-sin-icono.md"` and `slug "puesto-sin-icono"`.
   - A present but malformed normalized icon (remote URL) rejects with
     `Invalid companyIcon` and does **not** fall back to the valid rendered copy.
2. **Real-collection fallback (new):** iterates the two real entries; when on-disk
   normalized `data.companyIcon` is absent, asserts the rendered frontmatter copy
   is the approved icon, and always asserts `resolveCompanyIcon(entry)` returns the
   approved icon. Robust to a later store refresh.
3. **Home + detail render:** renders the real homepage and each real detail page,
   resolving the expected icon with `resolveCompanyIcon(entry)`, and asserts the
   shared `.company-identity` image `src`/`alt` match, alt is non-empty, 40 × 40
   dimensions, the unchanged `Empresa de ejemplo` label, and that the identity sits
   inside the complete detail card with its expanded description.
4. **Replacement contract:** replaces the icon on an actual entry and verifies both
   `ExperienceHistory` and the detail page render the replacement without component
   edits (`resolveCompanyIcon(replacedEntry)` equals the replacement).
5. **Schema safety and SVG/CSS contract:** retained the unsafe-path/blank-alt schema
   rejections, the parseable local Astro SVG check, and the 40 × 40
   `object-fit: contain` CSS contract check.

## Commands and results

- `pnpm exec vitest run tests/unit/company-icon.test.ts` — **PASS**, exit 0;
  1 file / **9 tests**.
- `pnpm exec vitest run tests/unit/company-icon.test.ts tests/unit/content.test.ts
tests/unit/home.test.ts tests/unit/experience.test.ts tests/seo/home.test.ts
tests/seo/experience.test.ts tests/a11y/home.test.ts tests/a11y/experience.test.ts`
  — **PASS**, exit 0; 8 files / **32 tests**. (Transitions suite intentionally
  excluded from the pass claim per assignment.)
- `pnpm exec eslint tests/unit/company-icon.test.ts` — **PASS**, exit 0.
- `pnpm exec prettier --write tests/unit/company-icon.test.ts` — **PASS**,
  unchanged (already Prettier-clean); `pnpm exec prettier --check
tests/unit/company-icon.test.ts` — **PASS**.
- `pnpm test:a11y` (informational characterization) — **PASS**, exit 0;
  4 files / 5 tests (home, detail, floating-nav, react).
- `pnpm exec vitest run tests/unit/transitions.test.ts` (informational, excluded)
  — **PASS**, exit 0; 3 tests. The T5a header expectation is already corrected and
  the suite no longer blocks on the icon.
- `pnpm exec vitest run tests/unit/agents.test.ts` (informational, out of scope)
  — **FAIL**, 1 failed / 18 passed. `tests/unit/agents.test.ts:142` expects
  `spec-refiner` model `openrouter/openai/gpt-6-luna#medium` but the configured
  value is `openrouter/openrouter/auto#medium`. Unrelated to T7b; no render/icon
  involvement.

## Gate status

- **Unit tests:** Applicable and verified for the T7b scope (company-icon, content,
  home, detail). PASS.
- **SEO:** Applicable; home and detail SEO suites rendered with real collection
  data and PASS (title, single meta description, unique absolute canonical).
- **Accessibility:** Applicable; home and both detail axe suites PASS, and the full
  `pnpm test:a11y` gate (4 files / 5 tests) PASSes.
- **Lint / Prettier:** Targeted checks on the owned test file PASS. Repository-wide
  `pnpm lint` / `pnpm format:check` were **not** run, per the assignment to avoid
  overlap with concurrent QA6/fix-anchor/transition work; they remain final gates.
- **Build:** `pnpm build` was **not** run under the concurrent-work constraint; the
  historical build evidence remains in the prior T5a/T7 records. Not claimed here.

## Defects / blockers

- T7b flow: no defect found. The helper resolves the real collection icons from
  rendered frontmatter; both rendered views show the same path/alt beside the
  company name; replacement content flows through; malformed/missing values reject
  with descriptive errors.
- Out-of-scope blockers for the **final** full suite, not T7b: `tests/unit/agents.test.ts`
  model expectation mismatch (line 142), unrelated to this change. The stale
  transition header assertion is already resolved in this workspace (transitions
  suite passes in the informational run).

## Constraints observed

- No production changes under `src/`; only the QA-owned
  `tests/unit/company-icon.test.ts` was edited and this new evidence file created.
- No changes to `specs/**` task/spec files, other test files, or configuration.
- T7b passes targeted verification. Full repository unit/build/format gates remain
  for final integration QA.
