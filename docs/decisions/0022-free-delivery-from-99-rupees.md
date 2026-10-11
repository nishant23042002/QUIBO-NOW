# 0022. Free delivery from 99 rupees

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-11
- **Source:** the owner

## Context

Free delivery began from 199 rupees of items (a sample, until each town's fee rules arrive in Phase 2). The owner decided
to lower the line to 99 rupees.

## Decision

1. **The free-delivery line is 99 rupees of items** (`ZONE.freeDeliveryFrom` = 9,900 paise). It is judged the same way as
   before: on the whole cart, before any coupon, and a tip never helps reach it (ADR 0009, ADR 0011).
2. **It is still a zone setting**, not screen code. Every screen reads it from one place (`FREE_DELIVERY_FROM` /
   `ZONE.freeDeliveryFrom`): the Home offer, the floating note, the cart, the price details, the shop page and checkout. Nothing
   else changes when a town sets a different line, including the Hindi and Marathi text, which take the amount as a value.
3. **Tests follow the zone's line** instead of a typed-in number, and the test basket sits below it.

## Consequences

- At 99 rupees most baskets are free delivery, so the "₹X more" note shows only for small carts. The nudge matters least
  where it was meant to matter most, so the next offer (a coupon or a bigger line for far trips) may be worth a look.
- **Economics:** the plan's unit-economics example assumes about 20 to 25 rupees of delivery and small-basket fees per
  order (`docs/PLAN.md`, section 14). With a 99-rupee line that income mostly disappears, and the minimum fee is 12 rupees.
  `docs/PLAN.md` carries a note saying so; the table has not been recalculated. Decide before the pilot whether handling
  fees, a small-basket fee or a distance-based exception will carry the delivery cost.
