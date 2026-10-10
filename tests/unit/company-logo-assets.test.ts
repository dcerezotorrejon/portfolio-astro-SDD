import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface LogoCase {
  name: string;
  path: string;
  viewBox: string;
  maxBytes: number;
}

const logos: LogoCase[] = [
  {
    name: "Babel",
    path: "public/images/companies/babel.svg",
    viewBox: "0 0 526.8 129.1",
    maxBytes: 5462,
  },
  {
    name: "NTTData",
    path: "public/images/companies/nttdata.svg",
    viewBox: "0 0 340.16 69.52",
    maxBytes: 3529,
  },
];

describe("T3 minified company logo assets", () => {
  for (const logo of logos) {
    describe(logo.name, () => {
      const bytes = readFileSync(logo.path);
      const svg = bytes.toString("utf8");

      it("is a well-formed SVG document", () => {
        expect(svg).toContain("<svg");
        expect(svg).toContain("</svg>");
      });

      it("keeps no editor/export cruft", () => {
        // XML declaration, Illustrator comments, <metadata> blocks and the
        // GIMP/Inkscape `data-name` attribute are all non-rendering content.
        expect(svg.startsWith("<?xml")).toBe(false);
        expect(svg).not.toContain("<!--");
        expect(svg).not.toMatch(/<metadata\b/);
        expect(svg).not.toMatch(/data-name\s*=/);
      });

      it("preserves the original viewBox", () => {
        expect(svg).toContain(`viewBox="${logo.viewBox}"`);
      });

      it("is strictly smaller than the pre-minification byte limit (R11)", () => {
        expect(bytes.byteLength).toBeLessThan(logo.maxBytes);
      });

      it("still renders at least one path with a fill", () => {
        expect(svg).toMatch(/<path\b/);
        expect(svg).toMatch(/fill[:=]/);
      });
    });
  }
});
