// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

import Counter from "../fixtures/Counter";
import { getContainer } from "../helpers/render";

describe("React integration", () => {
  it("server renders the React counter fixture", async () => {
    const container = await getContainer();
    const html = await container.renderToString(Counter, {
      props: { initial: 5 },
    });
    const { document } = new JSDOM(html).window;
    const output = document.querySelector("output");

    expect(output?.textContent?.trim()).toBe("Count: 5");
    expect(document.querySelector("button")).toBeTruthy();
  });

  it("updates the count when the button is clicked", () => {
    rtlRender(<Counter initial={2} />);

    const button = screen.getByRole("button", { name: "Increment" });
    const output = screen.getByRole("status");

    expect(output).toHaveTextContent("Count: 2");

    fireEvent.click(button);

    expect(output).toHaveTextContent("Count: 3");
  });
});
