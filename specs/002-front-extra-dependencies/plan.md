# Plan — Front extra dependencies: Tailwind CSS v4 and React

- **Spec ID**: `002-front-extra-dependencies`
- **Last updated**: 2026-10-05

## Approach

1. **Dependencies & Configuration**: Install `tailwindcss`, `@tailwindcss/vite`, `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y`. Update `astro.config.mjs` to include both `@tailwindcss/vite` and `react()`.
2. **TypeScript & Styles**: Configure `tsconfig.json` for React JSX (`jsx: "react-jsx"`, `jsxImportSource: "react"`). Create `src/styles/global.css` with `@import "tailwindcss";` and import it in the home page.
3. **ESLint Setup**: Update ESLint configuration to include React, React Hooks, and JSX a11y rules for `.jsx`/`.tsx` files.
4. **Constitution & Documentation Amendment**: Update `docs/constitution.md` (§2 and §10) and bump its version to `1.1.0`. Ensure `AGENTS.md` reflects the new tech stack.
5. **Verification Fixtures & Testing**: Add a test-only React counter fixture under `tests/fixtures/` (never shipped in `src/`) and verify it with the Astro Container API (SSR) and `@testing-library/react` (client interaction) via Vitest. Verify Tailwind output via `pnpm build` and run all validation gates (`lint`, `format:check`, `build`, `test:run`, `test:a11y`).
6. **React Compiler**: Install `oxc-transform-react` (dev) and enable `react({ compiler: true })` so interactive islands are auto-memoized. React 19 already ships the compiler runtime, so no `react-compiler-runtime` is needed.

## Files to change

- `package.json` — add dependencies and devDependencies.
- `astro.config.mjs` — register `@tailwindcss/vite` and `@astrojs/react`.
- `tsconfig.json` — configure JSX runtime options.
- `src/styles/global.css` — Tailwind v4 global stylesheet.
- `eslint.config.js` — add React hooks and JSX a11y ESLint plugins.
- `docs/constitution.md` — amend §2 and §10, bump version to 1.1.0.
- `AGENTS.md` — reflect Tailwind v4 and React interactivity policy.
- `src/pages/index.astro` — import the global stylesheet and apply a Tailwind utility class.
- `vitest.config.ts` — include `.tsx` test files.
- `tests/fixtures/Counter.tsx` — interactive React fixture used only by tests (not shipped).
- `tests/unit/react.test.tsx` — SSR (Astro Container API) and client interaction (`@testing-library/react`) tests.
- `tests/a11y/react.test.ts` — axe-core audit over the fixture's server-rendered markup.

## Key decisions

- **Tailwind v4 via Vite**: Using `@tailwindcss/vite` plugin directly in Astro configuration for optimal build speed and native CSS pipeline integration. `@astrojs/tailwind` (Tailwind 3) is legacy and not used.
- **Strict Zero-JS Default**: Astro pages remain 100% static HTML unless an explicit `client:*` directive is supplied on a framework island. No product React islands are added by this spec; React is proven with a test-only fixture.
- **Constitution Versioning**: Bumping constitution version from `1.0.0` to `1.1.0` to formalize the addition of Tailwind and React alongside the interactivity rule.
- **No `eslint-plugin-react`**: Its latest stable (7.37.5) calls the removed `context.getFilename()` API and crashes under ESLint 10. We keep `eslint-plugin-react-hooks` (declares ESLint 10 support) and `eslint-plugin-jsx-a11y` (works at runtime), which cover the hooks and accessibility rules that matter here.
- **React Compiler enabled**: `@astrojs/react@7` supports `compiler: true`, backed by Oxc (`oxc-transform-react`). This auto-memoizes client islands without manual `useMemo`/`useCallback`. It applies only to client components/hooks, not to server rendering or `.astro` files.

## Risks

- **Tailwind v4 CSS import conflicts**: Ensuring `@import "tailwindcss";` is correctly processed before any custom styles.
- **Tailwind purge with no usage**: With no utility classes, Tailwind emits nothing; mitigated by applying a utility class on the home page and asserting it in the build output.
- **Vitest React support**: Ensuring Vitest runs the React test under a jsdom environment (per-file `@vitest-environment jsdom`) and the Astro container can render a framework component.

## Testing strategy

- **Unit / Component tests**: `tests/unit/react.test.tsx` using the Astro Container API for SSR and `@testing-library/react` for client-side interaction.
- **Build / Tailwind verification**: `pnpm build` to ensure Tailwind CSS compiles successfully into production assets (`dist/_astro/*.css` contains the used utility).
- **React Compiler**: `pnpm build` and the test suite run cleanly with `compiler: true`.
- **Accessibility & Linting**: `pnpm test:a11y` and `pnpm lint` covering the new `.tsx` fixture and Tailwind utility usage.
