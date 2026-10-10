# Tasks: GitHub Pages Deployment

Spec: [`spec.md`](./spec.md) · Plan: [`plan.md`](./plan.md) · Shared branch:
`spec/027-deploy-github-pages` (base `main` @ `1552b36`).

Ownership rules: Dev owns production/config files and `tests/unit/**`; QA owns
`tests/seo/**`, `tests/a11y/**`, `tests/integration/**`, and `tests/helpers/**`,
and records evidence for the assigned task here. No per-task branches, commits, or
pushes.

Model note: Task 1 uses the Dev model variant `opencode-go/deepseek-v4.1-flash#high`
(highest reasoning) because it spans CSS, Astro, and multiple unit tests. Tasks 2
and 3 use the Dev default `opencode-go/deepseek-v4.1-flash`. QA uses the QA
default `opencode-go/deepseek-v4.1-flash`.

---

## T1 — Base-aware site URLs and configuration

- Owner: Dev
- Depends on: none
- Status: [x]
- Scope (exact files):
  - `astro.config.mjs`
  - `src/lib/base-url.ts` (new)
  - `src/layouts/SiteLayout.astro`
  - `src/styles/global.css`
  - `src/components/atoms/Icon.astro`
  - `src/components/home/ProfileIntroduction.astro`
  - `src/components/home/ExperienceHistory.astro`
  - `src/pages/experiencia/[slug].astro`
  - `playwright.config.ts`
  - `tests/unit/**` (update assertions affected by base-prefixed output; add a
    test asserting the `site`/`base` values)
- Deliverable: R1–R3 and R9 (unit/tooling part). `site`/`base` set; every
  site-root reference resolves under the base; canonical/sitemap carry it;
  `playwright.config.ts` `baseURL` points at the base path.
- Dev pre-handoff: update affected `tests/unit/**` and run
  `pnpm exec vitest run tests/unit`; run Prettier on every changed file.
- Evidence: _pending QA_

## T2 — Deployment workflow

- Owner: Dev
- Depends on: spec re-anchor of R5/AC5 and the workflow non-goal by the Spec
  Refiner (Playwright in the workflow) — done.
- Status: [x]
- Scope (exact files):
  - `.github/workflows/deploy.yml` (new)
  - `tests/unit/deployment-workflow.test.ts` (new)
- Deliverable: R4–R7 and R10. Workflow triggers only on `push` to `main`, installs
  with pnpm and the frozen lockfile, installs Chromium
  (`pnpm exec playwright install --with-deps chromium`), runs the gates with
  `pnpm build` before `pnpm test:run` and includes `pnpm test:integration`, enables
  Pages via `actions/configure-pages` `enablement: true`, uploads `./dist`, deploys
  via `actions/deploy-pages`, declares Pages permissions/concurrency, pins
  actions; a unit test asserts the trigger, steps, actions, and flags.
- Dev pre-handoff: `pnpm exec vitest run tests/unit`; Prettier on changed files.
- Evidence: _pending QA_

## T3 — README deployment documentation

- Owner: Dev
- Depends on: none (references the T2 workflow contract)
- Status: [x]
- Scope (exact files):
  - `README.md`
- Deliverable: R8 and AC6. Rename/replace the provisional note, update the "Site
  configuration" section to the real origin/base, and add a Deployment section
  describing the published URL, the `push` to `main` trigger and gate behavior,
  and the one-time `gh api` command that sets the Pages build type to `workflow`.
- Dev pre-handoff: Prettier on `README.md`.
- Evidence: _pending QA (Markdown-only: lint + format)_

---

## QA verification

QA verifies each task on the shared branch, reviews Dev's `tests/unit/**` for
sufficiency, owns and runs the remaining suites, records the latest report in the
task entry, and marks only verified acceptance checkboxes in `spec.md`.

### QA — T1

- Status: [x]
- Applicable gates: `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration`.
- Also owns: `tests/helpers/render.ts` (add `base`), `tests/seo/**`,
  `tests/a11y/**`, `tests/integration/**` base-aware navigation.
- Report: **Approved** — 2026-10-10, branch `spec/027-deploy-github-pages` @
  `1552b36` plus uncommitted T1 changes.
  - Scope verified: `astro.config.mjs`, `src/lib/base-url.ts`,
    `src/layouts/SiteLayout.astro`, `src/styles/global.css`,
    `src/components/atoms/Icon.astro`,
    `src/components/home/ProfileIntroduction.astro`,
    `src/components/home/ExperienceHistory.astro`,
    `src/pages/experiencia/[slug].astro`, `playwright.config.ts`, `tests/unit/**`
    (Dev); `tests/helpers/render.ts`, `tests/seo/**`, `tests/integration/**`
    (QA).
  - Dev `tests/unit/**` sufficiency review: sufficient for AC1
    (`tests/unit/site-config.test.ts` asserts the `site`/`base` values and the
    absence of the `example.com` placeholder and `TODO`), the `withBase`
    contract (`tests/unit/base-url.test.ts`), and base-prefixed component
    output (`icon.test.ts`, `home.test.ts`, `experience.test.ts`,
    `design-assets.test.ts`, `transitions.test.ts`, `button-design.test.ts`,
    `integration-tooling.test.ts`). Reproduced 21 files / 153 tests.
  - QA suite alignment: `tests/helpers/render.ts` injects `base` and accepts a
    base-aware `request`; `tests/seo/home.test.ts` and
    `tests/seo/experience.test.ts` assert canonical/sitemap under
    `site + base`; new `tests/seo/build-output.test.ts` reads `dist/` for
    canonical count and URLs, base-prefixed asset references, absence of
    base-less root references, and sitemap URLs; `tests/integration/**`
    navigates via the new base-aware `tests/integration/helpers/site.ts`.
  - Gates (latest): `pnpm lint` clean; `pnpm format:check` clean; `pnpm build`
    success (3 pages + sitemap); `pnpm test:run` 28 files / 166 tests passed;
    `pnpm test:a11y` 4 files / 5 tests passed; `pnpm test:integration`
    `18 passed` (Chromium).
  - Build evidence: `dist/index.html` and each
    `dist/experiencia/<slug>/index.html` carry exactly one base-prefixed
    canonical; favicons, `@font-face`
    (`/portfolio-astro-SDD/fonts/open-sans-latin.woff2`), GitHub/LinkedIn icon
    sprites, profile image, company icons, and the `/#trayectoria` return link
    are base-prefixed; no root-absolute asset reference omits the base;
    `dist/sitemap-0.xml` lists only
    `https://dcerezotorrejon.github.io/portfolio-astro-SDD/...` URLs.
  - Result: AC1–AC4 verified; no defects.
