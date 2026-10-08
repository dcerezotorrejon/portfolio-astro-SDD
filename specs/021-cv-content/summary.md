# Summary — Adapt real CV content into the portfolio

- **Spec ID**: `021-cv-content`
- **Last updated**: 2026-10-08

## Files changed

- `src/content/parsers/content-schema.ts` — added `about` field, removed `notice`,
  relaxed `image.src` to `localProfileImagePath`.
- `src/content/profile/profile.md` — real profile (name, headline, `about`, image
  alt, GitHub/LinkedIn socials, SEO); `notice` removed.
- `src/content/experience/babel-senior-frontend-engineer.md` — new real entry.
- `src/content/experience/nttdata-lead-engineer.md` — new real entry.
- `src/content/experience/puesto-ejemplo-2022.md` — deleted (placeholder).
- `src/content/experience/puesto-ejemplo-2024.md` — deleted (placeholder).
- `src/components/home/ProfileIntroduction.astro` — renders `profile.about`;
  removed provisional-notice paragraph.
- `src/pages/experiencia/[slug].astro` — removed provisional-notice paragraph.
- `public/images/companies/babel.svg` — new placeholder company logo.
- `public/images/companies/nttdata.svg` — new placeholder company logo.
- `.gitignore` — ignores the untracked source PDF `/Daniel Cerezo Torrejón`.
- `tests/unit/content.test.ts` — real fixtures + `localProfileImagePath` coverage.
- `tests/unit/home.test.ts` — real profile/about/cards; no notice.
- `tests/unit/experience.test.ts` — real detail routes; no notice.
- `tests/unit/company-icon.test.ts` — neutralized fixtures + real icons.
- `tests/seo/home.test.ts` — real title/description.
- `tests/seo/experience.test.ts` — real detail titles/descriptions.
- `tests/a11y/experience.test.ts` — real detail slugs.

## Functions / components changed

- `profileSchema` — `about` added, `notice` removed, `image.src` now validates a
  local `/images/` path (`.svg|.png|.jpe?g|.webp`).
- `ProfileIntroduction` — renders the new `about` bio; provisional notice removed.
- Experience detail route (`[slug].astro`) — provisional notice removed.
- Two real experience entries (Babel, NTTData) with descriptive `companyIcon.alt`
  (`Logotipo de …`) and temporally-neutral homepage `summary` copy.

## Notes

- Education, languages, skills, hobbies, and disability sections remain out of
  scope (deferred to a later increment).
- The profile photo asset remains the placeholder; the schema now accepts a real
  local photo path when one is supplied.
- Company logos are provisional placeholders (initials marks); real logos will
  replace them later.
- The source CV PDF (`Daniel Cerezo Torrejón`) is intentionally left untracked and
  ignored (personal data).
