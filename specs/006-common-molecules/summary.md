# Summary — Common molecules

- **Spec ID**: `006-common-molecules`
- **Status**: done
- **Last updated**: 2026-10-05

## Files changed

- `src/components/molecules/Button.astro` — **new**. Static Astro molecule with a
  required `variant` (`primary` | `secondary`), optional `href`, optional `class`
  and `disabled`; polymorphic root (`<a href>` when `href` is set, otherwise
  `<button type="button">`); `type`/`disabled` restricted to the `<button>` root;
  forwards remaining attributes and merges a forwarded `class`; emits the public
  hooks `data-molecule="button"` and `data-variant`.
- `src/components/molecules/Heading.astro` — **new**. Static Astro molecule with a
  required `level` (1–6) selecting the tag and a required
  `variant` (`display` | `section` | `card`) selecting the visual style; forwards
  attributes and merges a forwarded `class`; emits `data-molecule="heading"`,
  `data-variant` and `data-level`.
- `src/styles/global.css` — added the `--heading-display-*`, `--heading-section-*`,
  `--heading-card-*` and `--button-secondary-*` component-token groups; kept the
  `--section-heading-*` aliases resolving to `--heading-section-*`; kept `--button-*`
  canonical; added the `[data-molecule="button"][data-variant="…"]` and
  `[data-molecule="heading"][data-variant="…"]` rules; re-pointed the retained
  `.detail-content h2, .detail-content h3` rule at the new heading tokens; removed
  the superseded `.button-link`, `.section-heading`, `.profile-details h1` and
  `.experience-card h3` rules (and their state/reduced-motion references).
- `src/components/ProfileIntroduction.astro` — the name `h1` is now
  `<Heading level={1} variant="display" id="profile-name">`; social links are now
  `<Button variant="primary" href>` keeping the icon + label children and the list
  `aria-label`.
- `src/components/ExperienceHistory.astro` — the history `h2` is now
  `<Heading level={2} variant="section" id="history-heading">`; card `h3` titles are
  now `<Heading level={3} variant="card">`; “Más información” links are now
  `<Button variant="primary">` with the same distinguishing accessible names.
- `src/pages/experiencia/[slug].astro` — the role `h1` is now
  `<Heading level={1} variant="display">` (the single intentional visual change);
  the return link is now `<Button variant="primary">`.
- `docs/design.md` — documents the button variants (`primary`/`secondary`) and the
  heading variants (`display`/`section`/`card`), the decoupled semantics/style rule,
  the token groups and the retained Markdown rule; refreshed `Last updated`.
- `tests/unit/molecules-button.test.ts` — **new** (QA). Root selection, hooks,
  attribute forwarding, merged `class`, required `variant`, both variants’ tokens
  and contrast, and isolated-fixture axe coverage (including the page-unused
  `secondary`).
- `tests/unit/molecules-heading.test.ts` — **new** (QA). Tag/`data-level` mapping,
  `variant` decoupling, forwarded attributes, merged `class`, required
  `level`/`variant`, token values and the 768 px breakpoint.
- `tests/fixtures/molecules-fixture.astro` — **new** test-only fixture rendering
  both molecules with visible labels.
- `tests/unit/button-design.test.ts`, `tests/unit/section-headings.test.ts`,
  `tests/unit/design-assets.test.ts` — re-anchored from the removed classes to the
  molecule hooks/tokens without losing contrast, min-target, token, hierarchy,
  single-`h1` or Markdown-heading intent.
- `specs/004-portfolio-home/summary.md` — refreshed under §4.2 (references this spec
  and the detail-`h1` normalization).
- `specs/006-common-molecules/{spec,plan,tasks,summary}.md` — this spec.

## Functions / components changed

- `Button` (new) — variant-driven pill control; primary keeps the delivered
  computed styles and secondary adds an outline surface. No new dependency and no
  client JavaScript.
