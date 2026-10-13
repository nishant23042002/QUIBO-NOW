# 0047. Need cards and Small prices are redesigned, and only where they live

- **Status:** Proposed (Phase 1, sub-phase 1l). Builds on [ADR 0044](0044-home-is-organised-by-departments-and-needs.md) (the need
  cards) and [ADR 0046](0046-one-list-of-categories.md).
- **Date:** 2026-10-13
- **Source:** the owner, who found both sections plain and chose one of three variants of each from a Canva board

## Context

"Shop for your need" was a row of flat tinted rectangles with a small emoji in a white circle, and "Small prices" reused the same
compact product card as every other row, with an outlined ADD inside the picture and the price as a small badge under it. The owner
asked for a more modern, premium look that sits with the rest of Home. Three variants of each were drawn; the owner chose A for the
need cards and B for Small prices.

## Decision

1. **Need cards (variant A, soft editorial).** 164 by 188 dp, radius 24, the need's soft tint, and the art filling the card: one main
   picture and two smaller ones in the same three places on every card, with the words over the lower part of it on a plate of the
   card's own colour (92% opaque) and a small round arrow. The plate is a fixed height and top-aligned, so every card's name and kinds
   sit on the same lines. The card is the button; the arrow only says so. The art stays emoji (three per need, which stay sharp on a
   phone where one very large emoji would soften) until each need has a picture, as the categories now do.
2. **The quick filters under the banner** read as buttons that filter: a sliders badge leads the row, each chip carries a small
   picture of what it does (all, clock, tag, rupee, leaf), is a little taller (40 dp) and has a hard edge under it like the price
   badge's. The chosen chip is filled with the action colour (aubergine in the light theme, pistachio in the dark) and its edge is
   pistachio. This is a `tone` option on `Chip`, used by that row only; every other chip keeps its look.
3. **Small prices (variant B, price first).** The three tiers are one segmented control (a lilac track, the chosen option a white pill
   with a hairline). Each item is a `PriceTile`: a tinted picture, then one row with the price large and bold on the left and a pistachio
   ADD (turning into the stepper) on the right, then the name, the pack and a delivery or low-stock line.
4. **Only Small prices changes its card.** `ItemTile` and `ProductCard` are used by ten screens and are unchanged. `PriceTile` keeps
   everything they do (the cart wiring through the same `ItemControl`, the vegetarian mark, the saving ribbon, "out of stock" and the
   low-stock warning) and differs only in arrangement, because this is the one row where price is the point.
5. **Stepper gains an `accent` option** for the filled ADD; the stepper it turns into is unchanged.

## Consequences

- There are now two card shapes on Home. If the price-first card is wanted everywhere, that is a separate change touching ten screens,
  their skeletons and any flow that taps ADD.
- The skeletons take the new sizes (a need card 164 by 188; the tiers a 48 dp track; a price tile from the same measurements as its
  text block), so nothing moves when a row loads.
- No new words and no new dependency. The text stays at 14 dp or more, and the controls keep their 48 dp touch areas.
- The Canva boards were direction, not specification: their sample copy and prices were wrong in places, so the sizes and words here
  come from the app's own tokens and message files.
