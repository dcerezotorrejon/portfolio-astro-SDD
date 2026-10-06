# Constitution

> Authoritative rules for this project. If any other guidance (agent instructions,
> comments, or conventions) conflicts with this document, **this document prevails**.
> It can only be changed through the amendment process in §11.

- **Version**: 1.9.0
- **Last amended**: 2026-10-06

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

- **Spec-anchored** means the current increment's spec is a living artifact,
  written alongside the work and kept in sync with the code while that increment
  is active. Spec and code evolve together through closure.
- **Spec-first** (writing a spec and throwing it away) and **spec-as-source**
  (generating code from the spec without editing the code) are explicitly **not**
  the model used here.
- **Conflict resolution during an active increment**: when code and the active
  spec diverge, **the code is the source of truth**. Analyze the divergence and
  update the active spec to re-anchor against actual behavior. Do not silently
  change code to match a stale spec.
- On closure with status `done`, the entire increment directory becomes a
  historical snapshot and MUST NOT be changed. Code remains the source of truth
  for current behavior. A later change is recorded in a new increment rather
  than by reopening or revising a completed one.

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

Every increment MUST include a `summary.md`, created at closure, that records:

- **Date** of the latest update.
- **Files changed** (paths relative to the repo root).
- **Functions / components changed** and a short description of what changed.

The summary MUST NOT include a related-spec list. Once the increment is closed
with status `done`, its summary and every other file in its directory are frozen
with the rest of the historical snapshot.

### 4.2 Historical specification access and references

- Agents MUST NOT read the contents of a completed specification directory by
  default. This includes opening, searching, indexing, summarizing, or quoting
  any completed `spec.md`, `plan.md`, `tasks.md`, or `summary.md`. Assignment to a
  new feature alone does not authorize a historical read.
- The sole read exception is an explicit request from the maintainer or an agent
  whose current prompt declares `mode: primary`. Such a request may authorize
  all participants in that feature, including subagents, to read completed
  specification content; it need not identify particular directories or state a
  purpose.
- Read authorization MUST NOT be treated as write authorization. Agents MUST
  NOT edit any file in a completed specification directory under any
  circumstances, including summaries or relationship records.
- New increment artifacts MUST NOT identify, cite, or link to completed specs by
  ID, path, or title. New specs MUST NOT record anticipated relationships to
  completed specs, and new summaries MUST NOT include a `Related specs` section.
- Existing completed directories and their contents MUST remain untouched,
  including their existing cross-references. No historical relationship
  backfill or cleanup is required or permitted.

## 5. Task lifecycle and verification gates

- Tasks are tracked as checklists in `tasks.md`.
- A task MUST NOT be marked complete (`[x]`) without **evidence** attached to it.
- Every task MUST be verified against the applicable gates: **unit tests**,
  **SEO**, and **accessibility**. The evidence (command run and result, or a short
  note) is recorded next to the task.
- If a gate does not apply to a task, that must be stated explicitly rather than
  skipped silently.
- When a task's complete changed-file set consists exclusively of `.md` files
  outside `src/content/**`, the only applicable verification gates are lint and
  format. Build, unit-test, SEO, and accessibility gates are not run under this
  exception and MUST be recorded as not applicable. If the task includes any
  non-Markdown file or any file under `src/content/**`, the ordinary applicable
  gates remain in force.

### 5.1 Shared feature-branch workflow

- After a spec is agreed and planning begins, exactly one shared feature branch
  named `spec/[NNN]-[slug]` MUST be created and published from the complete spec
  directory; task/developer branches MUST NOT be created or used. At most four
  tasks may be active, and parallel work is permitted only for independent tasks
  with disjoint scopes and no unfinished dependencies. A task remains active from
  assignment through verification approval, evidence, and any rework. It closes
  only after verification approval and recorded evidence. Verification MUST take
  place on the shared branch; defects return to the same implementer on that
  branch. Verification may update assigned tests and task evidence but MUST NOT
  edit production code.
