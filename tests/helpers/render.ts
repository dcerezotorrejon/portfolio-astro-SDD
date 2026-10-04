import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import reactRenderer from "@astrojs/react/server.js";
import { site } from "../../astro.config.mjs";

let container: Promise<AstroContainer> | undefined;

/**
 * Returns a shared Astro container used to render components and pages to HTML
 * strings without a browser. The production `site` is injected so pages that
 * build absolute URLs (e.g. canonical) behave like the real build.
 */
export function getContainer(): Promise<AstroContainer> {
  container ??= AstroContainer.create({
    astroConfig: { site },
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
 */
export async function render(
  component: AstroComponentFactory,
  props: Record<string, unknown> = {},
): Promise<string> {
  const instance = await getContainer();
  return instance.renderToString(component, { props });
}
