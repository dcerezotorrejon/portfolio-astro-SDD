// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { BASE, SITE } from "./src/lib/base-url.ts";

export const site = SITE;
export const base = BASE;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  // Astro's content Vite plugin reads the content data store from `.astro/`
  // when running in the dev/serve context (which Vitest uses), but `astro sync`
  // and `astro build` default to writing it to `node_modules/.astro/`. A clean
  // checkout has no `.astro/data-store.json`, so collection-based unit/a11y
  // tests see an empty store. Pointing `cacheDir` at `.astro/` makes build/sync
  // write the store exactly where the tests read it, with no extra CI step.
  cacheDir: "./.astro",
  integrations: [sitemap(), react({ compiler: true })],
  vite: {
    plugins: [tailwindcss()],
  },
});
