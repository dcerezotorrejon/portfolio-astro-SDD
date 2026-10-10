import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import reactRenderer from "@astrojs/react/server.js";
import { base, site } from "../../astro.config.mjs";

let container: Promise<AstroContainer> | undefined;

/**
 * Returns a shared Astro container used to render components and pages to HTML
 * strings without a browser. The production `site` and `base` are injected so
 * pages that build absolute URLs (e.g. canonical) and base-prefixed asset links
 * behave like the real build.
 */
export function getContainer(): Promise<AstroContainer> {
  container ??= AstroContainer.create({
    astroConfig: { site, base },
    renderers: [
      {
        name: reactRenderer.name,
        ssr: reactRenderer,
      },
    ],
  });
  return container;
}

/**
 * Renders an Astro component or page to its HTML string.
 *
 * Pass a `request` whose URL includes the configured base when the component
 * reads `Astro.url` (e.g. a page that emits a canonical link); otherwise the
 * container falls back to the bare `site`, which omits the base path.
 */
export async function render(
  component: AstroComponentFactory,
  props: Record<string, unknown> = {},
  request?: Request,
): Promise<string> {
  const instance = await getContainer();
  return instance.renderToString(component, {
    props,
    ...(request ? { request } : {}),
  });
}