- `Heading` (new) — decouples semantic level from visual variant, so the homepage
  name stays the only `h1` while `display` is also reused on the detail-page `h1`.
- `ProfileIntroduction`, `ExperienceHistory`, `pages/experiencia/[slug].astro` —
  migrated to the molecules while preserving links, accessible names, ids, order,
  routes, `view-transition-name` values and content.
- Global stylesheet rules — replaced the class-based button/heading styling with
  single, token-driven molecule rules; the Markdown rule remains the only selector
  for compiled Markdown `h2`/`h3`.

## Verification status

- All five constitutional gates pass on the latest source: `pnpm lint`,
  `pnpm format:check`, `pnpm build` (3 routes + sitemap), `pnpm test:run`
  (21 files / 141 tests) and `pnpm test:a11y` (4 files / 5 tests).
- Browser computed styles (`chrome-devtools` MCP against `astro preview`) at
  1440 px and 375 px match `docs/design.md`: `display` 44 px desktop / 32 px mobile,
  weight 700, line-height 1.2, letter-spacing -0.025em, no margin; `section`
  32 px desktop / 24 px mobile, weight 700, line-height 1.25, 24 px gap, `#0f1419`;
  `card` 1.25 rem, weight 700, line-height 1.35, no margin. The retained
  `.detail-content h2/h3` rule computes the same values as `section`.
- Button: `primary` background `rgb(12, 122, 191)`, white label, 44 px target,
  200 ms background transition, hover `rgb(9, 106, 167)`; `secondary` (probed with an
  injected element because it has no page usage) computes a white surface, `#0f1419`
  label, 1 px `#cfd9de` border and 44 px target. Keyboard focus shows the 3 px
  `rgb(7, 89, 133)` outline with a 3 px offset.
- Axe: `pnpm test:a11y` and the `a11y` MCP audits report 0 violations on `/` and
  both `/experiencia/…` routes; the isolated fixture covers `secondary`.
- The only visual change versus the previous delivery is the detail-page `h1`
  normalized from the user-agent default to `display`; the removed class rules are
  byte-equivalent in value to the new molecule rules (verified against
  `git show HEAD:src/styles/global.css`).

## Related specs

- `004-portfolio-home` — **modified**: this spec migrates `ProfileIntroduction`,
  `ExperienceHistory` and `pages/experiencia/[slug].astro`. No 004 requirement
  changed: R16’s Markdown heading styling is preserved through the shared
  `--heading-section-*` tokens, and routes, content, SEO and the single-`h1` rule are
  untouched. The single intentional visual normalization is the detail-page `h1`
  moving to the `display` variant. `004`’s `summary.md` is refreshed in this change
  and references this spec.
- `002-front-extra-dependencies` — **depends on**: the molecules are build-time
  Astro components; no new dependency, no client JavaScript, Tailwind v4 and the
  static-by-default policy unchanged.
- `003-agent-workflow` — **depends on**: implemented and verified through its
  refinement → plan → implementation → QA workflow; no agent definitions changed.
- `005-auto-router-agents` — **depends on**: work ran through the Auto Router
  (`#medium`) variant configured by that spec; `005` is not modified.

## Notes and remaining limits

- The `secondary` variant has no page usage; its browser evidence comes from an
  injected element under the live stylesheet and from isolated-fixture unit/axe
  coverage, not from server-rendered page markup (as planned).
- Transient `:active` (pressed) computed styles were not sampled in the browser;
  the pressed backgrounds are verified through the matched CSS rules, the resolved
  component tokens (`#075985` primary, `#cfd9de` secondary) and the unit contrast
  assertions. `secondary` hover was likewise not sampled in the browser for the same
  reason.
- Current employment entries contain no compiled Markdown `h2`/`h3`, so the retained
  Markdown rule was verified with a real-browser injected probe plus the JSDOM
  fixture test, not against server-rendered detail markup.
- The preview served the built `dist/` from an already-running server; the build was
  re-run immediately before the browser checks.
