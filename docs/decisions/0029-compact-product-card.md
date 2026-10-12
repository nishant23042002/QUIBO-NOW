# 0029. The product card in a row is compact: 128 dp wide and short

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner: drop the 148 dp card to 128 (or 124) dp, keep the text clearly visible and not cut off, and do not let the
  narrower card grow tall

## Context

The row card was 148 dp wide with a square picture and a text block that always kept room for five lines, so a card was about
300 dp tall and only a little more than two fitted across. On a small phone that is a lot of height for one item, and the same
"15–20 mins" line was repeated on every card although the header already says it.

## Decision

1. **A card under 150 dp is compact.** The row card (`RAIL_CARD_WIDTH`) is 128 dp, so two cards and a good part of a third show and
   the row plainly swipes.
2. **The picture is a rectangle wider than tall** (1.2 across for a compact card, 1.1 for a wide one), so the card is not stretched.
   The picture rests a little above its middle, clear of the ADD button.
3. **The name keeps the full 16; the rest steps down to 14.** The name is the only way a shopper knows which item it is, so on a
   compact card it stays at 16, semibold, in up to two lines packed close. The pack and the low-stock line are 14, the smallest
   size the app uses, and the price badge is 16 with the printed price at 14. A wide card in the grid keeps 16 throughout. Hindi and
   Marathi keep their taller line room; the measurements are in `useProductCardMetrics`, shared with the loading skeleton.
   **The controls shrink with the card.** The ribbon is shorter with its amount at 14 and a shallower cut; ADD and the stepper are
   28 dp tall with 14 text and sit closer to the corner, each with slop around it that still makes a 48 dp touch target.
4. **No per-card delivery estimate.** The header carries it (ADR 0012); the card shows only what is special to the item.
5. **Room for the low-stock line is kept only in a row that has one.** `anyLowStock` tells a row whether one of its cards shows
   "Only 3 left", and then every card in that row keeps the room, so a row is one height. Other rows stay short.
6. **Row titles do not stick.** A row's title and dotted line scroll away with its row instead of staying under the tabs, so
   nothing lies over the items (`HomeScroll` is gone).
7. **The change is app-wide for rows**: Home, the item page's "more from this shop" and "popular", and the cart's suggestions.

## Consequences

- A compact card is about 190 dp tall, down from about 300.
- A name longer than two lines at 16 is cut with an ellipsis on the card; its full name is on the item's page.
- `ProductCard` no longer takes a delivery line (`quickLabel`).
