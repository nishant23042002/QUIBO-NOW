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
3. **The cart bar never disappears; it comes apart into two.** As the bottom bar slides away the full cart bar sinks with it
   and shrinks into a small cart button at the lower right while its words fade early, so there is one continuous motion and no
   jump. At the lower left a separate free-delivery note slides in beside it. The button is pistachio with a static cart icon
   (never the items, whatever is in the cart) and "View cart" over the count in words. The note is dark, with a full-colour delivery scooter
   (`assets/delivery-scooter.png`) and two short lines. The scooter is the progress bar: drawn faded, it comes into full colour
   from its left as the cart nears free delivery, easing to each change, so there is no separate line. Not yet free: "₹153 more"
   over "for free delivery". Free: the scooter is in full colour with a small pistachio tick and a small pop, and it reads
   "Free delivery" over "unlocked". The pair sit 8 dp from each side
   and from each other, and are about 48 dp tall. Corners are 12 dp (the tile 6), a little sharper than the rest, and not
   full circles. Tapping either opens the cart.
4. **Only screens that scroll a long list hide it:** Home, shop pages, search, Orders, an order's page and Help. Cart, checkout,
   the item page and the address pages have their own bottom buttons, so the bar stays.
5. **A tile at the far right edge** holds the full Quibo logo for now. It is not a tab and is not pressed; it is a place kept for
   something of the app's own, later. It is set in 8 dp from the bar's top and bottom, flush with the screen's right edge, and
   rounded on both left corners.
6. **Category rows:** the title runs into a thin, light dotted line, and "See all" is a full-width button under the row.

## Consequences

- Pages keep the room for the bar at their bottom, so nothing jumps when it comes back.
- The "removed, undo" note rests right above whatever is lowest: the full cart bar with the bottom bar in place, the small
  note and button once it is away, or the screen's bottom edge when the cart is empty. It glides between these with the same
  shared value, so it never floats high above the collapsed pair.
- A future screen that scrolls a long list adds one line (`{...chromeScrollProps}`) to take part.
- The logo tile is decoration until it is given a job; it must not be given a tap target without a name and a destination.
