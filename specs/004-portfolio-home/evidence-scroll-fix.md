# AC12 browser follow-up — end scroll space

- **Date:** 2026-10-05
- **Target:** Active Astro dev server, `http://localhost:4321` (reported PID 26601)
- **Browser:** Chrome DevTools MCP; no dependencies, build, gates, tests, or production files changed.
- **Scope:** Verify the current served `src/styles/global.css` end-space rule and browser behavior after the scroll-space change. This is browser-only evidence; it does not replace the task's unit, SEO, accessibility, or final integration gates.

## Served rule and anchor behavior

The browser fetched `/src/styles/global.css` successfully (HTTP 200); the transformed response contained the updated declaration `--home-end-scroll-space: max(112px, calc(100svh - 610px))`. Computed homepage padding was 290 px at 1440 × 900, 158 px at 1440 × 768, 202 px at 375 × 812, and 112 px at 320 × 700. The `safe-area-inset-bottom` contribution resolved to zero in this browser; a physical device/nonzero safe-area inset was not emulated.

After settling, direct `/#trayectoria` loads selected `Trayectoria` (`aria-current="location"`, active index 1) and the indicator's rectangle matched its active link at all tested sizes. The measured section top was approximately 32 px (31.6–32.4 px) at each viewport, rather than the expected 16 px. This is improved over the prior 1440 × 900 maximum-scroll result of y=178 px, but still leaves a 16 px offset discrepancy. The existing `scroll-padding-block-start: 16px` at `src/styles/global.css:39-42` and `scroll-margin-block-start: 16px` at `src/styles/global.css:102-105` are both reflected in the browser alignment; the intended single 16 px inset is not achieved.

Clicking `Trayectoria` from `/` successfully changed the URL to `/#trayectoria`, selected the matching link, and settled with the same ~32 px section offset at 1440 × 900 and 320 × 700. Clicking `Inicio` returned to `/#inicio` at scrollY=0 with the start section top at 0; the indicator matched `Inicio`. At 1440 × 900 after click/settle, the indicator and active link both measured x=712.5, y=835, 175 × 44 px. At mobile sizes the fixed navigator remained 16 px above the viewport bottom.

| Viewport   | `padding-bottom` | `scrollY` / max | `#trayectoria` top | Active      | Last-card action vs fixed navigator             | Horizontal overflow |
| ---------- | ---------------: | --------------: | -----------------: | ----------- | ----------------------------------------------- | ------------------- |
| 1440 × 900 |           290 px |       598 / 630 |              32 px | Trayectoria | No overlap observed                             | No                  |
| 1440 × 768 |           158 px |       506 / 538 |            31.6 px | Trayectoria | No overlap observed                             | No                  |
| 375 × 812  |           202 px |       536 / 620 |            32.4 px | Trayectoria | Action y=624.5–668.5; nav y=742–796; no overlap | No                  |
| 320 × 700  |           112 px |       523 / 653 |            31.6 px | Trayectoria | **Action y=649.4–693.4 overlaps nav y=630–684** | No                  |

At 320 × 700 the last card remained readable by scrolling to the document end (scrollY=maxScroll=653; last card y=255–588; action y=519–563; nav y=630–684; no overlap). However, immediately after direct fragment navigation/click, the last action is partly covered by the fixed navigator. Focusing that action at this position left it at y=649.4–693.4 with a solid 3 px keyboard-focus outline; it remained overlapped by the navigator by 35 px. The browser did not automatically adjust for the fixed overlay because the focused action was still inside the viewport. This is a residual AC12 failure for the focused-control/no-obscuration requirement at 320 × 700, despite the ability to manually scroll until it clears.

At 375 × 812 the final card ended at y=693.5 and its action was visible at y=624.5–668.5, above the navigator starting at y=742. Focusing it did not overlap the navigator. At both mobile viewports document scroll width equaled viewport width.

## Screenshots

All files are outside the repository under `/tmp/opencode/`:

- `/tmp/opencode/spec004-scroll-fix-direct-1440x900.png`
- `/tmp/opencode/spec004-scroll-fix-click-trayectoria-1440x900.png`
- `/tmp/opencode/spec004-scroll-fix-direct-1440x768.png`
- `/tmp/opencode/spec004-scroll-fix-direct-375x812.png`
- `/tmp/opencode/spec004-scroll-fix-click-inicio-375x812.png`
- `/tmp/opencode/spec004-scroll-fix-direct-320x700.png`
- `/tmp/opencode/spec004-scroll-fix-click-trayectoria-320x700.png`
- `/tmp/opencode/spec004-scroll-fix-click-inicio-320x700.png`
- `/tmp/opencode/spec004-scroll-fix-focus-last-card-320x700.png` (focused control overlapped)

## Result and defects

- **Partial pass:** The new served CSS is active, the additional end space lets the 1440 × 900 fragment reach within 32 px of the start (instead of the previous 178 px), both anchors work, active state/indicator settle correctly, and no horizontal overflow occurred.
- **Residual AC12 failures:** (1) `#trayectoria` settles at ~32 px, not the 16 px inset; (2) at 320 × 700, the focused last-card action is obscured by the fixed navigator after direct/click anchor navigation. Relevant CSS is `src/styles/global.css:39-42,94-100,102-105`; the latter end-space formula evaluates to only 112 px at 700 svh.
- **Transient dev-server condition:** The first direct hash load showed Astro's error overlay (`Cannot read properties of undefined (reading 'src')`, stack at `src/components/ExperienceHistory.astro:36`). A subsequent root navigation rendered the page successfully, and subsequent direct/click anchor checks rendered normally. This follow-up did not diagnose or modify that content-data condition.
- No build, lint, format, unit, SEO, or accessibility commands were run, as explicitly excluded by this browser-only assignment; this evidence does not claim those gates pass.

AC12 therefore remains **not fully verified / fails the residual offset and 320 × 700 focused-control checks**. Dev follow-up is needed before it can be marked complete.
