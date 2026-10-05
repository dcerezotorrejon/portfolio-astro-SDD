# Personal Portfolio

A responsive, Spanish-language personal portfolio built with Astro. The homepage
introduces the profile and professional experience; each experience entry also has
its own detail page. Profile and experience content is sourced from validated
Markdown collections, while the site is statically rendered by default.

> **Content and deployment are still provisional.** Replace the sample profile,
> experience entries, social links, and `https://example.com` site URL before
> publishing as a real portfolio.

## Technology

- [Astro](https://astro.build/) for static pages and content collections.
- [Tailwind CSS v4](https://tailwindcss.com/) through `@tailwindcss/vite`.
- React only for the interactive floating section navigator; the rest of the
  site stays statically rendered.
- Markdown content validated with schemas.
- Vitest, Astro's Container API, and axe-core for tests and accessibility checks.

## Requirements

- Node.js `>=22.12.0`
- pnpm

## Getting started

```sh
pnpm install
pnpm dev
```

Astro starts the local development server at `http://localhost:4321`.

## Commands

| Command             | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `pnpm dev`          | Start the local Astro development server.                    |
| `pnpm build`        | Build the static site into `dist/` and generate the sitemap. |
| `pnpm preview`      | Preview the production build locally.                        |
| `pnpm lint`         | Run ESLint.                                                  |
| `pnpm lint:fix`     | Apply ESLint fixes.                                          |
| `pnpm format`       | Format the repository with Prettier.                         |
| `pnpm format:check` | Check formatting without modifying files.                    |
| `pnpm test`         | Start Vitest in watch mode.                                  |
| `pnpm test:run`     | Run the complete unit, component, and SEO test suite.        |
| `pnpm test:a11y`    | Run the accessibility test suite.                            |

Before considering a change complete, run the applicable quality gates:

```sh
pnpm lint
pnpm format:check
pnpm build
pnpm test:run
pnpm test:a11y
```

## Content

Portfolio copy and page metadata live in Markdown, not in the presentation
components:

- `src/content/profile/profile.md` — name, headline, social links, section labels,
  and homepage SEO metadata.
- `src/content/experience/*.md` — one Markdown entry per experience, including its
  unique slug, dates, summary, technologies, local company icon, detail-page SEO
  metadata, and expanded description.

Collections and frontmatter schemas are defined in `src/content.config.ts` and
`src/lib/content-schema.ts`. Keep slugs unique, use local image assets with
meaningful alternative text, and update the sample content before publishing.
Components should render the content they receive rather than hardcoding portfolio
copy.

## Project structure

```text
src/
├── components/       # Astro components and the interactive floating navigator
├── content/          # Profile and experience Markdown collections
├── layouts/          # Shared page layout and metadata
├── lib/              # Content helpers, schemas, and navigation logic
├── pages/            # Homepage and generated experience detail pages
└── styles/           # Global styles and design tokens
public/               # Local fonts and image assets
docs/                 # Project constitution and global design guidance
specs/                # Living feature specifications, plans, and QA evidence
tests/                # Unit, SEO, and accessibility tests
```

The global visual system is documented in [`docs/design.md`](docs/design.md),
and the binding engineering and accessibility requirements are in
[`docs/constitution.md`](docs/constitution.md).

## Development workflow

This repository follows **spec-anchored development**. A feature is described in
`specs/[NNN]-[feature-slug]/` and its spec remains the source of the agreed
requirements for that increment. Historical `spec.md` files are not rewritten;
later changes get a new spec and update affected summaries.

After a spec is agreed, the Dev Lead creates one shared branch named
`spec/[NNN]-[slug]`. Dev and QA work on that branch—there are no per-task or
per-developer branches. Up to four independent tasks may be active at once;
overlapping or dependent tasks are serialized. QA approval and task evidence are
required before the task closes. The Dev Lead creates the final feature commit(s)
and pushes the spec branch only after all QA approvals and final quality gates pass,
using the repository's commit skill. Merging a feature branch into the project
base branch is managed separately.

See [`specs/README.md`](specs/README.md) for spec conventions and
[`AGENTS.md`](AGENTS.md) for the operational agent workflow.

## Site configuration

The canonical site URL is configured as `site` in `astro.config.mjs` and is
currently `https://example.com`. Set it to the production domain before deployment
so canonical URLs and the sitemap use the correct origin.
