# Tasks — Custom domain deployment

Checklist of self-contained tasks. A task is only marked `[x]` by the Dev Lead
after QA approval and recorded evidence. Evidence is written by QA in the entry
below each task, replacing the previous report on every re-verification.

**Ownership reminder.** Dev implements production code, repository configuration,
and `tests/unit/**`. QA owns and edits `tests/seo/**` and `tests/integration/**`,
runs all applicable gates, and records evidence. QA sessions are **serialized**
because both tasks write to this shared `tasks.md` evidence file.

**Gate applicability.**

- T1 (non-Markdown change set: source, config, tests) → `pnpm lint`,
  `pnpm format:check`, `pnpm build`, `pnpm test:run`, `pnpm test:a11y`,
  `pnpm test:integration` (integration applies: routing/config/test-tooling).
- T2 (`README.md` only, `.md` outside `src/content/**`) → Markdown-only exception:
  only `pnpm lint` and `pnpm format:check`; build, unit, SEO, accessibility, and
  integration are **not applicable**.

---

## T1 — Align origin/base to the custom-domain root

- [x] Complete (QA approved; evidence recorded)
- **Owner**: Dev (implementation) → QA (verification and remaining tests)
- **Depends on**: none
- **Model**: Dev `opencode-go/deepseek-v4.1-flash#high`; QA
  `opencode-go/deepseek-v4.1-flash#high` (subtle root-base URL semantics across a
  wide file set; same model, higher reasoning variant).
- **Acceptance criteria covered**: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC9.

**Dev implementation files (exact ownership):**

- `src/lib/base-url.ts` — set `SITE = "https://portfolio.dcerezo.work"` and
  `BASE = "/"`; update the doc comments to the root-base behavior.
- `playwright.config.ts` — `use.baseURL` and `webServer.url` to
  `http://127.0.0.1:4321` (root preview).
- `tests/unit/site-config.test.ts` — assert the new `site`/`base`; keep the
  placeholder guard; add repository-level assertions that no `CNAME` file exists
  at the repo root or under `public/`.
- `tests/unit/base-url.test.ts` — `withBase` leaves site-root paths unchanged
  under the root base (no prefix introduced), incl. fragments/queries.
- `tests/unit/integration-tooling.test.ts` — assert the root preview URLs in
  `playwright.config.ts`.
- `tests/unit/button-design.test.ts`, `tests/unit/company-icon.test.ts`,
  `tests/unit/experience.test.ts`, `tests/unit/home.test.ts`,
  `tests/unit/icon.test.ts`, `tests/unit/design-assets.test.ts`,
  `tests/unit/transitions.test.ts` — replace `/portfolio-astro-SDD` literals with
  root-relative paths.

**Do not change**: `astro.config.mjs`, `.github/workflows/deploy.yml`,
`src/content/**`, component markup, or any `tests/seo/**` / `tests/integration/**`
file (QA owns those).

**QA verification files (exact ownership):**

- `tests/seo/home.test.ts` — canonical URL for the new origin.
- `tests/seo/build-output.test.ts` — one canonical per built page under the new
  origin; root-resolved assets/internal links; sitemap under the new origin; no
  `/portfolio-astro-SDD` segment; no `CNAME` in `dist/`. Build URLs safely (a
  root base makes `site + base` end in `/` and `base + "/"` produce `//`).
- `tests/seo/experience.test.ts` — canonical URLs and sitemap entries under the
  new origin; fix the request-URL construction (`new URL(`${base}/…`, site)`
  breaks under the root base).
- `tests/integration/helpers/site.ts` — update the explanatory comment to the
  root base (behavior already derives from `BASE`).

**QA gates and evidence:** run `pnpm lint`, `pnpm format:check`, `pnpm build`,
`pnpm test:run`, `pnpm test:a11y`, `pnpm test:integration` on the shared branch
and record the latest results plus approval/defects below.

**Evidence (QA):**

