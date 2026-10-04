# Summary — Front extra dependencies: Tailwind CSS v4 and React

- **Spec ID**: `002-front-extra-dependencies`
- **Last updated**: 2026-10-05

## Files changed

- `package.json` — added runtime deps (`@astrojs/react`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/vite`) and dev deps (`@types/react`, `@types/react-dom`, `@testing-library/react`, `@testing-library/jest-dom`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `oxc-transform-react`).
- `pnpm-lock.yaml` — lockfile refresh.
- `pnpm-workspace.yaml` — allowed `puppeteer` builds (used by the `a11y` MCP).
- `astro.config.mjs` — registered `react({ compiler: true })` (React Compiler) and the `tailwindcss()` Vite plugin.
- `tsconfig.json` — added `jsx: "react-jsx"` and `jsxImportSource: "react"`.
- `eslint.config.js` — added `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` rules for `**/*.{jsx,tsx}`.
- `src/styles/global.css` — new Tailwind v4 entrypoint (`@import "tailwindcss";`).
- `src/pages/index.astro` — imports the global stylesheet and applies `text-3xl font-bold` to the heading.
- `vitest.config.ts` — test `include` now covers `.tsx` files.
- `tests/helpers/render.ts` — the shared Astro container now registers the React SSR renderer.
- `tests/fixtures/Counter.tsx` — new test-only interactive React fixture (not shipped).
- `tests/unit/react.test.tsx` — new SSR (Astro Container API) and client interaction (`@testing-library/react`) tests.
- `tests/a11y/react.test.ts` — new axe-core audit over the fixture's server-rendered markup.
- `docs/constitution.md` — version `1.0.0` → `1.1.0`; §2 interactivity policy; §10 Tailwind + React/React Compiler tooling.
- `AGENTS.md` — stack note (Tailwind v4, React islands only).
- `specs/002-front-extra-dependencies/{spec,plan,tasks,summary}.md` — this spec.

## Functions / components changed

- `Counter` (new) — test-only React component proving SSR and client interactivity; not imported by `src/`.
- `getContainer()` (updated in `tests/helpers/render.ts`) — now registers the `@astrojs/react` SSR renderer so framework components can be rendered through the shared container.

## Commits

- `2c0e4d1` — `feat(spec-002): add tailwind and react integration to the stack`.

## Notes

- **`eslint-plugin-react` is intentionally not installed**: its latest stable (7.37.5) calls the removed `context.getFilename()` API and crashes under ESLint 10. `eslint-plugin-react-hooks` (declares ESLint 10 support) and `eslint-plugin-jsx-a11y` (works at runtime) cover hooks and accessibility linting.
- **Zero client JS confirmed**: `dist/index.html` contains no `<script>` and no reference to the framework client chunk; React only ships when a `client:*` directive is added.
- **Tailwind usage required for output**: with no utility classes Tailwind emits nothing, so the home heading carries a utility to keep the build output verifiable.
- **React Compiler**: enabled via `react({ compiler: true })` and `oxc-transform-react`; it only affects client components/hooks (not SSR or `.astro` files) and memoizes them automatically.
- The `site` constant is still the placeholder `https://example.com`; replace it before deploying (see `001-sdd-baseline`).
