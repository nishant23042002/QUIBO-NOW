# 0028. The tabs share Home's header

- **Status:** Accepted (Phase 1). Replaces [0027](./0027-search-lives-in-the-categories-header.md) and, for the tab screens only, the
  header rule of [0026](./0026-one-header-on-every-secondary-screen.md).
- **Date:** 2026-10-12
- **Source:** the owner, who wants the tabs to wear the same header as Home, as the big grocery apps do

## Context

Home wears a tinted header: the delivery promise, the address, the profile button, and under them a search bar that stays at the top
as the page scrolls. The other tabs wore a different one (the aubergine block, then a collapsing header built only for Categories). The
same app showed three headers, and the search bar at 52 dp was taller than it needed to be.

## Decision

1. **Home, Categories and Orders share one header** (`TabHeader`, with the identity row in `HeaderIdentity`, which Home uses too): the
   delivery promise, the address, the profile button, on Home's "All" tint, with the search bar under them. It behaves as Home's does:
   the upper part slides up and out with the finger and the search bar (with a rail under it, if the tab has one) stops under the status
   bar. It only moves, on the phone's animation thread.
2. **Home keeps the extras; the tabs leave them out.** The shops row, the category tabs and the offers stay on Home. On Categories the
   page is the categories; on Orders it is the orders.
3. **The rail slot** (where Home keeps its category tabs) holds a tab's own filter. Orders puts two chips there, "In progress" (with
   the count) and "Past orders". Until the shopper chooses, it opens on what is in progress, or on past orders when nothing is.
4. **The search bar is compact: 44 dp tall**, a 12 dp radius, 16 px text, with its touch area made up to 48 dp. This is the one search
   bar for the whole app, Home included.
5. **Only Categories and Orders adopt it now.** The cart and every secondary screen (checkout, delivery time, coupons, addresses,
   Help, Settings, an order's page, the item and shop pages) keep their own headers. A further tab-like screen can adopt `TabHeader`
   later if it is searched or browsed first; that is a decision to make then, not a default.
6. **Tabs that are kept do not replay their skeleton** (`quietReturn`, `backgroundReady`), as before.

## Consequences

- One header to keep right for the three tabs, and the same tint on every tab, so switching tabs never changes the header.
- `SearchHeader` (0027) is gone. `AppHeader` remains for the secondary screens (0026).
- The count that Orders showed as a line under its title now shows on the "In progress" chip.
