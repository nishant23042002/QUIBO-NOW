# 0005. Money arithmetic and formatting

- **Status:** Accepted (Phase 0)
- **Date:** 2026-10-08
- **Source:** `CLAUDE.md` ("Money is integer paise. Never floats."), `docs/PLAN.md` sections 8 and 10

## Context

The non-negotiable is integer paise. That leaves choices that every order, payment, refund and ledger
total will depend on: how loose-weight items are priced, how a half paisa rounds, whether an amount can
be negative, and how an amount is written for a customer in three languages.

## Decision

All of this lives in `packages/contracts/src/money.ts`.

1. **`Money` is a branded, signed, safe integer of paise.** A plain `number` cannot be passed where
   `Money` is expected. It is signed because refunds and ledger deltas are negative.
2. **No floating-point arithmetic touches an amount.** `add` and `subtract` use BigInt and throw
   `RangeError` if the result leaves the safe integer range.
3. **`multiplyByQuantity` takes up to 3 decimals** (kilograms, litres, for loose items sold by weight).
   The quantity is converted to thousandths, multiplied with BigInt, and rounded **half away from zero**
   (0.5 paise becomes 1, -0.5 becomes -1). A fourth decimal throws instead of being silently rounded.
   Float noise such as `0.1 + 0.2` is accepted as 0.3.
4. **`formatRupees` uses Indian digit grouping and Latin digits in every language:** `₹1,23,456.50`,
   `-₹5`. Only the whole-rupee part goes through `Intl` (as a BigInt); the paise are appended as
   integers. By default whole rupees omit `.00`; `{ paise: 'always' }` shows two decimals for bills.

## Consequences

- Marathi's default numbering in `Intl` is Devanagari digits. We chose Latin digits everywhere so prices
  read the same on every screen. Confirm this with real users in Phase 1; changing it is one function.
- Half away from zero is a business rule: it favours neither the shop nor the customer on average. Change
  it here, with its tests, if the shops' billing practice differs.
- Weighed prepaid orders still need the "final bill" rule from PLAN section 10 (take payment after
  weighing, or limit prepaid to fixed-price items). That is Phase 2.
