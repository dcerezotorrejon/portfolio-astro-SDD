# Constitution

> Authoritative rules for this project. If any other guidance (agent instructions,
> comments, or conventions) conflicts with this document, **this document prevails**.
> It can only be changed through the amendment process in §11.

- **Version**: 1.4.0
- **Last amended**: 2026-10-05

---

## 1. Purpose and precedence

This constitution defines the non-negotiable rules for building and evolving the
project. Everything else — agent files, READMEs, inline comments — is subordinate
to it. When a practice is not covered here, use the Astro documentation and the
conventions already present in the codebase, in that order.

## 2. Project nature

- The project is a **personal portfolio built with Astro**, styled with **Tailwind CSS v4**.
- **Content is hydrated from Markdown files**. Portfolio content (projects,
  experience, posts, metadata, etc.) MUST live in `.md` files consumed through
  Astro content collections.
- Components MUST render content they receive; they MUST NOT hardcode portfolio
  content that belongs in Markdown.
- Static assets live in `public/` (or are imported when they need optimization).
- **Interactivity policy**: By default, the site is static and sends no client
  JavaScript. React MAY be used for elements that require real client-side
  interactivity, including interactive navigation and stateful indicators.
  Framework components are reserved exclusively for those interactive islands
  and MUST always be declared with an explicit `client:*` directive. Using React
  for an interactive element does not justify hydrating unrelated static content.
  Content and logic that can be resolved at build/Markdown time must remain
  unhydrated.

### 2.1 Global design

- [`docs/design.md`](./design.md) defines the shared visual language for the
  entire portfolio. Specs, technical plans, and UI implementations MUST reference
  and follow its applicable criteria.
- Shared design criteria belong in that document; feature-specific content,
  placement, and interaction behavior belong in the corresponding spec.
- The design document is subordinate to this constitution, including the
  accessibility requirements in §7.

## 3. Spec-Anchored Development

This project follows **spec-anchored development**, not spec-first and not
spec-as-source:

- **Spec-anchored** means the spec is a _living artifact_. It is written alongside
  the work and **kept in sync with the code for the entire life of the feature**.
  It is never discarded once the first implementation ships.
- **Spec-first** (writing a spec and throwing it away) and **spec-as-source**
  (generating code from the spec without editing the code) are explicitly **not**
  the model used here.
- Specs and code MUST evolve together.
- **Conflict resolution**: when code and spec diverge, **the code is the source of
  truth**. The divergence is analyzed, and then the spec is updated to re-anchor
  against the real behavior. Silently changing code to match a stale spec is not
  allowed; the spec must be amended to reflect reality.

## 4. Spec structure and naming

Each spec lives in its own directory under `specs/`:

```
specs/[NNN]-[feature-slug]/
├── spec.md      # requirements + acceptance criteria
├── plan.md      # technical approach
├── tasks.md     # checklist of tasks with verification evidence
└── summary.md   # files/functions changed + date
```

Rules:

- `[NNN]` is a zero-padded sequential numeric identifier (e.g. `001`).
- `[feature-slug]` is a short, lowercase, hyphenated name of the **main feature,
  at most three words** (e.g. `001-content-collections`,
  `002-responsive-nav`).
- The feature slug **may and should be repeated** across specs when the same
  behavior is modified. The numeric identifier keeps each spec unique.
- All spec files are written in **English** (see §9 for the language policy).

### 4.1 `summary.md`

Every spec MUST include a `summary.md` that records, at minimum:

- **Date** of the latest update.
- **Files changed** (paths relative to the repo root).
- **Functions / components changed** and a short description of what changed.
- **Related specs** — the specs this one affects or is affected by, with the
  direction of each relationship (§4.2). State "None." when there are none.

It is created when the spec is completed and **updated on every later change**
that touches the feature, refreshing the date.

### 4.2 Spec relationships

Features do not exist in isolation: changing one behavior usually touches
others, and specs must keep those links visible.

- While a spec is being written, its **anticipated relationships** are recorded
  in `spec.md`: which existing specs it is likely to affect, depend on, or
  modify.
- When the spec is completed, `summary.md` MUST resolve them in its
  **`Related specs`** section, listing every spec that was added, modified, or
  otherwise impacted, with a short note describing the relationship. If there
  are none, state "None." explicitly.
- Relationships are **bidirectional in maintenance**: when a later change
  touches a feature, the `summary.md` of the affected spec is updated in the
  same change, refreshing its date.
- Historical `spec.md` files MUST NOT be rewritten by later incremental specs.
  A new spec records anticipated relationships in its own `spec.md`; when an
  earlier feature is affected, update only that feature's `summary.md` relationship
  record in the same change. The current feature's spec remains a living artifact
  under §3.

## 5. Task lifecycle and verification gates

- Tasks are tracked as checklists in `tasks.md`.
- A task MUST NOT be marked complete (`[x]`) without **evidence** attached to it.
- Every task MUST be verified against the applicable gates: **unit tests**,
  **SEO**, and **accessibility**. The evidence (command run and result, or a short
  note) is recorded next to the task.
