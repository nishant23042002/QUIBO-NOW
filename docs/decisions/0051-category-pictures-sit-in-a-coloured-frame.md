# 0051. Category pictures sit in a band of the category's colour

- **Status:** Proposed (Phase 1, sub-phase 1l). Amends [ADR 0044](0044-home-is-organised-by-departments-and-needs.md) and
  [ADR 0046](0046-one-list-of-categories.md), which put a category's picture on a neutral plate.
- **Date:** 2026-10-14
- **Source:** the owner, who saw the picture's backdrop and the screen's background as nearly the same colour, which looked wrong

## Context

Every category picture is made on the same neutral grey (`artworkPlate`, `#F7F7F7`), so the tiles match across categories. The page
behind them is `#F8F4F7`. The two are almost the same colour, so a pictured tile had no edge and looked like a hole in the page; a
hairline was the only thing holding it up, and it sat oddly beside the tinted emoji tiles.

## Decision

1. **The plate is set in a band of the category's own colour**, 3 dp wide, like the mat round a framed photograph. The plate keeps the
   neutral grey, so the pictures stay consistent, and the band gives the tile a clear edge and ties it to the category's colour (green
   for fruit and vegetables, blue for dairy, and so on).
2. **The hairline is dropped** for pictured tiles: the band is the edge.
3. **Corners:** the tile is `lg` (12) and the plate inside it `md` (8), so the two stay concentric.
4. **Emoji tiles are unchanged**, and so are the picture files and the registry.

## Consequences

- Nothing moves: the tile is the same size and the picture is a little smaller inside it (6 dp less across).
- In the dark theme the band is the deep tint and the plate stays light, which reads as the same framed picture.
- One component changed (`CategoryTile`); the Home grid, the Categories tab and All categories all use it.
