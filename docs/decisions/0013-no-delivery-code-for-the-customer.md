# 0013. The customer never reads out a delivery code

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the product owner's correction during Phase 1d (the cart's trust promises)

## Context

The plan listed a "customer OTP or photo at the door" and a "drop OTP" in the driver app, and the cart's first promises said
"you get a 4-digit code; share it only when your order is in your hands". The business does not want a code for the customer
to give the rider.

## Decision

1. **No delivery code.** Nothing in the customer app, the order tracking or the driver app asks the customer for, shows the
   customer, or has the rider enter a code to complete a delivery.
2. **Proof of delivery is the rider's own.** A photo at the door, or the rider marking the order delivered, with the
   order's own event recorded (`order_events`), as for every status change.
3. **The cart's promise is about care, not a code.** The tile is "Careful handover": the rider follows the customer's
   delivery instructions and hands the order over with care.
4. **What stays:** the shop's pickup code (the rider shows it to collect from the store), and the phone login OTP (first
   run, section 1e), which is about signing in, not delivery.

## Consequences

- `docs/PLAN.md` (delivery proof, the driver app, the driver-live phase) and the Phase 1 notes (order tracking) no longer
  mention a customer or drop OTP.
- Cash on delivery still needs the rider to record the cash collected; that is separate from proof of delivery.
