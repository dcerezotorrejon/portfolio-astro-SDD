import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  experienceSchema,
  profileSchema,
} from "./content/parsers/content-schema";

const profile = defineCollection({
  loader: glob({
    base: "./src/content/profile",
    pattern: "profile.md",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: profileSchema,
});

const experience = defineCollection({
  loader: glob({
    base: "./src/content/experience",
    pattern: "*.md",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: experienceSchema,
});

export const collections = { profile, experience };
