# Tasks — Profile photo fit and logo optimization

Increment `024-profile-photo-fit`, branch `spec/024-profile-photo-fit`.
Implementation by `dev`, verification by `qa` (Constitution §5.1).

> A task is only closed after QA approval and recorded evidence for every
> applicable gate. Dev owns `tests/unit/**`; QA owns SEO/a11y/integration and
> the gates. No task-level commits/pushes.

## Tasks

### T1 — Profile image content + schema (`image()`)

- **Depends on**: —
- **Dev (production)**: move `public/images/profile-photo.jpg` →
  `src/content/profile/profile-photo.jpg`; update `src/content/parsers/content-schema.ts`
  (replace `localProfileImagePath` with Astro's `image()` helper and retype
  `ProfileData.image.src` as `ImageMetadata`); update `src/content.config.ts`
  (profile `schema` as `({ image }) => z.object({...})`); update
  `src/content/profile/profile.md` (`image.src: ./profile-photo.jpg`).
- **Dev (unit)**: `tests/unit/content.test.ts` — schema accepts a
  collection-relative image and rejects remote/absolute/invalid paths.
- **QA report**: verified by `qa` on `spec/024-profile-photo-fit` @ `1552b36`
  (plus the uncommitted T1–T4 working-tree changes). Scope **AC8** (T1).
  - Reviewed `tests/unit/content.test.ts`: accepts `./profile-photo.jpg` with a
    non-empty `alt`, and rejects a missing `image.src`, an empty `image.src`, and
    an empty `alt` (via a documented `image: () => z.string().min(1)` mock). The
    mock intentionally does not exercise Astro's resolver, so the negative half of
    AC8 is not unit-tested.
  - AC8 positive half is backed by the real `image()` path: `pnpm build` resolves
    `./profile-photo.jpg` through the profile collection
    `schema: ({ image }) => profileSchema(image)` and emits 12 `srcset` variants
    (`/_astro/profile-photo.*.{avif,webp,jpg}`); a plain string `src` could not
    produce `<Picture>` output. The negative half (remote URL / non-resolvable
    path fails content loading) is Astro's `image()` guarantee, confirmed in
    `node_modules/astro/dist/content/runtime-assets.js` `createImage`: it adds a
    **fatal** issue when `pluginContext.resolve` yields no id or
    `emitImageMetadata` returns `undefined`. No repo code bypasses this helper.
  - `pnpm lint` ✓ clean.
  - `pnpm format:check` ✓ clean.
  - `pnpm build` ✓ cold build succeeds; emits the profile variants.
  - `pnpm test:run` ✓ — 26 files / 169 tests.
  - `pnpm test:a11y` ✓ — 4 files / 5 tests.
  - `pnpm test:integration` ✓ — 18 tests.
  - Result: **APPROVED** at @ `1552b36` — all applicable gates pass; AC8 backed.
- **Evidence**: unit ✓ / lint ✓ / format ✓ / build ✓ / a11y ✓ / integration ✓.

### T2 — Profile image component (contain frame + eager loading)

- **Depends on**: T1
- **Dev (production)**: `src/components/home/ProfileIntroduction.astro` — render
  via `Picture` (`astro:assets`, `formats=["avif","webp"]`, responsive widths,
  eager loading) with frame classes `aspect-square … object-contain bg-surface
rounded-card` and responsive widths; `alt` from content.
- **Dev (unit)**: `tests/unit/home.test.ts` and
  `tests/unit/design-assets.test.ts` — assert `object-contain`, white surface,
  not lazy, alt, and `--profile-image-width-desktop` = 240 px.
- **QA report**: re-verified by `qa` on `spec/024-profile-photo-fit` @ `1552b36`
  (plus the uncommitted working-tree changes), after the frame sizing/positioning
  moved from the `<img>` to the `<picture>` flex item. Scope AC1–AC7. Kept
  `tests/integration/profile.spec.ts` re-anchored (portrait ratio, computed
  `object-fit: contain`, white surface, modern format, response < 100 KB) and
  added a responsive frame-size guard for the collapsed-size regression
  (`#inicio picture` and `.profile-image` measure 240 px desktop / 200 px mobile).
  - `pnpm lint` ✓ clean.
  - `pnpm format:check` ✓ clean.
  - `pnpm build` ✓ cold build succeeds; emits AVIF/WebP/JPEG variants (see T4).
  - `pnpm test:run` ✓ — 26 files / 169 tests (includes SEO and T2 unit tests).
  - `pnpm test:a11y` ✓ — 4 files / 5 tests.
  - `pnpm test:integration` ✓ — 21 tests, including the frame-size guard.
  - Geometry (AC1/AC2/AC6): the `<picture>` flex item and inner `.profile-image`
    are square (240×240 px desktop, 200×200 px mobile) with `object-fit: contain`
    and a white surface; the portrait photo is fully visible (no crop).
  - Result: **APPROVED** at @ `1552b36` — all applicable gates pass. AC1–AC7
    verified; AC3 backed by the build output (see T4).