- Claimed acceptance criteria (mark in `spec.md` only after evidence): AC1–AC4,
  and the R9 portion covered here.

### QA — T2

- Status: [x]
- Applicable gates: `pnpm lint`, `pnpm format:check`, `pnpm build`,
  `pnpm test:run`, `pnpm test:a11y`. Integration is **not applicable**: neither
  changed file affects page rendering, routing, content, styles, client behavior,
  browser-complex components, or the integration suite/tooling.
- Report: **Approved** — 2026-10-10, branch `spec/027-deploy-github-pages` @
  `1552b36` plus uncommitted T1 changes; T2 files untracked.
  - Scope verified: `.github/workflows/deploy.yml` (new),
    `tests/unit/deployment-workflow.test.ts` (new).
  - Dev `tests/unit/deployment-workflow.test.ts` sufficiency review: sufficient for
    AC5 — 10 tests assert the trigger (`push`/`main` only), the exact Pages
    permissions, the non-cancelling `pages` concurrency group, frozen-lockfile
    install, Chromium installed before the gates, pnpm 10 / Node 22 with the pnpm
    cache, all six R5 gates in order with `pnpm build` before `pnpm test:run`,
    pinned action order, `configure-pages` `enablement: true` and the `./dist`
    upload after the gates, and `deploy-pages` with `id: deployment` plus the
    exposed page URL. Reproduced 10/10.
  - Independent workflow validation: `python3 -c "import yaml; yaml.safe_load(...)"`
    → `YAML OK`. Trigger is `push` to `main` only; `permissions` are exactly
    `contents: read`, `pages: write`, `id-token: write`; `concurrency` group `pages`
    with `cancel-in-progress: false`; the gate/action order matches the plan.
  - AC7: no `CNAME` at the repository root or in `public/` (`find . -name CNAME`
    excluding `node_modules` returned nothing).
  - Gates (latest): `pnpm lint` clean; `pnpm format:check` clean; `pnpm build`
    success (3 pages + sitemap); `pnpm test:run` 29 files / 176 tests passed;
    `pnpm test:a11y` 4 files / 5 tests passed. `pnpm test:integration` not run —
    not applicable (explicitly recorded).
  - Result: AC5 and AC7 verified; no defects.
- Claimed acceptance criteria: AC5, AC7.

### QA — T3

- Status: [x]
- Applicable gates: `pnpm lint`, `pnpm format:check` (Markdown-only exception,
  Constitution §§5–6); build/unit/SEO/a11y/integration recorded as not run.
- Report: **Approved** — 2026-10-10, branch `spec/027-deploy-github-pages` @
  `1552b36` plus uncommitted T1/T2/T3 changes; T3 file `README.md` modified.
  - Scope verified: `README.md` (only T3 changed file; `.md` outside
    `src/content/**`).
  - AC6/R8 content review (direct): the provisional top note no longer claims
    deployment is provisional and no longer references `example.com` (the
    remaining note only marks the portfolio content provisional); the "Site
    configuration" section states `site = "https://dcerezotorrejon.github.io"`
    and `base = "/portfolio-astro-SDD"` with the published URL
    `https://dcerezotorrejon.github.io/portfolio-astro-SDD/`; the new
    **Deployment** section documents the published URL, the
    `.github/workflows/deploy.yml` trigger (a `push` to `main`, unmerged feature
    branch does not deploy), the gates run before publishing (Chromium plus
    `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
    `pnpm test:a11y`, `pnpm test:integration`) with "any gate failure prevents
    deployment", and the one-time activation
    `gh api --method POST /repos/dcerezotorrejon/portfolio-astro-SDD/pages -f build_type=workflow`
    with the `--method PUT` note and the `actions/configure-pages`
    `enablement: true` fallback. `grep -n "example.com" README.md` → no match
    (exit 1).
  - Gates (latest): `pnpm lint` clean (exit 0); `pnpm format:check` clean —
    "All matched files use Prettier code style!" (exit 0). No unit test reviews
    apply (T3 has no `tests/unit/**` changes).
  - Not run under the Constitution §§5–6 Markdown-only exception (explicitly
    recorded): `pnpm build`, `pnpm test:run`, SEO, accessibility, and
    `pnpm test:integration`.
  - Result: AC6 verified; no defects.
- Claimed acceptance criteria: AC6.

---

## Final gate report

- Owner: QA records the Lead's final results; Lead runs and owns the decision.
- Scope: complete increment relative to `main` @ `1552b36` (committed, staged,
  unstaged, untracked).
- Required gates: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, `pnpm test:integration`.
- Report: _pending_
