import {
  END_SPACE_ATTRIBUTE,
  projectSlugFromPath,
  visibleCardCount,
  writeReturnRecord,
} from "./return-position";

/**
 * Thresholds for tilted-wheel input. A gesture starts after `gestureGapMs`
 * without wheel input and is discrete when its first event uses a line or page
 * delta, or reaches `discreteDeltaPx`. Provisional until the physical check.
 */
export const WHEEL_THRESHOLDS = {
  gestureGapMs: 150,
  discreteDeltaPx: 40,
  moveIntervalMs: 150,
} as const;

/** Quiet time after the last scroll event that counts as settled. */
const SETTLE_DEBOUNCE_MS = 150;
/** Rounding allowance for scroll offsets at fractional stop widths. */
const STOP_TOLERANCE_PX = 2;

export const CLONE_ATTRIBUTE = "data-carousel-clone";

export interface CarouselMetrics {
  /** Scroll offset of stop 0, the first real card. */
  origin: number;
  /** Distance between two consecutive stops. */
  stopWidth: number;
  /** Full cards visible at a stop. */
  visibleCards: number;
}

export function stopLeft(metrics: CarouselMetrics, stop: number): number {
  return metrics.origin + stop * metrics.stopWidth;
}

export function stopFromPosition(
  metrics: CarouselMetrics,
  position: number,
): number {
  return Math.round((position - metrics.origin) / metrics.stopWidth);
}

export function isAlignedToStop(
  metrics: CarouselMetrics,
  position: number,
  stop: number,
): boolean {
  return Math.abs(position - stopLeft(metrics, stop)) <= STOP_TOLERANCE_PX;
}

/** Map an extended stop to its real stop, from 0 to `count - 1`. */
export function wrapStop(stop: number, count: number): number {
  return ((stop % count) + count) % count;
}

/**
 * Plan one move from the logical target rather than a measurement, so rapid
 * input lands correctly. Every slot visible at a stop must exist, including
 * both peeks, which bounds the stop to 1 - count through 2 * count - 3. A move
 * past those bounds goes back by one full set of cards, and the position follows
 * with an invisible jump. Rapid input can outrun the animation so far that the
 * position has no room for that jump; it then keeps moving, since only the
 * target's real stop decides where the carousel lands.
 */
export function planMove(
  target: number,
  delta: number,
  count: number,
  position: number,
): { shift: number; target: number } {
  const next = target + delta;
  let shift = 0;

  if (next > 2 * count - 3) {
    shift = -count;
  } else if (next < 1 - count) {
    shift = count;
  }

  const shifted = position + shift;
  const fits = shifted >= -count && shifted <= 2 * count - 1;

  return { shift: fits ? shift : 0, target: next + shift };
}

/**
 * The real stop that shows a focused real card in full, keeping the current
 * stop when it already does.
 */
export function focusStop(
  cardIndex: number,
  currentStop: number,
  visibleCards: number,
): number {
  const first = Math.max(0, cardIndex - visibleCards + 1);

  return Math.min(cardIndex, Math.max(first, currentStop));
}

export type WheelAction = "native" | "consume" | "move";

export interface WheelSample {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  shiftKey: boolean;
  time: number;
}

/**
 * The horizontal part of a wheel event, or 0 for vertical input. Chromium keeps
 * Shift with a vertical wheel in `deltaY` and only scrolls it sideways, while
 * other browsers report it in `deltaX`.
 */
export function horizontalWheelDelta({
  deltaX,
  deltaY,
  shiftKey,
}: Pick<WheelSample, "deltaX" | "deltaY" | "shiftKey">): number {
  if (shiftKey && deltaX === 0) {
    return deltaY;
  }

  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : 0;
}

/**
 * Decide what each wheel event does. Vertical-dominant input is never touched.
 * A continuous gesture such as a trackpad stays native; a discrete gesture
 * moves one stop per event, throttled.
 */
