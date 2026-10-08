# Adapt real CV content into the portfolio

- **Spec ID**: `021-cv-content`
- **Status**: done
- **Last updated**: 2026-10-08

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The portfolio currently renders explicitly provisional Spanish Markdown content:
`profile.md` uses `Nombre Apellidos` and a placeholder headline/notice, and the two
experience entries are `Puesto de ejemplo` / `Empresa de ejemplo`. The maintainer
provided a real CV (a PDF, text extracted for reference) containing the actual
name, title, a long "ACERCA DE MÍ" bio, and two real positions (Babel Sistemas de
Información and NTTData Europe & LATAM). This increment replaces the placeholder
content with that real data, adds an `about` bio field to the profile, and removes
the provisional `notice` affordance that no longer applies to real content.

Content remains hydrated from Markdown collections (§2 of the constitution). The
changes touch schema (`src/content/parsers/content-schema.ts`), two Astro
components, the global stylesheet, static assets, and the tests that assert the
placeholder values. This is therefore a normal code+content increment, not the
Markdown-only exception.

## Goals

- Replace the placeholder profile with the real name, headline, bio, image alt,
  social destinations, and SEO values.
- Replace the two placeholder experience entries with the two real positions from
  the CV, including role, company, dates, summary, technologies, company icon, SEO,
  and the expanded long-form body (used as-is except formatting and spelling).
- Add an `about` field to the profile schema and render it in the profile
  introduction.
- Remove the provisional `notice` field end-to-end (schema, both components,
  profile content, stylesheet rule, and test assertions).
- Relax the profile image `src` schema from a single literal to a local image path
  so a real photo can be dropped in later; keep the placeholder asset for now.
- Add provisional placeholder company SVGs for the two real companies.
- Correct spelling/casing within the content that is in scope (e.g. `JavaScript`,
  not `Javascript`).

## Non-goals

- Education, languages, skills/capabilities, hobbies, and disability sections are
  **not** added in this increment (deferred to a later one).
- A real profile photo asset is **not** added; the existing placeholder remains.
- Real company logos are **not** added; provisional placeholder SVGs are used.
- Email, phone, and address are **not** displayed; only GitHub/LinkedIn social
  links are rendered.
- The factual education institution name (out of scope) is **not** corrected here.
- No change to the experience detail layout beyond removing the notice and using
  real values.

## Requirements

### R1 — Real profile content

`src/content/profile/profile.md` MUST contain the following values (notice field
removed, `about` field added):

- `name`: `Daniel Cerezo Torrejón`
- `headline`: `Senior Frontend Engineer & Software Architect`
- `about`: `Senior Frontend Engineer & Software Architect con +8 años de experiencia en plataformas e-commerce de alto tráfico (Iberia.com). Especializado en diseñar arquitecturas Frontend desde cero con React, TypeScript y Clean Architecture, liderando la migración desde plataformas legacy a tecnologías de vanguardia. Apasionado de la cultura DevOps y la infraestructura Linux (Docker, CI/CD, Homelab).`
- `image.src`: `/images/profile-placeholder.svg` (unchanged asset)
- `image.alt`: `Fotografía de Daniel Cerezo Torrejón`
- `socials`:
  - github → `https://github.com/dcerezotorrejon`
  - linkedin → `https://www.linkedin.com/in/dcerezotorrejon`
- `historyHeading`: `Trayectoria profesional`
- `moreInfoLabel`: `Más información`
- `backLabel`: `Volver a la trayectoria`
- `navigation`: `inicio`/`Inicio` and `trayectoria`/`Trayectoria` (unchanged)
- `seo.title`: `Daniel Cerezo Torrejón | Senior Frontend Engineer | Portfolio profesional`
- `seo.description`: `Presentación y trayectoria profesional de Daniel Cerezo Torrejón, Senior Frontend Engineer & Software Architect.`

### R2 — Real experience entries

Delete `src/content/experience/puesto-ejemplo-2022.md` and
`src/content/experience/puesto-ejemplo-2024.md`, and add the two entries below.

**`src/content/experience/babel-senior-frontend-engineer.md`**

