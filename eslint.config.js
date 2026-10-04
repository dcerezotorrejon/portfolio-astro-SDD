// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

import { defineConfig } from "eslint/config";

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

  // Desactiva las reglas de estilo que entran en conflicto con Prettier.
  // Debe ir al final para sobrescribir al resto.
  prettier,
);
