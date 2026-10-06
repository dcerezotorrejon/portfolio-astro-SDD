import { expect, test } from "@playwright/test";
import { experiences } from "./helpers/content";

test("home and every content-derived experience detail load directly", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (const experience of experiences) {
    await page.goto(`/experiencia/${experience.slug}/`);
    await expect(page.locator("article[data-experience-slug]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      experience.role,
    );
    await expect(page.locator(".company-identity")).toContainText(
      experience.company,
    );
  }
});
