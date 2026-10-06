export const iconMap = {
  github: "/icons/github.svg#icon",
  linkedin: "/icons/linkedin.svg#icon",
} as const;

export type IconName = keyof typeof iconMap;
