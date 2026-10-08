# 0009. One order can hold several shops, with one delivery

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-08
- **Source:** the product owner's clarification during Phase 1a; replaces "orders stay single-shop in the MVP" in `docs/PLAN.md` section 6

## Context

PLAN section 6 assumed every order has exactly one store. The intended experience is different: a customer
fills one cart from any shops in town, and one delivery partner collects it all and brings it as one order.
The customer never sees several riders arriving at different times.

## Decision

1. **One cart is one order.** The cart, the bill, the payment, the promised window and the tracking page are
   all per order, not per shop.
2. **Each shop packs its own part.** A new `order_shop` row (order, store, status, subtotal) holds that
   shop's share. Items belong to an `order_shop`. The store portal, the accept and pack steps and the
   dark-store pick task work on `order_shop`, so partner mode and dark mode stay behind `FulfilmentStrategy`
   as before (ADR 0002). A dark-store order is simply an order with one `order_shop`.
3. **One delivery, many pickups.** `delivery` stays one per order. The rider's route is the order's
   `order_shop` pickups, then the customer. Batching several orders onto one ride stays a later option.
4. **Status.** Order status and each `order_shop` status both change only through
   `OrderStateMachine.transition()`, each change writing an `order_event` row (with the `order_shop` id when
   it is about one shop). The order moves to "out for delivery" only when every non-rejected shop part is
   picked up.
5. **If one shop cannot fill its part**, the shop rejects or short-picks its part; the customer is offered a
   substitute or a removal for those items only, and the rest of the order carries on.
6. **Money.** Free delivery counts the whole cart's value. The delivery fee is one per order. Whether an
   extra pickup charge applies for each shop after the first is an open question for the pricing work in
   Phase 2.
7. **Promised window.** It is set from the slowest shop's pack time plus the trip, shown as a window, never
   as minutes. Item and shop labels such as "Today 4-6 PM" are inputs to that window, not separate promises.
8. **Settlement.** Each shop is paid for its own `order_shop` subtotal through the ledger; the rider's payout
   and any cash collected are per delivery.

## Consequences

- No contract or database change yet: Phase 0 has no order schema. The `Order` and `OrderShop` Zod contracts
  are written in the first phase that needs them.
- The Phase 1 cart shows items grouped by shop, with one total, one free-delivery line and one delivery window.
- The driver app (phases 5 and 6) shows one job with several pickup stops.
