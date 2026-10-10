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
  integrations: [sitemap(), react({ compiler: true })],
  vite: {
    plugins: [tailwindcss()],
  },
});
