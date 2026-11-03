import { CLONE_ATTRIBUTE, focusStop } from "./carousel";
import {
  END_SPACE_ATTRIBUTE,
  RETURN_RECORD_KEY,
  parseReturnRecord,
  restoreCarouselPosition,
  restoredStop,
  restoresOnSwap,
  visibleCardCount,
  type ReturnHelpers,
  type RouterEntry,
} from "./return-position";

const helpers: ReturnHelpers = {
  key: RETURN_RECORD_KEY,
  endSpaceAttribute: END_SPACE_ATTRIBUTE,
  cloneAttribute: CLONE_ATTRIBUTE,
  parse: parseReturnRecord,
  select: restoredStop,
  pick: focusStop,
  visible: visibleCardCount,
};

/**
 * Apply the position on router entries. `astro:after-swap` runs before the view
 * transition captures the new page and before the island hydrates, and these
 * listeners sit outside the island because the detail page may have loaded as a
 * full document, where the island's module never ran.
 */
export function installReturnListeners(): void {
  let restore = false;

  document.addEventListener("astro:before-swap", (event) => {
    restore = restoresOnSwap(event as unknown as RouterEntry);
  });
  document.addEventListener("astro:after-swap", () => {
    restoreCarouselPosition(restore, helpers);
  });
}

/**
 * The inline script for an entry that loads the home as a full document. Only a
 * history traversal restores; a reload or a new visit just consumes the record.
 * The router re-runs inline scripts after a swap, when the document is no longer
 * loading and `astro:after-swap` has already handled the entry.
 */
export function returnScriptSource(): string {
  const source = `{key:${JSON.stringify(helpers.key)},endSpaceAttribute:${JSON.stringify(helpers.endSpaceAttribute)},cloneAttribute:${JSON.stringify(helpers.cloneAttribute)},parse:${helpers.parse},select:${helpers.select},pick:${helpers.pick},visible:${helpers.visible}}`;

  return `if(document.readyState==="loading"){(${restoreCarouselPosition})(performance.getEntriesByType("navigation")[0]?.type==="back_forward",${source})}`;
}
