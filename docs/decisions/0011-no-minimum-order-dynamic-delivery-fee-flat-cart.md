# 0011. No minimum order, a delivery fee that follows the trip, and a cart that is not split by shop

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the product owner's correction during Phase 1d; changes `docs/PLAN.md` section 6 (checkout rules) and the
  cart wording in ADR 0009

## Context

The Phase 1d cart blocked orders under 99 rupees, charged a flat 25 rupee delivery fee, and showed items in one card per
shop with a subtotal for each. None of that is the intended business:

- Small orders are welcome. They are delivered and simply pay the delivery fee.
- Delivery costs what the trip costs: the distance the rider travels, the time of day, rush hours, festival days and
  weather. It is not a flat figure.
- The town may be served by one company dark store, where an order comes from one place. Splitting the cart by store
  is pointless there, and even with partner shops the customer has one order, not several.

## Decision

1. **There is no minimum order.** Any item total can be placed. `minimum basket` is removed from the zone settings. A
   town can still set a free-delivery line (a basket value above which delivery is free), and may switch it off.
2. **The delivery fee is calculated, within hard limits.** It is a base fee from the trip's distance band, plus a set
   amount for each of rush hour, a festival day and rain, and it **never exceeds 30 rupees**. The bands, rush hours,
   extras and cap are zone settings in the database (sample data in the app until Phase 2), never in screen code. The
   chosen delivery slot (Phase 1d, phase B) feeds the time of day, so a quieter slot can cost less.
3. **The handling fee** pays for care in carrying. The most delicate item in the cart sets it (eggs are fragile, milk and
   curd are chilled, flour and oil are heavy, produce is fresh), a festival day adds a little, and it is **always under
   18 rupees** (sample: 6 to 17). One fee per order.
4. **The cart is one flat list.** Per-shop cards and subtotals are gone. In a partner town each item carries a quiet
   "Sold by" line; in a dark-store town there is nothing to tell apart. The difference comes from the data (the item's
   store), not from a branch on fulfilment mode in shared code (ADR 0002). Behind the scenes the order still has one
   `order_shop` per store (ADR 0009); only the customer's view stopped splitting.
5. **The bill is plain.** One line per charge (items, delivery, handling), the total, and what the order saves. The
   reason behind any charge is one tap away in "Why this price?", not on the bill itself.

## Consequences

- `docs/PLAN.md`: the checkout rules, the admin zone screen and the `zone` entity no longer list a minimum order; fee
  bands now include rush, festival and weather extras and a cap.
- ADR 0009 stands except for its note that the Phase 1 cart groups items by shop.
- Phase 2 needs zone fee settings that carry bands, rush hours, extras, the cap and the free-delivery line, and a way to
  measure each trip's distance (the address section, 1e, supplies the first estimate).
