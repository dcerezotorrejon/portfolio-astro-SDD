export interface SectionStart {
  id: string;
  /** Section top in viewport coordinates (`getBoundingClientRect().top`). */
  top: number;
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