export function createWheelClassifier(): (sample: WheelSample) => WheelAction {
  let lastEventTime = Number.NEGATIVE_INFINITY;
  let lastMoveTime = Number.NEGATIVE_INFINITY;
  let isDiscrete = false;

  return ({ deltaX, deltaY, deltaMode, shiftKey, time }) => {
    const delta = horizontalWheelDelta({ deltaX, deltaY, shiftKey });

    if (delta === 0) {
      return "native";
    }

    if (time - lastEventTime > WHEEL_THRESHOLDS.gestureGapMs) {
      isDiscrete =
        deltaMode !== 0 || Math.abs(delta) >= WHEEL_THRESHOLDS.discreteDeltaPx;
    }
    lastEventTime = time;

    if (!isDiscrete) {
      return "native";
    }

    if (time - lastMoveTime < WHEEL_THRESHOLDS.moveIntervalMs) {
      return "consume";
    }
    lastMoveTime = time;

    return "move";
  };
}

/**
 * Copy a slide for the loop. A clone stays operable by pointer, so it does not
 * use `inert`, and it carries nothing that must stay unique on the page.
 */
export function createClone(slide: HTMLElement): HTMLElement {
  const clone = slide.cloneNode(true) as HTMLElement;
  const elements = [clone, ...clone.querySelectorAll<HTMLElement>("*")];

  clone.setAttribute("aria-hidden", "true");
  clone.setAttribute(CLONE_ATTRIBUTE, "");

  for (const element of elements) {
    element.removeAttribute("id");
    element.removeAttribute("aria-labelledby");
    // This attribute is what carries `view-transition-name`.
    element.removeAttribute("data-astro-transition-scope");

    if (element.tagName === "A") {
      element.setAttribute("tabindex", "-1");
    } else if (element.tagName === "IMG") {
      // A wrap must not reveal an unloaded image.
      element.setAttribute("loading", "eager");
    }
  }

  return clone;
}

/** Surround the slides with one full set of clones on each side. */
export function insertClones(list: HTMLElement): () => void {
  const slides = Array.from(list.children) as HTMLElement[];
  const before = slides.map(createClone);
  const after = slides.map(createClone);

  list.prepend(...before);
  list.append(...after);

  return () => {
    [...before, ...after].forEach((clone) => clone.remove());
  };
}

interface RouterNavigationEvent extends Event {
  from: URL;
  to: URL;
  navigationType: string;
}

export interface CarouselController {
  move: (delta: number) => void;
  destroy: () => void;
}

/**
 * Add the loop, wheel, and focus behavior to a server-rendered scroller. The
 * clones and the looped position apply in this one synchronous step, so no
 * card moves. Native scrolling and CSS snap keep doing the scrolling.
 */
