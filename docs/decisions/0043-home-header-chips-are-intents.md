# 0043. The Home header's chips are intents, and the header stays lilac

- **Status:** Superseded by [ADR 0056](0056-home-quick-filters-removed.md): the quick-filter row was removed from Home on 2026-10-14.
  It replaced the category tabs of the Home header described in ADR 0028 and the per-category header colour. Where the chips sat was
  changed by [ADR 0044](0044-home-is-organised-by-departments-and-needs.md) (a row under the banner, the header rail showing departments).
- **Date:** 2026-10-13
- **Source:** the owner, once categories had their own screens (ADR 0041)

## Decision

1. **The chips are ways to look at what is on sale,** not departments: All, Quick, Offers, Under ₹50 and Veg (`home/homeIntents.ts`).
   "All" is the usual page; each of the others shows the items that suit it, from every shelf, one of each kind (the first listed of a
   kind that suits it, so Offers shows the brand that has the offer), in a two-column grid.
2. **The header stays lilac** whichever chip is chosen. A product's picture keeps its category colour; the header does not take it.
3. **Choosing a chip** shows a short skeleton, then the grid from the top of the page. A chip with no items says so and offers "All".

## Consequences

- The Categories tab, Shop by category and "See all" are the ways into a department.
- "Under ₹50" is the middle of the price tiers (`PRICE_TIERS`), so it follows them if they change.
- Quick means an item that can come in the next delivery window; it is true to the sample data and to the card's own "Today, 7–8 AM".
