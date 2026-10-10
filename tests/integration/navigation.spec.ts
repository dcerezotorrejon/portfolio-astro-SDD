import { expect, test, type Page } from "@playwright/test";
import { basePath, withBase } from "./helpers/site";

interface NavSample {
  y: number;
  index: string | null;
}

/**
 * Start an in-page sampler that records the scroll position and the
 * navigator's `data-active-index` every frame, then stops once the page has
 * actually moved and settled. Pre-movement frames let us assert the state at
 * activation, before the smooth scroll has travelled anywhere.
 */
async function installNavSampler(page: Page) {
  await page.evaluate(() => {
    const samplerWindow = window as unknown as {
      __navSamples: NavSample[];
      __navSamplerDone: boolean;
    };
    samplerWindow.__navSamples = [];
    samplerWindow.__navSamplerDone = false;

    const nav = document.querySelector(".floating-nav");
    let moved = false;
    let stable = 0;
    let last = window.scrollY;

    const sample = () => {
      const y = window.scrollY;
      samplerWindow.__navSamples.push({
        y,
        index: nav?.getAttribute("data-active-index") ?? null,
      });

      if (y !== last) {
        moved = true;
        stable = 0;
        last = y;
      } else if (moved) {
        stable += 1;
      }

      if ((moved && stable >= 6) || samplerWindow.__navSamples.length > 3000) {
        samplerWindow.__navSamplerDone = true;
        return;
      }

      window.requestAnimationFrame(sample);
    };

    window.requestAnimationFrame(sample);
  });
}

async function readNavSamples(page: Page): Promise<NavSample[]> {
  return page.evaluate(
    () =>
      (window as unknown as { __navSamples: NavSample[] }).__navSamples ?? [],
  );
}

test("pointer and keyboard navigation track both sections and detail return", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  const navigation = page.getByRole("navigation", {
    name: "Navegación por secciones",
  });
  const profileLink = navigation.getByRole("link", { name: "Inicio" });
  const experienceLink = navigation.getByRole("link", {
    name: "Trayectoria",
  });
  const profileSection = page.locator("#inicio");
  const experienceSection = page.locator("#trayectoria");

  // data-positioned is set by the hydrated island after its first paint.
  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await experienceLink.click();
  await expect(page).toHaveURL(/#trayectoria$/);
  await expect(experienceSection).toBeInViewport();
  await expect(experienceLink).toHaveAttribute("aria-current", "location");

  await profileLink.click();
  await expect(page).toHaveURL(/#inicio$/);
  await expect(profileSection).toBeInViewport();
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await page.goto(withBase("/"));
  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await profileLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#inicio$/);
  await expect(profileSection).toBeInViewport();
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await experienceLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#trayectoria$/);
  await expect(experienceSection).toBeInViewport();
  await expect(experienceLink).toHaveAttribute("aria-current", "location");

  const firstExperienceLink = experienceSection
    .locator("article")
    .first()
    .getByRole("link");
  await firstExperienceLink.click();
  await expect(page).toHaveURL(/\/experiencia\/.+\/$/);
  await page.getByRole("link", { name: /volver/i }).click();
  await expect(page).toHaveURL(/\/#trayectoria$/);
  await expect(experienceSection).toBeInViewport();
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
});

test("home → detail → home round-trip stays client-side without a full reload", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  // Seed a window-scoped marker after the initial document load. A full
  // document reload replaces `window` and clears the marker, while an
  // Astro ClientRouter (SPA) transition keeps the same `window` instance.
  await page.evaluate(() => {
    (window as unknown as Record<string, string>).__clientRouterMarker =
      "initial";
  });

  const experienceSection = page.locator("#trayectoria");
  const detailLink = experienceSection
    .locator("article")
    .first()
    .getByRole("link");
  const detailHref = await detailLink.getAttribute("href");
  expect(detailHref).toMatch(new RegExp(`^${basePath}/experiencia/.+/$`));

  await detailLink.click();
  await expect(page).toHaveURL(new RegExp(`${detailHref}$`));
  await expect(page.locator("article[data-experience-slug]")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as Record<string, string>).__clientRouterMarker,
      ),
    )
    .toBe("initial");

  // Re-seed for the return leg so detail → home is proven client-side too.
  await page.evaluate(() => {
    (window as unknown as Record<string, string>).__clientRouterMarker =
      "return";
  });

  await page.getByRole("link", { name: /volver/i }).click();
  await expect(page).toHaveURL(/\/#trayectoria$/);
  await expect(experienceSection).toBeInViewport();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as Record<string, string>).__clientRouterMarker,
      ),
    )
    .toBe("return");
});

