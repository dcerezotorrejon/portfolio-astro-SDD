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
