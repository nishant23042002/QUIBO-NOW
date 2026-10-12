# 0030. Cart taps redraw one card, and crossing free delivery is a moment

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner: adding and changing quantities felt slow, the + and - gave no sense of being pressed, and nothing told the
  shopper the cart had become worth free delivery

## Context

Every change to the cart redrew every item card on the page: the cart's value was one object read by all of them, the catalogue was
rebuilt and re-indexed on each change, and the screen that holds the cards read the whole cart too. On a small phone that is tens of
cards redrawn for one tap, so ADD and + answered late.

## Decision

1. **A card reads only its own number.** The provider keeps a small store of how many of each pack (and how many items), settled from
   the cart in the same frame it commits (`quantityStore`, `useQuantity`, `useCartCount`). Cards and `HomeFeed` are memoised, so a tap
   redraws the tapped card, the cart bar and the badge, and nothing else (measured: one card redrawn, down from every card).
2. **The action is steady.** `useCartActions` hands out a function that never changes, so holding it does not redraw a card.
3. **The catalogue is built once per language** and indexed once, not on every change. When the order arrives (`useDeliveryWhen`)
   is worded once by the provider and shared; reading it does not subscribe to the cart.
4. **The press is seen at once.** ADD dips and takes the lilac under the finger, and - and + dip and dim, before the cart has
   changed anything; the count still bounces when it does.
5. **Crossing into free delivery is a moment.** When the cart goes from not free to free while it is in use, a note rises above the
   cart bar (scooter, pistachio tick, a few flecks flying out) and goes by itself after a few seconds, or on a tap. It follows the
   same rule as the undo note for where it rests, and says nothing when the app opens on a cart that was already free. With "reduce
   motion" on it simply appears. The cart bar and its note say it for as long as it is true.

## Consequences

- A screen that only needs a count or one pack should use `useCartCount` or `useQuantity`, not `useCart`, so it is not redrawn by every
  change. `useCart` stays for the screens that show the whole cart.
- No new dependency. Tap feedback with the phone's vibration (haptics) would need one and is left until it is asked for and approved.
