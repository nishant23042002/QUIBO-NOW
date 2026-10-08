# Phase 1: product page (PDP) review

Walkthrough of the product page as built at commit `59649e2` plus the ADD button added to the title card. Checked in
the web preview in English light, Hindi dark and Marathi dark, at a 360 dp width. Nothing here is built yet: this is
the list to choose from. Items are marked **P0** (fix soon, it is wrong today), **P1** (the page feels incomplete
without it), **P2** (polish) and **Later** (belongs to a later sub-phase).

## What works

- **Gallery:** swipe, thumbnail strip, count, ribbon on top, one picture shows no strip; stand-ins until photos exist.
- **Sizes:** each pack has its own price, stock and cart line; price per litre, kilogram or piece; best-value mark;
  an out-of-stock size is dimmed and cannot be chosen.
- **Adding:** the inline ADD in the title card and the sticky bar share one state (the chosen pack's count).
- **Header:** delivery window and address, back, search (opens search), share (opens the phone's share sheet);
  the name turns into a product card (picture, name, price) after the picture scrolls away; Home tint, light border.
- **Detail:** trust tiles, highlights with View more, information, seller details, sold-by card, two rails.
- **States:** loading skeleton that matches the page and cross-fades in, item-not-found with a way back.
- **Navigation:** back steps through items opened from one another; deep link to `/product/<id>`; bottom bar kept.
- **Languages and themes:** English, Hindi and Marathi, light and dark, all laid out without overflow at 360 dp.

## Wrong today

1. ~~**P0, stock is not enforced.**~~ Fixed: see "Done since this review".
2. ~~**P0, an empty cart bar is still read out.**~~ Not a bug. The bar and the undo toast are already hidden from
   screen readers while they are hidden on screen (`aria-hidden` on the root, touches off). The browser tool I used for
   the walkthrough lists hidden elements too, which made it look as if they were announced. Checked in the page: the
   bar has `aria-hidden="true"` and `pointer-events: none` when the cart is empty.
3. **P1, fixed heights break at 200% text.** The header's product card (50 dp), the delivery line (36 dp) and the
   size options use fixed heights. At the largest text size they will clip. Needs a check on a phone and `minHeight`
   instead of `height`.
4. **P2, the insight card stays open** when you swipe the pictures, change size or scroll, and a tap outside it does
   not close it. It should close on any of those.
5. **P2, two ADD buttons are always on screen** (title card and sticky bar). Keep the sticky bar, but show it only
   once the title card's button has scrolled out of view, or keep both and say so in the design.
6. **P2, the share link is an app link** (`exp://` in Expo Go), useless to someone without the app. Fine until Quibo
   has a public web address; then share that.

## Missing

- **P1, loose items sold by weight.** PLAN sections 6 and 10 say vegetables and fruit are sold loose, in 0.5 kg
  steps, with "estimated weight, final bill after weighing" and a substitution choice. The page only knows fixed packs.
  Needs the weight stepper on the page, the tolerance note, and a "if it is not available" choice (build with the cart,
  sub-phase 1d).
- **P1, delivery information for every item.** Only items that can come in the next window say anything about delivery.
  Everything else says nothing. Under ADR 0009 the window comes from the slowest shop of the whole order, so the page
  should say "Comes with your order, in your delivery window" and show the window when it is known.
- **P1, offline and error states.** The project rule is loading, empty, error and offline on every screen. The page has
  loading and not-found only. Needs a "could not load, try again" state and an offline notice (sub-phase 1h, with the
  decision on the network library).
- **P1, labelling that a pack carries by law:** who made or packed it and where, when it was packed, best before or use
  by, and the unit price in the same place as the MRP. Today the page has the seller and shelf life only. Add "Packed
  on" and "Best before" and the packer's name and address to Information.
- **P1, per-size cart count.** The size picker should show "2 in cart" on a size already added, so the shopper does not
  have to remember.
- **P2, brand line** above the name for packaged goods (the plan's catalogue has a brand field).
- **P2, out of stock help:** a "Tell me when it is back" button, and alternatives (the sizes and the similar rail
  already help; the all-sizes-out case has no screen).
- **P2, "Bought before" cue:** "You bought this 2 times" with a link to the past order, once orders exist.
- **P2, nutrition and allergen facts** for packaged food.
- **P2, picture viewer:** full-screen with pinch to zoom, and a fallback picture when a photo link fails.
- **Later, ask the shop:** a button on the sold-by card opening a WhatsApp chat with the shop, with the product
  filled in (PLAN: click-to-chat per shop is a launch feature). Needs the shops' phone numbers.
- **Later, address change:** the delivery line should open the address screen (sub-phase 1e).
- **Not planned, on purpose:** ratings and reviews (the plan is rating-free; trust comes from the verified shop).

## Could be better

- **Order of the cards.** Four trust tiles sit between the sizes and the product facts, so the first product detail
  is about 1,000 dp down. Better: title, sizes, highlights, a compact one-row trust strip, information.
- **Insight card discoverability.** The sparkle button is easy to miss. A one-time soft pulse the first time a shopper
  opens a product, or a small label, would help; the card could also change with the chosen size (unit price does,
  the rest does not).
- **Sticky bar content.** It shows only the price. It could add the pack ("500 ml") so it is clear which size ADD adds.
- **Title card.** The name is 36 dp and can run to four lines in Hindi and Marathi; the diet mark and the word
  "Vegetarian" say the same thing twice (keep the mark, put the word in its accessibility label).
- **Code.** `ProductView` is about 450 lines. Split into a title card, a size card, a trust card and the information
  cards, each with its own skeleton, so the page and its skeleton stay in step more easily.
- **Tests.** There are unit tests for pack maths, cart maths and the helpers. There is no flow test for the page. Add a
  Maestro flow (open a product, change size, add both sizes, open the cart) in sub-phase 1h.

## Suggested next steps

1. Fix **P0** items 1 and 2 (small, and both are wrong today).
2. Do the delivery-information line and the per-size cart count (small, visible).
3. Reorder the cards and shrink the trust tiles (decide the look first).
4. Weight-based items with the cart screen (1d); offline and error states in 1h.

## Done since this review

- **Per-size cart count:** each size in the picker shows a small cart badge with how many are in the cart.
- **Packaging labels:** Information now has Packed on, Best before, Packed by and the packer's address (sample names and
  addresses, marked as samples). Packed-on dates are today for fresh things and earlier for packaged goods; best before
  is worked out from the shelf life.
- **Offline and error states:** a full-page "You are offline" and "Something went wrong" with Try again, and a notice
  at the top of a page that is already showing when the network drops. The page loads again by itself when the network
  returns. On a phone the network cannot be detected yet (needs the netinfo library, to be approved); development builds
  have two switches on the Profile screen to rehearse both states.
- **Bug found and fixed on the way:** after opening one product and going back, opening another and going back took
  you to the first product instead of Home. The back trail is now only the items opened from a page's own rows.
- **Stock is enforced.** A pack with "Only 3 left" can have at most 3 in the cart: the cart cuts any bigger request down
  to the stock, the + button goes dim at the limit and is named "No more available" for screen readers, and the product
  page says "All 3 we have are in your cart". Packs with no stock figure still stop at 20.