test("the indicator holds the activated target for the whole in-page scroll", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  const navigation = page.getByRole("navigation", {
    name: "Navegación por secciones",
  });
  const profileLink = navigation.getByRole("link", { name: "Inicio" });
  const experienceLink = navigation.getByRole("link", {
    name: "Trayectoria",
  });

  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await installNavSampler(page);
  await experienceLink.click();

  // Activation selects the target immediately (optimistic) — before the
  // browser-controlled smooth scroll has travelled anywhere.
  await expect(navigation).toHaveAttribute("data-active-index", "1");
  await expect(experienceLink).toHaveAttribute("aria-current", "location");

  await page.waitForFunction(
    () =>
      (window as unknown as { __navSamplerDone: boolean }).__navSamplerDone ===
      true,
  );

  const samples = await readNavSamples(page);
  expect(samples.length).toBeGreaterThan(1);

  const targetY = samples.reduce((max, sample) => Math.max(max, sample.y), 0);
  expect(targetY).toBeGreaterThan(120);

  // In-flight window: the page has moved away from the top but has not yet
  // reached the target section.
  const inFlight = samples.filter(
    (sample) => sample.y > 40 && sample.y < targetY - 40,
  );
  expect(inFlight.length).toBeGreaterThan(0);
  // AC2: geometry must never revert the selection to "Inicio" (index 0) while
  // the programmatic scroll is under way.
  expect(inFlight.every((sample) => sample.index === "1")).toBe(true);
  // AC1: the very first frames after movement already show the target.
  const firstMoved = samples.find((sample) => sample.y > 40);
  expect(firstMoved?.index).toBe("1");

  // Settled: the target is still the current item.
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
  await expect(navigation).toHaveAttribute("data-active-index", "1");
});

test("a manual scroll before arrival releases the hold and geometry takes over", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  const navigation = page.getByRole("navigation", {
    name: "Navegación por secciones",
  });
  const profileLink = navigation.getByRole("link", { name: "Inicio" });
  const experienceLink = navigation.getByRole("link", {
    name: "Trayectoria",
  });

  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await experienceLink.click();
  await expect(navigation).toHaveAttribute("data-active-index", "1");
  await page.waitForFunction(() => window.scrollY > 60);

  // "Home" is a scroll key: it releases the hold and returns the page to the
  // top, where geometry selects "Inicio" again.
  await page.keyboard.press("Home");
  await page.waitForFunction(() => window.scrollY <= 1);

  await expect(profileLink).toHaveAttribute("aria-current", "location");
  await expect(navigation).toHaveAttribute("data-active-index", "0");
  await expect(experienceLink).not.toHaveAttribute("aria-current", "location");
});

test("activating a second section mid-hold retargets the indicator", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  const navigation = page.getByRole("navigation", {
    name: "Navegación por secciones",
  });
  const profileLink = navigation.getByRole("link", { name: "Inicio" });
  const experienceLink = navigation.getByRole("link", {
    name: "Trayectoria",
  });

  await expect(navigation).toHaveAttribute("data-positioned", "true");

  await experienceLink.click();
  await expect(navigation).toHaveAttribute("data-active-index", "1");
  await page.waitForFunction(() => window.scrollY > 40);

  // While the first hold is still active, activate "Inicio": the selection
  // and the hold retarget to it.
  await profileLink.click();
  await expect(profileLink).toHaveAttribute("aria-current", "location");
  await expect(navigation).toHaveAttribute("data-active-index", "0");
  await expect(experienceLink).not.toHaveAttribute("aria-current", "location");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("activation selects the target and positions the page without the smooth animation", async ({
    page,
  }) => {
    await page.goto(withBase("/"));

    const navigation = page.getByRole("navigation", {
      name: "Navegación por secciones",
    });
    const profileLink = navigation.getByRole("link", { name: "Inicio" });
    const experienceLink = navigation.getByRole("link", {
      name: "Trayectoria",
    });
    const experienceSection = page.locator("#trayectoria");

    await expect(navigation).toHaveAttribute("data-positioned", "true");
    await expect(profileLink).toHaveAttribute("aria-current", "location");

    await experienceLink.click();

    // The native fragment jump positions the page immediately and the target
    // becomes current through geometry (the indicator transition stays
    // suppressed by `motion-reduce:transition-none`).
    await expect(page).toHaveURL(/#trayectoria$/);
    await expect(experienceSection).toBeInViewport();
    await expect(experienceLink).toHaveAttribute("aria-current", "location");
    await expect(navigation).toHaveAttribute("data-active-index", "1");
  });
});

test("keyboard activation keeps the focused link visible and current", async ({
  page,
}) => {
  await page.goto(withBase("/"));

  const navigation = page.getByRole("navigation", {
    name: "Navegación por secciones",
  });
  const experienceLink = navigation.getByRole("link", {
    name: "Trayectoria",
  });

  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await experienceLink.focus();
  await expect(experienceLink).toBeFocused();

  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#trayectoria$/);
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
  await expect(experienceLink).toBeFocused();
  // Focus is inside the navigator, so it must stay visible.
  await expect(navigation).not.toHaveAttribute("data-focus-obscured", "true");
  await expect(navigation).toBeVisible();
});
