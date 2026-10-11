/**
 * Base-aware navigation helper for the Playwright integration suite.
 *
 * Playwright resolves root-absolute URLs (`/foo`) against the `baseURL` origin
 * only. The site is served from the custom-domain root, so the configured base
 * is `/` and the derived `basePath` is the empty string: every `page.goto` and
 * same-origin `href` assertion resolves directly at the origin root.
 */
import { BASE } from "../../../src/lib/base-url";

/**
 * The deployment base path without a trailing slash. It is the empty string at
 * the root base; for a subpath base it is that subpath.
 */
export const basePath = BASE.replace(/\/+$/, "");

/**
 * Prefixes a site-root path with the deployment base so it resolves under the
 * preview server's base path. At the root base the prefix is empty and the path
 * passes through unchanged. External, protocol-relative, and relative
 * references are returned unchanged.
 */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${basePath}${path}`;
}
