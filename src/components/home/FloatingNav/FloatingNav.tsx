import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import {
  getActiveSectionIndex,
  hasReachedActivation,
  prefersReducedMotion,
  scrollToSection,
} from "./helpers/navigation";

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
  // Set to the target of a programmatic activation while its smooth scroll is
  // still in flight. Geometry keeps this section selected until it reaches the
  // activation inset, so the indicator does not snap back to the origin.
  const heldSectionIdRef = useRef<string | null>(null);
  // Late-bound handle to the measurement scheduler, so the manual-input
  // effect can request a re-measure without owning the frame slot itself.
  const scheduleMeasureRef = useRef<() => void>(() => {});
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
      const heldId = heldSectionIdRef.current;

      if (heldId !== null) {
        const heldTop = sectionStarts.find(({ id }) => id === heldId)?.top;

        // Keep the activated target selected while it is still travelling to
        // the inset; geometry must not pull the indicator back to the origin
        // during the smooth scroll.
        if (heldTop !== undefined && !hasReachedActivation(heldTop, 16, 1)) {
          if (heldId !== activeSectionIdRef.current) {
            activeSectionIdRef.current = heldId;
            setActiveSectionId(heldId);
          }

          return;
        }

        // The target arrived (or vanished): release the hold and fall through
        // to normal geometry, which selects the held section without flicker.
        heldSectionIdRef.current = null;
      }

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

    scheduleMeasureRef.current = scheduleMeasure;

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

  // A user-initiated scroll before the activated target arrives takes over
  // from the programmatic scroll: release the hold immediately and re-measure
  // so geometry governs again (e.g. the indicator returns to "Inicio" when the
  // user scrolls back to the top).
  useEffect(() => {
    const scrollKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ]);

    const releaseHold = () => {
      if (heldSectionIdRef.current === null) {
        return;
      }

      heldSectionIdRef.current = null;
      scheduleMeasureRef.current();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) {
        releaseHold();
      }
    };

    window.addEventListener("wheel", releaseHold, { passive: true });
    window.addEventListener("touchstart", releaseHold, { passive: true });
    window.addEventListener("touchmove", releaseHold, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", releaseHold);
      window.removeEventListener("touchstart", releaseHold);
      window.removeEventListener("touchmove", releaseHold);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    heldSectionIdRef.current = id;
    activeSectionIdRef.current = id;
    setActiveSectionId(id);
  };

  return (
    <nav
      className="floating-nav group fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-10 mx-auto w-[min(360px,calc(100%-32px))] rounded-pill border border-[rgb(15_20_25/8%)] bg-surface p-1 shadow-[0_4px_20px_rgb(15_20_25/14%)] data-[focus-obscured=true]:pointer-events-none data-[focus-obscured=true]:opacity-0"
      aria-label={ariaLabel}
      data-active-index={activeIndex}
      data-positioned={isPositioned ? "true" : "false"}
      data-focus-obscured={isFocusObscured ? "true" : undefined}
      ref={navRef}
    >
      <span
        className="floating-nav-indicator pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-pill bg-button transition-transform duration-control group-data-[positioned=false]:transition-none motion-reduce:transition-none group-data-[active-index=0]:translate-x-0 group-data-[active-index=1]:translate-x-full"
        aria-hidden="true"
      />
      <div className="floating-nav-list relative m-0 grid w-full list-none grid-cols-2 p-0">
        {sections.map(({ id, label }) => (
          <a
            className="floating-nav-link relative z-[1] flex min-h-11 min-w-0 items-center justify-center rounded-pill px-3 py-2 text-center font-semibold leading-tight no-underline whitespace-nowrap text-ink decoration-2 hover:underline aria-[current=location]:text-surface"
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
