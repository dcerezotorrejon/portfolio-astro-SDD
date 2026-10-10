import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Icon from "../../src/components/atoms/Icon.astro";
import { iconMap } from "../../src/components/atoms/iconMap";
import { render } from "../helpers/render";

const expectedPaths = {
  github:
    "M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.47 2.19 3.85 1.53.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.23-5.1 5.5.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z",
  linkedin:
    "M20.45 3H3.55c-.3 0-.55.25-.55.55v16.9c0 .3.25.55.55.55h16.9c.3 0 .55-.25.55-.55V3.55c0-.3-.25-.55-.55-.55ZM8.34 18H5.4V9.5h2.94V18ZM6.87 8.34a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM18 18h-2.94v-4.14c0-.99-.02-2.26-1.38-2.26-1.38 0-1.59 1.08-1.59 2.19V18H9.15V9.5h2.82v1.16h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.95 3.52 4.49V18Z",
} as const;

describe("Icon atom", () => {
  it.each([
    ["github", "/portfolio-astro-SDD/icons/github.svg#icon"],
    ["linkedin", "/portfolio-astro-SDD/icons/linkedin.svg#icon"],
  ] as const)(
    "renders the %s map entry as an external SVG use",
    async (name, href) => {
      const html = await render(Icon, { name });
      const { document } = new JSDOM(html).window;
      const roots = document.querySelectorAll("svg");
      const root = roots[0];

      expect(roots).toHaveLength(1);
      expect(root?.querySelectorAll("use")).toHaveLength(1);
      expect(root?.querySelector("use")?.getAttribute("href")).toBe(href);
      expect(root?.getAttribute("class")).toBe("icon size-4");
    },
  );

  it("forwards SVG attributes, merges classes and does not add SVG or accessibility defaults", async () => {
    const html = await render(Icon, {
      name: "github",
      class: "text-white custom-icon",
      style: "color: rebeccapurple",
      width: "32",
      height: "32",
      role: "img",
      "aria-label": "GitHub profile",
      focusable: "false",
    });
    const { document } = new JSDOM(html).window;
    const root = document.querySelector("svg");

    expect(root?.getAttribute("class")?.split(/\s+/)).toEqual([
      "icon",
      "size-4",
      "text-white",
      "custom-icon",
    ]);
    expect(root?.getAttribute("style")).toContain("color: rebeccapurple");
    expect(root?.getAttribute("width")).toBe("32");
    expect(root?.getAttribute("height")).toBe("32");
    expect(root?.getAttribute("role")).toBe("img");
    expect(root?.getAttribute("aria-label")).toBe("GitHub profile");
    expect(root?.getAttribute("focusable")).toBe("false");
    expect(root?.hasAttribute("viewBox")).toBe(false);
    expect(root?.hasAttribute("fill")).toBe(false);
    expect(root?.hasAttribute("aria-hidden")).toBe(false);
    expect(root?.querySelector("use")?.hasAttribute("fill")).toBe(false);
  });

  it("keeps its API map-derived and free of client scripts or hydration directives", async () => {
    expect(iconMap).toEqual({
      github: "/icons/github.svg#icon",
      linkedin: "/icons/linkedin.svg#icon",
    });

    const source = await readFile("src/components/atoms/Icon.astro", "utf8");
    const mapSource = await readFile("src/components/atoms/iconMap.ts", "utf8");
    expect(source).toMatch(/name:\s*IconName/);
    expect(source).toMatch(/iconMap\[name\]/);
    expect(mapSource).toMatch(/export type IconName = keyof typeof iconMap/);
    expect(source).not.toMatch(/<script\b|\bclient:/);
  });
});

describe("public social SVG symbols", () => {
  it.each(["github", "linkedin"] as const)(
    "publishes the %s artwork as the currentColor #icon symbol",
    async (name) => {
      const svg = await readFile(`public/icons/${name}.svg`, "utf8");
      const { document } = new JSDOM(svg, {
        contentType: "image/svg+xml",
      }).window;
      const symbols = document.querySelectorAll('symbol[id="icon"]');
      const symbol = symbols[0];
      const paths = symbol?.querySelectorAll("path");

      expect(document.querySelectorAll("symbol")).toHaveLength(1);
      expect(symbols).toHaveLength(1);
      expect(symbol?.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(paths).toHaveLength(1);
      expect(paths?.[0]?.getAttribute("fill")).toBe("currentColor");
      expect(paths?.[0]?.getAttribute("d")).toBe(expectedPaths[name]);
      expect(iconMap[name]).toBe(`/icons/${name}.svg#icon`);
    },
  );
});
