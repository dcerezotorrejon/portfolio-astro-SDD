import { expect, test } from "@playwright/test";
import { experiences } from "./helpers/content";

test.describe("company logos render (AC10)", () => {
  test("homepage cards load every company logo with alt text and dimensions", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("#trayectoria");

    for (const experience of experiences) {
      const icon = section
        .locator("article")
        .filter({
          has: page.locator(`a[href="/experiencia/${experience.slug}/"]`),
        })
        .locator("img.company-icon");

      await expect(icon).toHaveCount(1);
      await expect(icon).toHaveAttribute("src", experience.icon.src);
      await expect(icon).toHaveAttribute("alt", experience.icon.alt);
      await expect(icon).toHaveAttribute("width", "128");
      await expect(icon).toHaveAttribute("height", "128");

      // Lazy cards only fetch the logo once scrolled into view; then it must
      // have decoded into an intrinsic size (naturalWidth > 0).
      await icon.scrollIntoViewIfNeeded();
      await expect(icon).toHaveJSProperty("complete", true);
      expect(
        await icon.evaluate(
          (element) => (element as HTMLImageElement).naturalWidth,
        ),
      ).toBeGreaterThan(0);
    }
  });

  test("detail pages load their company logo with alt text and dimensions", async ({
    page,
  }) => {
    for (const experience of experiences) {
      await page.goto(`/experiencia/${experience.slug}/`);
      const icon = page.locator("img.company-icon").first();

      await expect(icon).toHaveAttribute("src", experience.icon.src);
      await expect(icon).toHaveAttribute("alt", experience.icon.alt);
      await expect(icon).toHaveAttribute("width", "128");
      await expect(icon).toHaveAttribute("height", "128");

      await expect(icon).toHaveJSProperty("complete", true);
      expect(
        await icon.evaluate(
          (element) => (element as HTMLImageElement).naturalWidth,
        ),
      ).toBeGreaterThan(0);
    }
  });
});
