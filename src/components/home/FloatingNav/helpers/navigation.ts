/** Whether the user has requested reduced motion in the current environment. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scroll the section with `id` to the viewport start inset, animating unless
 * the user prefers reduced motion. Returns `false` when the target is missing
 * or `scrollIntoView` is unavailable, so callers can keep the native anchor
 * behavior as a fallback.
 */
export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);

  if (!target || typeof target.scrollIntoView !== "function") {
    return false;
  }

  target.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });

  return true;
}

export interface SectionStart {
  id: string;
  /** Section top in viewport coordinates (`getBoundingClientRect().top`). */
  top: number;
}

/**
 * Whether a section top has reached the activation inset.
 *
 * Mirrors the threshold used by `getActiveSectionIndex`: a top counts as
 * arrived when it is at or above `activationOffset` plus the 1 px rounding
 * tolerance (so a top of 16.4 px with the default values still qualifies).
 * Kept as a separate pure helper so the indicator hold can be released at the
 * exact same moment geometry would activate the section.
 */
export function hasReachedActivation(
  top: number,
  activationOffset = 16,
  tolerance = 1,
): boolean {
  return top <= activationOffset + tolerance;
}

/**
 * Return the index of the active section under section-start activation.
 *
 * A section becomes active when its top reaches the activation offset (the
 * 16 px scroll inset), so the section sits at the top of the viewport. The
 * active section is the **last** section, in the order given, whose top is
 * at or above `activationOffset` plus `tolerance` (1 px of rounding
 * tolerance for fractional CSS offsets, e.g. a top of 16.4 px still
 * qualifies). Sections with equal tops: the later one wins. Before any
 * section qualifies (including an empty list), the first section is active.
 *
 * The caller must pass sections in actual DOM order; this helper does not
 * reorder them.
 */
export function getActiveSectionIndex(
  sections: readonly SectionStart[],
  activationOffset = 16,
  tolerance = 1,
): number {
  if (sections.length === 0) {
    return 0;
  }

  const threshold = activationOffset + tolerance;
  let activeIndex = 0;

  sections.forEach(({ top }, index) => {
    if (top <= threshold) {
      activeIndex = index;
    }
  });

  return activeIndex;
}
