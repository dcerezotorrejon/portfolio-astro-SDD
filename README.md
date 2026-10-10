# Personal Portfolio

A responsive, Spanish-language personal portfolio built with Astro. The homepage
introduces the profile and professional experience; each experience entry also has
its own detail page. Profile and experience content is sourced from validated
Markdown collections, while the site is statically rendered by default.

> **Content is still provisional.** Replace the sample profile, experience
> entries, and social links before publishing as a real portfolio.

## Technology

- [Astro](https://astro.build/) for static pages and content collections.
- [Tailwind CSS v4](https://tailwindcss.com/) through `@tailwindcss/vite`.
- React only for the interactive floating section navigator; the rest of the
  site stays statically rendered.
- Markdown content validated with schemas.
- Vitest, Astro's Container API, and axe-core for tests and accessibility checks.
- Playwright Test with Chromium and browser-based axe checks for integration
  coverage.

## Requirements

- Node.js `>=22.12.0`
- pnpm

## Getting started

```sh
pnpm install
pnpm dev
```

Astro starts the local development server at `http://localhost:4321`.

## Browser integration tests

Install the project dependencies and the Playwright Chromium browser from a fresh
checkout:

```sh
pnpm install
pnpm exec playwright install chromium
```

On Linux, if Chromium reports missing system libraries, install its required
operating-system dependencies with:

```sh
pnpm exec playwright install-deps chromium
```

Then run the browser suite:

```sh
pnpm test:integration
```

This command builds the static site and runs Playwright against a managed local
preview of that build; no separately started server is needed. The existing
browser tests cover the homepage and every content-derived experience detail
page, profile content and links, and the full experience list and detail/return
flows. Navigation tests cover pointer and keyboard use of the floating navigator,
including target visibility and active-section state. Browser axe checks cover the
homepage and every detail page using applicable WCAG A/AA tags through WCAG 2.2.
Automated axe checks do not establish complete WCAG conformance. Existing Vitest
unit, SEO, and accessibility tests remain available through their usual commands.

When a browser test fails, inspect Playwright's terminal failure output and the
generated diagnostics in `test-results/` (including traces/screenshots when
captured). The HTML report is written to `playwright-report/`; open it with
`pnpm exec playwright show-report playwright-report`. These generated files are
local test artifacts, not portfolio content.

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
`src/content/parsers/content-schema.ts`. Keep slugs unique, use local image assets with
meaningful alternative text, and update the sample content before publishing.
Components should render the content they receive rather than hardcoding portfolio
copy.

## Project structure

```text
src/
├── components/       # Shared atoms/molecules and page-grouped components
│   ├── atoms/         # Shared primitive components
│   ├── molecules/     # Shared composed components
│   └── home/          # Profile, experience history, badges, floating navigator
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

The canonical site URL is configured as
`site = "https://dcerezotorrejon.github.io"` in `astro.config.mjs`, together with
`base = "/portfolio-astro-SDD"`. The site is published at
`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`, so canonical URLs and
the sitemap use that origin and base.

## Deployment

The site is published with GitHub Pages at
`https://dcerezotorrejon.github.io/portfolio-astro-SDD/`.

Deployment is automated by `.github/workflows/deploy.yml`, which triggers only on
a `push` to `main`; a push to `main` is required to deploy a new build, and the
feature branch stays unmerged until it is approved. The workflow installs
Chromium and runs the repository quality gates — `pnpm lint`, `pnpm format:check`,
`pnpm build`, `pnpm test:run`, `pnpm test:a11y`, and `pnpm test:integration` —
before publishing; any gate failure prevents deployment.

GitHub Pages must be enabled once with the GitHub Actions build type. With the
GitHub CLI:

```sh
gh api --method POST /repos/dcerezotorrejon/portfolio-astro-SDD/pages -f build_type=workflow
```

If the Pages site already exists, use `--method PUT` instead of `--method POST`.
The workflow also enables Pages on its first run through `actions/configure-pages`
with `enablement: true`.
