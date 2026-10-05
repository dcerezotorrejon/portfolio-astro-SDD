# Tasks — Common molecules

- **Spec ID**: `006-common-molecules`

> A task is only marked `[x]` with evidence from the applicable gates.
> If a gate does not apply, state it explicitly. Implementation (`dev`) and
> verification (`qa`) are separate subagent runs; QA owns the test files.
> Parallel waves only run tasks whose files are disjoint, to avoid write races.

## Dependency graph

- **Wave 1 (parallel):** T1a, T1b, T3 — disjoint files, no dependency.
- **Wave 1 QA:** T1q — after T1a and T1b; suite stays green because T1b is
  additive and the old class rules are retained.
- **Wave 2 (parallel):** T2a, T2b — depend on T1a and T1b.
- **Wave 3:** T5 (dev) — depends on T2a and T2b.
- **Wave 4:** T4 (qa) — depends on T2a, T2b, T3 and T5.

## Checklist

### Wave 1

- [x] **T1a (dev): Create the molecules** — **parallel-safe**
  - `src/components/molecules/Button.astro`: required
    `variant: "primary" | "secondary"`, optional `href`, optional `class`;
    renders `<a href>` when `href` is set, otherwise `<button type="button">`;
    `type`/`disabled` only on the `<button>` root; merges `class`; forwards
    remaining attributes; root hooks `data-molecule="button"` and
    `data-variant`.
  - `src/components/molecules/Heading.astro`: required `level: 1..6` and
    `variant: "display" | "section" | "card"`; dynamic tag `h1`…`h6`; merges
    `class`; forwards remaining attributes; root hooks `data-molecule="heading"`,
    `data-variant` and `data-level`.
  - Static Astro only: no `client:*`, no dependencies. Do **not** edit
    `global.css`, consumers or tests.
  - Files: `src/components/molecules/Button.astro`,
    `src/components/molecules/Heading.astro`.
  - Model: Auto Router `#medium` (default). **Evidence:** both files exist and are
    static Astro (no `client:*`/`<script>`); `tests/unit/molecules-button.test.ts`
    and `tests/unit/molecules-heading.test.ts` assert root polymorphism, hooks,
    forwarded attributes, merged `class` and required props. `pnpm test:run`
    (21 files / 141 tests), `pnpm lint`, `pnpm format:check` pass.

- [x] **T1b (dev): Token/hook refactor in the stylesheet** — **parallel-safe**
  - `src/styles/global.css`, **additive**: add `--heading-display-*`,
    `--heading-section-*`, `--heading-card-*` and `--button-secondary-*`
    component tokens; alias `--section-heading-*` → `--heading-section-*`; keep
    `--button-*` canonical.
  - Add rules targeting `[data-molecule="button"][data-variant="…"]` and
    `[data-molecule="heading"][data-variant="…"]` reproducing the current
    computed styles (R3/R5).
  - Re-point the retained `.detail-content h2, .detail-content h3` rule to
    `--heading-section-*`.
  - **Keep** `.button-link`, `.section-heading`, `.profile-details h1` and
    `.experience-card h3` for now (removed in T5). Do **not** edit consumers or
    components. Keep the 768 px and reduced-motion blocks intact.
  - Model: Auto Router `#medium` (default). **Evidence:** `global.css` declares the
    `--heading-*` / `--button-secondary-*` groups and the `[data-molecule]` rules;
    aliases resolve as asserted in `tests/unit/molecules-heading.test.ts` and
    `tests/unit/molecules-button.test.ts`; `pnpm test:run` (141 tests) passes.

- [x] **T3 (dev): Document variants in `docs/design.md`** — **parallel-safe**
  - Document button variants (`primary`/`secondary`) and heading variants
    (`display`/`section`/`card`), the decoupled semantics/style rule and the
    token groups; refresh `Last updated`. No feature-specific content and no
    duplicate design document.
  - Files: `docs/design.md`. Do not touch code.
  - Model: Auto Router `#medium` (default). **Evidence:** `docs/design.md` §“Heading
    styles and variants” and §“Buttons” document all variants, the decoupled
    semantics/style rule, the token groups and the retained Markdown rule;
    `tests/unit/design-assets.test.ts` reads the document and `pnpm format:check`
    passes. Sole global design document (no duplicate).

- [x] **T1q (qa): Verify the molecules**
  - Add `tests/unit/molecules-button.test.ts` and
    `tests/unit/molecules-heading.test.ts` (isolated fixtures) asserting root
    type/tag, required props, hook attributes, forwarded attrs, merged `class`,
    both button variants and, for `secondary`, axe/contrast on the fixture.
  - Run the full unit suite (still green: T1b is additive) plus lint/format.
  - **Evidence:** `tests/unit/molecules-button.test.ts` (root selection, hooks,
    forwarding, merged `class`, required `variant`, both variants’ tokens/contrast,
    axe on the isolated fixture) and `tests/unit/molecules-heading.test.ts`
    (tag/`data-level` mapping, variant decoupling, required props, tokens); both
    green in `pnpm test:run` (21 files / 141 tests) with `pnpm lint` and
    `pnpm format:check`.

