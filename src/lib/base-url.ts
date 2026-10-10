/**
 * Single source of truth for the deployment origin and base path, shared by
 * `astro.config.mjs` and the render-time `withBase` helper.
 *
 * `withBase` deliberately does not read `import.meta.env.BASE_URL`: that value
 * is `/` in the Vitest/Astro-container render context, so it cannot resolve the
 * production base deterministically in both the container and the built output.
 * The base is instead derived from the same `BASE` constant that
 * `astro.config.mjs` exports as `base`.
 */
export const SITE = "https://dcerezotorrejon.github.io";

export const BASE = "/portfolio-astro-SDD";

/** The configured base without a trailing slash (empty string for the root). */
const normalizedBase = BASE === "/" ? "" : BASE.replace(/\/+$/, "");

/**
 * Prefixes a site-root path (one that starts with `/`) with the configured
 * base. External URLs, protocol-relative and relative references, and
 * fragment-only references are returned unchanged, and any `#fragment` or
 * `?query` is preserved.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${normalizedBase}${path}`;
}
