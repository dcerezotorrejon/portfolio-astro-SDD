# Plan — Adapt real CV content into the portfolio

- **Spec ID**: `021-cv-content`
- **Last updated**: 2026-10-08

## Approach

Replace the provisional portfolio content with the maintainer's real CV data,
extend the profile schema with an `about` bio, remove the provisional `notice`
affordance end-to-end, relax the profile image `src` validator, and add provisional
placeholder company SVGs. The long-form experience descriptions are used verbatim
(Markdown-formatted as bold-led bullet lists); the homepage `summary` fields are
newly written engaging copy (first-person, temporally neutral). Tests that assert
the replaced placeholder values are updated to the real content.

The production changes are an atomic unit: adding the required `about` field and
removing `notice` span the schema, the profile content, and both components, and
any partial state leaves either a schema-validation failure (missing `about`) or a
`profile.notice` reference to a removed field. They are therefore implemented in a
single Dev task rather than split into non-verifiable intermediate states.

This plan was re-anchored after the Tailwind-first styles migration landed on
`main`: component styling now uses inline utility classes, and the
`.provisional-notice` rule no longer exists in `global.css` (only the two inline
notice paragraphs carry the class name).

## Files to change

### Schema

- `src/content/parsers/content-schema.ts` — add `about: nonEmptyString`, remove
  `notice`, replace `image.src` literal with a local `/images/` path validator
  (`localProfileImagePath`, accepting `.svg|.png|.jpe?g|.webp`).

### Content

- `src/content/profile/profile.md` — real name/headline/`about`/image alt/socials/
  SEO; `notice` removed.
- `src/content/experience/puesto-ejemplo-2022.md` — delete.
- `src/content/experience/puesto-ejemplo-2024.md` — delete.
- `src/content/experience/babel-senior-frontend-engineer.md` — new (R2).
- `src/content/experience/nttdata-lead-engineer.md` — new (R2).

### Components / styles

- `src/components/home/ProfileIntroduction.astro` — render `profile.about`, drop the
  provisional-notice paragraph (inline Tailwind utilities).
- `src/pages/experiencia/[slug].astro` — drop the provisional-notice paragraph.
- No `global.css` change: the `.provisional-notice` rule was already removed by the
  Tailwind-first migration; only the two inline notice paragraphs remain to delete.

### Assets

- `public/images/companies/babel.svg` — placeholder initials mark.
- `public/images/companies/nttdata.svg` — placeholder initials mark.

### Tests (unit — Dev-owned)

- `tests/unit/content.test.ts` — real fixtures, `about` present, no `notice`.
- `tests/unit/home.test.ts` — real name/headline, `about` render, image alt; no
  notice assertion.
- `tests/unit/experience.test.ts` — real slugs/role/company/icon/dates/badges/body;
  no notice assertion.
- `tests/unit/company-icon.test.ts` — fixture content neutralized.

### Tests (SEO — QA-owned, updated during verification)

- `tests/seo/home.test.ts` — real title/description.
- `tests/seo/experience.test.ts` — real detail titles.

## Key decisions

- **`about` as a frontmatter field** rather than the Markdown body: the bio is a
  single paragraph, so a schema-validated string field keeps the intro component
  simple and avoids an extra `render()`.
- **Relax `image.src`** from a single literal to a local path so a real photo can
  replace the placeholder later without another schema change; the placeholder
  asset is retained now.
- **Placeholder company SVGs** (simple initials mark) rather than real logos, which
  the maintainer will supply later.
- **Descriptive `companyIcon.alt`** (`Logotipo de <empresa>`) rather than the bare
  company name: the bare name is redundant with the adjacent visible company text
  and trips axe's `image-redundant-alt` (best-practice). Approved by the maintainer.
- **First-person, temporally-neutral `summary` copy** to spark curiosity without
  anchoring the narrative to the past; "alto tráfico" was intentionally removed
  from the summaries per the maintainer (kept only in the verbatim `about` bio).
- **Education/languages/skills/hobbies/disability sections** are out of scope and
  deferred.
- **Model choice**: both tasks use the subagent defaults (`dev` →
  `opencode-go/kimi-k2.7-code`, `qa` → `opencode-go/deepseek-v4.1-flash`); no
  override needed.

## Risks

- **Test blast radius**: several unit/SEO tests hardcode placeholder strings;
  updating them is required for the build/test gates to pass (enumerated above and
  in R7).
- **Atomicity**: the `notice`→`about` migration cannot be split; it is one task to
  avoid broken intermediate builds.
- **Schema relaxation** widens accepted image paths; covered by a unit test.
- **Unused `astro.svg`** becomes referenced only by test fixtures; left in place
  (optional cleanup, out of scope).
- **Untracked source PDF** (`Daniel Cerezo Torrejón`) in the repo root contains
  personal data (address, phone, birth date, disability) and MUST NOT be committed;
  it is not part of the site and is left untracked.

## Testing strategy

- **Unit/component tests** (`tests/unit/**`, Dev) are updated to real fixtures and
  cover `about` rendering and the absence of `notice`.
- **SEO tests** (`tests/seo/**`, QA) assert the real titles/descriptions.
- **Accessibility** (`pnpm test:a11y`, QA) is unchanged in structure but re-run to
  confirm no regression from the component/CSS edits.
- **Integration** (`pnpm test:integration`, QA) reads content dynamically via its
  helper and is re-run to confirm the two real detail routes render.
- **Final gates** (§6): lint, format, build, unit, SEO, accessibility, integration.
