# Summary — Profile photo fit and logo optimization

- **Date**: 2026-10-10

## Files changed

- `package.json`, `pnpm-lock.yaml` — added `sharp` as a direct dependency for the Astro image service.
- `src/content/profile/profile-photo.jpg` — real portrait photo moved here from `public/images/` and its corrupt EXIF Orientation tag fixed losslessly (257 → 1); kept as the 1.8 MB master.
- `src/content/profile/profile.md` — `image.src` now `./profile-photo.jpg`.
- `src/content/parsers/content-schema.ts` — profile schema converted to a factory using Astro's `image()` helper; `ProfileData.image.src` retyped as `ImageMetadata`.
- `src/content.config.ts` — profile collection `schema` uses `({ image }) => profileSchema(image)`.
- `src/components/home/ProfileIntroduction.astro` — renders `<Picture>` from `astro:assets` (AVIF/WebP, responsive widths, eager loading) in a square white rounded frame with `object-fit: contain`; flex sizing lives on the `<picture>` wrapper.
- `public/images/companies/babel.svg`, `public/images/companies/nttdata.svg` — minified in place (no dependency), preserving `viewBox`/shapes/colors.
- `tests/unit/content.test.ts`, `tests/unit/home.test.ts`, `tests/unit/design-assets.test.ts` — re-anchored to the new schema, `<Picture>` markup, and frame geometry.
- `tests/unit/company-logo-assets.test.ts` — new; asserts the logos keep `viewBox`, drop metadata/comments, and stay under R11 byte limits.
- `tests/integration/profile.spec.ts` — re-anchored to the served asset (portrait ratio, `object-fit: contain`, modern format < 100 KB) plus a responsive frame-size guard.
- `tests/integration/experience-logos.spec.ts` — new; asserts every company logo loads with alt and 128×128 dimensions.
- `tests/integration/helpers/content.ts` — exposes profile image alt and company icon src/alt for integration assertions.

## Functions / components changed

- `ProfileIntroduction.astro` — profile image now delivered through the Astro image pipeline and shown uncropped in a square white rounded frame.
- `profileSchema` / `ProfileData` (`content-schema.ts`) — image validated via `image()` as collection-relative `ImageMetadata` instead of a `/images/...` string regex.
- `resolveCompanyIcon` consumers — unchanged behavior; the two logo assets were only minified.
