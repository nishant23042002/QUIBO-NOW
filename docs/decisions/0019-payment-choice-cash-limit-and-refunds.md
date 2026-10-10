# 0019. Payment choice, the cash limit and refunds

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-10
- **Source:** the Phase 1 plan for checkout and tracking (1f)

## Context

PLAN section 4 makes cash on delivery and UPI side by side, both first-class, because a shopper in a small town often pays the
rider in cash. Cash has a cost: the rider carries a stranger's money, and the plan limits it for new customers. Phase 1 has no
server and no payment gateway, so what is built must still behave the way the real thing will, and must not become a habit of
moving real money or storing card details.

## Decision

1. **Two ways to pay, always both shown.** Cash on delivery is the default. UPI is the other. A choice that cannot be used is shown
   greyed out with the reason, never hidden.
2. **Cash has a limit for new customers.** An order above it is paid by UPI. The limit is `payment.codMaxNewCustomer` in the zone
   settings (1,000 rupees to start with, in paise), not in a screen. Phase 1 has no order history, so every shopper counts as new;
   the rule that decides who is new arrives with the server.
3. **UPI is a test sheet.** It shows "Test payment. No real money moves." and two buttons, pay and make this payment fail. Nothing
   collects a UPI id, a card or any credential. A failed payment leaves the cart as it was and offers cash when cash is allowed.
4. **An order is placed once.** A key is made when checkout opens. Asking to place the same order twice (a double tap, a retry after
   a slow answer) returns the one order. This is the same idempotency rule the server will apply to orders, payments and webhooks.
5. **The cart leaves only when the order is saved.** What was bought, the coupon, the tip and the chosen delivery time are cleared
   once the order exists. What is saved for later and the rider instructions stay.
6. **Money is a status, never an edited balance.** Cash is `to_collect` until the order arrives, then `paid`. A UPI payment is
   `paid` when the order is placed. If a paid UPI order ends rejected, cancelled or undelivered it becomes `refunding`, in the same
   move as the status change. A cash order that does not arrive is never paid, so the screens say nothing was charged. The real
   ledger and the refund itself are Phase 2.
7. **Words about money are never a promise.** "Arriving in about 25 to 30 mins. An estimate, not a promise." A refund says "3 to 5
   working days", which is how long a bank takes, not a guarantee of ours.

## Consequences

- The limit, and later the rules for who is new, can change without a release, because they are data.
- Phase 2 swaps the test sheet for a gateway (PLAN, the technology table) and the `refunding` status for ledger entries; the screens read the
  order's own payment, so they do not change.
- The cash limit is one number for every shopper until there is history to tell a new customer from a regular one.
- Who may cancel and when is decided by the order's status table; today it is a screen rule, and the server will own it.
