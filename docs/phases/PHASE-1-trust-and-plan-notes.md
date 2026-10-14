# Phase 1 notes: trust, the shop plan and standing orders (parked)

Parked per the working rule "never build ahead". Nothing here is built; each item waits for the owner's go-ahead and a one-step
plan. Source: ADR 0053 and ADR 0054, and the mock at "Quibo Home Redesign".

## Customer app (screens designed in the mock, not built)

- Buy again module for returning customers, with "Add all" and out-of-stock named.
- Language chip in the header, a language sheet, and a one-time card for a new customer.
- Payment strip under the hero with a Pay on delivery badge (only if cash on delivery is supported).
- Know your shop (a draggable dark store against shop scene, five questions, the 0 of 5 against 5 of 5 score and a close), the
  Quibo promise and the How we check a shop sheet. "From your neighbours" was designed and then removed by the owner.
- Moment screens: launch, between navigation, order placed.
- Outside-the-delivery-area screen with Notify me and the list of towns.
- Live order card on Home, and the shops-closed state.
- Can't find something? request box; Coming soon cards (Pharmacy, Only on Quibo, and the other groups) with Notify me.
- Standing orders (daily, chosen days, alternate days, monthly list) under Orders, and "make this daily" on Daily essentials.
  Not yet designed.

## Admin and store portal (Phase 3)

- Plans and billing module: monthly, quarterly and yearly plans, trial month, renewal reminders, grace period, invoices.
- Store portal: plan and renewal, offers, "new" marks, and an "extra orders this month" figure.
- Hygiene visit checklist and photos in store onboarding; hygiene line in the weekly shop score.

## Contracts and data (Phase 2)

- `store_plan`, `store_subscription`, `offer`, `standing_order`, `standing_order_run`; remove `store.commission`
  (PLAN section 10).
- Zone settings: the free-delivery line and delivery fee set together with the plan price (PLAN section 14).

## Decided later

- Exclusive items and pharmacy: sourcing, licensing and legal route (ADR 0053 decision 3).