- **Evidence**: unit ✓ / lint ✓ / format ✓ / build ✓ / a11y ✓ / integration ✓.

### T4 — `sharp` direct dependency (image service)

- **Depends on**: T1, T2 (surfaced by T2's build gate)
- **Dev (production)**: add `sharp` as a direct dependency so `astro:assets`
  resolves the image service under pnpm's strict layout; update `package.json`
  and `pnpm-lock.yaml`. Approved by maintainer.
- **Dev (unit)**: — (no unit test; the build gate covers resolution)
- **QA**: re-run `pnpm build` and `pnpm test:integration`; verify AC3.
- **Evidence**: verified by `qa` @ `1552b36`. `pnpm build` ✓ cold build resolves
  `sharp` from the project root and emits the profile variants — AVIF
  5040/6174/12674/16301 B, WebP 8988/11654/24208/30378 B, JPEG fallback
  11346/14919/34378/45400 B; every variant < 100 KB (max 45400 B). At least one
  modern format (AVIF and WebP) emitted. `pnpm test:integration` ✓ 18 tests.

### T3 — Company logo SVG minification

- **Depends on**: —
- **Dev (production)**: minify `public/images/companies/babel.svg` and
  `public/images/companies/nttdata.svg` in place (preserve `viewBox`, shapes,
  colors; drop metadata/comments/whitespace).
- **Dev (unit)**: new `tests/unit/company-logo-assets.test.ts` — parse validity,
  preserved `viewBox`, no editor comments/`<metadata>`, byte size under R11.
- **QA report**: verified by `qa` on `spec/024-profile-photo-fit` @ `1552b36`
  (plus the uncommitted T1–T4 working-tree changes). Scope **AC9, AC10** (T3).
  - AC9 — reviewed `tests/unit/company-logo-assets.test.ts` (10 tests): asserts
    `<svg`/`</svg>`, the exact preserved `viewBox` (`babel` `0 0 526.8 129.1`,
    `nttdata` `0 0 340.16 69.52`), absence of `<!--`/`<metadata>`/`data-name`,
    byte size below R11 (5462 / 3529 B), and a `<path`/`fill`. The "valid SVG"
    assertion is only a substring check, not a real parse; validity is
    additionally proven by the browser rendering (AC10) and an independent
    `xmllint --noout` parse. A diff against `HEAD` confirms identical
    rendering-relevant element counts (paths, `g`, `fill`, `clipPath`, `use`,
    `stop-color`; same `#hex` palette). Bytes: `babel.svg` 5462 → 4560 B
    (−16.5%), `nttdata.svg` 3529 → 2590 B (−26.6%).
  - AC10 — added `tests/integration/experience-logos.spec.ts` (2 tests) and
    exposed each `companyIcon` `src`/`alt` through
    `tests/integration/helpers/content.ts`. The homepage-cards and detail-pages
    tests assert, for every experience entry, the `src`, `alt`, `width`/`height`
    (128) and `naturalWidth > 0` of each `img.company-icon`. Passing on Chromium.
  - `pnpm lint` ✓ clean.
  - `pnpm format:check` ✓ clean.
  - `pnpm build` ✓ cold build succeeds.
  - `pnpm test:run` ✓ — 26 files / 169 tests.
  - `pnpm test:a11y` ✓ — 4 files / 5 tests.
  - `pnpm test:integration` ✓ — 20 tests (18 + 2 new AC10), including
    `experience-logos.spec.ts`.
  - Result: **APPROVED** at @ `1552b36` — all applicable gates pass; AC9 and
    AC10 verified.
- **Evidence**: unit ✓ / lint ✓ / format ✓ / build ✓ / a11y ✓ / integration ✓.

## Execution order

1. T1 and T3 may run in parallel (disjoint files, no shared deps).
2. T2 starts only after T1 closes.
3. QA sessions run serially (shared test/build artifacts).

## Final gates (Lead, at closure)

Final-gate report (Lead, latest) on `spec/024-profile-photo-fit` @ `1552b36`:

- `pnpm lint` — clean (exit 0).
- `pnpm format:check` — clean ("All matched files use Prettier code style!").
- `pnpm build` — success; 3 pages built; emits 12 profile-image variants
  (AVIF/WebP/JPEG), all < 100 KB.
- `pnpm test:run` — 26 files / 169 tests passed.
- `pnpm test:a11y` — 4 files / 5 tests passed.
- `pnpm test:integration` — 21 tests passed (Chromium, including the new
  profile-frame-size guard and experience-logos specs).

The change set is non-Markdown and includes `src/content/**`, so the full gate
set applies and the Markdown-only exception (Constitution §§5–6) does not.
