# 0027. The search lives in the Categories header and stays when the page scrolls

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner, after seeing the Categories tab with its search field scrolling away with the tiles

## Context

The Categories tab first had the standard header with the search field as the first thing in the scrolling page, so scrolling to
the lower groups lost the way into search. The owner asked for the search to be part of the header and to stay.

## Decision

1. **One header holds the screen's name and the search field** (`SearchHeader`): the same deep aubergine block with the rounded
   lower edge as every other header (0026), the name large above a white field, light status bar text.
2. **It collapses as the page scrolls.** The name slides up and fades over the first 48 dp, the block gives that height back, and the
   field is left pinned just under the status bar. It is driven by the scroll position with transforms and opacity only, so it runs on
   the phone's animation thread and never lags the finger.
3. **It lies over the page and takes no layout.** The page puts `useSearchHeaderHeight()` of room above its first row; nothing is
   pushed down as the header collapses. The header stays put through loading, offline and failed states.
4. **The field types the same example words as Home** (`useSearchHint`), so the two searches read as one feature. Pressing it opens
   the search screen.
5. **The loading skeleton mirrors the page**: group title with its dotted line, rows of four square tiles, one or two name lines,
   in the real group sizes, below the real header.
6. **A tab that is kept does not replay its skeleton.** Like Orders and the cart, the Categories tab uses `quietReturn` and
   `backgroundReady`, so switching tabs never flashes the skeleton again.

## Consequences

- Any later tab that is searched first can use `SearchHeader` with its own scroll value.
- The Categories tab has no `AppHeader`; it follows the 0026 look but not its component, because it needs the collapsing field.
