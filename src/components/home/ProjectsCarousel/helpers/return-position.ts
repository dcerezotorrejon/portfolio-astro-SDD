/**
 * The carousel's position on return from a project detail page (R37). The record
 * lives in `sessionStorage` under `RETURN_RECORD_KEY`, as the JSON
 * `{"at":"<slug>","opened":"<slug>"}`: the project at the logical stop, and the
 * one opened.
 *
 * This module imports nothing, so the listeners bundled on every page stay small.
 */

export const RETURN_RECORD_KEY = "projects-carousel-return";
export const END_SPACE_ATTRIBUTE = "data-carousel-end-space";

export interface ReturnRecord {
  at: string;
  opened: string;
}

export function parseReturnRecord(raw: string | null): ReturnRecord | null {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw);

    return typeof value?.at === "string" && typeof value?.opened === "string"
      ? { at: value.at, opened: value.opened }
      : null;
  } catch {
    return null;
  }
}

export function writeReturnRecord(record: ReturnRecord): void {
  try {
    sessionStorage.setItem(RETURN_RECORD_KEY, JSON.stringify(record));
  } catch {
    // A store failure counts as having no record.
  }
}

/** The slug of a project detail path, under any configured base. */
export function projectSlugFromPath(pathname: string): string | null {
  return /\/proyectos\/([^/]+)\/?$/.exec(pathname)?.[1] ?? null;
}

/** Full cards at a stop: the scroller fits them plus an edge on each side. */
export function visibleCardCount(
  width: number,
  edge: number,
  stopWidth: number,
  slideWidth: number,
): number {
  return Math.round((width - 2 * edge + (stopWidth - slideWidth)) / stopWidth);
}

type StopPicker = (
  cardIndex: number,
  currentStop: number,
  visibleCards: number,
) => number;

/**
 * The real stop to restore, or null when the record names a slug that no card
 * has. It comes from the slugs at the current width, never a stored offset.
 */
export function restoredStop(
  slugs: string[],
  record: ReturnRecord,
  visibleCards: number,
  pickStop: StopPicker,
): number | null {
  const at = slugs.indexOf(record.at);
  const opened = slugs.indexOf(record.opened);

  return at < 0 || opened < 0 ? null : pickStop(opened, at, visibleCards);
}

export interface RouterEntry {
  from: URL;
  to: URL;
  navigationType: string;
}

/**
 * Only a return from a detail page restores. A traversal to the same path also
 * does: the router swaps the home again on going back from a section's hash to
 * the bare URL, and that hash move must leave the carousel where it was.
 */
export function restoresOnSwap({ from, to, navigationType }: RouterEntry) {
  return (
    projectSlugFromPath(from.pathname) !== null ||
    (from.pathname === to.pathname && navigationType === "traverse")
  );
}

export interface ReturnHelpers {
  key: string;
  endSpaceAttribute: string;
  cloneAttribute: string;
  parse: typeof parseReturnRecord;
  select: typeof restoredStop;
  pick: StopPicker;
  visible: typeof visibleCardCount;
}

/**
 * Consume the record on an entry that shows the carousel, and restore when the
 * entry asks for it. Only the scroller's horizontal offset changes, and focus
 * and the window stay untouched.
 *
 * This function is also serialized into an inline script, so it MUST NOT refer
 * to anything outside its parameters and browser globals.
 */
export function restoreCarouselPosition(
  restore: boolean,
  helpers: ReturnHelpers,
): void {
  const scroller = document.querySelector<HTMLElement>(
    ".projects-carousel-scroller",
  );
  const list = scroller?.querySelector("ul");

  if (!scroller || !list) {
    return;
  }

  let raw: string | null = null;

  try {
    raw = sessionStorage.getItem(helpers.key);
    sessionStorage.removeItem(helpers.key);
  } catch {
    // A store failure counts as having no record.
  }

  const record = helpers.parse(raw);

  if (!restore || !record) {
    return;
  }

  const slides = (Array.from(list.children) as HTMLElement[]).filter(
    (slide) => !slide.hasAttribute(helpers.cloneAttribute),
  );

  if (slides.length < 2) {
    return;
  }

  const first = slides[0].getBoundingClientRect().left;
  const stopWidth = slides[1].getBoundingClientRect().left - first;
  const scrollerRect = scroller.getBoundingClientRect();
  const edge =
    Number.parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) || 0;
  const visibleCards = helpers.visible(
    scrollerRect.width,
    edge,
    stopWidth,
    slides[0].offsetWidth,
  );
  const stop = helpers.select(
    slides.map((slide) => slide.dataset.projectSlug ?? ""),
    record,
    visibleCards,
    helpers.pick,
  );

  if (stop === null) {
    return;
  }

  const origin = first - scrollerRect.left + scroller.scrollLeft - edge;

  // Without clones, the last stops cannot be reached until there is end space.
  if (stop > slides.length - visibleCards) {
    list.setAttribute(helpers.endSpaceAttribute, "");
  }

  scroller.scrollTo({ left: origin + stop * stopWidth, behavior: "instant" });
}
