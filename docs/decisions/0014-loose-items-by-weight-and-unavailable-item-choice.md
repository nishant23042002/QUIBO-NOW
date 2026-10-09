# 0014. Loose items are sold by weight and billed on the weighed amount; the shopper chooses what happens when an item is unavailable

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the product owner's approval of Phase F of the cart

## Context

Vegetables and fruit are bought by the kilogram, not in fixed packs. Stores weigh them as they pack, so the weight that
arrives is never exactly the weight asked for. Separately, small stores run out of things, and the shopper should say in
advance what to do rather than be surprised.

## Decision

1. **Loose items.** A loose item has one pack, priced per kilogram, and the quantity in the cart is in kilograms, added by
   the half kilogram (0.5 up to 10). It counts as one item however many kilograms. What it comes to is shown as an estimate
   (with a leading "≈") with a note that it is weighed when packed.
2. **Billing on the weighed amount.** `settleWeight` bills the actual weight in thousandths of a kilogram, rounded in integer
   paise, and never more than a tolerance over the weight ordered (5%, a zone setting). A lighter pack is refunded; a
   heavier one within the tolerance is charged the difference. The shopper never pays for more than they asked for plus the
   tolerance.
3. **Unavailable items.** The shopper chooses once for the order, and may choose differently for any item: swap it for the
   closest match (never at a higher price than the item chosen), leave it out and refund it, or call the shopper first.
   The default is to swap. The choices are kept on the phone and the per-item ones are forgotten when the cart is emptied.
4. **Not built here.** Weighing, the swap and the refund happen in the store portal (Phase 3 and 4) and the driver app
   (Phase 5 and 6). The customer app records the choice and shows the promise.

## Consequences

- `CartEntry.loose`, `PackLimit.mostPerOrder`, `HomePack.loose` and the `weights` and `substitute` message groups are new;
  a saved cart may now hold half kilograms.
- A fifth promise ("Pay for what you get") appears only when the cart holds a loose item.
