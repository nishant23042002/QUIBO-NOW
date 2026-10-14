# 0052. A switch leaves three sections off Home until a customer's first order

- **Status:** Proposed (Phase 1, sub-phase 1l). Builds on [ADR 0048](0048-daily-essentials-and-home-order.md).
- **Date:** 2026-10-14
- **Source:** the owner, who wanted Home's first view for a new customer to be shorter, and to be able to turn that on and off from the
  environment file

## Context

Home carries nine sections. A customer who has never ordered has not yet learned "needs", has no favourite brand and has not browsed
the categories, so three of the sections repeat what the categories and Daily essentials already offer, or ask the shopper to know
something they do not yet know.

## Decision

1. **A build-time switch, off by default:** `EXPO_PUBLIC_HOME_FIRST_RUN_LEAN` in the environment file (`true` or `false`). Anything
   other than `true`, or nothing, leaves Home exactly as it is. The shared environment schema (`packages/config`) accepts only `true` or
   `false`, so a bad value fails and names the variable.
2. **What it leaves out:** "Shop for your need", "Small prices" and "Featured this week". Shop by brand stays (owner's choice). They are
   one list, `HIDDEN_FOR_NEW_CUSTOMER`, so another can be added or removed in one place.
3. **Until the first order.** A customer who has placed any order (a cancelled one counts) sees the full Home. No new storage is
   needed: the orders the phone already keeps decide it.
4. **Never wrongly hidden.** Until the saved orders have been read back, nothing is left out, so a returning customer never loses a
   section for a moment.
5. **The loading skeleton follows the same decision**, so nothing jumps when the real sections arrive.

## Consequences

- The value is written into the app when it is bundled: change it, then restart the bundler. It is not a per-customer setting and
  holds no secret.
- With the switch on, the Maestro step that looks for "Shop for your need" on Home will not find it for a customer with no orders; the
  flows run with the switch off.
- When orders come from the API (Phase 2), "has ordered" is read from there instead of the phone; the switch and the list stay.
