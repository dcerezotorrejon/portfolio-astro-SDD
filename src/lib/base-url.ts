/**
 * Single source of truth for the deployment origin and base path, shared by
 * `astro.config.mjs` and the render-time `withBase` helper.
 *
 * The site is served from the custom-domain root at
 * `https://portfolio.dcerezo.work`, so `BASE` is `/` and `withBase` returns
 * site-root paths unchanged because the normalized base is empty. `withBase`
 * deliberately does not read `import.meta.env.BASE_URL`: the base is derived
 * from the same `BASE` constant that `astro.config.mjs` exports as `base`,
 * keeping the render context and the built output consistent.
 */
export const SITE = "https://portfolio.dcerezo.work";

export const BASE = "/";

/** The configured base without a trailing slash (empty string for the root). */
const normalizedBase = BASE === "/" ? "" : BASE.replace(/\/+$/, "");

/**
 * Prefixes a site-root path (one that starts with `/`) with the configured
 * base. Under the root base the normalized prefix is empty, so site-root paths
 * pass through unchanged. External URLs, protocol-relative and relative
 * references, and fragment-only references are returned unchanged, and any
 * `#fragment` or `?query` is preserved.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${normalizedBase}${path}`;
}
