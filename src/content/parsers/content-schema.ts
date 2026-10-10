import type { ImageMetadata } from "astro";
import { z } from "astro/zod";

const nonEmptyString = z.string().trim().min(1, "Must not be empty");

const safeHttpUrl = nonEmptyString.refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Must be a valid HTTP or HTTPS URL");

const isoDate = z.iso
  .date()
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const localCompanyIconPath = z
  .string()
  .regex(
    /^\/images\/companies\/[a-z0-9-]+\.svg$/,
    "Must be a local company SVG path",
  );

export const companyIconSchema = z.object({
  src: localCompanyIconPath,
  alt: nonEmptyString,
});

const seoSchema = z.object({
  title: nonEmptyString,
  description: nonEmptyString.max(160, "Must be at most 160 characters"),
});

export const profileSchema = (image: () => z.ZodType) =>
  z.object({
    name: nonEmptyString,
    headline: nonEmptyString,
    about: nonEmptyString,
    image: z.object({
      src: image(),
      alt: nonEmptyString,
    }),
    socials: z.array(
      z.object({
        platform: z.enum(["github", "linkedin"]),
        label: nonEmptyString,
        url: safeHttpUrl,
      }),
    ),
    historyHeading: nonEmptyString,
    moreInfoLabel: nonEmptyString,
    backLabel: nonEmptyString,
    navigation: z.array(
      z.object({
        id: z.enum(["inicio", "trayectoria"]),
        label: nonEmptyString,
      }),
    ),
    seo: seoSchema,
  });

export const experienceSchema = z
  .object({
    slug: nonEmptyString.regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Must be a kebab-case slug",
    ),
    role: nonEmptyString,
    company: nonEmptyString,
    companyIcon: companyIconSchema,
    startDate: isoDate,
    endDate: isoDate.optional(),
    summary: nonEmptyString,
    technologies: z.array(nonEmptyString).min(1),
    seo: seoSchema,
  })
  .superRefine((experience, context) => {
    if (experience.endDate && experience.endDate < experience.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must not be earlier than start date",
      });
    }
  });

export interface ProfileData {
  name: string;
  headline: string;
  about: string;
  image: {
    src: ImageMetadata;
    alt: string;
  };
  socials: Array<{
    platform: "github" | "linkedin";
    label: string;
    url: string;
  }>;
  historyHeading: string;
  moreInfoLabel: string;
  backLabel: string;
  navigation: Array<{
    id: "inicio" | "trayectoria";
    label: string;
  }>;
  seo: {
    title: string;
    description: string;
  };
}

export type ExperienceData = z.infer<typeof experienceSchema>;
