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
2. **A tap shows at once; the cart is worked out right after.** The control and the cart bar read the same store, and a tap writes
   an _expectation_ to it (already cut to stock) before anything else, so the control, the bar and the notes above it change in the
   same frame. The cart's own update (totals, the bill, the bar's words) is a transition that follows. The cart's number confirms the
   expectation; one it never lands on is dropped after 1.5 seconds. Measured in the web dev build: the control at 12 ms, the bar
   starting at 17 ms. The card's controls are a slot (`control`), so a change redraws only the ADD and stepper, never the card.
3. **The action is steady.** `useCartActions` hands out a function that never changes, so holding it does not redraw a card.
4. **The catalogue is built once per language** and indexed once, not on every change. When the order arrives (`useDeliveryWhen`)
   is worded once by the provider and shared; reading it does not subscribe to the cart.
5. **The press is seen at once.** ADD dips and takes the lilac under the finger, and - and + dip and dim, before the cart has
   changed anything, and a thin ring goes out from the control and fades (260 ms, from the press's start). The ring is an outline
   moved by transform and opacity on the animation thread, so it costs nothing to lay out; with "reduce motion" on it does not play.
   The count still bounces when it changes.
6. **Crossing into free delivery is a moment.** When the cart goes from not free to free while it is in use, a note rises above the
   cart bar (scooter, pistachio tick, a few flecks flying out) and goes by itself after under three seconds, or on a tap. The undo note goes after the same time: long enough to read and reach
   for Undo, no longer, so neither sits over the cart. It follows the
   same rule as the undo note for where it rests, and says nothing when the app opens on a cart that was already free. With "reduce
   motion" on it simply appears. The cart bar and its note say it for as long as it is true.

7. **The limit is said, not just shown.** At the most that can be added, + stays dim but can be pressed: it gives a small shake and a
   few words above the control ("Limit reached"), once, and fades. It is named "No more available" for a screen reader. Transform and
   opacity only; with "reduce motion" on it shows the words without the shake.
8. **The bottom bar hides after a real stretch of scrolling.** It goes only after the page has been scrolled about 96 dp down from
   where the shopper last turned, and not at all in the first 48 dp; it returns after 32 dp back up, so it is easy to get back. A
   nudge or a bounce never moves it. The control and bar motions are short and firm (the bar 220 ms in, 180 ms out, the control's
   bounce about 200 ms) so they move together.

## Consequences

- A screen that only needs a count or one pack should use `useCartCount` or `useQuantity`, not `useCart`, so it is not redrawn by every
  change. `useCart` stays for the screens that show the whole cart.
- No new dependency. Tap feedback with the phone's vibration (haptics) would need one and is left until it is asked for and approved.
