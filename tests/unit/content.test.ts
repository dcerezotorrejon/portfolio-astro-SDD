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
  name: "Nombre Apellidos",
  headline: "Un breve titular sobre mi perfil profesional",
  notice: "Contenido provisional de ejemplo",
  image: {
    src: "/images/profile-placeholder.svg",
    alt: "Imagen de perfil provisional",
  },
  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/" },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/",
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
    title: "Nombre Apellidos | Portfolio profesional",
    description:
      "Presentación y trayectoria profesional de Nombre Apellidos. Contenido provisional de ejemplo",
  },
} satisfies Parameters<typeof profileSchema.parse>[0];

const approvedDescription =
  "Información ampliada de ejemplo sobre las responsabilidades y el contexto del puesto. Este contenido no representa una experiencia laboral real";

const approvedCompanyIcon = {
  src: "/images/companies/astro.svg",
  alt: "Icono provisional de Astro para Empresa de ejemplo",
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
  it("accepts the approved provisional profile and employment samples", () => {
    expect(profileSchema.parse(approvedProfile)).toMatchObject(approvedProfile);

    const recent = experienceSchema.parse({
      slug: "puesto-ejemplo-2024",
      role: "Puesto de ejemplo",
      company: "Empresa de ejemplo",
      companyIcon: approvedCompanyIcon,
      startDate: "2024-01-01",
      summary: "Descripción de ejemplo de las responsabilidades del puesto",
      technologies: ["Astro", "Tailwind CSS"],
      seo: {
        title:
          "Puesto de ejemplo (2024) | Nombre Apellidos | Portfolio profesional",
        description: approvedDescription,
      },
    });
    const earlier = experienceSchema.parse({
      slug: "puesto-ejemplo-2022",
      role: "Puesto de ejemplo",
      company: "Empresa de ejemplo",
      companyIcon: approvedCompanyIcon,
      startDate: "2022-01-01",
      endDate: "2023-12-01",
      summary: "Descripción de ejemplo de las responsabilidades del puesto",
      technologies: ["React", "TypeScript"],
      seo: {
        title:
          "Puesto de ejemplo (2022) | Nombre Apellidos | Portfolio profesional",
        description: approvedDescription,
      },
    });

    expect(recent.startDate.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(recent.endDate).toBeUndefined();
    expect(earlier.endDate?.toISOString()).toBe("2023-12-01T00:00:00.000Z");
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
        slug: "puesto-ejemplo",
        role: " ",
        company: "Empresa",
        companyIcon: approvedCompanyIcon,
        startDate: "2024-01-01",
        summary: "Resumen",
        technologies: ["Astro"],
        seo: { title: "Título", description: "Descripción" },
      }).success,
    ).toBe(false);
  });

  it("requires a valid start date, accepts a missing end date, and rejects reversed ranges", () => {
    const withoutStartDate: Record<string, unknown> = {
      slug: "puesto-ejemplo",
      role: "Puesto",
      company: "Empresa",
      companyIcon: approvedCompanyIcon,
      startDate: "2024-01-01",
      summary: "Resumen",
      technologies: ["Astro"],
      seo: { title: "Título", description: "Descripción" },
    };
    delete withoutStartDate.startDate;
    expect(experienceSchema.safeParse(withoutStartDate).success).toBe(false);

    const openRole = experienceSchema.safeParse({
      slug: "puesto-actual",
      role: "Puesto",
      company: "Empresa",
      companyIcon: approvedCompanyIcon,
      startDate: "2024-01-01",
      summary: "Resumen",
      technologies: ["Astro"],
      seo: { title: "Título", description: "Descripción" },
    });
    expect(openRole.success).toBe(true);
    if (openRole.success) expect(openRole.data.endDate).toBeUndefined();

    expect(
      experienceSchema.safeParse({
        slug: "puesto-invalido",
        role: "Puesto",
        company: "Empresa",
        companyIcon: approvedCompanyIcon,
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
    const older = experience("puesto-ejemplo-2022", "2022-01-01");
    const recent = experience("puesto-ejemplo-2024", "2024-01-01");
    const added = experience("puesto-nuevo-2025", "2025-03-15");
    const entries = [older, recent, added];

    const ordered = sortExperiences(entries);

    expect(ordered).toEqual([added, recent, older]);
    expect(entries).toEqual([older, recent, added]);
    expect(ordered).not.toBe(entries);
  });

  it("rejects repeated route slugs even when loader IDs are distinct filenames", () => {
    expect(() =>
      assertUniqueExperienceSlugs([
        { id: "puesto-uno-2024.md", data: { slug: "puesto-ejemplo" } },
        { id: "puesto-dos-2023.md", data: { slug: "puesto-ejemplo" } },
      ]),
    ).toThrow(/puesto-uno-2024\.md.*puesto-dos-2023\.md/);
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
