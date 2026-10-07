import { expect, test } from "@playwright/test";

test("pointer and keyboard navigation track both sections and detail return", async ({
  page,
}) => {
  await page.goto("/");

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

  await page.goto("/");
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
  await page.goto("/");

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
  expect(detailHref).toMatch(/^\/experiencia\/.+\/$/);

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
