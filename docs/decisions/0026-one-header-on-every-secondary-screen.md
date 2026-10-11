# 0026. One header on every secondary screen: the deep aubergine block

- **Status:** Accepted (Phase 1). Replaces the header rules of [0008](./0008-design-system-aubergine-and-pistachio.md) and [0010](./0010-customer-design-direction-home-first.md) for every screen except Home and the item page.
- **Date:** 2026-10-11
- **Source:** the owner, who saw three headers in one app and chose option B from a board of three

## Context

Orders, Categories, Settings and the shop page wore a dark flat bar (`AppHeader`). The cart, checkout, delivery time, coupons,
addresses, Help and an order's page wore a lilac block with a rounded lower edge (`CartHeader`). Home and the item page wear the tint of
their category. Three looks for the same job read as inconsistent, and none of the secondary screens said what it was about beyond a
title.

## Decision

1. **One header, `AppHeader`, for every screen except Home and the item page**: the deep aubergine (`chrome`) in both themes, a rounded
   lower edge (16 dp), a pale round back button and a share button where there is one, the title, and an optional line under it
   (`subtitle`). `CartHeader` is gone; its screens use `AppHeader` with the same props.
2. **A tab that is not Home has no back button**, and its title starts where the cards' text does.
3. **Lines under the title only where there is something real to say**: the cart and checkout keep their item count; Orders says how
   many orders are in progress (`orders.activeCount`, English, Hindi and Marathi, the last two drafts) and says nothing when none is.
   Settings, Help and the others carry the title alone. A line fits inside the fixed 56 dp, so the header is no taller.
4. **Status bar text is light everywhere it is used** (the header is dark in both themes). Screens in the tabs set it only while they are
   in front (`ScreenStatusBar`), so a screen left behind cannot override Home's dark text on its pale tint; the root stack's Settings
   header sets it always (`statusBar="always"`).
5. **Home and the item page keep their category tints.** That is the aisle identity, and the shared rounded shape ties them together.

## Consequences

- One component to change when the header changes, and one look to check in both themes.
- `AppHeader`'s `logoLabel` (the logo on a first screen) has no screen using it now; it is kept with the logo itself.
- The earlier ADR lines "the header is dark in both themes" (0008) and "the header is no longer dark" (0010) now apply only to the
  parts they describe: Home's tinted header and the dark in-house screens respectively.
