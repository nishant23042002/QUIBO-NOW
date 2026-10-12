# 0035. The tabs show their skeleton again, and every skeleton mirrors its page

- **Status:** Accepted (Phase 1). Reverses point 3 of [0025](./0025-instant-tabs-and-a-lively-bottom-bar.md) for the Categories, Cart and Orders tabs.
- **Date:** 2026-10-12
- **Source:** the owner, on the Categories tab: the skeleton had gone, and moving between tabs felt less real without it

## Context

ADR 0025 made Cart, Orders and Categories instant: built early, ready at once, and never showing their skeleton on a return. The
owner has since asked for the skeleton back, because a tab that appears fully drawn in the same frame as the tap feels like nothing
happened. The skeletons also had to match what they stand in for, in position and alignment, so that nothing moves when the page
arrives.

## Decision

1. **A tab shows its skeleton each time it is chosen from another tab** (`freshOnOpen` in `useScreenLoad`), and the first time after it
   was built early. The load is `TAB_LOAD_MS` (350 ms) and then the page cross-fades in over it for 200 ms. The rule is a pure function,
   `shouldRestartOnFocus`, with tests.
2. **Uncovering a tab does not reload it.** Coming back to a tab from a screen that was opened over it (a search a tile opened, an
   order opened from Orders, a step opened from the cart) still follows the tab's quiet return. The tab can tell the two apart because
   its own navigator names the tab in front when it goes out of front.
3. **A skeleton is built from what the page will hold,** not from a fixed picture:
   - **Categories:** every group, the real title's length, the real tile names' lines (`tileNameLines`).
   - **Orders:** the cards the chosen filter will show (up to three), their pictures, the shops line's length and the "Track" line only
     for an order in progress, or the empty page, or the dashed note (`ordersShape`).
   - **Cart:** unchanged; it was already drawn from the cart's lines, saved items and shops.
   - **Home, "All":** the page's own sections in order (Shop by category with its named tiles, shops, Small prices with its tabs,
     Featured, a row per category, the quieter-times note), and the grid with as many cards as the category has.
4. **Skeleton rows are the real rows.** The product card skeleton has the real card's rows and gaps and the same low-stock line rule
   (`reserveNote`); the tile name has no gap between its two lines; the featured cards share one computed height (`useFeaturedCardHeight`)
   so the row is as tall before the cards as after, in Hindi and Marathi too. Measured in the browser, every row title of Home and of
   Categories sits at the same y with the skeleton as with the page.

## Consequences

- About 0.5 s from a tap on a tab to its page (350 ms and the fade), against nothing before. It is one number (`TAB_LOAD_MS`) to change.
- The testing switches "Pretend offline" and "Next load fails" meet Categories, Cart and Orders again when they are chosen from another
  tab.
- Not shown: the brand footer has no placeholder on Home's skeleton; it is below the fold while the page loads.
- Home itself is the first tab and keeps its own loading; it shows its skeleton at start and when a category is chosen.
