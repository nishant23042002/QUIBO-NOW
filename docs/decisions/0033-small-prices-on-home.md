# 0033. "Small prices" on Home

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner's Home redesign

## Decision

1. **One section, three tabs.** Under the shops row, "Small prices" has three tabs (Under ₹30, ₹50 and ₹100) over one swipeable row
   of the same compact cards as every other row, cheapest first, at most eight. It opens on the middle tab.
2. **The tiers are data, in paise** (`PRICE_TIERS`), so a town can have its own; these are the samples until the API supplies them.
   The picking is plain code with tests (`pickUnder`): items that cost no more than the limit, cheapest first, ties in their order,
   without what is out of stock.
3. **It reuses what exists**: the same chips as the filters elsewhere (the chosen one in lilac), the same dotted-line title, the same
   cards. Choosing a tab only swaps the row; nothing loads or moves.
4. **No "See all".** There is no page that lists by price, and the row already shows the cheapest eight.

## Consequences

- A loose item (sold by the kilogram) is compared by the price its card shows, which is per kilogram.
- A tier with nothing in it says so in one quiet line instead of showing an empty row.
