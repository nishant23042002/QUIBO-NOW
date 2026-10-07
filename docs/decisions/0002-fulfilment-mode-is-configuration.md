# 0002. Fulfilment mode is configuration

- **Status:** Accepted (Phase 0)
- **Date:** 2026-10-08
- **Source:** `docs/PLAN.md` sections 1, 7, 8 and 10; `CLAUDE.md` non-negotiables

## Context

A town is supplied either by partner shops, or by one company dark store, or by both. The business must be
able to start in either mode and switch at any time, for example when the dark-store triggers in PLAN
section 7 are met. If order, payment, dispatch or ledger code knew which mode it was in, every switch
would be a code change and every mode would double the test matrix.

## Decision

1. **Three configuration values decide supply behaviour, and they are data, not code:**
   - `town.fulfilment_mode`: `partner`, `dark` or `hybrid`
   - `store.type`: `partner` or `dark`
   - `store.stock_mode`: `toggle` (a shop's available switch) or `counted` (derived from stock movements)

   Phase 0 defines them as Zod enums in `packages/contracts` (`FulfilmentMode`, `StoreType`, `StockMode`),
   each with tests that valid values pass and invalid ones are rejected.

2. **Shared code never branches on them.** Order, payment, dispatch and ledger code contains no
   `if (mode === ...)`. The differences (availability, accept, pick, settle) live behind one small
   `FulfilmentStrategy` interface per module, chosen from the store's configuration. The interface is
   built in Phase 2; the enums above are the only part that exists now.
3. **Switching is a data operation** (PLAN section 7): create or hide stores, load opening stock as goods
   receipts, change the town's mode. Orders in flight finish under the store they were placed with.
4. **The customer UI is built once and designed for both modes** (PLAN section 6): in partner mode Home
   lists shops, in dark mode it opens straight into the one branded store. `packages/mocks` ships a
   fixture for each mode so every screen can be developed and tested in both.

## Consequences

- A branch on fulfilment mode in order, payment, dispatch or ledger code is a defect. PLAN section 15
  lists it as a risk with the early signal "a branch on fulfilment mode appears in shared code".
- Every end-to-end flow must pass in both modes from Phase 1 (the gate checklist says so).
- `hybrid` is valid for a town but not for a store: a single store is `partner` or `dark`. The contract
  tests check this.
