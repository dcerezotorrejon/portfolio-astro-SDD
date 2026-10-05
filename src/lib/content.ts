import { companyIconSchema } from "./content-schema";
import type { ExperienceData } from "./content-schema";

type ExperienceWithIcon = {
  id?: string;
  data: { slug: string; companyIcon?: unknown };
  rendered?: unknown;
};

type RenderedEntryMetadata = {
  metadata?: { frontmatter?: Record<string, unknown> };
};

/** Resolve and validate an experience icon, including Astro's rendered-frontmatter fallback. */
export function resolveCompanyIcon(experience: ExperienceWithIcon) {
  const rendered = experience.rendered as RenderedEntryMetadata | undefined;
  const frontmatterIcon = rendered?.metadata?.frontmatter?.companyIcon;
  const iconValue =
    experience.data.companyIcon === undefined
      ? frontmatterIcon
      : experience.data.companyIcon;
  const identity = `entry id "${experience.id ?? "unknown"}", slug "${experience.data.slug}"`;

  const result = companyIconSchema.safeParse(iconValue);
  if (!result.success) {
    throw new Error(
      `Invalid companyIcon for experience ${identity}: ${result.error.message}`,
    );
  }

  return result.data;
}

type ExperienceRecord = {
  id?: string;
  data: Pick<ExperienceData, "startDate" | "slug">;
};

type SlugRecord =
  { id?: string; slug: string } | { id?: string; data: { slug: string } };

function asDate(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid experience date: ${String(value)}`);
  }
  return date;
}

/** Sort experience collection entries by descending start date without mutating the input. */
export function sortExperiences<T extends ExperienceRecord>(
  experiences: readonly T[],
): T[] {
  return [...experiences].sort((first, second) => {
    const dateDifference =
      asDate(second.data.startDate).getTime() -
      asDate(first.data.startDate).getTime();
    if (dateDifference !== 0) return dateDifference;
    return first.data.slug.localeCompare(second.data.slug);
  });
}

/** Throw before route generation if multiple entries claim the same experience URL slug. */
export function assertUniqueExperienceSlugs(
  experiences: readonly SlugRecord[],
): void {
  const entriesBySlug = new Map<string, string>();

  for (const experience of experiences) {
    const slug = "data" in experience ? experience.data.slug : experience.slug;
    const entryId = experience.id ?? slug;
    const firstEntryId = entriesBySlug.get(slug);
    if (firstEntryId) {
      throw new Error(
        `Duplicate experience route slug "${slug}" is used by entries "${firstEntryId}" and "${entryId}".`,
      );
    }
    entriesBySlug.set(slug, entryId);
  }
}

/** Format an ISO date or Date in Spanish as “enero de 2024 – actualidad”. */
export function formatDateRange(
  startDate: Date | string,
  endDate?: Date | string,
): string {
  const spanishMonthYear = (value: Date | string) =>
    new Intl.DateTimeFormat("es", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(asDate(value));

  return `${spanishMonthYear(startDate)} – ${endDate ? spanishMonthYear(endDate) : "actualidad"}`;
}
