# Tasks — Front extra dependencies: Tailwind CSS v4 and React

- **Spec ID**: `002-front-extra-dependencies`

> A task is only marked `[x]` with evidence from the applicable gates.

## Checklist

- [x] T1: Install Tailwind v4, `@tailwindcss/vite`, `@astrojs/react`, React, types, and ESLint React plugins.
  - Evidence: `pnpm add` runtime (`@astrojs/react@7`, `react@19.3.0`, `react-dom@19.3.0`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`) and dev (`@types/react`, `@types/react-dom`, `@testing-library/react@16.3.3`, `@testing-library/jest-dom@7.0.1`, `eslint-plugin-react-hooks@7.1.1`, `eslint-plugin-jsx-a11y@6.10.2`). `eslint-plugin-react` intentionally omitted (incompatible with ESLint 10).
- [x] T2: Configure `astro.config.mjs` with Vite Tailwind plugin and Astro React integration.
  - Evidence: `pnpm build` completes; `react()` in `integrations`, `tailwindcss()` in `vite.plugins`.
- [x] T3: Update `tsconfig.json` with `jsx: "react-jsx"` and `jsxImportSource: "react"`.
  - Evidence: `.tsx` fixtures compile under `pnpm test:run`.
- [x] T4: Create `src/styles/global.css` with Tailwind v4 `@import` directive and wire it into the layout/home.
  - Evidence: `pnpm build` emits `dist/_astro/index.*.css` containing `text-3xl` and `font-bold`.
- [x] T5: Configure ESLint with `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y`.
  - Evidence: `pnpm lint` passes across `.astro`/`.ts`/`.tsx` (including the new fixture).
- [x] T6: Amend `docs/constitution.md` (§2 and §10) for React islands and Tailwind v4, bumping version to 1.1.0, and update `AGENTS.md`.
  - Evidence: `docs/constitution.md` shows `Version: 1.1.0`, §2 interactivity policy, §10 CSS + client interactivity entries; `AGENTS.md` reflects the stack.
- [x] T7: Create a test-only React counter fixture under `tests/fixtures/` (not shipped) to demonstrate the React integration; no product islands are added to `src/`.
  - Evidence: `tests/fixtures/Counter.tsx` (test-only; not imported from `src/`).
- [x] T8: Add a React test (`tests/unit/react.test.tsx`) covering SSR through the Astro Container API and client interaction through `@testing-library/react`.
  - Evidence: `tests/unit/react.test.tsx` (SSR + `fireEvent` interaction) and `tests/a11y/react.test.ts` (axe over SSR markup); `pnpm test:run` -> 7 passed, `pnpm test:a11y` -> 2 passed.
- [x] T9: Run verification gates (`lint`, `format:check`, `build`, `test:run`, `test:a11y`).
  - Evidence: all five gates pass (see Gate summary).
- [x] T10: Enable the React Compiler (`react({ compiler: true })`) with `oxc-transform-react` installed.
  - Evidence: `oxc-transform-react@0.152.0` in devDependencies; `pnpm build` and `pnpm test:run` pass.

## Gate summary

- [x] Lint (`pnpm lint`)
- [x] Format (`pnpm format:check`)
- [x] Build (`pnpm build`)
- [x] Unit tests (`pnpm test:run`) — 7 passed
- [x] Accessibility (`pnpm test:a11y`) — 2 passed
