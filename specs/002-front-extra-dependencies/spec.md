# Front extra dependencies: Tailwind CSS v4 and React

- **Spec ID**: `002-front-extra-dependencies`
- **Status**: done
- **Last updated**: 2026-10-05

## Context

The repository currently relies on standard Astro markup and raw CSS without a robust styling utility system or a client-side component model. To enable a modern, polished personal portfolio with interactive UI components (islands) while preserving high performance and strict zero-JS-by-default policies, we need to integrate Tailwind CSS v4 and React.

## Goals

- Integrate **Tailwind CSS v4** via the `@tailwindcss/vite` plugin for utility-first styling.
- Integrate **React** via `@astrojs/react` exclusively for interactive components (islands) using explicit `client:*` directives, enforcing a zero client-side JS default.
- Extend ESLint with `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y` for comprehensive static analysis of `.jsx`/`.tsx` files.
- Update project configuration (`tsconfig.json`, `package.json`, global stylesheets) to support Tailwind v4 and React.
- Amend the project constitution (`docs/constitution.md`) and operational guide (`AGENTS.md`) to formally codify the React interactivity policy and the expanded technology stack.

## Non-goals

- Implementing full product feature pages or complex React widget libraries beyond verification fixtures.
- Modifying non-frontend core architecture rules.

## Requirements

- **R1 (Tailwind v4 Integration)**: Tailwind CSS v4 must be installed alongside `@tailwindcss/vite` and configured in `astro.config.mjs` and a global CSS file (`src/styles/global.css`) using `@import "tailwindcss";`.
- **R2 (React Integration)**: `@astrojs/react`, `react`, `react-dom`, and appropriate type packages must be installed, configured in `astro.config.mjs`, and `tsconfig.json` must be set up with `jsx: "react-jsx"` and `jsxImportSource: "react"`.
- **R3 (Interactivity Policy)**: All pages and Astro components must render statically by default. React components are restricted strictly to interactive islands utilizing an explicit `client:*` directive.
- **R4 (Linting and Tooling)**: ESLint must include `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`, checking all `.jsx` and `.tsx` source files without errors. (`eslint-plugin-react` is intentionally omitted because its latest stable, 7.37.5, is incompatible with ESLint 10.)
- **R5 (Constitution and Governance Amendment)**: `docs/constitution.md` (§2 and §10) must be amended to define the React island interactivity rule and the inclusion of Tailwind v4 and React, bumping the constitution version from 1.0.0 to 1.1.0.
- **R6 (React Compiler)**: The React integration must enable the React Compiler (`react({ compiler: true })`) so client islands are auto-memoized. The compiler is provided by the `oxc-transform-react` dev dependency; no manual `react-compiler-runtime` is needed because the project uses React 19.

## Acceptance criteria

- [x] AC1: Tailwind v4 is successfully integrated and verified via a utility applied in the home page whose compiled CSS output is validated during build.
- [x] AC2: React via `@astrojs/react` is wired up with correct TypeScript JSX settings and verified through a test fixture in `tests/` using `@testing-library/react`.
- [x] AC3: Zero client-side JS by default is enforced: standard Astro pages render without client bundles unless an explicit `client:*` directive is attached.
- [x] AC4: ESLint runs successfully across `.astro`, `.ts`, `.js`, `.jsx`, and `.tsx` files with React and accessibility plugins active.
- [x] AC5: The project constitution (`docs/constitution.md`) version is updated to `1.1.0` incorporating the new technology stack and interactivity rules.
- [x] AC6: The React Compiler is enabled through `@astrojs/react` and the build/tests pass with `oxc-transform-react` installed.

## Verification

- **Lint / Format**: `pnpm lint` and `pnpm format:check`.
- **Build**: `pnpm build` verifying Tailwind compilation and static bundle generation.
- **Unit / Interaction tests**: `pnpm test:run` verifying React island behavior with `@testing-library/react`.
- **React Compiler**: `react({ compiler: true })` processed by `oxc-transform-react`, verified by a clean `pnpm build` and passing tests.
- **Accessibility**: `pnpm test:a11y` ensuring rendered markup (including React fixtures) passes axe-core validation.
