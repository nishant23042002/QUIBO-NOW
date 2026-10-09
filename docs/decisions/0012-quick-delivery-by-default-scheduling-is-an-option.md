# 0012. Quick delivery by default, scheduling is an option

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the product owner's correction during Phase 1d; supersedes "we promise a delivery window, never minutes" in
  `CLAUDE.md` and `docs/PLAN.md`, and the clock-window rule in ADR 0008

## Context

The cart was built as a scheduled-delivery app: one default window ("Today 4-6 PM"), with slots to pick from. The product is
a quick-commerce app. Customers expect to order and get it within minutes, and to schedule a time only when they prefer
one.

## Decision

1. **Quick delivery is the default.** The cart says "Delivering in 10-15 mins" (or 15-20, and so on). The time is an
   **estimate shown as a range**, worked out from the trip and the order, never a fixed figure: packing time, the
   distance, a little more for a big order, and more in a rush hour, on a festival day or in rain, up to a top. Its rules
   are zone settings (`ZONE.quick`), not screen code.
2. **Scheduling is the option.** A "Schedule" button on the cart opens a page where the customer picks **Quick delivery**
   or **Schedule delivery**: a one-hour window today or tomorrow, windows too soon to pack removed, full ones shown but
   locked, each with its delivery fee. The choice is kept on the phone and feeds the delivery fee (the hour of the window).
3. **Quick delivery runs between the first and last hour of the day** (sample: 7 AM to 9 PM). Outside them it is shown as
   closed and the order falls back to the earliest window. A chosen window that has passed or filled falls back to quick
   delivery.
4. **Minutes are an estimate, not a promise.** There is no fixed "10-minute" brand claim, no countdown timer, and no
   penalty for a rider who is late (those rules in `CLAUDE.md` stay). The cart says "usually", and longer in rush hour or
   rain.
5. **One order, one delivery** (ADR 0009) is unchanged: quick or scheduled, a cart is one order with one rider and one
   bill, and the schedule page shows its items under "View items".

## Consequences

- `CLAUDE.md` and the matching lines of `docs/PLAN.md` now say minutes are an estimate and a window is a choice, instead of
  "windows, never minutes".
- Home and the product page still show a sample window ("Delivery today, 4-6 PM"). They should show the quick estimate
  too; that is a later change across those screens, not part of the cart.
- The PLAN notes that platforms were asked to drop "10-minute" branding (January 2026). Showing a computed range, never a
  fixed minute count, is how the app stays on the right side of that; legal review before launch is advised.
- The backend (Phase 2) needs each town's quick-delivery rules and operating hours as settings, and a rider-side estimate
  that matches what the customer was shown.
