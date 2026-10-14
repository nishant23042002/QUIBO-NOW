# 0053. Trust-first positioning, a flat-fee shop plan and standing orders

- **Status:** Accepted (2026-10-14). `PLAN.md` and `CLAUDE.md` were updated the same day; the app needed no change
- **Date:** 2026-10-14
- **Source:** the product owner's handwritten notes on the concept (hygiene and trust, flat-fee shops, scheduled and daily
  delivery, exclusive items, pharmacy)

## What the notes say

1. **Worry about the giants' dark-store model.** Customers cannot see where an order comes from: how the products are kept
   and whether the place is clean. That is a hygiene and trust problem, not only a cost problem.
2. **Solution: a city-wide hyperlocal app that connects stores near the customer** that they already visit and trust. The
   store handles cleanliness, and trust comes from having seen the shop. Coverage follows store locality and population.
3. **Stores:** list their products with **no commission**, paying a **flat fee** (monthly, weekly or yearly subscription).
   They get digital visibility on the app. They can run offers and show what is new, and can showcase app-only products.
4. **Customers:** order online, delivered within minutes or at a scheduled time, for a small item, a medium basket or a whole
   **monthly ration**. A **daily schedule** (milk, bread and similar) on chosen days or alternate days. **Exclusive items**
   that no store in Roha stocks. **Pharmacy** at the doorstep, and more.

## Where the current plan already agrees

- Partner shops by default; a company store only as a switchable option (ADR 0002, PLAN sections 1 and 7).
- Quick estimate by default and a scheduled window as the option (ADR 0012); one order, many shops, one rider (ADR 0009).
- Shop-first browsing, FSSAI per shop, `town_id` everywhere, zones and fees as data.
- Nothing built so far depends on commission: the customer app has no commission logic, so the change is in the plan and the
  data model, not in the screens.

## Proposed decisions

1. **Positioning.** The lead reason to choose Quibo is trust: "packed by a shop you know, in your own town", with no hidden
   dark store for everyday items. Cost and reach remain the second reason. Dark-store mode stays a fallback and is never
   the headline.
2. **Revenue: no commission.** Shops pay a flat plan fee. Customers pay delivery and small-basket fees. Replace
   `store.commission` with a plan and a subscription (`store_plan`, `store_subscription`, a billing invoice). Visibility on the
   app is included in the plan and is not sold separately.
3. **Standing orders** (daily, chosen weekdays, alternate days, or a monthly list on a date). A standing order is a template
   that creates ordinary orders through the normal order flow. It is not a new order type, so `OrderStateMachine`, payment
   idempotency and the ledger are unchanged. Promote it from V2 to the first release after the customer app goes live.
4. **Store offers and "new in your shops".** Shops create offers (price, bundle, validity); ops moderates. Home shows them
   in the Offers and a "New from your shops" module. Prices stay at or below MRP.
5. **Trust made visible.** A hygiene checklist and photos at onboarding, a "visited and verified" mark, a hygiene line in the
   weekly shop score, and the shop named wherever an item is shown.
6. **Exclusive items** are a small company catalogue sold as "Only on Quibo", delivered by schedule (usually next day), held
   by the one company store that hybrid mode already allows or by a pickup-point shop. The company is then the seller of
   those items (GST invoice, FSSAI for food). Not in the first release.
7. **Pharmacy** is a store type held by licensed chemists, in two stages: non-prescription items first, then prescription
   upload with a pharmacist check. It leaves the "deliberately not built" list and becomes a V2 item behind legal review.
8. **Coverage by locality.** Expansion inside a city goes by ward clusters ranked by population and shop density. A
   multi-shop order is only allowed when the shops are close enough for one trip.

## What changes in the documents (after approval)

| Document                    | Change                                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PLAN.md` section 1 and 2   | Trust and hygiene become the first reason; cost and reach second                                                                                                     |
| `PLAN.md` section 3 and 4   | Town filters add ward population and shop density; new rows for visible hygiene and daily needs                                                                      |
| `PLAN.md` section 5 and 6   | Standing orders earlier; store offers; plan and billing in admin and the store portal; pharmacy and exclusive items staged                                           |
| `PLAN.md` section 7         | Shop agreement becomes a flat-fee plan with a trial month; hygiene checklist in onboarding and the weekly score                                                      |
| `PLAN.md` section 10        | Remove `store.commission`; add `store_plan`, `store_subscription`, `offer`, `standing_order`, `standing_order_run`, `store.kind = pharmacy`, `master_item.exclusive` |
| `PLAN.md` section 11        | GST on plan invoices, drug licence, prescription data under DPDP (all to confirm with a CA and a lawyer)                                                             |
| `PLAN.md` section 14 and 15 | Re-run the economics without commission; the revenue-model decision is closed                                                                                        |
| `CLAUDE.md`                 | One sentence in "What we are building": shops pay a flat plan, there is no commission                                                                                |

## Consequences and the one number that matters

- With no commission, each order loses money on the plan's own section 14 inputs: fees of about Rs 25 against about
  Rs 37 of rider, gateway, refund, messaging and support cost, so about minus Rs 12 an order with the levers (minus Rs 22 in the base case). Free
  delivery from Rs 99 (ADR 0022) makes this worse. The plan fees must cover the fixed cost and this gap: at 100 orders a day
  and Rs 60,000 of fixed cost that is roughly Rs 97,000 a month, or about 100 shops at Rs 999. These are illustrative and need the
  pilot's real numbers.
- So the delivery-fee policy has to be set together with the plan price: raise the free-delivery line, let nearby shops
  deliver themselves (the plan already has `self_delivery`), or both. These are zone settings, not code.
- Recurring orders need a rule for stock-outs, shop holidays, price changes and a cut-off time before each run.

## Decisions made by the product owner (2026-10-14)

1. **Plan periods:** monthly, quarterly and yearly. Prices in `PLAN.md` section 14 are working defaults to test (Rs 499, Rs 1,299,
   Rs 4,499), with a free trial month.
2. **Delivery fee stays.** The flat plan is what shops pay to be listed, in the way a ride app charges its drivers a plan
   instead of a cut. Customers keep paying delivery and handling fees (ADR 0011, ADR 0022).
3. **Exclusive items and pharmacy are placeholders.** They appear as "Coming soon" with a notify-me tap and are decided in a later
   phase. Nothing is sourced, licensed or built for them at launch (decision 6 and 7 above are therefore deferred).
4. **Dark-store mode is unchanged.** It stays a secondary mode behind the town setting (ADR 0002). It can be switched on, left
   alone or removed later; no code, data model or plan section for it was changed.
5. **Trust is shown to the customer**, plainly and without naming a competitor (ADR 0054).
