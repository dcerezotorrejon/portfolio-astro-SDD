# Summary: Floating navigation client-only rendering

- **Date**: 2026-11-02

## Files changed

- `src/pages/index.astro`
- `tests/unit/home.test.ts`
- `tests/integration/navigation.spec.ts`
- `tests/integration/helpers/content.ts`
- `specs/031-floating-nav-hydration/` (`spec.md`, `plan.md`, `tasks.md`,
  `summary.md`)

## Functions / components changed

- `index.astro`: the `FloatingNav` island moved from `client:load` to
  `client:only="react"`. The static home HTML no longer contains the navigation
  markup, and the island mounts on the client without hydration.
- `home.test.ts`: the home render test asserts the client-only contract (no
  `.floating-nav`, one `astro-island` with `client="only"` and the react
  renderer), and a new test checks that `index.astro` declares
  `client:only="react"`.
- `navigation.spec.ts`: four Playwright tests cover the mounted navigation links
  and accessible name, the active link on first mount for each fragment, and the
  active link after scrolling.
- `helpers/content.ts`: new `navigationSections` helper that parses
  `profile.navigation` from the profile frontmatter.
