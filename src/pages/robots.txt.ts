import type { APIRoute } from "astro";

import { SITE, withBase } from "../lib/base-url";

export const GET: APIRoute = () => {
  const sitemapUrl = new URL(withBase("/sitemap-index.xml"), SITE).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
