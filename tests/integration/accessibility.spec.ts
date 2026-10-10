import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { experiences } from "./helpers/content";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("home and every content-derived detail page pass browser axe", async ({
  page,
}) => {
  const routes = [
    "/",
    ...experiences.map(({ slug }) => `/experiencia/${slug}/`),
  ];

  for (const route of routes) {
    await page.goto(route);
    if (route === "/") {
      await expect(
        page.getByRole("navigation", { name: "Navegación por secciones" }),
      ).toHaveAttribute("data-positioned", "true");
    }

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations, `axe violations on ${route}`).toEqual([]);
  }
});

test("aria-current follows the navigator selection and the page stays axe-clean after activation", async ({
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

  await expect(navigation).toHaveAttribute("data-positioned", "true");
  await expect(profileLink).toHaveAttribute("aria-current", "location");

  await experienceLink.click();
  await expect(experienceLink).toHaveAttribute("aria-current", "location");
  await expect(profileLink).not.toHaveAttribute("aria-current", "location");

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations, "axe violations after activation").toEqual([]);
});
