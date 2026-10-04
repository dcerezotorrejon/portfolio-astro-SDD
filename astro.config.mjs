// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// TODO: replace with the real production domain before deploying.
export const site = "https://example.com";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
});
