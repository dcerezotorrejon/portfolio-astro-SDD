import { expect, test } from "@playwright/test";
import { profile } from "./helpers/content";
import { withBase } from "./helpers/site";

test("profile identity, image, and social destinations match content", async ({
  page,
}) => {
  await page.goto(withBase("/"));
  await expect(
    page.getByRole("heading", { level: 1, name: profile.name }),
  ).toBeVisible();
  await expect(page.getByText(profile.headline, { exact: true })).toBeVisible();
  const image = page.locator("#inicio img.profile-image");
  await expect(image).toHaveAttribute("src", withBase(profile.image));
  await expect(image).toHaveJSProperty("complete", true);
  await expect(image).not.toHaveJSProperty("naturalWidth", 0);

  for (const social of profile.socials) {
    const link = page.getByRole("link", { name: social.label, exact: true });
    await expect(link).toHaveAttribute("href", social.url);
  }
});
