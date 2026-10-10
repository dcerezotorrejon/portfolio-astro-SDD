import { expect, test } from "@playwright/test";
import { profile } from "./helpers/content";
import { withBase } from "./helpers/site";

/**
 * Aspect ratio of the committed master (`src/content/profile/profile-photo.jpg`,
 * 3258x4102). The frame uses `object-fit: contain`, so every served variant must
 * keep this portrait ratio instead of being cropped into a square.
 */
const PROFILE_ASPECT_RATIO = 3258 / 4102;

/** The optimized profile variants Astro emits from the master (`/_astro/...`). */
const OPTIMIZED_PROFILE_IMAGE =
  /\/_astro\/profile-photo\.[^/]+\.(?:avif|webp)$/i;

/** Rendered square-frame width per breakpoint (R7/AC6). */
const DESKTOP_FRAME_WIDTH = 240;
const MOBILE_FRAME_WIDTH = 200;

test("profile identity, image, and social destinations match content", async ({
  page,
}) => {
  // Eager loading means the chosen variant is requested during navigation.
  // Capture that response up front so we can assert its real body size.
  const imageResponsePromise = page.waitForResponse((response) =>
    OPTIMIZED_PROFILE_IMAGE.test(response.url()),
  );

  await page.goto(withBase("/"));

  await expect(
    page.getByRole("heading", { level: 1, name: profile.name }),
  ).toBeVisible();
  await expect(page.getByText(profile.headline, { exact: true })).toBeVisible();

  const image = page.locator("#inicio img.profile-image");
  await expect(image).toHaveAttribute("alt", profile.image.alt);
  await expect(image).toHaveJSProperty("complete", true);
  await expect(image).not.toHaveJSProperty("naturalWidth", 0);

  const served = await image.evaluate((element) => {
    const img = element as HTMLImageElement;
    const style = getComputedStyle(img);
    const rect = img.getBoundingClientRect();
    return {
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      objectFit: style.objectFit,
      backgroundColor: style.backgroundColor,
      boxWidth: rect.width,
      boxHeight: rect.height,
    };
  });

  // The square frame letterboxes the portrait instead of cropping it, and the
  // empty bands blend with the photograph's white background (surface).
  expect(served.objectFit).toBe("contain");
  expect(served.backgroundColor).toBe("rgb(255, 255, 255)");
  expect(Math.abs(served.boxWidth - served.boxHeight)).toBeLessThan(1);

  // The full portrait is served: the intrinsic ratio stays portrait and is not
  // cropped into a square (`naturalWidth === naturalHeight`).
  expect(served.naturalWidth).toBeLessThan(served.naturalHeight);
  expect(served.naturalWidth / served.naturalHeight).toBeCloseTo(
    PROFILE_ASPECT_RATIO,
    2,
  );

  // Chromium resolves the modern-format `<source>` (AVIF/WebP), not the JPEG
  // fallback, and the served body stays under the 100 KB target.
  expect(served.currentSrc).toMatch(/\.(?:avif|webp)$/i);

  const imageResponse = await imageResponsePromise;
  expect(imageResponse.url()).toBe(served.currentSrc);
  const body = await imageResponse.body();
  expect(body.byteLength).toBeLessThan(100 * 1024);

  for (const social of profile.socials) {
    const link = page.getByRole("link", { name: social.label, exact: true });
    await expect(link).toHaveAttribute("href", social.url);
  }
});

test("profile frame keeps its responsive square size", async ({ page }) => {
  // Regression guard: the flex-item sizing lives on the <picture> wrapper, so
  // the frame must stay 240 px (desktop) / 200 px (mobile) instead of
  // collapsing. The inner image fills it as a square white `contain` box.
  const measure = () =>
    page.evaluate(() => {
      const picture = document.querySelector("#inicio picture");
      const image = document.querySelector("#inicio img.profile-image");
      if (!picture || !image) throw new Error("profile frame not found");
      const pictureRect = picture.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      return {
        pictureWidth: pictureRect.width,
        imageWidth: imageRect.width,
        imageHeight: imageRect.height,
        objectFit: getComputedStyle(image).objectFit,
      };
    });

  const assertSquareFrame = (
    frame: Awaited<ReturnType<typeof measure>>,
    width: number,
  ) => {
    expect(frame.pictureWidth).toBeCloseTo(width, 0);
    expect(frame.imageWidth).toBeCloseTo(width, 0);
    expect(frame.imageHeight).toBeCloseTo(width, 0);
    expect(frame.objectFit).toBe("contain");
  };

  // Desktop Chrome viewport (>= md): 240 px wide square frame.
  await page.goto(withBase("/"));
  assertSquareFrame(await measure(), DESKTOP_FRAME_WIDTH);

  // Mobile: 200 px wide square frame.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(withBase("/"));
  assertSquareFrame(await measure(), MOBILE_FRAME_WIDTH);
});
