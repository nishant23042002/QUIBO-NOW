# 0018. The order model and the mock order clock

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the Phase 1 plan for checkout and tracking (1f)

## Context

Checkout and tracking need an order to exist, and there is no server in Phase 1. The order has to be the shape the server will
use, so Phase 2 swaps the mock for the real thing without changing a screen, and it has to show the same timeline in every
fulfilment mode without a screen asking which mode the town is in (ADR 0002).

## Decision

1. **The order is a contract.** `OrderSchema` in `packages/contracts` holds the id, town, idempotency key, status, who accepts,
   the shops in it, the payment, the total in integer paise, and an append-only history of events. An order that breaks its own
   rules fails to parse: the history starts at `placed`, `status` is the last event, every move is one the transition table
   allows, and time only goes forwards.
2. **Acceptance is on the order, not read from the town.** When an order is placed the fulfilment strategy sets `acceptance` to
   `by_shop` (a shop must say yes) or `automatic` (a company dark store). Screens read the order, so the timeline for an automatic
   order simply has no "shop confirms" step. Hybrid towns choose per order.
3. **One door for status changes.** `transition()` in the app stands in for `OrderStateMachine.transition()`: it checks the table,
   adds the event row and returns a new order. Nothing else changes a status. Cash on delivery becomes paid when the order
   arrives.
4. **A mock clock moves the order.** It makes each move when it is due and stamps it with the time it was due, so closing the app
   and coming back gives the same history. A plan says how the order will end: delivered (the normal case), rejected by the
   shop, cancelled, or undelivered. A shop-less order cannot be rejected, so that ending becomes a cancellation.
5. **The clock is only a mock.** The plan and the pace are kept beside the order, never inside it, because a real order has
   neither. A fast pace lets a whole order be watched in about a minute; a slow one is six times slower.
6. **The customer can cancel until packing is finished**, that is while the order is placed or accepted.
7. **The order remembers how it is delivered.** `delivery` holds either the quick-delivery estimate as a range of minutes or the
   one-hour window the customer picked, taken from the cart when the order is placed. Tracking shows it as a range or a
   window, never as a countdown (ADR 0012).
8. **The clock runs while the app is open and sleeps until the next move is due.** With no connection it pauses, and when the phone
   is back it catches up with the true times. The development switch "Order speed" sets how fast the next order moves.
9. **A payment that is not needed goes back.** When a paid UPI order ends rejected, cancelled or undelivered, the same status move
   sets its payment to `refunding`. A cash order that did not arrive was never paid, so it stays as it was and the screens say
   nothing was charged.
10. **Cancelling is the customer's, until packing is finished.** Anything already due is applied first, so a late tap cannot undo a
    move that has happened: the order is left as it is and the customer is told it is too late.

## Consequences

- The timeline, shop parts and exits are plain logic with tests, and the same for both modes.
- Phase 2 replaces `transition()` and the clock with the server and real-time updates; the contract and the screens stay.
- The customer's cancel window is a UI rule today; the server will decide it from the same table.
