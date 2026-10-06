import type { IconName } from "../../src/components/atoms/iconMap";

const github: IconName = "github";
const linkedin: IconName = "linkedin";

// @ts-expect-error Unsupported names must be rejected by the map-derived API.
const mastodon: IconName = "mastodon";

void [github, linkedin, mastodon];
