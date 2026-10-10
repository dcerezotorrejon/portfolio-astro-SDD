# Plan — Profile photo fit and logo optimization

- **Spec**: `specs/024-profile-photo-fit/spec.md`
- **Branch**: `spec/024-profile-photo-fit` (published to `origin`)
- **Base**: `main`

## Approach

### 1. Profile photo through the Astro image pipeline (R1–R8)

The photograph is a tall portrait rendered in a square frame; `object-cover`
crops it top and bottom. We switch the frame to `object-fit: contain` and route
the asset through `astro:assets` so only optimized modern-format variants are
served.

1. **Move the master** from `public/images/profile-photo.jpg` to
   `src/content/profile/profile-photo.jpg` (collection-relative, so Astro's
   `image()` schema helper can resolve it). Keep the original 3258×4102 file as
   the master — no pre-downscaling.
2. **Schema**: the profile collection schema becomes a function
   `({ image }) => z.object({...})` so `image.src` uses `image()`. The exported
   `ProfileData` type is updated so `image.src` is an `ImageMetadata` (from
   `astro:assets`) instead of a validated string. The string-path regex
   (`localProfileImagePath`) is removed.
3. **Frontmatter**: `src/content/profile/profile.md` changes
   `image.src` to `./profile-photo.jpg`.
4. **Component**: `ProfileIntroduction.astro` renders `<Picture>` from
   `astro:assets` with `formats={["avif", "webp"]}`, responsive `widths`/`sizes`
   covering the 200/240 px render sizes (including 2x), `loading` eager (not
   lazy), and the frame classes: `profile-image aspect-square
w-[min(200px,100%)] shrink-0 self-center rounded-card object-contain
bg-surface md:w-[240px] md:self-auto`. `alt` stays content-driven.

### 2. Company logo minification (R9–R11)

Minify `public/images/companies/babel.svg` and `nttdata.svg` **in place**, once,
with no added dependency. Remove the XML declaration/editor comments,
`<metadata>`, unused `<style>`/`<defs>` blocks, redundant namespaces and
attributes, and insignificant whitespace, while preserving the `viewBox`, shapes
and colors. Asset paths, the `companyIcon` schema, the frontmatter `alt` and the
`<img class="company-icon">` behavior are unchanged.

## Files to change

| File                                                                        | Task    | Nature                                     |
| --------------------------------------------------------------------------- | ------- | ------------------------------------------ |
| `public/images/profile-photo.jpg` → `src/content/profile/profile-photo.jpg` | T1      | move (master)                              |
| `src/content/parsers/content-schema.ts`                                     | T1      | schema: `image()`, `ProfileData` type      |
| `src/content.config.ts`                                                     | T1      | profile collection `schema` function form  |
| `src/content/profile/profile.md`                                            | T1      | `image.src: ./profile-photo.jpg`           |
| `src/components/home/ProfileIntroduction.astro`                             | T2      | `<Picture>` + contain frame                |
| `public/images/companies/babel.svg`                                         | T3      | minify in place                            |
| `public/images/companies/nttdata.svg`                                       | T3      | minify in place                            |
| `tests/unit/content.test.ts`                                                | T1      | schema acceptance/rejection                |
| `tests/unit/home.test.ts`                                                   | T2      | rendered image assertions                  |
| `tests/unit/design-assets.test.ts`                                          | T2      | frame geometry (`object-contain`)          |
| `tests/unit/company-logo-assets.test.ts` (new)                              | T3      | viewBox + size + no metadata               |
| `tests/integration/profile.spec.ts`                                         | QA (T2) | served asset format/size (re-anchor `src`) |
| `tests/integration/experience*.spec.ts`                                     | QA (T3) | logos still load                           |

## Approved decisions (maintainer)

1. **Minification medium**: one-time in-place commit, no SVGO/devDependency.
   Avoids a constitution §10 (Tooling) amendment; trade-off is manual
   re-minification if a logo changes later.
2. **Master asset**: keep the original 1.8 MB photograph as the committed master;
   only the served variants are optimized (each < 100 KB, modern format).

## Risks

- **`astro:assets` in unit tests**: the Astro Container renders `<Picture>`/`<Image>`;
  unit tests must assert structure (alt, classes, `object-fit`, `loading`, width
  token) rather than the exact hashed/optimized `src`. Exact asset URLs and
  formats are verified against the production build and via integration.
- **`sharp` availability**: `astro:assets` needs `sharp`, which is Astro's
  optional dependency and present in the pnpm store; verify a real `pnpm build`
  resolves it.
- **`image()` validation semantics**: the profile schema's exact
  accept/reject behavior (remote, absolute, traversal paths) is whatever Astro's
  `image()` enforces. If it diverges from R6/AC8 wording, QA reports it and the
  spec is re-anchored (spec-anchored development), not silently forced.
- **Working tree baseline**: `profile.md` already points to the real photo and
  `tests/unit/home.test.ts` currently fails expecting the placeholder; T2
  re-anchors it.

## Testing strategy

- **Unit (Dev, `tests/unit/**`)**: schema accept/reject via `image()`; rendered
  `<img>` has `object-contain`, white surface, eager (not lazy) loading, alt and
  responsive width classes; logo SVGs parse, keep `viewBox`, drop metadata and
  shrink under the byte limits.
- **SEO (QA)**: homepage `<title>`/description/canonical regression.
- **Accessibility (QA)**: axe on homepage; profile image alt text present.
- **Integration (QA, Playwright)**: homepage image loads (`naturalWidth > 0`),
  served response is a modern format under 100 KB; experience cards and detail
  pages load both logos.
- **Build (QA/final)**: emitted profile-image assets are `.webp`/`.avif` and
  < 100 KB.