- `slug`: `babel-senior-frontend-engineer`
- `role`: `Senior Software Engineer (Frontend)`
- `company`: `Babel Sistemas de Información`
- `companyIcon.src`: `/images/companies/babel.svg`
- `companyIcon.alt`: `Logotipo de Babel Sistemas de Información`
- `startDate`: `2022-02-01` (no `endDate` → renders `actualidad`)
- `summary`: `Trabajo en la modernización de la web de Iberia.com y participo en iniciativas donde pongo en práctica Clean Architecture, React, TypeScript y React Compiler.`
- `technologies`: `React`, `TypeScript`, `Zustand`, `Stencil.js`, `Angular`, `AngularJS`
- `seo.title`: `Senior Software Engineer (Frontend) (2022) | Daniel Cerezo Torrejón | Portfolio profesional`
- `seo.description`: `Arquitectura Frontend desde cero en Iberia.com con React, TypeScript y Clean Architecture como Senior Software Engineer.`
- Body (long text, used as-is except Markdown formatting):

```md
- **Liderazgo de Arquitectura Frontend:** Diseño e implementación desde cero de arquitecturas Frontend escalables basadas en Clean Architecture, aplicando principios SOLID y patrones modulares para garantizar la mantenibilidad a largo plazo.
- **Adopción de Tecnologías de Vanguardia:** Desarrollo de proyectos web utilizando las últimas versiones de React, integrando React Compiler para la optimización automática del renderizado, TypeScript para un tipado estricto y Zustand para la gestión de estado.
- **Referente Técnico y Mentoría:** Actuación como referente del equipo realizando análisis técnicos, propuestas de arquitectura y evaluación de viabilidad para negocio y desarrollo. Promoción activa de buenas prácticas, testing (Vitest, Jest, Axe) y accesibilidad web (WCAG).
- **Desarrollo Modular:** Creación e integración de componentes web reutilizables de alto rendimiento utilizando Stencil.js y React para los portales del grupo Iberia.
- **Modernización de aplicaciones Legacy:** Participación en migraciones de elevada complejidad basadas en frameworks Angular y AngularJS.
```

**`src/content/experience/nttdata-lead-engineer.md`**

- `slug`: `nttdata-lead-engineer`
- `role`: `Lead Engineer`
- `company`: `NTTData Europe & LATAM`
- `companyIcon.src`: `/images/companies/nttdata.svg`
- `companyIcon.alt`: `Logotipo de NTTData Europe & LATAM`
- `startDate`: `2017-07-01`
- `endDate`: `2022-01-31`
- `summary`: `De Solutions Assistant a Lead Engineer en Iberia.com, coordinando la arquitectura de contenidos de Oracle WebCenter Sites y la migración de módulos legacy hacia TypeScript y Angular.`
- `technologies`: `TypeScript`, `JavaScript`, `Angular`, `AngularJS`, `jQuery`, `Webpack`
- `seo.title`: `Lead Engineer (2017) | Daniel Cerezo Torrejón | Portfolio profesional`
- `seo.description`: `Progresión hasta Lead Engineer en Iberia.com: liderazgo técnico y migración de módulos legacy.`
- Body (long text, used as-is except Markdown formatting):

```md
- **Progresión Técnica:** Ascenso continuado desde Solutions Assistant hasta Lead Engineer en el proyecto estratégico Iberia.com.
- **Liderazgo Técnico y Gestión de Contenidos:** Coordinación del análisis y desarrollo de componentes orientados a contenido en Oracle WebCenter Sites, definiendo la estructura técnica y plantillas JSP.
- **Migración y Modernización Tecnológica:** Evolución progresiva de módulos legacy basados en jQuery y JSP hacia arquitecturas modernas en JavaScript/TypeScript y frameworks como AngularJS y Angular, empaquetados mediante Webpack y Babel.
```

YAML note: any frontmatter value containing `: ` (colon-space), such as the
NTTData `seo.description`, MUST be double-quoted.

### R3 — Schema: add `about`, remove `notice`, relax image `src`

In `src/content/parsers/content-schema.ts`:

- Remove `notice: nonEmptyString` from `profileSchema`.
- Add `about: nonEmptyString` to `profileSchema`.
- Replace `image.src: z.literal("/images/profile-placeholder.svg")` with a local
  image path validator (e.g. `/^\/images\/[a-z0-9-]+\.(svg|png|jpe?g|webp)$/`),
  reused via a named constant like `localProfileImagePath`, keeping
  `image.alt: nonEmptyString`.
- `companyIconSchema` already accepts any `/images/companies/*.svg`; no change is
  required there.

### R4 — Components: render `about`, drop `notice`

- `src/components/home/ProfileIntroduction.astro`: remove the notice paragraph
  (`<p class="provisional-notice …">{profile.notice}</p>`, which now carries inline
  Tailwind utilities); add a paragraph rendering `profile.about` between the
  `headline` paragraph and the social links list, styled consistently with the
  headline (e.g. `class="mt-3 mb-5"`).
