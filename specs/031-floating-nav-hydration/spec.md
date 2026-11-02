# Floating navigation client-only rendering

- **Spec ID**: `031-floating-nav-hydration`
- **Status**: done
- **Last updated**: 2026-11-02

> Keep this increment's spec anchored to code while it is active. On closure
> with status `done`, the entire directory becomes an immutable historical
> snapshot, and code remains the source of truth for current behavior. Later
> changes belong in a new increment. Do not add historical-spec relationship
> lists to new increment artifacts, and leave completed directories untouched.

## Context

The home page (`src/pages/index.astro`) mounts the `FloatingNav` React island
with `client:load`, which server-renders the navigation into the static HTML and
then hydrates it. The component derives its initial active section from the URL
fragment (`window.location.hash`), which is unknown at build time. A
server-rendered navigation therefore always starts on the first section and can
differ from the first client render when the page is opened with a fragment.

The island is changed to `client:only="react"` to reduce the initial load: Astro
no longer renders it at build time, so the initial HTML no longer carries the
navigation markup and the browser mounts the island from scratch, with no
hydration pass. As a side effect, the first client render already reflects the
URL fragment. The navigation is therefore available only after its script loads,
which the maintainer accepts. The interactivity policy
([Constitution §2](../../docs/constitution.md#2-project-nature)) still applies:
the island keeps an explicit `client:*` directive and no unrelated static content
is hydrated.

## Goals

- Mount `FloatingNav` only on the client, with no server-rendered markup and no
  hydration step.
- Reduce the initial load by removing the navigation markup from the static HTML.
- Keep the navigation's behavior unchanged once mounted: sections from
  `profile.navigation`, active-section tracking, and the accessible name.

## Non-goals

- Changing `FloatingNav` markup, styling, or behavior, or the navigation content.
- Changing other pages or islands.
- Adding a server-rendered fallback or placeholder for the navigation; its
  absence before the script loads is accepted.
- Defining or measuring a numeric performance target; the load reduction is the
  motivation, verified only through the absence of server-rendered markup (R2).

## Requirements

- R1: `src/pages/index.astro` declares the `FloatingNav` island with
  `client:only="react"` and passes `profile.navigation` as `sections`.
- R2: The statically built home HTML MUST NOT contain the server-rendered
  floating navigation markup (`.floating-nav`); it contains an `astro-island`
  element for `FloatingNav` that carries `client="only"` and the `react`
  renderer.
- R3: Once mounted in a browser, the navigation renders every entry of
  `profile.navigation` with the accessible name `Navegación por secciones`, and
  its active-section behavior is unchanged.
- R4: When the home page is opened with a URL fragment matching a navigation
  section, the first client render marks that section active.
- R5: The home page keeps no other hydrated island and remains free of client
  JavaScript beyond that island's.

## Acceptance criteria

- [x] AC1: `index.astro` uses `client:only="react"` for `FloatingNav` (R1).
- [x] AC2: The rendered home HTML has no `.floating-nav` element and has exactly
      one `astro-island` for `FloatingNav` with `client="only"` and the `react`
      renderer (R2, R5).
- [x] AC3: In Chromium, the home page shows the navigation with all configured
      links and the accessible name `Navegación por secciones`, and it passes the
      axe audit for WCAG A/AA through 2.2 (R3).
- [x] AC4: In Chromium, opening `/#<section-id>` shows that section's link as
      active on first mount, and scrolling still updates the active section (R3,
      R4).
- [x] AC5: Existing tests that assert server-rendered navigation markup on the
      home page are updated to the client-only contract; all applicable
      [§6 gates](../../docs/constitution.md#6-quality-gates) pass.

## Verification

- AC1, AC2: unit test over the Astro Container render of the home page
  (Vitest), replacing the assertion that `.floating-nav` is present in the
  rendered HTML.
- AC3: Playwright integration and `@axe-core/playwright` audit on the built home
  page; the existing Vitest axe test of the component rendered in isolation
  stays valid.
- AC4: Playwright integration test navigating to `/#<section-id>` and scrolling.
- AC5: `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test:run`,
  `pnpm test:a11y`, and `pnpm test:integration` (applies: client behavior and
  page rendering change). SEO: the home `<title>`, meta description, and canonical
  are unaffected; the existing SEO tests stay green.
