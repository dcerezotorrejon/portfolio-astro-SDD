/**
 * Base-aware navigation helper for the Playwright integration suite.
 *
 * Playwright resolves root-absolute URLs (`/foo`) against the `baseURL` origin
 * only, dropping the configured deployment base path. Every `page.goto` and
 * same-origin `href` assertion therefore has to carry the base explicitly.
 */
import { BASE } from "../../../src/lib/base-url";

/** The deployment base path without a trailing slash, e.g. `/portfolio-astro-SDD`. */
export const basePath = BASE.replace(/\/+$/, "");

/**
 * Prefixes a site-root path with the deployment base so it resolves under the
 * preview server's base path. External, protocol-relative, and relative
 * references are returned unchanged.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
