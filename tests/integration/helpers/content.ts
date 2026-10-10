import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
const contentRoot = join(repositoryRoot, "src", "content");

function readFrontmatter(relativePath: string): string {
  const source = readFileSync(join(contentRoot, relativePath), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error(`Missing frontmatter in ${relativePath}`);
  return match[1];
}

function scalar(frontmatter: string, key: string): string {
  const match = new RegExp(
    `^\\s*${key}:\\s*["']?([^\\r\\n"']+)["']?\\s*$`,
    "m",
  ).exec(frontmatter);
  if (!match) throw new Error(`Missing ${key} in content frontmatter`);
  return match[1].trim();
}

export const profile = (() => {
  const source = readFrontmatter("profile/profile.md");
  const socialsBlock = /^socials:\s*\r?\n((?:[ \t]+.*\r?\n?)*)/m.exec(
    source,
  )?.[1];
  if (!socialsBlock) throw new Error("Missing profile socials content");
  const socials = socialsBlock
    .split(/\r?\n(?=\s*- platform:)/)
    .filter(Boolean)
    .map((item) => ({
      label: scalar(item, "label"),
      url: scalar(item, "url"),
    }));
  return {
    name: scalar(source, "name"),
    headline: scalar(source, "headline"),
    image: {
      src: scalar(source, "src"),
      alt: scalar(source, "alt"),
    },
    socials,
  };
})();

export const experiences = readdirSync(join(contentRoot, "experience"))
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => {
    const source = readFrontmatter(join("experience", file));
    const iconBlock = /^companyIcon:\s*\r?\n((?:[ \t]+.*\r?\n?)*)/m.exec(
      source,
    )?.[1];
    if (!iconBlock) throw new Error(`Missing companyIcon content in ${file}`);
    return {
      slug: scalar(source, "slug"),
      role: scalar(source, "role"),
      company: scalar(source, "company"),
      icon: {
        src: scalar(iconBlock, "src"),
        alt: scalar(iconBlock, "alt"),
      },
    };
  });
