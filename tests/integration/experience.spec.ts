import { expect, test } from "@playwright/test";
import { experiences } from "./helpers/content";
import { withBase } from "./helpers/site";

test("every experience entry opens its matching detail and returns to the list", async ({
  page,
}) => {
  await page.goto(withBase("/"));
  const section = page.locator("#trayectoria");
  for (const experience of experiences) {
    const card = section.locator("article").filter({
      has: page.locator(
        `a[href="${withBase(`/experiencia/${experience.slug}/`)}"]`,
      ),
    });
    await expect(card).toBeVisible();
    const link = card.getByRole("link");
    await expect(link).toHaveAttribute(
      "href",
      withBase(`/experiencia/${experience.slug}/`),
    );
    await link.click();
    await expect(page).toHaveURL(
      new RegExp(`/experiencia/${experience.slug}/$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      experience.role,
    );
    await expect(page.locator(".company-name")).toContainText(
      experience.company,
    );
    await page.getByRole("link", { name: /volver/i }).click();
    await expect(page).toHaveURL(/\/#trayectoria$/);
    await expect(section).toBeInViewport();
  }
});