### Wave 2

- [x] **T2a (dev): Migrate the homepage consumers** — **depends on T1a, T1b**
  - `src/components/ProfileIntroduction.astro`: `h1` → `Heading`
    (`level={1} variant="display" id="profile-name"`); social links → `Button`
    (`variant="primary" href`), preserving icon+label and list `aria-label`.
  - `src/components/ExperienceHistory.astro`: `h2` → `Heading`
    (`level={2} variant="section" id="history-heading"`); card `h3` → `Heading`
    (`level={3} variant="card"`); “Más información” → `Button` (`primary`),
    preserving accessible names.
  - Preserve links, ids, order, `view-transition-name` values and content.
  - Model: Auto Router `#medium` (default). **Evidence:** both files use the
    molecules; rendered-HTML suites `tests/unit/home.test.ts`,
    `tests/unit/experience.test.ts`, `tests/unit/transitions.test.ts` and
    `tests/seo/{home,experience}.test.ts` pass in `pnpm test:run` (141 tests);
    browser computed styles match the delivered section/card/primary values at
    1440 px and 375 px. `view-transition-name` preserved.

- [x] **T2b (dev): Migrate the detail page** — **depends on T1a, T1b**
  - `src/pages/experiencia/[slug].astro`: role `h1` → `Heading`
    (`level={1} variant="display"`, the intentional normalization); return link
    → `Button` (`primary`).
  - Preserve links, ids, `view-transition-name` value, content and the single
    `h1`.
  - Model: Auto Router `#medium` (default). **Evidence:** `[slug].astro` uses
    `Heading`/`Button`; `tests/unit/experience.test.ts` asserts one `h1` and the
    preserved `view-transition-name`, `tests/a11y/experience.test.ts` is green,
    and the browser confirms the `h1` is the `display` variant (32 px mobile /
    44 px desktop) as the documented normalization.

### Wave 3

- [x] **T5 (dev): Remove the superseded class rules** — **depends on T2a, T2b**
  - Remove `.button-link`, `.section-heading`, `.profile-details h1` and
    `.experience-card h3` (and their `:hover`/`:active`/reduced-motion
    references) from `src/styles/global.css`, now that no markup uses them.
  - Only `src/styles/global.css`.
  - Model: Auto Router `#medium` (default). **Evidence:** `grep` over `src/` finds
    no references to the removed classes (only the `--section-heading-*` token
    aliases remain); `pnpm test:run` (141 tests) green; the removed declarations
    in the previous stylesheet match the new molecule rules by value.

### Wave 4

- [x] **T4 (qa): Integration verification + spec closure** — **depends on all**
  - Re-anchor `tests/unit/button-design.test.ts`,
    `tests/unit/section-headings.test.ts` and
    `tests/unit/design-assets.test.ts` to the molecule hooks/tokens without
    losing their intent (contrast, min target, token values, hierarchy, single
    `h1`, Markdown heading styling).
  - Run all constitutional gates; capture browser before/after computed styles
    and the intentional detail-`h1` change; run axe on pages and molecule
    fixtures.
  - Refresh `specs/004-portfolio-home/summary.md` (§4.2), resolve
    `specs/006-common-molecules/summary.md`, and check off ACs 1–12 in
    `spec.md` with evidence.
  - Model: Auto Router `#medium` (default). **Evidence:** re-anchored
    `button-design`/`section-headings`/`design-assets` suites keep their original
    intent; all gates pass — `pnpm lint`, `pnpm format:check`, `pnpm build`
    (3 routes + sitemap), `pnpm test:run` (21 files / 141 tests) and
    `pnpm test:a11y` (4 files / 5 tests). Browser computed styles captured at
    1440 px and 375 px via `chrome-devtools` MCP (detail-`h1` normalization
    recorded); `a11y` MCP 0 violations on all three routes. `004` summary refreshed
    and `006` summary written; ACs checked in `spec.md`.

## Gate summary

Verified on the final integrated source (T4, 2026-10-05):

- [x] Lint (`pnpm lint`) — pass, 0 errors.
- [x] Format (`pnpm format:check`) — pass, all files formatted.
- [x] Build (`pnpm build`) — pass, 3 routes (`/`, both `/experiencia/…`) plus
      `sitemap-index.xml`.
- [x] Unit tests (`pnpm test:run`) — pass, 21 files / 141 tests, including the new
      molecule suites and the re-anchored `button-design`, `section-headings` and
      `design-assets` suites.
- [x] Accessibility (`pnpm test:a11y`) — pass, 4 files / 5 tests; plus `a11y` MCP
      0 violations on `/` and both detail routes.
- [x] Browser computed-style check (AC5/AC8/AC9) — `chrome-devtools` MCP at 1440 px
      and 375 px; primary/secondary/heading values match `docs/design.md`; focus
      outline 3 px `#075985`; the detail `h1` is the sole visual change.
