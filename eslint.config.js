// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

import { defineConfig } from "eslint/config";

const mergeLanguageOptions = (...configs) =>
  configs.reduce((acc, config) => {
    if (!config?.languageOptions) {
      return acc;
    }

    return {
      ...acc,
      ...config.languageOptions,
      parserOptions: {
        ...(acc.parserOptions ?? {}),
        ...(config.languageOptions.parserOptions ?? {}),
      },
    };
  }, {});

const mergePlugins = (...configs) =>
  configs.reduce((acc, config) => {
    if (!config?.plugins) {
      return acc;
    }

    return {
      ...acc,
      ...config.plugins,
    };
  }, {});

const reactJsxFilesConfig = {
  files: ["**/*.{jsx,tsx}"],
  languageOptions: mergeLanguageOptions(
    reactHooks.configs.flat["recommended-latest"],
    jsxA11y.flatConfigs.recommended,
  ),
  plugins: mergePlugins(
    reactHooks.configs.flat["recommended-latest"],
    jsxA11y.flatConfigs.recommended,
  ),
  rules: {
    ...reactHooks.configs.flat["recommended-latest"].rules,
    ...jsxA11y.flatConfigs.recommended.rules,
  },
};

export default defineConfig(
  // Archivos que ESLint debe ignorar.
  {
    ignores: ["dist/", "node_modules/", ".astro/"],
  },

  // Reglas base para JavaScript.
  js.configs.recommended,

  // Reglas recomendadas para TypeScript.
  ...tseslint.configs.recommended,

  // Reglas recomendadas para componentes Astro.
  ...astro.configs.recommended,

  // Variables globales disponibles en el navegador y en Node.
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Ajustes específicos para archivos .astro.
  {
    files: ["**/*.astro"],
    rules: {
      // Los tipos globales de Astro (p. ej. ImageMetadata) no se importan.
      "no-undef": "off",
    },
  },

  // React, hooks, and accessibility rules for JSX/TSX files.
  reactJsxFilesConfig,

  // Desactiva las reglas de estilo que entran en conflicto con Prettier.
  // Debe ir al final para sobrescribir al resto.
  prettier,
);
