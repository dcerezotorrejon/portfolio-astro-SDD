import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import {
  getActiveSectionIndex,
  prefersReducedMotion,
  scrollToSection,
} from "../lib/navigation";

// `useLayoutEffect` warns during server rendering; the client needs it to
// pre-paint the active section from the URL fragment, while the server only
// needs a no-op.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface FloatingNavSection {
  id: string;
  label: string;
}

export interface FloatingNavProps {
  sections: FloatingNavSection[];
  ariaLabel?: string;
}

export default function FloatingNav({
  sections,
  ariaLabel = "Navegación por secciones",
}: FloatingNavProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? "");
  const [isFocusObscured, setIsFocusObscured] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const activeSectionIdRef = useRef(activeSectionId);
  const navRef = useRef<HTMLElement>(null);
  const activeIndex = Math.max(
    0,
    sections.findIndex(({ id }) => id === activeSectionId),
  );

  // On a direct fragment load (e.g. returning from a detail page to
  // "/#trayectoria") the browser has already jumped to the section before
  // hydration. Reflect that fragment in the active state before paint so the
  // indicator starts on the right link instead of flipping to it afterwards.
  useIsomorphicLayoutEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash && sections.some(({ id }) => id === hash)) {
      activeSectionIdRef.current = hash;
      setActiveSectionId(hash);
    }
  }, [sections]);

  // Only after the first paint is it safe to animate indicator moves; the CSS
  // suppresses the transition until `data-positioned` flips to "true".
  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsPositioned(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    let animationFrame: number | null = null;
    const sectionElements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)
      // The helper assumes DOM order; sort the found elements into actual
      // document order in case the `sections` props list differs from it.
      .sort((a, b) =>
        (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) === 0
          ? 1
          : -1,
      );

    const measure = () => {
      animationFrame = null;
      const sectionStarts = sectionElements.map((section) => ({
        id: section.id,
        top: section.getBoundingClientRect().top,
      }));
      const nextIndex = getActiveSectionIndex(sectionStarts, 16, 1);
      const nextId = sectionStarts[nextIndex]?.id;

      if (nextId && nextId !== activeSectionIdRef.current) {
        activeSectionIdRef.current = nextId;
        setActiveSectionId(nextId);
      }
    };

    const scheduleMeasure = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(measure);
      }
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);

    sectionElements.forEach((section) => resizeObserver?.observe(section));
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("hashchange", scheduleMeasure);
    window.addEventListener("pageshow", scheduleMeasure);
    document.fonts?.addEventListener("loadingdone", scheduleMeasure);
    scheduleMeasure();

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("hashchange", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      document.fonts?.removeEventListener("loadingdone", scheduleMeasure);
      resizeObserver?.disconnect();

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [sections]);

  // Keep keyboard focus clear: if a focus-visible control outside the navigator
  // would be covered by the fixed navigator, hide the navigator until focus
  // moves into the navigator or out of the overlapping region. The navigator
  // retains its layout and tab order, so keyboard users can still reach it.
  useEffect(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const isFocusVisible = (element: HTMLElement) => {
      try {
        return element.matches(":focus-visible");
      } catch {
        // Browsers without :focus-visible support keep the navigator visible.
        return false;
      }
    };

    const overlapsNavigator = (element: HTMLElement) => {
      const elementRect = element.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      // Include the 3 px focus outline plus its 3 px offset so the visible
      // focus indicator, not only the control box, stays unobscured.
      const focusOutlineMargin = 8;

      return (
        elementRect.bottom + focusOutlineMargin > navRect.top &&
        elementRect.top - focusOutlineMargin < navRect.bottom &&
        elementRect.right + focusOutlineMargin > navRect.left &&
        elementRect.left - focusOutlineMargin < navRect.right
      );
    };

    let focusAnimationFrame: number | null = null;

    const updateFocusObscuring = () => {
      focusAnimationFrame = null;
      const active = document.activeElement;

      if (
        !(active instanceof HTMLElement) ||
        nav.contains(active) ||
        !isFocusVisible(active)
      ) {
        setIsFocusObscured(false);

        return;
      }

      setIsFocusObscured(overlapsNavigator(active));
    };

    const handleFocusChange = () => {
      if (focusAnimationFrame === null) {
        focusAnimationFrame =
          window.requestAnimationFrame(updateFocusObscuring);
      }
    };

    document.addEventListener("focusin", handleFocusChange);
    document.addEventListener("focusout", handleFocusChange);
    window.addEventListener("scroll", handleFocusChange, { passive: true });
    window.addEventListener("resize", handleFocusChange);

    return () => {
      document.removeEventListener("focusin", handleFocusChange);
      document.removeEventListener("focusout", handleFocusChange);
      window.removeEventListener("scroll", handleFocusChange);
      window.removeEventListener("resize", handleFocusChange);

      if (focusAnimationFrame !== null) {
        window.cancelAnimationFrame(focusAnimationFrame);
      }
    };
  }, []);

  // Activate an in-page anchor with a smooth scroll without triggering the
  // browser's native instant fragment jump. Modified/new-tab/middle clicks and
  // reduced-motion users fall through to the native link behavior.
  const handleLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (prefersReducedMotion() || !document.getElementById(id)) {
      return;
    }

    event.preventDefault();
    window.history.pushState(null, "", `#${id}`);
    scrollToSection(id);
    activeSectionIdRef.current = id;
    setActiveSectionId(id);
  };

  return (
    <nav
      className="floating-nav"
      aria-label={ariaLabel}
      data-active-index={activeIndex}
      data-positioned={isPositioned ? "true" : "false"}
      data-focus-obscured={isFocusObscured ? "true" : undefined}
      ref={navRef}
    >
      <span className="floating-nav-indicator" aria-hidden="true" />
      <div className="floating-nav-list">
        {sections.map(({ id, label }) => (
          <a
            className="floating-nav-link"
            href={`#${id}`}
            aria-current={activeSectionId === id ? "location" : undefined}
            onClick={(event) => handleLinkClick(event, id)}
            key={id}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
