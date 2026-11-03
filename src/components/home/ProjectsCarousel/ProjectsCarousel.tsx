import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  createCarouselController,
  type CarouselController,
} from "./helpers/carousel";

// `useLayoutEffect` warns during server rendering; the client needs it so the
// clones and the looped position apply in one step, before the next paint.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const arrowClasses =
  "inline-flex size-11 items-center justify-center rounded-pill border border-border bg-surface text-primary transition-colors duration-control enabled:hover:bg-page enabled:active:bg-border disabled:opacity-50 motion-reduce:transition-none";

export interface ProjectsCarouselProps {
  previousLabel: string;
  nextLabel: string;
  children?: ReactNode;
}

function ArrowIcon({ path }: { path: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export default function ProjectsCarousel({
  previousLabel,
  nextLabel,
  children,
}: ProjectsCarouselProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<CarouselController | null>(null);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const list = scroller?.querySelector("ul");

    if (!scroller || !list) {
      return;
    }

    const controller = createCarouselController(scroller, list);
    controllerRef.current = controller;
    setIsHydrated(true);

    return () => {
      controllerRef.current = null;
      controller.destroy();
    };
  }, []);

  return (
    <div className="projects-carousel">
      <div className="projects-carousel-controls">
        <button
          className={arrowClasses}
          type="button"
          aria-label={previousLabel}
          disabled={!isHydrated}
          onClick={() => controllerRef.current?.move(-1)}
        >
          <ArrowIcon path="M15 6l-6 6 6 6" />
        </button>
        <button
          className={arrowClasses}
          type="button"
          aria-label={nextLabel}
          disabled={!isHydrated}
          onClick={() => controllerRef.current?.move(1)}
        >
          <ArrowIcon path="M9 6l6 6-6 6" />
        </button>
      </div>
      <div className="projects-carousel-scroller" ref={scrollerRef}>
        {children}
      </div>
    </div>
  );
}
