# 0021. The bottom bar hides while the page is read

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-11
- **Source:** the owner, after looking at how the big grocery apps behave

## Context

The bottom navigation bar and the cart bar above it take about 160 dp of a small screen all the time. On a long page of items that
is a lot of the view, and the big quick-commerce apps give it back while the shopper is browsing.

## Decision

1. **The bar hides on scroll down and returns on scroll up.** It slides straight down, with no fade, on a soft ease-in-out curve
   (about 280 ms out, 260 ms back); with "reduce motion" on it only fades. Near the top (80 dp) it always shows, and a turn back
   has to be more than a flick (10 dp) to count. The rule is plain logic with tests (`ui/logic/chromeScroll.ts`).
2. **One shared value drives everything** (`ui/chrome.ts`): 0 with the bar in place, 1 with it away. Screens that scroll report
   their offset; a new screen always starts with the bar in place. Everything moves with transforms and opacity on the phone's
   animation thread, so nothing is laid out while it runs and no state changes on the JavaScript thread mid-move.
3. **The cart bar never disappears; it turns into a pill.** The full bar and the pill are the same dark shape at two sizes. As
   the bottom bar slides away the full bar sinks with it and shrinks toward the pill's corner while its words fade early, and the
   pill's words arrive as it lands, so there is one continuous motion and no jump. The pill shows a cart icon (it never shows
   items, whatever is in the cart) with the count on it, two short lines, a chevron, and the thin free-delivery line along its
   bottom. Not yet free: "₹153 more" over "for free delivery". Free: the icon tile turns pistachio with a check and gives a small
   pop, and it reads "Free delivery" over "unlocked". Corners are 16 and 12 dp, not full circles.
4. **Only screens that scroll a long list hide it:** Home, shop pages, search, Orders, an order's page and Help. Cart, checkout,
   the item page and the address pages have their own bottom buttons, so the bar stays.
5. **A tile at the far right edge** holds the full Quibo logo for now. It is not a tab and is not pressed; it is a place kept for
   something of the app's own, later. It fills the bar's whole height and is rounded only at its upper left.
6. **Category rows:** the title runs into a thin, light dotted line, and "See all" is a full-width button under the row.

## Consequences

- Pages keep the room for the bar at their bottom, so nothing jumps when it comes back.
- A future screen that scrolls a long list adds one line (`{...chromeScrollProps}`) to take part.
- The logo tile is decoration until it is given a job; it must not be given a tap target without a name and a destination.
