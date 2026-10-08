import { expect, test, type Page } from "@playwright/test";

interface LayoutSelectors {
  card: string;
  header: string;
  text: string;
  description: string;
  button: string;
}

interface LayoutCase extends LayoutSelectors {
  name: string;
  path: string;
}

const cases: LayoutCase[] = [
  {
    name: "home card",
    path: "/",
    card: "#trayectoria .experience-card",
    header: ".experience-card-header",
    text: ".experience-card-text",
    description: ".experience-summary",
    button: 'a[href^="/experiencia/"]',
  },
  {
    name: "detail page",
    path: "/experiencia/babel-senior-frontend-engineer/",
    card: "article.experience-detail-card",
    header: ".experience-detail-header",
    text: ".experience-detail-text",
    description: ".experience-detail-body",
    button: 'a[href="/#trayectoria"]',
  },
];

interface LayoutMeasurement {
  headerDirection: string;
  headerRect: Rect;
  iconRect: Rect;
  iconObjectFit: string;
  iconNaturalWidth: number;
  iconNaturalHeight: number;
  textRect: Rect;
  headingTop: number;
  companyTop: number;
  periodTop: number;
  descriptionTop: number;
  headerBottom: number;
  buttonJustify: string;
  buttonRight: number;
  buttonRowRight: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

async function measure(
  page: Page,
  selectors: LayoutSelectors,
): Promise<LayoutMeasurement> {
  return page.evaluate((s) => {
    const card = document.querySelector(s.card);
    const header = card?.querySelector(s.header);
    const text = card?.querySelector(s.text);
    const icon = card?.querySelector(".company-icon");
    const description = card?.querySelector(s.description);
    const button = card?.querySelector(s.button);
    const buttonRow = button?.parentElement;
    const heading = header?.querySelector("h1, h2, h3");
    const company = header?.querySelector(".company-name");
    const period = header?.querySelector(".experience-period");

    if (
      !header ||
      !text ||
      !icon ||
      !description ||
      !button ||
      !buttonRow ||
      !heading ||
      !company ||
      !period
    ) {
      throw new Error("Missing an expected experience layout element");
    }

    const rect = (element: Element): Rect => {
      const r = element.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      };
    };
    const style = (element: Element, property: string): string =>
      getComputedStyle(element).getPropertyValue(property).trim();

    return {
      headerDirection: style(header, "flex-direction"),
      headerRect: rect(header),
      iconRect: rect(icon),
      iconObjectFit: style(icon, "object-fit"),
      iconNaturalWidth: (icon as HTMLImageElement).naturalWidth,
      iconNaturalHeight: (icon as HTMLImageElement).naturalHeight,
      textRect: rect(text),
      headingTop: rect(heading).y,
      companyTop: rect(company).y,
      periodTop: rect(period).y,
      descriptionTop: rect(description).y,
      headerBottom: rect(header).bottom,
      buttonJustify: style(buttonRow, "justify-content"),
      buttonRight: rect(button).right,
      buttonRowRight: rect(buttonRow).right,
    };
  }, selectors);
}

async function openCase(page: Page, layoutCase: LayoutCase): Promise<void> {
  await page.goto(layoutCase.path);
  const icon = page.locator(`${layoutCase.card} .company-icon`).first();
  await icon.scrollIntoViewIfNeeded();
  await expect(icon).toHaveJSProperty("complete", true);
}

function expectTextBlockOrder(m: LayoutMeasurement): void {
  expect(m.headingTop).toBeLessThan(m.companyTop);
  expect(m.companyTop).toBeLessThan(m.periodTop);
}

function expectDescriptionGap(m: LayoutMeasurement): void {
  expect(m.descriptionTop - m.headerBottom).toBeGreaterThanOrEqual(16);
}

function expectButtonRightAligned(m: LayoutMeasurement): void {
  expect(m.buttonJustify).toBe("flex-end");
  expect(Math.abs(m.buttonRight - m.buttonRowRight)).toBeLessThanOrEqual(1);
}

for (const layoutCase of cases) {
  test.describe(`experience layout — ${layoutCase.name}`, () => {
    for (const width of [1024, 601]) {
      test(`shows the icon left and the text block right at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await openCase(page, layoutCase);
        const m = await measure(page, layoutCase);

        expect(m.headerDirection).toBe("row");
        expect(m.iconRect.width).toBeCloseTo(128, 0);
        expect(m.iconRect.height).toBeCloseTo(128, 0);
        expect(m.iconObjectFit).toBe("contain");

        // Icon on the left, text block on the right, vertically overlapping.
        expect(m.iconRect.right).toBeLessThanOrEqual(m.textRect.x + 1);
        expect(m.iconRect.y).toBeLessThan(m.textRect.bottom);
        expect(m.textRect.y).toBeLessThan(m.iconRect.bottom);

        expectTextBlockOrder(m);
        expectDescriptionGap(m);
        expectButtonRightAligned(m);
      });
    }

    for (const width of [600, 390]) {
      test(`stacks a full-width undistorted icon above the text at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await openCase(page, layoutCase);
        const m = await measure(page, layoutCase);

        expect(m.headerDirection).toBe("column");

        // The icon spans the full header content width.
        expect(
          Math.abs(m.iconRect.width - m.headerRect.width),
        ).toBeLessThanOrEqual(1);
        // The text block renders below the icon.
        expect(m.textRect.y).toBeGreaterThanOrEqual(m.iconRect.bottom - 1);

        // The icon is letterboxed (never stretched) and its box follows the
        // logo's intrinsic aspect ratio rather than a forced square.
        expect(m.iconObjectFit).toBe("contain");
        expect(m.iconNaturalWidth).toBeGreaterThan(0);
        expect(m.iconNaturalHeight).toBeGreaterThan(0);
        const renderedRatio = m.iconRect.width / m.iconRect.height;
        const naturalRatio = m.iconNaturalWidth / m.iconNaturalHeight;
        expect(
          Math.abs(renderedRatio - naturalRatio) / naturalRatio,
        ).toBeLessThan(0.02);

        expectTextBlockOrder(m);
        expectDescriptionGap(m);
        expectButtonRightAligned(m);
      });
    }
  });
}
