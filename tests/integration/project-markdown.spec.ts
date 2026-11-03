import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

/**
 * 033-projects-section, T3: AC27 (R27) and the build-level half of AC1 (R2).
 *
 * No real project body contains a Markdown `h2` or `h3`, and a style rule for
 * them can only be proven on compiled Markdown. These tests therefore build a
 * throwaway copy of the site (under `node_modules/.cache`, removed afterwards)
 * with an extra fixture project, so neither the real content nor `dist/` is
 * touched. The copy shares `node_modules` through hard links.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const workDir = join(
  root,
  "node_modules",
  ".cache",
  `qa-spec033-markdown-${process.pid}`,
);
const astroBin = join(workDir, "node_modules", "astro", "bin", "astro.mjs");

const fixtureFrontmatter = (slug: string, order: number, extra = "") => `---
slug: ${slug}
name: Fixture ${slug}
summary: Fixture temporal de pruebas.
technologies:
  - Astro
repositoryUrl: https://example.com/${slug}
archived: false
order: ${order}
${extra}seo:
  title: Fixture ${slug} | Daniel Cerezo Torrejón | Portfolio profesional
  description: Fixture temporal de pruebas.
---
`;

const fixtureBody = `
Introducción.

## Subtítulo de sección

Texto del apartado.

### Subtítulo de tercer nivel

Más texto.
`;

function build(outDir: string) {
  return spawnSync("node", [astroBin, "build", "--outDir", outDir], {
    cwd: workDir,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

function mimeFor(file: string): string {
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".avif": "image/avif",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".png": "image/png",
  };
  return types[extname(file)] ?? "application/octet-stream";
}

function serve(dir: string): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer((request, response) => {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://localhost").pathname,
      );
      let file = join(dir, pathname);
      if (pathname.endsWith("/")) file = join(file, "index.html");
      if (!existsSync(file)) {
        response.writeHead(404).end();
        return;
      }
      response
        .writeHead(200, { "content-type": mimeFor(file) })
        .end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

test.beforeAll(() => {
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(join(workDir, "node_modules"), { recursive: true });
  for (const entry of ["src", "public"]) {
    cpSync(join(root, entry), join(workDir, entry), { recursive: true });
  }
  for (const file of ["astro.config.mjs", "package.json", "tsconfig.json"]) {
    cpSync(join(root, file), join(workDir, file));
  }
  // Hard-linked copy: a symlinked node_modules breaks Vite's path resolution.
  for (const entry of readdirSync(join(root, "node_modules"))) {
    if (entry === ".cache") continue;
    execFileSync("cp", [
      "-al",
      join(root, "node_modules", entry),
      join(workDir, "node_modules", entry),
    ]);
  }
});

test.afterAll(() => {
  rmSync(workDir, { recursive: true, force: true });
});

test.describe("Markdown headings in a detail body (AC27)", () => {
  const viewports = [
    { width: 320, height: 568, size: 24, leading: 30 },
    { width: 767, height: 1024, size: 24, leading: 30 },
    { width: 768, height: 1024, size: 32, leading: 40 },
    { width: 1280, height: 800, size: 32, leading: 40 },
    { width: 1920, height: 1080, size: 32, leading: 40 },
  ];

  test("h2 and h3 compute to the section heading visual language", async ({
    page,
  }) => {
    writeFileSync(
      join(workDir, "src", "content", "projects", "zz-fixture.md"),
      fixtureFrontmatter("zz-fixture", 6) + fixtureBody,
    );
    const built = build("dist-fixture");
    expect(built.status, built.stdout + built.stderr).toBe(0);

    const server = await serve(join(workDir, "dist-fixture"));
    const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);

        // Reference: a real `section`-variant heading rendered by the Heading
        // molecule, taken from the same build and viewport.
        await page.goto(`${origin}/`);
        const reference = await page
          .locator('h2[data-variant="section"]')
          .first()
          .evaluate((el) => {
            const s = getComputedStyle(el);
            return {
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              lineHeight: s.lineHeight,
              color: s.color,
              marginBottom: s.marginBottom,
              fontFamily: s.fontFamily,
              textTransform: s.textTransform,
              textAlign: s.textAlign,
              letterSpacing: s.letterSpacing,
            };
          });
        expect(reference.fontSize).toBe(`${viewport.size}px`);

        await page.goto(`${origin}/proyectos/zz-fixture/`);
        const headings = page.locator(".detail-content h2, .detail-content h3");
        await expect(headings).toHaveCount(2);
        expect(await page.locator("h1").count()).toBe(1);

        for (const level of ["h2", "h3"]) {
          const actual = await page
            .locator(`.detail-content ${level}`)
            .evaluate((el) => {
              const s = getComputedStyle(el);
              return {
                fontSize: s.fontSize,
                fontWeight: s.fontWeight,
                lineHeight: s.lineHeight,
                color: s.color,
                marginBottom: s.marginBottom,
                fontFamily: s.fontFamily,
                textTransform: s.textTransform,
                textAlign: s.textAlign,
                letterSpacing: s.letterSpacing,
              };
            });
          const label = `${level} at ${viewport.width}px`;
          expect(actual, label).toEqual(reference);
          // Absolute values from docs/design.md, independent of the reference.
          expect(actual.fontSize, label).toBe(`${viewport.size}px`);
          expect(actual.fontWeight, label).toBe("700");
          expect(actual.lineHeight, label).toBe(`${viewport.leading}px`);
          expect(actual.marginBottom, label).toBe("24px");
          expect(actual.textTransform, label).toBe("none");
        }
      }
    } finally {
      server.close();
    }
  });
});

test.describe("duplicate project entries fail the build (AC1, R2)", () => {
  const projectsDir = () => join(workDir, "src", "content", "projects");

  test.afterEach(() => {
    for (const name of ["zz-dup-order.md", "zz-dup-slug.md", "zz-no-alt.md"]) {
      rmSync(join(projectsDir(), name), { force: true });
    }
    rmSync(join(projectsDir(), "zz-fixture.md"), { force: true });
  });

  test("a duplicate order is rejected by assertUniqueProjects", () => {
    // `order: 1` is portfolio's.
    writeFileSync(
      join(projectsDir(), "zz-dup-order.md"),
      fixtureFrontmatter("zz-dup-order", 1) + "\nTexto.\n",
    );
    const built = build("dist-dup-order");
    expect(built.status, "build must fail").not.toBe(0);
    expect(built.stdout + built.stderr).toMatch(/Duplicate project order 1/);
  });

  test("a duplicate slug is rejected by assertUniqueProjects", () => {
    // The slug matches portfolio's; the file name does not.
    writeFileSync(
      join(projectsDir(), "zz-dup-slug.md"),
      fixtureFrontmatter("portfolio", 9) + "\nTexto.\n",
    );
    const built = build("dist-dup-slug");
    expect(built.status, "build must fail").not.toBe(0);
    expect(built.stdout + built.stderr).toMatch(
      /Duplicate project slug "portfolio"/,
    );
  });

  test("an image without alt is rejected by the schema", () => {
    writeFileSync(
      join(projectsDir(), "zz-no-alt.md"),
      fixtureFrontmatter(
        "zz-no-alt",
        9,
        "image:\n  src: ../../assets/project-default.svg\n  alt: ''\n",
      ) + "\nTexto.\n",
    );
    const built = build("dist-no-alt");
    expect(built.status, "build must fail").not.toBe(0);
    expect(built.stdout + built.stderr).toMatch(/alt/i);
  });

  test("the unmodified copy still builds (control)", () => {
    const built = build("dist-control");
    expect(built.status, built.stdout + built.stderr).toBe(0);
    expect(
      existsSync(join(workDir, "dist-control", "proyectos", "portfolio")),
    ).toBe(true);
  });
});