- If a gate does not apply to a task, that must be stated explicitly rather than
  skipped silently.

### 5.1 Shared feature-branch workflow

- After a spec is agreed and planning begins, the Dev Lead MUST create and publish
  exactly one feature-work branch named `spec/[NNN]-[slug]`, using the complete
  spec directory name. This is the shared branch for every Dev and QA working on
  that feature. Task/developer branches (including `dev/...`) MUST NOT be created.
- The Dev Lead MAY run independent tasks in parallel only when their file scopes
  do not overlap and they have no unfinished dependencies. Overlapping tasks and
  tasks with dependencies MUST be serialized.
- No more than four tasks may be active at once. A task becomes active when
  assigned to a Dev and remains active through QA verification, evidence
  recording, and any rework. It closes only when QA approves it and records
  evidence; a fifth task MUST NOT be assigned while four tasks are active.
- QA verifies the task on the shared feature branch, may update tests and task
  evidence there, and MUST NOT edit production code or commit or push. If QA finds
  defects, the same Dev corrects them on that branch and returns the task to QA.
  Dev and QA MUST NOT create branches, merge branches, or commit or push task work.
- If an agent encounters a Git or change conflict, it MUST stop the affected
  operation and notify the Dev Lead with the conflicting branches/files and
  blocking state. Agents MUST NOT overwrite another agent's work or guess at a
  resolution. The Lead escalates decisions requiring judgment to the maintainer;
  work resumes only after an agreed resolution.
- Before planning or delegating implementation affected by a material technical
  decision not settled by the spec, constitution, or established conventions, the
  Dev Lead MUST present the decision and options to the maintainer and receive
  approval. The Lead records the approved decision in the relevant planning
  artifact.
- After every task has QA approval and evidence, and the final quality gates in
  §6 pass, only the Dev Lead uses the repository's commit skill for the final
  feature commit(s) and push of the shared branch. This workflow does not merge
  the feature branch into the repository's base branch or delete the feature
  branch; base-branch integration is separately managed.

## 6. Quality gates

Before a spec or a task is considered done, all of the following MUST pass:

| Gate          | Command                                        |
| ------------- | ---------------------------------------------- |
| Lint          | `pnpm lint`                                    |
| Format        | `pnpm format:check`                            |
| Build         | `pnpm build`                                   |
| Unit tests    | `pnpm test:run`                                |
| Accessibility | `pnpm test:a11y` (and/or the `a11y` MCP audit) |

## 7. Accessibility

- Accessibility is a first-class requirement, not an afterthought.
- Target: **WCAG 2.2 level AA**.
- Use semantic HTML, landmarks, logical heading order, and sufficient color
  contrast.
- Every image needs meaningful `alt` text (or empty `alt` when decorative).
- Interactive elements must be keyboard reachable and operable, with visible
  focus states.
- Automated checks are necessary but not sufficient; manual/keyboard checks are
  encouraged for non-trivial UI.

## 8. SEO

- Every page MUST have a unique `<title>` and a meta description.
- Canonical URLs and a sitemap MUST be generated.
- Prefer semantic markup and, where useful, structured data.
- SEO is verified by automated tests over the rendered HTML (`<title>`, meta,
  canonical) and by the sitemap build output.

## 9. Content and internationalization

- Markdown is the source of truth for content (§2).
- Content collections MUST validate their frontmatter with a schema.
- If the site is multilingual, use Astro's i18n routing conventions; do not
  invent ad-hoc locale handling.

### Language policy

- **Interaction / conversation** with the maintainer is in **Spanish**.
- **All committed artifacts** (`docs/constitution.md`, `AGENTS.md`, and every
  file under `specs/`: `spec.md`, `plan.md`, `tasks.md`, `summary.md`) are written
  in **English**, to reduce token cost during execution.

## 10. Tooling

The approved verification stack is:

- **Unit / component tests**: [Vitest](https://vitest.dev/) together with the
  Astro Container API to render components without a browser.
- **SEO**: `@astrojs/sitemap` for sitemap generation, plus tests over rendered HTML.
- **Accessibility**: `axe-core` against rendered HTML in tests, plus the `a11y`
  MCP server configured in `opencode.json` for URL-based audits.
- **Lint / format**: ESLint and Prettier (already configured).
- **CSS**: Tailwind CSS v4 through the official Vite plugin `@tailwindcss/vite` (global stylesheet at `src/styles/global.css` with `@import "tailwindcss";`). (Note: `@astrojs/tailwind`/Tailwind 3 is legacy and not used.)
- **Client interactivity**: React through `@astrojs/react`, used only for interactive islands (see §2). The React Compiler is enabled (`react({ compiler: true })`) via the `oxc-transform-react` dev dependency.

Adding or replacing tools requires updating this section.

## 11. Governance and amendments

- This constitution is versioned. Any change MUST increment the version and update
  the **Last amended** date.
- Amendments are proposed in conversation, justified, and applied only after
  maintainer approval.
- `AGENTS.md` and other guidance MUST remain consistent with this constitution.
  When the constitution changes, dependent guidance is updated in the same change.
