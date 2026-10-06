import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("home page", () => {
  it("renders the approved profile content from the profile collection", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    expect(document.documentElement.lang).toBe("es");
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("#inicio h1")?.textContent).toBe(
      "Nombre Apellidos",
    );
    expect(document.querySelector("#inicio p")?.textContent).toBe(
      "Un breve titular sobre mi perfil profesional",
    );
    expect(
      document.querySelector("#inicio .provisional-notice")?.textContent,
    ).toBe("Contenido provisional de ejemplo");

    const image = document.querySelector<HTMLImageElement>("#inicio img");
    expect(image?.getAttribute("src")).toBe("/images/profile-placeholder.svg");
    expect(image?.getAttribute("alt")).toBe("Imagen de perfil provisional");
    expect(image?.getAttribute("width")).toBe("240");
    expect(image?.getAttribute("height")).toBe("240");
  });

  it("renders the approved social links with visible, unambiguous names", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".social-links a"),
    );

    expect(
      links.map((link) => [
        link.textContent?.trim(),
        link.getAttribute("href"),
      ]),
    ).toEqual([
      ["GitHub", "https://github.com/"],
      ["LinkedIn", "https://www.linkedin.com/"],
    ]);
    expect(
      links.map((link) => {
        const icon = link.querySelector<SVGSVGElement>("svg");
        const use = icon?.querySelector("use");

        return {
          className: icon?.getAttribute("class"),
          hidden: icon?.getAttribute("aria-hidden"),
          focusable: icon?.getAttribute("focusable"),
          symbol: use?.getAttribute("href"),
          visibleLabel: link.querySelector("span")?.textContent?.trim(),
        };
      }),
    ).toEqual([
      {
        className: "icon text-white",
        hidden: "true",
        focusable: "false",
        symbol: "/icons/github.svg#icon",
        visibleLabel: "GitHub",
      },
      {
        className: "icon text-white",
        hidden: "true",
        focusable: "false",
        symbol: "/icons/linkedin.svg#icon",
        visibleLabel: "LinkedIn",
      },
    ]);
    expect(links.every((link) => !link.hasAttribute("target"))).toBe(true);
    expect(links.every((link) => !link.hasAttribute("aria-label"))).toBe(true);
  });

  it("renders complete employment cards newest first with their technologies and detail links", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;
    const history = document.querySelector("#trayectoria");
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".experience-card"),
    );

    expect(history?.querySelector("h2")?.textContent).toBe(
      "Trayectoria profesional",
    );
    expect(cards).toHaveLength(2);
    expect(
      cards.map((card) => card.querySelector("a")?.getAttribute("href")),
    ).toEqual([
      "/experiencia/puesto-ejemplo-2024/",
      "/experiencia/puesto-ejemplo-2022/",
    ]);

    const getCardContent = (card: HTMLElement) => ({
      role: card.querySelector("h3")?.textContent?.trim(),
      company: card.querySelector("p")?.textContent?.trim(),
      dateRange: card.querySelectorAll("p")[1]?.textContent?.trim(),
      summary: card.querySelectorAll("p")[2]?.textContent?.trim(),
      technologies: Array.from(
        card.querySelectorAll(".technology-badge"),
        (badge) => badge.textContent?.trim(),
      ),
      linkLabel: card.querySelector("a")?.textContent?.trim(),
      linkName: card.querySelector("a")?.getAttribute("aria-label"),
    });

    expect(cards.map(getCardContent)).toEqual([
      {
        role: "Puesto de ejemplo",
        company: "Empresa de ejemplo",
        dateRange: "enero de 2024 – actualidad",
        summary: "Descripción de ejemplo de las responsabilidades del puesto",
        technologies: ["Astro", "Tailwind CSS"],
        linkLabel: "Más información",
        linkName:
          "Más información sobre Puesto de ejemplo en Empresa de ejemplo (2024)",
      },
      {
        role: "Puesto de ejemplo",
        company: "Empresa de ejemplo",
        dateRange: "enero de 2022 – diciembre de 2023",
        summary: "Descripción de ejemplo de las responsabilidades del puesto",
        technologies: ["React", "TypeScript"],
        linkLabel: "Más información",
        linkName:
          "Más información sobre Puesto de ejemplo en Empresa de ejemplo (2022)",
      },
    ]);
  });

  it("renders both sections in document order with the requested navigation island", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;

    expect(
      Array.from(
        document.querySelectorAll("main > section"),
        (section) => section.id,
      ),
    ).toEqual(["inicio", "trayectoria"]);
    expect(document.querySelector(".floating-nav")).not.toBeNull();
    const islands = document.querySelectorAll("astro-island");
    expect(islands).toHaveLength(1);
    expect(islands[0]?.getAttribute("client")).toBe("load");
    expect(islands[0]?.getAttribute("component-url")).toMatch(
      /\/FloatingNav\.tsx$/,
    );
  });
});