- `src/pages/experiencia/[slug].astro`: remove the notice paragraph
  (`<p class="provisional-notice …">{profile.notice}</p>`); keep the `profile` prop
  because `profile.backLabel` is still used.
- No `src/styles/global.css` change is required: the `.provisional-notice` rule was
  already removed from `global.css` by the Tailwind-first migration; only the two
  inline notice paragraphs (deleted here) still carry the class name.

### R5 — Assets: provisional company SVGs

Add two self-contained placeholder SVGs (no external references) that match the
`companyIconSchema` path regex:

- `public/images/companies/babel.svg`
- `public/images/companies/nttdata.svg`

Each must be a square, self-contained SVG with a simple neutral/initials mark and
no `<image>` or external `href` references, following the same style as the
existing `astro.svg` placeholder.

### R6 — Spelling and casing

Within the in-scope content, use correct spelling/casing; in particular
`JavaScript` (not `Javascript`). Do not alter the factual education institution
name (out of scope).

### R7 — Tests updated to real content

Update all tests that assert the replaced placeholder values so they assert the
real content and no longer assert the removed `notice`. Known affected files:

- `tests/unit/content.test.ts` (approved profile/sample fixtures)
- `tests/unit/home.test.ts` (name, headline, notice, image alt)
- `tests/unit/experience.test.ts` (slugs, role, company, icon, date ranges,
  technologies, expanded body, notice assertion)
- `tests/unit/company-icon.test.ts` (fixture content)
- `tests/seo/home.test.ts` (title/description)
- `tests/seo/experience.test.ts` (detail titles)

At least one test MUST cover rendering of the new `about` field, and no test in
`src/` or `tests/` may assert the `notice` profile field or the placeholder
values. `tests/unit/design-assets.test.ts` requires no change: it references the
retained placeholder image and asserts `.provisional-notice` is absent from
`global.css` (a Tailwind-migration check that remains valid).

## Acceptance criteria

- [x] AC1: `profile.md` contains exactly the real values in R1 (name, headline,
      `about`, image alt, both social URLs, history/more-info/back labels, navigation,
      SEO) and no `notice` field.
- [x] AC2: The two placeholder experience files are removed and the two real
      entries in R2 exist with the exact slug, role, company, icon, dates, summary,
      technologies, SEO, and long-form body specified.
- [x] AC3: `profileSchema` has `about` and no `notice`, and `image.src` accepts any
      local `/images/` path (photo-ready) while the placeholder asset is still used.
- [x] AC4: `ProfileIntroduction.astro` renders the `about` paragraph and no
      provisional notice; `[slug].astro` renders no notice; no `provisional-notice`
      class or `profile.notice` reference remains in `src/`.
- [x] AC5: `babel.svg` and `nttdata.svg` exist, validate against
      `companyIconSchema`, and are self-contained placeholders.
- [x] AC6: The site builds and the two experience detail pages render at
      `/experiencia/babel-senior-frontend-engineer/` and
      `/experiencia/nttdata-lead-engineer/` with the correct headings, date ranges
      (`febrero de 2022 – actualidad`, `julio de 2017 – enero de 2022`), badges, and
      body.
- [x] AC7: No remaining references to the placeholder strings `Nombre Apellidos`,
      `Puesto de ejemplo`, `Empresa de ejemplo`, or `Contenido provisional de
ejemplo` in `src/` or `tests/`, and no `notice` field or `provisional-notice`
      class remains in `src/` (the placeholder image asset path and frozen
      `specs/**` snapshots are excluded).
- [x] AC8: All applicable quality gates pass — lint, format, build, unit tests,
      SEO, accessibility, and integration.

## Verification

- **Content correctness** — `pnpm build` (schema validation rejects malformed
  frontmatter) plus direct file review of the three Markdown files.
- **Schema** — `tests/unit/content.test.ts` (updated fixtures) and `pnpm build`.
- **`about` rendering / notice removal** — `tests/unit/home.test.ts` and
  `tests/unit/experience.test.ts`; a grep across `src/` and `tests/` shows no
  `provisional-notice` / `notice` field references.
- **Assets** — `pnpm test:run` schema coverage and a self-containment review of the
  two SVGs.
- **SEO** — `pnpm test:run` (SEO tests over rendered HTML) and `pnpm build`
  (sitemap output).
- **Accessibility** — `pnpm test:a11y`.
- **Integration** — `pnpm test:integration`.
- **Spelling** — manual/QA content review (no automated spellcheck configured).
