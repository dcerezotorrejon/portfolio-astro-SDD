import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "./helpers/content";
import { withBase } from "./helpers/site";

/**
 * 033-projects-section, T3 (R26, R28, R32, R34 detail pages): the five detail
 * pages, the return link, view transitions from real cards and clones, and
 * axe and page overflow at every listed viewport.
 */

const viewports = [
  { width: 320, height: 568 },
  { width: 767, height: 1024 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
] as const;

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("the collection has the five approved projects", () => {
  expect(projects.map((p) => p.slug).sort()).toEqual([
    "custom-aur",
    "hassio-pacman",
    "openrazer",
    "portfolio",
    "zot-quarantine-proxy",
  ]);
});

test.describe("detail page content and links (AC25, AC26)", () => {
  for (const project of projects) {
    test(`${project.slug}: one h1, links, return link to the section`, async ({
      page,
    }) => {
      await page.goto(withBase(`/proyectos/${project.slug}/`));

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(project.name);
      await expect(page.locator("main img")).toHaveCount(0);
      expect(
        (await page.locator(".detail-content").innerText()).trim().length,
      ).toBeGreaterThan(0);

      const hrefs = await page
        .locator("main a")
        .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
      expect(hrefs).toContain(project.repositoryUrl);
      // No page links to a published site (AC26): the only external link in
      // the content is the GitHub repository, and no link targets the site.
      expect(
        hrefs.filter((href) => /^https?:\/\//.test(href ?? "")),
        "external links",
      ).toEqual([project.repositoryUrl]);
      expect(hrefs.join(" ")).not.toContain("portfolio.dcerezo.com");
      await expect(
        page.getByRole("link", { name: /sitio publicado/i }),
      ).toHaveCount(0);

      // The license appears only where the entry sets one (AC26).
      const license = page.locator(".project-license");
      if (project.license) {
        await expect(license).toContainText(project.license);
      } else {
        await expect(license).toHaveCount(0);
      }
      expect(project.license !== undefined).toBe(project.slug === "openrazer");

      // Archived status is text, not color alone (R24).
      await expect(page.locator(".project-status")).toHaveCount(
        project.archived ? 1 : 0,
      );

      // Return link: lands on the projects section of the home.
      await page.locator("main a[href$='/#proyectos']").click();
      await expect(page).toHaveURL(new RegExp(`${withBase("/")}#proyectos$`));
      await expect(page.locator("section#proyectos")).toBeInViewport();
    });
  }
});

test.describe("detail pages at every listed viewport (AC34, detail pages)", () => {
  for (const viewport of viewports) {
    test(`${viewport.width}px: no horizontal scroll and axe-clean`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      for (const project of projects) {
        const route = withBase(`/proyectos/${project.slug}/`);
        await page.goto(route);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll, `${route} overflows`).toBeLessThanOrEqual(
          overflow.client,
        );
        const results = await new AxeBuilder({ page })
          .withTags(wcagTags)
          .analyze();
        expect(results.violations, `axe on ${route}`).toEqual([]);
      }
    });
  }
});

type TransitionRecord = { ready: string; finished: string };

/** Records every view transition started on the page and how it ended. */
async function spyOnViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: TransitionRecord[] };
    w.__vt = [];
    const original = document.startViewTransition?.bind(document);
    if (!original) return;
    document.startViewTransition = (
      callback?: ViewTransitionUpdateCallback,
    ) => {
      const transition = original(callback);
      const record: TransitionRecord = {
        ready: "pending",
        finished: "pending",
      };
      w.__vt.push(record);
      transition.ready.then(
        () => (record.ready = "ok"),
        () => (record.ready = "rejected"),
      );
      transition.finished.then(
        () => (record.finished = "ok"),
        () => (record.finished = "rejected"),
      );
      return transition;
    };
  });
}

async function lastTransition(page: Page): Promise<TransitionRecord> {
  return page.evaluate(() => {
    const list = (window as unknown as { __vt: TransitionRecord[] }).__vt;
    return list[list.length - 1];
  });
}

test.describe("view transitions (AC28)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  const slug = "openrazer";
  const name = projects.find((p) => p.slug === slug)!.name;

  async function openHydratedHome(page: Page) {
    await spyOnViewTransitions(page);
    await page.goto(withBase("/"));
    await expect(
      page.locator("li[data-carousel-clone]").first(),
    ).toBeAttached();
  }

  test("a real card and its detail page share one transition name", async ({
    page,
  }) => {
    await page.goto(withBase("/"));
    const cardName = await page
      .locator(
        `li:not([data-carousel-clone]) article:has(a[href$="/proyectos/${slug}/"])`,
      )
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
    await page.goto(withBase(`/proyectos/${slug}/`));
    const detailName = await page
      .locator("article")
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(cardName).toBe(`project-transition-${slug}`);
    expect(detailName).toBe(cardName);
  });

  test("a click on a real card navigates with a completed transition, and back", async ({
    page,
  }) => {
    await openHydratedHome(page);
    expect(await page.evaluate(() => "startViewTransition" in document)).toBe(
      true,
    );

    await page
      .locator(`li:not([data-carousel-clone]) a[href$="/proyectos/${slug}/"]`)
      .click();
    await expect(page).toHaveURL(new RegExp(`/proyectos/${slug}/$`));
    await expect(page.locator("h1")).toHaveText(name);
    await expect
      .poll(async () => (await lastTransition(page)).finished)
      .toBe("ok");
    expect((await lastTransition(page)).ready).toBe("ok");

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${withBase("/")}$`));
    await expect(page.locator("section#proyectos")).toBeAttached();
    await expect
      .poll(async () => (await lastTransition(page)).finished)
      .toBe("ok");
    expect((await lastTransition(page)).ready).toBe("ok");
  });

  test("a click on a visible clone completes, and the return trip too", async ({
    page,
  }) => {
    await openHydratedHome(page);

    // Bring the last stop into view: the card after it is a clone of the first.
    const next = page.getByRole("button", { name: "Proyecto siguiente" });
    for (let i = 0; i < projects.length - 1; i++) {
      await next.click();
      await expect
        .poll(
          async () => {
            const read = () =>
              page.evaluate(
                () =>
                  document.querySelector(".projects-carousel-scroller")!
                    .scrollLeft,
              );
            const first = await read();
            await page.waitForTimeout(150);
            return first === (await read());
          },
          { message: "carousel settles after the arrow click" },
        )
        .toBe(true);
    }

    // Pick a clone link fully inside the carousel's visible area.
    const handle = await page.evaluateHandle(() => {
      const scroller = document.querySelector(".projects-carousel-scroller")!;
      const box = scroller.getBoundingClientRect();
      return (
        [...document.querySelectorAll("li[data-carousel-clone] a")].find(
          (a) => {
            const r = a.getBoundingClientRect();
            return r.width > 0 && r.left >= box.left && r.right <= box.right;
          },
        ) ?? null
      );
    });
    const link = handle.asElement();
    expect(link, "no clone link fully visible at the last stop").not.toBeNull();
    const href = await link!.getAttribute("href");
    expect(href).toMatch(/\/proyectos\/[a-z-]+\/$/);

    await link!.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toBeVisible();
    await expect
      .poll(async () => (await lastTransition(page)).finished)
      .toBe("ok");

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${withBase("/")}$`));
    await expect
      .poll(async () => (await lastTransition(page)).finished)
      .toBe("ok");
    // The return does not accumulate clones (R10).
    await expect(page.locator("li[data-carousel-clone]")).toHaveCount(
      2 * projects.length,
    );
  });
});
