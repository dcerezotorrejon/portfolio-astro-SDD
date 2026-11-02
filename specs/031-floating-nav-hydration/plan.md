# Plan: Floating navigation client-only rendering

## Approach

The production change is already in the working tree: `src/pages/index.astro`
declares `FloatingNav` with `client:only="react"`. No further production edits
are planned. The work is to bring the test suite in line with the client-only
contract and to cover the behavior that the change newly guarantees.

## Files

- Production (already changed, not reassigned): `src/pages/index.astro`.
- Unit tests (Dev): `tests/unit/home.test.ts`, and any other `tests/unit/**` file
  that assumes server-rendered navigation markup.
- Integration / a11y / SEO tests (QA): `tests/integration/navigation.spec.ts`
  (fragment on first mount, AC4), `tests/integration/accessibility.spec.ts`
  (axe on the mounted navigation, AC3), `tests/seo/**` only if affected.

## Decisions and trade-offs

- No server-rendered fallback (accepted by the maintainer in the spec).
- `tests/a11y/floating-nav.test.ts` renders the component in isolation and stays
  valid; it is not changed unless QA finds it insufficient.
- Branch `spec/031-floating-nav-hydration` was created from the current
  `chore/claude-code-migration` HEAD, not from `main`, because the agent and
  permission files this workflow depends on exist only there.

## Risks

- Tests that look for `.floating-nav` in Container-rendered HTML fail by design;
  they must assert the `astro-island` contract instead (R2).
- Browser tests must wait for the island to mount before querying the navigation.

## Testing strategy

- Unit: home render has no `.floating-nav` and one `astro-island` with
  `client="only"` and the `react` renderer (AC1, AC2).
- Integration: navigation visible after mount with all links and accessible name;
  `/#<section-id>` marks that link active on first mount; scrolling still updates
  it (AC3, AC4).
- Gates: lint, format, build, unit, a11y, integration (AC5).