- The Dev Lead orchestrates work and writes only the assigned current increment's
  `plan.md`, `tasks.md`, and `summary.md`, except for the following final closure
  operation in that increment's `spec.md`. Only after the approved §11 amendment
  is adopted and the updated Lead role definition is loaded, the Lead may make
  one final directory edit, limited to `Status` and `Last updated`, after every
  task has QA approval and recorded evidence, every acceptance criterion has
  QA-backed completion, substantive re-anchoring is resolved, all directory
  artifacts and the latest final-gate evidence are finalized while active, and
  all applicable final gates pass. The Lead MUST then set only `Status` to
  `done` and `Last updated` to the actual closure date. If any prerequisite fails,
  the increment remains active and no metadata transition occurs. After this
  edit, no file in the increment directory may be changed; actual subsequent Git
  outcomes MUST be reported externally and MUST NOT be pre-recorded in the frozen
  directory. The Lead MUST NOT implement application, operational Markdown,
  repository configuration, tests, or substantive spec content, nor write
  indirectly through shell commands, formatters, or other means. An explicit task
  assignment does not expand this authority. The Lead MUST assign all
  implementation, including operational Markdown and repository configuration,
  to Dev with exact file ownership and within Dev's current permissions.
- Dev implements only its assigned production files. QA independently owns
  assigned test changes and task evidence and MUST NOT edit production files. In
  the assigned current `spec.md`, QA may change only evidence-backed acceptance
  checkbox markers as defined by its current prompt; substantive current-spec
  ownership remains with the Spec Refiner. These role boundaries do not otherwise
  change the verification, evidence, or spec-ownership rules above.
- On a Git or change conflict, participants MUST stop the affected operation,
  record the conflicting branches/files and blocking state, and MUST NOT overwrite
  work or guess a resolution. Decisions requiring judgment MUST be escalated to
  the maintainer, and work resumes only after an agreed resolution. Before work
  affected by a material technical decision not settled by the spec, this
  constitution, or established conventions is planned or delegated, maintainer
  approval MUST be obtained and recorded in the relevant planning artifact.
- Final feature commit(s) and push MUST happen only after every task has
  verification approval and evidence and all §6 gates pass. No task-level
  commit/push is permitted. Base-branch integration MUST require explicit
  affirmative maintainer approval before it occurs; the published feature branch
  MUST NOT be deleted as part of this workflow. Role-specific procedures are
  defined in the applicable current agent prompts, subordinate to this
  constitution.
- Current workflow rules are defined by this constitution and, where consistent
  with it, the applicable current agent prompts. This constitution prevails in a
  conflict. Explicit maintainer decisions may resolve matters not specified here,
  but do not override this constitution unless adopted through the amendment
  process in §11. Completed specification files MUST NOT establish or override
  current workflow rules, permissions, role boundaries, or current behavior. The
  access and immutability rules in §4.2 apply to every completed increment.

## 6. Quality gates

Before a spec or a task is considered done, all applicable quality gates MUST
pass:

| Gate          | Command                                        |
| ------------- | ---------------------------------------------- |
| Lint          | `pnpm lint`                                    |
| Format        | `pnpm format:check`                            |
| Build         | `pnpm build`                                   |
| Unit tests    | `pnpm test:run`                                |
| Accessibility | `pnpm test:a11y` (and/or the `a11y` MCP audit) |

The only applicable gates for a task are lint and format when the task's complete
changed-file set consists exclusively of `.md` files outside `src/content/**`;
in that case build, unit tests, SEO, and accessibility are not run under this
exception and MUST be recorded as not applicable. The same exception applies to
final spec closure only when the complete changed-file set for the feature
increment, relative to its base revision, consists exclusively of `.md` files
outside `src/content/**`. For all other task or feature change sets, the applicable
gates in the table remain required. If any changed file is non-Markdown or is
under `src/content/**`, the Markdown-only exception does not apply.

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
