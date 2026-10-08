import { describe, expect, it } from "vitest";

import {
  experienceSchema,
  profileSchema,
  type ExperienceData,
} from "../../src/content/parsers/content-schema";
import {
  assertUniqueExperienceSlugs,
  formatDateRange,
  sortExperiences,
} from "../../src/content/parsers/content";

const approvedProfile = {
  name: "Daniel Cerezo Torrejón",
  headline: "Senior Frontend Engineer & Software Architect",
  about:
    "Senior Frontend Engineer & Software Architect con +8 años de experiencia en plataformas e-commerce de alto tráfico (Iberia.com). Especializado en diseñar arquitecturas Frontend desde cero con React, TypeScript y Clean Architecture, liderando la migración desde plataformas legacy a tecnologías de vanguardia. Apasionado de la cultura DevOps y la infraestructura Linux (Docker, CI/CD, Homelab).",
  image: {
    src: "/images/profile-placeholder.svg",
    alt: "Fotografía de Daniel Cerezo Torrejón",
  },
  socials: [
    {
      platform: "github",
      label: "GitHub",
      url: "https://github.com/dcerezotorrejon",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/dcerezotorrejon",
    },
  ],
  historyHeading: "Trayectoria profesional",
  moreInfoLabel: "Más información",
  backLabel: "Volver a la trayectoria",
  navigation: [
    { id: "inicio", label: "Inicio" },
    { id: "trayectoria", label: "Trayectoria" },
  ],
  seo: {
    title:
      "Daniel Cerezo Torrejón | Senior Frontend Engineer | Portfolio profesional",
    description:
      "Presentación y trayectoria profesional de Daniel Cerezo Torrejón, Senior Frontend Engineer & Software Architect.",
  },
} satisfies Parameters<typeof profileSchema.parse>[0];

const babelIcon = {
  src: "/images/companies/babel.svg",
  alt: "Logotipo de Babel Sistemas de Información",
};

const nttdataIcon = {
  src: "/images/companies/nttdata.svg",
  alt: "Logotipo de NTTData Europe & LATAM",
};

function experience(
  slug: string,
  startDate: string,
): { id: string; data: Pick<ExperienceData, "slug" | "startDate"> } {
  return {
    id: slug,
    data: { slug, startDate: new Date(`${startDate}T00:00:00.000Z`) },
  };
}

