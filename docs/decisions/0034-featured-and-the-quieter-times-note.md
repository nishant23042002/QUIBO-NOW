# 0034. Featured picks and a quieter-times note on Home

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner's Home redesign

## Decision

1. **"Featured this week"** is one swipeable row of a few tinted cards (a title, a line under it, a picture), under the same
   dotted-line title as every row, after "Small prices". A pick opens a category on Home or search for a word, the way a category
   tile does. The picks are app-local data (`FEATURED`) until the API supplies them, with a test that each is worded in all three
   languages.
2. **A quiet "quieter times cost less" note** sits near the end of Home, above the brand footer. It is true: a rush-hour window adds a
   set amount to the delivery fee (`deliveryFee`), and the time-picker shows what each window costs. It opens that picker, which works
   with an empty cart.
3. **There is no separate "fresh milk every morning" card.** That message is already one of the offers in the header's carousel,
   which is where it belongs; a second copy lower on the page would only repeat it.

## Consequences

- With this, every part of the redesign in the mock is in the app, apart from the dropped Bestsellers collage.
