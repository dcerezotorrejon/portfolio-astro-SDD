import { expect, test, type Page } from "@playwright/test";
import { basePath, withBase } from "./helpers/site";

/**
 * Start an rAF sampler that records `window.scrollY` every frame, capturing the
 * starting position synchronously, and stops after a bounded number of frames.
 * The samples let a test prove that activation jumps straight to the target
 * instead of travelling there over several frames (which a smooth scroll would
 * produce).
 */
async function installScrollSampler(page: Page, frames = 60) {
  await page.evaluate((maxFrames) => {
    const samplerWindow = window as unknown as {
      __scrollSamples: number[];
      __scrollSamplerDone: boolean;
    };
    samplerWindow.__scrollSamples = [window.scrollY];
    samplerWindow.__scrollSamplerDone = false;

    const sample = () => {
      samplerWindow.__scrollSamples.push(window.scrollY);

      if (samplerWindow.__scrollSamples.length >= maxFrames) {
        samplerWindow.__scrollSamplerDone = true;
        return;
      }

      window.requestAnimationFrame(sample);
    };

    window.requestAnimationFrame(sample);
  }, frames);
}

async function readScrollSamples(page: Page): Promise<number[]> {
  return page.evaluate(
    () =>
      (window as unknown as { __scrollSamples: number[] }).__scrollSamples ??
      [],
  );
}

async function waitForScrollSampler(page: Page) {
  await page.waitForFunction(
    () =>
      (window as unknown as { __scrollSamplerDone: boolean })
        .__scrollSamplerDone === true,
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

test("a plain link click jumps straight to the target and updates the fragment and current state", async ({
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

  await installScrollSampler(page);
  await experienceLink.click();

  // The fragment updates and the target becomes current immediately.
  await expect(page).toHaveURL(/#trayectoria$/);
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
  await expect(navigation).toHaveAttribute("data-active-index", "1");
  await expect(experienceSection).toBeInViewport();

  await waitForScrollSampler(page);
  const samples = await readScrollSamples(page);
  const startY = samples[0] ?? 0;
  const targetY = samples[samples.length - 1] ?? 0;
  expect(targetY).toBeGreaterThan(120);

  // AC2/R3: no animated progression — the position is never sampled between the
  // origin and the target. A smooth scroll would fill this window with frames.
  const inFlight = samples.filter((y) => y > startY + 2 && y < targetY - 2);
  expect(inFlight).toHaveLength(0);
  // AC2/R3: the jump completes within a single frame — the sample right before
  // the first landed-at-target sample is still at the origin.
  const firstTarget = samples.findIndex((y) => y >= targetY - 2);
  expect(firstTarget).toBeGreaterThan(0);
  expect(samples[firstTarget - 1]).toBeLessThanOrEqual(startY + 2);

  // Returning to the first section jumps straight back to the top too.
  await installScrollSampler(page);
  await profileLink.click();

  await expect(page).toHaveURL(/#inicio$/);
  await expect(profileLink).toHaveAttribute("aria-current", "location");
  await expect(navigation).toHaveAttribute("data-active-index", "0");
  await expect(page.locator("#inicio")).toBeInViewport();

  await waitForScrollSampler(page);
  const returnSamples = await readScrollSamples(page);
  const returnStart = returnSamples[0] ?? 0;
  const returnEnd = returnSamples[returnSamples.length - 1] ?? 0;
  expect(returnStart).toBeGreaterThan(120);
  expect(returnEnd).toBeLessThanOrEqual(2);
  const returnInFlight = returnSamples.filter(
    (y) => y > returnEnd + 2 && y < returnStart - 2,
  );
  expect(returnInFlight).toHaveLength(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("activation jumps to the target with the indicator transition suppressed", async ({
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

    // AC6/R8: the indicator's shared-element transition stays suppressed under
    // reduced motion (`motion-reduce:transition-none`).
    const transitionProperty = await page
      .locator(".floating-nav-indicator")
      .evaluate((indicator) => getComputedStyle(indicator).transitionProperty);
    expect(transitionProperty).toBe("none");

    await experienceLink.click();

    // Activation still jumps to the target, updates the fragment, and selects
    // it as current. No animated scroll is introduced.
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
