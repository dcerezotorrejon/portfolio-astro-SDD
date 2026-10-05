# Plan — Common molecules

- **Spec ID**: `006-common-molecules`
- **Last updated**: 2026-10-05

## Approach

Extract the reusable button and heading styling into two small, static Astro
components under `src/components/molecules/`, keep all styling centralized in
`src/styles/global.css` (no scoped `<style>` blocks) and target stable
`data-*` hooks, then migrate every existing consumer in `004-portfolio-home`
without changing delivered behavior. The only intended visual change is
normalizing the detail-page `h1` (currently unstyled user-agent default) to the
`display` variant.

The refactor preserves the current three-layer token system
(primitive → semantic → component). New `--heading-*` and
`--button-secondary-*` component tokens are added; `--button-*` stays canonical
and `--section-heading-*` is kept as an alias of `--heading-section-*` so
existing token assertions keep resolving.

### Public contracts (implementation constraints)

- `Button` root: `data-molecule="button"` + `data-variant="primary"|"secondary"`.
  `<a href>` when `href` is set, otherwise `<button type="button">`.
  `type`/`disabled` are only applied to the `<button>` root; `class` is merged.
- `Heading` root: `data-molecule="heading"` + `data-variant="display"|"section"|"card"`
  - `data-level="1".."6"`; tag is `h1`…`h6`. `class` is merged.
- CSS selectors in `global.css` target those hooks, e.g.
  `[data-molecule="button"][data-variant="primary"] { … }`.
- Compiled Markdown cannot use components, so the
  `.detail-content h2, .detail-content h3` rule is **kept**, re-pointed at
  `--heading-section-*`.

## Files to change

- `src/components/molecules/Button.astro` — **new**. `variant` (required),
  `href?`, `class?`; polymorphic root; forwards remaining attrs; data hooks.
- `src/components/molecules/Heading.astro` — **new**. `level` (1–6, required),
  `variant` (`display`|`section`|`card`, required); dynamic tag; data hooks.
- `src/styles/global.css` — add `--heading-*` (display/section/card) and
  `--button-secondary-*` tokens; keep `--button-*` canonical; alias
  `--section-heading-*` → `--heading-section-*`; add `[data-molecule]` rules;
  remove `.button-link`, `.section-heading`, `.profile-details h1`,
  `.experience-card h3`; re-point `.detail-content h2/h3` to the heading tokens;
  keep the 768 px and reduced-motion blocks intact.
- `src/components/ProfileIntroduction.astro` — `h1` → `Heading`
  (`level={1} variant="display" id="profile-name"`); social links → `Button`
  (`variant="primary" href`), preserving icon+label and list `aria-label`.
- `src/components/ExperienceHistory.astro` — `h2` → `Heading`
  (`level={2} variant="section" id="history-heading"`); card `h3` → `Heading`
  (`level={3} variant="card"`); “Más información” → `Button` (`primary`),
  preserving accessible names.
- `src/pages/experiencia/[slug].astro` — role `h1` → `Heading`
  (`level={1} variant="display"`, intentional normalization); return link →
  `Button` (`primary`).
- `docs/design.md` — document button variants (`primary`/`secondary`) and
  heading variants (`display`/`section`/`card`), decoupled semantics/style, and
  the token groups; refresh `Last updated`.
- `tests/unit/molecules-button.test.ts` — **new** (QA).
- `tests/unit/molecules-heading.test.ts` — **new** (QA).
- `tests/unit/button-design.test.ts` — re-anchor class selectors to molecule
  hooks/tokens, keeping contrast/min-target intent (QA).
- `tests/unit/section-headings.test.ts` — re-anchor to component/token
  assertions, keeping hierarchy/single-`h1`/Markdown intent (QA).
- `tests/unit/design-assets.test.ts` — re-anchor `.button-link` min-target
  assertions to the button hook (QA).
- `specs/004-portfolio-home/summary.md` — refresh under Constitution §4.2,
  referencing this spec and the detail-`h1` normalization.
- `specs/006-common-molecules/tasks.md`, `summary.md` — evidence and closure.

## Key decisions

- **Centralized CSS, not scoped.** The existing token/style tests parse
  `src/styles/global.css`; keeping molecule rules there with `data-*` hooks
  preserves testability and a single source of truth.
- **`variant`/`level` required.** Explicit at every call site; `level` and
  `variant` are fully independent so semantics never change visual size.
- **`--button-*` stays canonical.** Only the heading tokens need aliasing; this
  avoids churning every existing button consumer/test.
- **Retained Markdown selector.** Component usage is impossible for compiled
  Markdown, so `.detail-content h2/h3` remains but consumes the shared heading
  tokens — 004 R16 is preserved, so 004 has no requirement change.
- **`secondary` unused on pages.** It is exercised only through an isolated
  component fixture for tests and axe.
- **No new dependency, no client JS.** Both molecules are static Astro.

## Risks

- **Class-coupled tests** (`button-design`, `section-headings`,
  `design-assets`) break on migration → re-anchor in the migration task's QA
  without losing their intent.
- **Computed-style regression** for migrated headings/buttons → capture
  before/after computed styles for every non-normalized element.
- **Attribute forwarding on `<a>`** (`type`/`disabled`) → restrict to the
  `<button>` root; covered by a component test.
- **Secondary contrast** → fixture-level contrast/axe check before closing.
- **Global CSS edits touching unrelated rules** → keep 768 px and reduced-motion
  blocks byte-identical apart from token renames.

## Testing strategy

- **Unit / component tests:** Astro Container API via `tests/helpers/render.ts`.
  New molecule tests assert root type/tag, required props, hook attributes,
  forwarded attrs and merged `class`. Re-anchored suites keep their prior intent
  (contrast, min target, token values, hierarchy, single `h1`, Markdown heading
  styling).
- **SEO checks:** render `/`, both detail routes and assert title/meta/canonical
  and routes are unchanged; the existing `tests/seo/*` suites must stay green.
- **Accessibility checks:** axe on homepage and detail markup plus the isolated
  molecule fixtures (covers `secondary`); manual keyboard/focus review of
  migrated controls.
- **Gates:** `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`.

## Model plan

Tasks use the subagents' configured Auto Router variant (`#medium`). No
escalation is expected; the molecule and stylesheet tasks stay at the default
tier for cost efficiency.
