// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// TODO: replace with the real production domain before deploying.
export const site = "https://example.com";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap(), react({ compiler: true })],
  vite: {
    plugins: [tailwindcss()],
  },
});
