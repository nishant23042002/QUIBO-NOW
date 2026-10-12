# 0031. "Shop by category" opens Home's rows

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner's Home redesign, inspired by the quick-commerce apps and drawn in Quibo's own style

## Decision

1. **Eight tiles in two rows of four** sit at the top of Home's rows (the "All" view), under the same thin dotted-line title the
   rows have, with a "See all" button under them that opens the Categories tab. They are the same tile and the same four-across
   grid as the Categories tab (`CategoryTileGrid`), and the same full-width button as the rows (`SeeAllButton`).
2. **A main category stays on Home.** Choosing Milk and curd, Vegetables, Fruits or Snacks switches Home to that category's tab in
   place (the header changes colour as it does), with no new screen. A finer tile (Eggs and paneer, Atta and rice, Oil and masala,
   Tea) opens search for its word.
3. **The loading shape matches.** While a category is chosen the skeleton starts with the same title and two rows of tiles, so
   nothing moves when the tiles arrive.
4. **The Bestsellers collage is not built.** Its job is done by these tiles and the rows under them.

## Consequences

- The tile grid, its loading shape and the "See all" button are one piece each, so Home and the Categories tab cannot drift apart.
- The sample tiles stay app-local data (`HOME_CATEGORY_TILES`) until the API supplies them in Phase 2.
- **Amended 2026-10-12 ([ADR 0038](0038-shop-by-brand-on-home-and-the-shops-strip-goes.md)):** "Shop by brand" is the row under these
  tiles, and a category's own tab carries a brand filter above its grid ([ADR 0036](0036-products-carry-a-brand-and-brands-are-browsable.md)).
  Points 1 to 4 stand.