describe("portfolio content schemas", () => {
  it("accepts the approved profile and real employment samples", () => {
    expect(profileSchema.parse(approvedProfile)).toMatchObject(approvedProfile);

    const babel = experienceSchema.parse({
      slug: "babel-senior-frontend-engineer",
      role: "Senior Software Engineer (Frontend)",
      company: "Babel Sistemas de Información",
      companyIcon: babelIcon,
      startDate: "2022-02-01",
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
      seo: {
        title:
          "Senior Software Engineer (Frontend) (2022) | Daniel Cerezo Torrejón | Portfolio profesional",
        description:
          "Arquitectura Frontend desde cero en Iberia.com con React, TypeScript y Clean Architecture como Senior Software Engineer.",
      },
    });
    const nttdata = experienceSchema.parse({
      slug: "nttdata-lead-engineer",
      role: "Lead Engineer",
      company: "NTTData Europe & LATAM",
      companyIcon: nttdataIcon,
      startDate: "2017-07-01",
      endDate: "2022-01-31",
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
      seo: {
        title:
          "Lead Engineer (2017) | Daniel Cerezo Torrejón | Portfolio profesional",
        description:
          "Progresión hasta Lead Engineer en Iberia.com: liderazgo técnico y migración de módulos legacy.",
      },
    });

    expect(babel.startDate.toISOString()).toBe("2022-02-01T00:00:00.000Z");
    expect(babel.endDate).toBeUndefined();
    expect(nttdata.endDate?.toISOString()).toBe("2022-01-31T00:00:00.000Z");
  });

  it("enforces a 160-character maximum on the shared SEO description", () => {
    const atLimit = {
      ...approvedProfile,
      seo: { title: "Título", description: "x".repeat(160) },
    };
    const overLimit = {
      ...approvedProfile,
      seo: { title: "Título", description: "x".repeat(161) },
    };

    expect(profileSchema.safeParse(atLimit).success).toBe(true);
    expect(profileSchema.safeParse(overLimit).success).toBe(false);
  });

  it("accepts local profile image paths and rejects remote, non-/images/, or traversal paths", () => {
    const withSrc = (src: string) =>
      profileSchema.safeParse({
        ...approvedProfile,
        image: { ...approvedProfile.image, src },
      });

    for (const src of [
      "/images/profile-placeholder.svg",
      "/images/me.png",
      "/images/me.jpg",
      "/images/me.jpeg",
      "/images/me.webp",
    ]) {
      expect(withSrc(src).success, `Expected ${src} to be accepted`).toBe(true);
    }

    for (const src of [
      "https://example.com/me.png",
      "/avatar/me.png",
      "/images/../secret.png",
    ]) {
      expect(withSrc(src).success, `Expected ${src} to be rejected`).toBe(
        false,
      );
    }
  });

  it("allows profile copy and social destinations to be replaced without schema changes", () => {
    const replacement = profileSchema.parse({
      ...approvedProfile,
      name: "Ada Ejemplo",
      socials: approvedProfile.socials.map((social) =>
        social.platform === "github"
          ? { ...social, url: "https://github.com/ada-ejemplo" }
          : social,
      ),
    });

    expect(replacement.name).toBe("Ada Ejemplo");
    expect(replacement.socials[0]?.url).toBe("https://github.com/ada-ejemplo");
  });

  it("rejects empty required fields and unsafe or malformed social URLs", () => {
    expect(
      profileSchema.safeParse({ ...approvedProfile, name: "  " }).success,
    ).toBe(false);
    for (const url of [
      "javascript:alert(1)",
      "ftp://example.com",
      "not a url",
    ]) {
      expect(
        profileSchema.safeParse({
          ...approvedProfile,
          socials: [{ ...approvedProfile.socials[0], url }],
        }).success,
      ).toBe(false);
    }
    expect(
      experienceSchema.safeParse({
        slug: "sample-role",
        role: " ",
        company: "Acme",
        companyIcon: babelIcon,
        startDate: "2024-01-01",
        summary: "Resumen",
        technologies: ["Astro"],
        seo: { title: "Título", description: "Descripción" },
      }).success,
    ).toBe(false);
  });

  it("requires a valid start date, accepts a missing end date, and rejects reversed ranges", () => {
    const withoutStartDate: Record<string, unknown> = {
      slug: "sample-role",
      role: "Rol",
      company: "Acme",
      companyIcon: babelIcon,
      startDate: "2024-01-01",
      summary: "Resumen",
      technologies: ["Astro"],
      seo: { title: "Título", description: "Descripción" },
    };
    delete withoutStartDate.startDate;
    expect(experienceSchema.safeParse(withoutStartDate).success).toBe(false);

    const openRole = experienceSchema.safeParse({
      slug: "current-role",
      role: "Rol",
      company: "Acme",
      companyIcon: babelIcon,
      startDate: "2024-01-01",
      summary: "Resumen",
      technologies: ["Astro"],
      seo: { title: "Título", description: "Descripción" },
    });
    expect(openRole.success).toBe(true);
    if (openRole.success) expect(openRole.data.endDate).toBeUndefined();

    expect(
      experienceSchema.safeParse({
        slug: "invalid-range",
        role: "Rol",
        company: "Acme",
        companyIcon: babelIcon,
        startDate: "2024-01-01",
        endDate: "2023-12-31",
        summary: "Resumen",
        technologies: ["Astro"],
        seo: { title: "Título", description: "Descripción" },
      }).success,
    ).toBe(false);
  });
});

describe("experience content helpers", () => {
  it("orders a newly added dated entry newest-first without mutating the source", () => {
    const older = experience("sample-role-2022", "2022-01-01");
    const recent = experience("sample-role-2024", "2024-01-01");
    const added = experience("sample-role-2025", "2025-03-15");
    const entries = [older, recent, added];

    const ordered = sortExperiences(entries);

    expect(ordered).toEqual([added, recent, older]);
    expect(entries).toEqual([older, recent, added]);
    expect(ordered).not.toBe(entries);
  });

  it("rejects repeated route slugs even when loader IDs are distinct filenames", () => {
    expect(() =>
      assertUniqueExperienceSlugs([
        { id: "role-one-2024.md", data: { slug: "sample-role" } },
        { id: "role-two-2023.md", data: { slug: "sample-role" } },
      ]),
    ).toThrow(/role-one-2024\.md.*role-two-2023\.md/);
  });

  it("supports both flat and collection-shaped slug records", () => {
    expect(() =>
      assertUniqueExperienceSlugs([
        { id: "first.md", slug: "first-role" },
        { id: "second.md", data: { slug: "second-role" } },
      ]),
    ).not.toThrow();
    expect(() =>
      assertUniqueExperienceSlugs([
        { slug: "same-role" },
        { data: { slug: "same-role" } },
      ]),
    ).toThrow(/Duplicate experience route slug/);
  });

  it("formats approved Spanish ranges and current roles for strings and Dates", () => {
    expect(formatDateRange("2024-01-01")).toBe("enero de 2024 – actualidad");
    expect(
      formatDateRange(new Date("2022-01-01T00:00:00.000Z"), "2023-12-01"),
    ).toBe("enero de 2022 – diciembre de 2023");
  });
});