- **Task/scope**: T1 — align origin/base to the custom-domain root. Verified
  AC1–AC7 and AC9 over the T1 changed-file set: `src/lib/base-url.ts`,
  `playwright.config.ts`, `tests/unit/**` (Dev) plus `tests/seo/home.test.ts`,
  `tests/seo/build-output.test.ts`, `tests/seo/experience.test.ts`,
  `tests/integration/helpers/site.ts` (QA).
- **Branch/revision**: `spec/029-custom-domain` at `75f1de5` (verified on the
  shared branch). The T1 code/test changes are present uncommitted in the working
  tree. After the functional gate runs, only spec Markdown artifacts changed
  (Lead/Spec-Refiner Prettier pass and AC10 removal); no code or test file
  changed, so those results remain valid for the current tree.
- **Unit-test review (Dev's tests)**: sufficient for AC1/AC2/AC9 —
  `tests/unit/site-config.test.ts` asserts the new `site`/`base` and the absence
  of `CNAME` at the repo root and under `public/`; `tests/unit/base-url.test.ts`
  asserts `withBase` leaves site-root paths (incl. fragments/queries) unchanged
  under the root base; `tests/unit/integration-tooling.test.ts` asserts the root
  preview URLs. No defects.
- **QA test updates**: SEO tests rebuilt to join the origin with single-slash
  root-relative paths (avoiding the `//` root-base pitfalls), plus a new
  `dist/CNAME` absence assertion and a no-`/portfolio-astro-SDD` assertion over
  built HTML and the sitemap; the integration helper comment updated (behavior
  already derives from `BASE`, which is `""` at the root).
- **Gates (all from repo root, shared branch):**
  - `pnpm lint` — **pass** (no output; unchanged code/test tree).
  - `pnpm format:check` — **pass** (re-run after the Lead/Spec-Refiner formatted
    the three spec artifacts and removed AC10: "All matched files use Prettier
    code style!").
  - `pnpm build` — **pass** (3 pages; sitemap generated).
  - `pnpm test:run` — **pass**: 30 files, 200 tests.
  - `pnpm test:a11y` — **pass**: 4 files, 5 tests.
  - `pnpm test:integration` — **pass** (applicable: routing/config/test
    tooling): 35 tests.
- **Built-output spot checks**: home canonical
  `https://portfolio.dcerezo.work/`; detail canonical
  `https://portfolio.dcerezo.work/experiencia/<slug>/`; `dist/sitemap-0.xml`
  lists exactly the three root URLs under the new origin; no
  `/portfolio-astro-SDD` anywhere under `dist/`; no `dist/CNAME`.
- **Status**: **Approved.** All applicable gates pass; AC1–AC7 and AC9 are
  verified and marked. The earlier `pnpm format:check` defect on the
  Lead/Spec-Refiner-owned spec artifacts is resolved.

---

## T2 — Document custom-domain deployment and prerequisites

- [x] Complete (QA approved; evidence recorded)
- **Owner**: Dev (implementation) → QA (verification)
- **Depends on**: none (disjoint `README.md` scope; may proceed in parallel with
  T1, but its QA runs after T1's QA to serialize evidence writes)
- **Model**: Dev `opencode-go/deepseek-v4.1-flash` (documentation-only, configured
  default); QA `opencode-go/deepseek-v4.1-flash`.
- **Acceptance criteria covered**: AC8.

**Dev implementation files (exact ownership):**

- `README.md` — update the "Site configuration" and "Deployment" sections to the
  new origin `https://portfolio.dcerezo.work`, root base `/`, and published URL;
  document the external prerequisites: the DNS `CNAME` record
  (`portfolio` → `dcerezotorrejon.github.io`, already configured), the GitHub
  Pages custom-domain setting, and enforced HTTPS; state that no `CNAME` file is
  committed and that the former project-site URL relies on GitHub's automatic
  redirect.

**Do not change**: `AGENTS.md`, `docs/**`, any `specs/**` file other than the
assigned spec, or any non-`README.md` file.

**QA gates and evidence:** because the changed-file set is `README.md` only
(`.md` outside `src/content/**`), the only applicable gates are `pnpm lint` and
`pnpm format:check`. Record build, unit, SEO, accessibility, and integration as
not applicable under the Constitution §§5–6 Markdown-only exception. Verify the
required content (R8/AC8), including that the README does **not** instruct
committing a `CNAME` file.

**Evidence (QA):**

- **Task/scope**: T2 — document custom-domain deployment and prerequisites.
  Verified AC8 over the T2 changed-file set, which is `README.md` only.
- **Branch/revision**: `spec/029-custom-domain` at `75f1de5` (confirmed via
  `git branch --show-current`); the `README.md` change is present uncommitted in
  the working tree alongside the T1 code/test changes.
- **Content review (R8/AC8)**: verified against `README.md`:
  - new origin `site = "https://portfolio.dcerezo.work"` (line 162), root base
    `base = "/"` described as the domain root (line 163), published URL
    `https://portfolio.dcerezo.work/` (lines 164 and 170).
  - external prerequisites all present (lines 179–191): DNS `CNAME` record
    `portfolio` → `dcerezotorrejon.github.io` already configured (lines 181–183);
    Pages custom-domain setting in **Settings → Pages** (lines 184–187);
    **Enforce HTTPS** (lines 188–189); reliance on GitHub Pages' automatic
    redirect of the former project-site URL (lines 190–191).
  - **no instruction to commit a `CNAME` file**: the README states the opposite —
    "**no `CNAME` file is committed to the repository**" (line 186). The only
    other `CNAME` occurrence (line 181) refers to the external DNS record. The
    `portfolio-astro-SDD` literal on line 199 is the GitHub repository name in a
    `gh api` path, not a deployment subpath. No defect.
- **Gate applicability**: T2 changed-file set is `README.md` only (`.md` outside
  `src/content/**`), so the Constitution §§5–6 Markdown-only exception applies.
- **Gates (from repo root, shared branch):**
  - `pnpm lint` — **pass** (exit 0).
  - `pnpm format:check` — **pass**: "All matched files use Prettier code style!".
  - `pnpm build` — **not applicable** (Markdown-only exception).
  - `pnpm test:run` — **not applicable** (Markdown-only exception).
  - `pnpm test:a11y` — **not applicable** (Markdown-only exception).
  - `pnpm test:integration` — **not applicable** (Markdown-only exception;
    integration is excluded, not merely not-run).
- **Status**: **Approved.** AC8 verified and marked; only applicable gates pass.

---

## Deployment follow-up (external, not a Dev/QA task)

By maintainer decision the spec no longer includes a live-deployment acceptance
criterion; that check can only run after `main` deploys, i.e. after closure. The
external prerequisites (DNS record already configured, Pages custom-domain
setting, enforced HTTPS, automatic redirect of the former project-site URL) are
documented in `README.md` under AC8 and reported externally after deployment.
They do not affect this increment's task or gate set.

---

## Final feature gates (QA-recorded)

The complete feature increment (relative to its base revision) includes
non-Markdown files, so the full gate set applies, including integration
(routing/config/test-tooling changed).

- **Scope**: complete feature increment `029-custom-domain` vs. its base
  revision (changed-file set includes non-Markdown files, so the full gate set
  applies; integration is applicable because routing/config/test-tooling
  changed).
- **Branch/revision**: `spec/029-custom-domain` at `75f1de5` (shared branch); the
  increment changes are present uncommitted in the working tree.
- **Gates (latest, Lead-run):**
  - `pnpm lint` — **pass** (exit 0).
  - `pnpm format:check` — **pass** (exit 0): "All matched files use Prettier
    code style!"
  - `pnpm build` — **pass** (exit 0): 3 pages; sitemap generated.
  - `pnpm test:run` — **pass** (exit 0): 30 files, 200 tests.
  - `pnpm test:a11y` — **pass** (exit 0): 4 files, 5 tests.
  - `pnpm test:integration` — **pass** (exit 0): 35 tests (applicable).
- **Status**: all applicable gates pass; no failures.
