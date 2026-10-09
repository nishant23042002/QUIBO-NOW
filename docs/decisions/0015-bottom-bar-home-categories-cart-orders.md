# 0015. The bottom bar is Home, Categories, Cart and Orders

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the product owner, while reviewing the bottom navigation (amends ADR 0010, decision 4)

## Context

The bar had Home, Order again, Categories and Orders. The cart could only be reached from the floating cart bar on Home
and on item pages, and "Order again" and "Orders" are two views of the same thing: what the shopper has bought before.

## Decision

1. **The bar is Home, Categories, Cart, Orders.** The cart is a tab, so it is one tap from anywhere, with a count of the
   items on its icon.
2. **Order again lives inside Orders.** Past orders each offer "Order again", and Orders also shows a short row of things
   bought before. There is no separate tab for it.
3. **The Cart tab stays lit through the cart's steps** (delivery time, coupons, address, checkout). Shop pages, item
   pages and search belong to Home and keep Home lit.
4. **Icons are drawn with the thin line.** Text uses a weight scale with nothing at 700 or above.

## Consequences

- The floating cart bar on Home and item pages stays: it shows the total and how close the cart is to free delivery,
  which the tab's count does not.
- The Orders screen (built in a later section of Phase 1) includes the "Order again" row and its empty state.
