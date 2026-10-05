import { getCollection, getEntry } from "astro:content";
import { describe, expect, it } from "vitest";

import ExperienceDetail from "../../src/pages/experiencia/[slug].astro";
import { formatViolations, runAxeOnHtml } from "../helpers/a11y";
import { render } from "../helpers/render";

async function renderExperience(slug: string): Promise<string> {
  const experiences = await getCollection("experience");
  const experience = experiences.find((entry) => entry.data.slug === slug);
  const profile = await getEntry("profile", "profile");
  if (!experience || !profile) {
    throw new Error(`Missing approved collection content for ${slug}`);
  }
  return render(ExperienceDetail, { experience, profile: profile.data });
}

describe("experience detail accessibility", () => {
  it.each(["puesto-ejemplo-2024", "puesto-ejemplo-2022"])(
    "has no axe violations for %s",
    async (slug) => {
      const html = await renderExperience(slug);
      const results = await runAxeOnHtml(html);

      expect(results.violations, formatViolations(results)).toEqual([]);
    },
  );
});
