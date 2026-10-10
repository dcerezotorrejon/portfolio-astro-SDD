import { expect, test, type Locator } from "@playwright/test";
import { withBase } from "./helpers/site";

/**
 * Browser-level coverage for the control-motion duration restored by spec
 * 028-design-consistency (AC1/AC3): the floating navigator indicator and a
 * primary button must transition at the shared 200 ms `--duration-control`
 * value, and reduced motion must still suppress the transition.
 */

const indicatorSelector = ".floating-nav-indicator";
const primaryButtonSelector =
  '.experience-card [data-molecule="button"][data-variant="primary"]';

interface TransitionStyles {
  transitionProperty: string;
  transitionDuration: string;
}

function readTransitionStyles(element: Locator): Promise<TransitionStyles> {
  return element.evaluate((node) => {
    const styles = getComputedStyle(node);

    return {
      transitionProperty: styles.transitionProperty,
      transitionDuration: styles.transitionDuration,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto(withBase("/"));
  await expect(
    page.getByRole("navigation", { name: "Navegación por secciones" }),
  ).toHaveAttribute("data-positioned", "true");
});

test("AC1: the navigator indicator and a primary button transition at 200 ms", async ({
  page,
}) => {
  const indicator = page.locator(indicatorSelector);
  const primaryButton = page.locator(primaryButtonSelector).first();

  await expect(indicator).toBeAttached();
  await expect(primaryButton).toBeVisible();

  const indicatorStyles = await readTransitionStyles(indicator);

  // The restored `duration-control` utility feeds the indicator's transform
  // transition; it must resolve to the documented 200 ms, not the 150 ms
  // Tailwind fallback.
  expect(indicatorStyles.transitionProperty).toContain("transform");
  expect(indicatorStyles.transitionDuration).toBe("0.2s");

  const buttonStyles = await readTransitionStyles(primaryButton);

  expect(buttonStyles.transitionProperty).toContain("color");
  expect(buttonStyles.transitionDuration).toBe("0.2s");
});

test.describe("AC3: reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("suppresses the control transition while selection and positioning stay functional", async ({
    page,
  }) => {
    const navigation = page.getByRole("navigation", {
      name: "Navegación por secciones",
    });
    const indicator = page.locator(indicatorSelector);
    const primaryButton = page.locator(primaryButtonSelector).first();
    const experienceLink = navigation.getByRole("link", {
      name: "Trayectoria",
    });

    const indicatorStyles = await readTransitionStyles(indicator);
    const buttonStyles = await readTransitionStyles(primaryButton);

    // Tailwind's `motion-reduce:transition-none` removes the transition
    // property, so no transition runs for either control. The declared
    // transition-duration is still 200 ms, but with no transitionable property
    // the transition is fully suppressed.
    expect(indicatorStyles.transitionProperty).toBe("none");
    expect(buttonStyles.transitionProperty).toBe("none");

    // Selection and positioning remain functional: activating a section
    // updates the indicator state and the programmatic current marker even
    // though the movement is not animated.
    await expect(navigation).toHaveAttribute("data-active-index", "0");
    const indicatorLeftBefore = await indicator.evaluate(
      (node) => node.getBoundingClientRect().left,
    );

    await experienceLink.click();
    await expect(page).toHaveURL(/#trayectoria$/);
    await expect(navigation).toHaveAttribute("data-active-index", "1");
    await expect(experienceLink).toHaveAttribute("aria-current", "location");

    // The indicator still moves onto the newly selected (second) link; only
    // the animation is suppressed, not the positioning.
    const indicatorLeftAfter = await indicator.evaluate(
      (node) => node.getBoundingClientRect().left,
    );

    expect(indicatorLeftAfter).toBeGreaterThan(indicatorLeftBefore + 1);
  });
});
