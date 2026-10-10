import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

import Home from "../../src/pages/index.astro";
import { render } from "../helpers/render";

describe("home page", () => {
  it("renders the approved profile content from the profile collection", async () => {
    const html = await render(Home);
    const { document } = new JSDOM(html).window;
    const profileParagraphs = Array.from(
      document.querySelectorAll("#inicio .profile-details p"),
    );

    expect(document.documentElement.lang).toBe("es");
    expect(document.querySelectorAll("h1")).toHaveLength(1);
    expect(document.querySelector("#inicio h1")?.textContent).toBe(
      "Daniel Cerezo Torrejón",
    );
    expect(profileParagraphs[0]?.textContent).toBe(
      "Senior Frontend Engineer & Software Architect",
    );
    expect(profileParagraphs[1]?.textContent).toBe(
      "Senior Frontend Engineer & Software Architect con +8 años de experiencia en plataformas e-commerce de alto tráfico (Iberia.com). Especializado en diseñar arquitecturas Frontend desde cero con React, TypeScript y Clean Architecture, liderando la migración desde plataformas legacy a tecnologías de vanguardia. Apasionado de la cultura DevOps y la infraestructura Linux (Docker, CI/CD, Homelab).",
    );
    expect(document.querySelector("#inicio .provisional-notice")).toBeNull();

    const image = document.querySelector<HTMLImageElement>("#inicio img");
    expect(image?.getAttribute("src")).toBe(
      "/portfolio-astro-SDD/images/profile-placeholder.svg",
    );
    expect(image?.getAttribute("alt")).toBe(
      "Fotografía de Daniel Cerezo Torrejón",
    );
    expect(image?.getAttribute("width")).toBe("240");
    expect(image?.getAttribute("height")).toBe("240");
    expect(image?.hasAttribute("loading")).toBe(false);
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
      ["GitHub", "https://github.com/dcerezotorrejon"],
      ["LinkedIn", "https://www.linkedin.com/in/dcerezotorrejon"],
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
        className: "icon size-4 text-white",
        hidden: "true",
        focusable: "false",
        symbol: "/portfolio-astro-SDD/icons/github.svg#icon",
        visibleLabel: "GitHub",
      },
      {
        className: "icon size-4 text-white",
        hidden: "true",
        focusable: "false",
        symbol: "/portfolio-astro-SDD/icons/linkedin.svg#icon",
        visibleLabel: "LinkedIn",
      },
    ]);
    expect(links.every((link) => !link.hasAttribute("target"))).toBe(true);
    expect(links.every((link) => !link.hasAttribute("aria-label"))).toBe(true);
    expect(links.map((link) => link.classList.contains("gap-x-2"))).toEqual([
      true,
      true,
    ]);
    expect(
      links.map((link) =>
        Array.from(link.children, (child) => child.localName),
      ),
    ).toEqual([
      ["svg", "span"],
      ["svg", "span"],
    ]);
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
      cards.map((card) => {
        const image = card.querySelector<HTMLImageElement>(".company-icon");

        return {
          loading: image?.getAttribute("loading"),
          src: image?.getAttribute("src"),
          alt: image?.getAttribute("alt"),
          width: image?.getAttribute("width"),
          height: image?.getAttribute("height"),
        };
      }),
    ).toEqual([
      {
        loading: "lazy",
        src: "/portfolio-astro-SDD/images/companies/babel.svg",
        alt: "Logotipo de Babel Sistemas de Información",
        width: "128",
        height: "128",
      },
      {
        loading: "lazy",
        src: "/portfolio-astro-SDD/images/companies/nttdata.svg",
        alt: "Logotipo de NTTData Europe & LATAM",
        width: "128",
        height: "128",
      },
    ]);
    expect(
      cards.map((card) => card.querySelector("a")?.getAttribute("href")),
    ).toEqual([
      "/portfolio-astro-SDD/experiencia/babel-senior-frontend-engineer/",
      "/portfolio-astro-SDD/experiencia/nttdata-lead-engineer/",
    ]);

    const getCardContent = (card: HTMLElement) => ({
      role: card.querySelector("h3")?.textContent?.trim(),
      company: card.querySelector(".company-name")?.textContent?.trim(),
      dateRange: card.querySelector(".experience-period")?.textContent?.trim(),
      summary: card.querySelector(".experience-summary")?.textContent?.trim(),
      technologies: Array.from(
        card.querySelectorAll(".technology-badge"),
        (badge) => badge.textContent?.trim(),
      ),
      linkLabel: card.querySelector("a")?.textContent?.trim(),
      linkName: card.querySelector("a")?.getAttribute("aria-label"),
    });

    expect(cards.map(getCardContent)).toEqual([
      {
        role: "Senior Software Engineer (Frontend)",
        company: "Babel Sistemas de Información",
        dateRange: "febrero de 2022 – actualidad",
        summary:
          "Trabajo en la modernización de la web de Iberia.com y participo en iniciativas donde pongo en práctica Clean Architecture, React, TypeScript y React Compiler.",
        technologies: [
          "React",
          "TypeScript",
          "Zustand",
          "Stencil.js",
          "Angular",
          "AngularJS",
        ],
        linkLabel: "Más información",
        linkName:
          "Más información sobre Senior Software Engineer (Frontend) en Babel Sistemas de Información (2022)",
      },
      {
        role: "Lead Engineer",
        company: "NTTData Europe & LATAM",
        dateRange: "julio de 2017 – enero de 2022",
        summary:
          "De Solutions Assistant a Lead Engineer en Iberia.com, coordinando la arquitectura de contenidos de Oracle WebCenter Sites y la migración de módulos legacy hacia TypeScript y Angular.",
        technologies: [
          "TypeScript",
          "JavaScript",
          "Angular",
          "AngularJS",
          "jQuery",
          "Webpack",
        ],
        linkLabel: "Más información",
        linkName:
          "Más información sobre Lead Engineer en NTTData Europe & LATAM (2017)",
      },
    ]);

    for (const card of cards) {
      const header = card.querySelector(".experience-card-header");
      const headerChildren = Array.from(header?.children ?? []);
      const textBlock = headerChildren.find((child) =>
        child.classList.contains("experience-card-text"),
      );
      const textChildren = Array.from(textBlock?.children ?? []);

      expect(headerChildren[0]?.classList.contains("company-icon")).toBe(true);
      expect(textBlock).toBeDefined();
      expect(textChildren[0]?.localName).toBe("h3");
      expect(textChildren[1]?.classList.contains("company-name")).toBe(true);
      expect(textChildren[2]?.classList.contains("experience-period")).toBe(
        true,
      );

      const buttonContainer = card.querySelector("a")?.parentElement;
      expect(buttonContainer?.classList.contains("flex")).toBe(true);
      expect(buttonContainer?.classList.contains("justify-end")).toBe(true);
    }
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