export function createCarouselController(
  scroller: HTMLElement,
  list: HTMLElement,
): CarouselController {
  const slides = Array.from(list.children) as HTMLElement[];
  const count = slides.length;

  const measure = (): CarouselMetrics => {
    const scrollerRect = scroller.getBoundingClientRect();
    const first = slides[0].getBoundingClientRect().left;
    const stopWidth = slides[1].getBoundingClientRect().left - first;
    const edge =
      Number.parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) ||
      0;

    return {
      origin: first - scrollerRect.left + scroller.scrollLeft - edge,
      stopWidth,
      visibleCards: visibleCardCount(
        scrollerRect.width,
        edge,
        stopWidth,
        slides[0].offsetWidth,
      ),
    };
  };

  const jumpTo = (left: number) => {
    scroller.scrollTo({ left, behavior: "instant" });
  };

  // Keep the stop reached before hydration, so no card moves when clones land.
  const initialMetrics = measure();
  let target = stopFromPosition(initialMetrics, scroller.scrollLeft);
  const removeClones = insertClones(list);
  list.removeAttribute(END_SPACE_ATTRIBUTE);
  jumpTo(stopLeft(measure(), target));

  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let lastWidth = scroller.getBoundingClientRect().width;

  const armSettle = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, SETTLE_DEBOUNCE_MS);
  };

  const move = (delta: number) => {
    const metrics = measure();
    const plan = planMove(
      target,
      delta,
      count,
      (scroller.scrollLeft - metrics.origin) / metrics.stopWidth,
    );

    // Rapid moves restart the animation before it reports any scroll, and
    // settling on that stale position would undo them.
    armSettle();

    if (plan.shift !== 0) {
      // Mid-animation this position is between stops, and snapping would pull
      // the cards back to the nearest one. Settling restores the snap.
      scroller.style.scrollSnapType = "none";
      jumpTo(scroller.scrollLeft + plan.shift * metrics.stopWidth);
    }

    target = plan.target;
    scroller.scrollTo({
      left: stopLeft(metrics, target),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const focusedRealIndex = () => {
    const active = document.activeElement;

    if (!active?.matches(":focus-visible")) {
      return -1;
    }

    return slides.findIndex((slide) => slide.contains(active));
  };

  const settle = () => {
    scroller.style.scrollSnapType = "";

    const metrics = measure();
    const position = scroller.scrollLeft;
    const stop = stopFromPosition(metrics, position);

    // A finger holding the scroller still is not settled.
    if (!isAlignedToStop(metrics, position, stop)) {
      return;
    }

    target = stop;
    const wrapped = wrapStop(stop, count);

    if (wrapped === stop) {
      return;
    }

    // Wrapping would carry a visibly focused real card off screen.
    const focused = focusedRealIndex();
    if (
      focused >= 0 &&
      focused >= stop &&
      focused < stop + metrics.visibleCards
    ) {
      return;
    }

    target = wrapped;
    jumpTo(stopLeft(metrics, wrapped));
  };

  const handleScrollEnd = () => {
    const metrics = measure();

    // An interrupted animation can end short of the target; the debounce from
    // the scroll events decides then.
    if (isAlignedToStop(metrics, scroller.scrollLeft, target)) {
      clearTimeout(settleTimer);
      settle();
    } else {
      armSettle();
    }
  };

  // Going back to the same page without a hash makes the router swap the home
  // again, which must leave the carousel where it was.
  const handlePreparation = (event: Event) => {
    const { from, to, navigationType } = event as RouterNavigationEvent;
    const at = slides[wrapStop(target, count)].dataset.projectSlug;
    const opened =
      from.pathname === to.pathname && navigationType === "traverse"
        ? at
        : projectSlugFromPath(to.pathname);

    if (at && opened) {
      writeReturnRecord({ at, opened });
    }
  };

  const classifyWheel = createWheelClassifier();

  const handleWheel = (event: WheelEvent) => {
    const action = classifyWheel({
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      shiftKey: event.shiftKey,
      time: event.timeStamp,
    });

    if (action === "native") {
      return;
    }

    event.preventDefault();

    if (action === "move") {
      move(Math.sign(horizontalWheelDelta(event)));
    }
  };

  // A click must never focus inside a clone's hidden subtree; it still navigates.
  const handleMouseDown = (event: MouseEvent) => {
    if (
      event.target instanceof Element &&
      event.target.closest(`[${CLONE_ATTRIBUTE}] a`)
    ) {
      event.preventDefault();
    }
  };

  const handleFocusIn = (event: FocusEvent) => {
    if (
      !(event.target instanceof Element) ||
      !event.target.matches(":focus-visible")
    ) {
      return;
    }

    const cardIndex = slides.findIndex((slide) =>
      slide.contains(event.target as Element),
    );

    if (cardIndex < 0) {
      return;
    }

    // The browser reveals the focused element after this event. Moving now
    // leaves it nothing to reveal, and the navigator's focus check, queued on
    // the next frame, measures the final position.
    const metrics = measure();
    const position = scroller.scrollLeft;
    const current = stopFromPosition(metrics, position);
    const next = focusStop(cardIndex, current, metrics.visibleCards);

    target = next;

    if (next !== current || !isAlignedToStop(metrics, position, next)) {
      jumpTo(stopLeft(metrics, next));
    }
  };

  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          const width = scroller.getBoundingClientRect().width;

          if (width !== lastWidth) {
            lastWidth = width;
            jumpTo(stopLeft(measure(), target));
          }
        });

  scroller.addEventListener("scroll", armSettle, { passive: true });
  scroller.addEventListener("scrollend", handleScrollEnd);
  scroller.addEventListener("wheel", handleWheel, { passive: false });
  scroller.addEventListener("mousedown", handleMouseDown, { capture: true });
  scroller.addEventListener("focusin", handleFocusIn);
  document.addEventListener("astro:before-preparation", handlePreparation);
  resizeObserver?.observe(scroller);

  return {
    move,
    destroy: () => {
      clearTimeout(settleTimer);
      resizeObserver?.disconnect();
      scroller.removeEventListener("scroll", armSettle);
      scroller.removeEventListener("scrollend", handleScrollEnd);
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("mousedown", handleMouseDown, {
        capture: true,
      });
      scroller.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener(
        "astro:before-preparation",
        handlePreparation,
      );
      scroller.style.scrollSnapType = "";
      removeClones();
    },
  };
}
