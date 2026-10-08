# 0001. UI first, contract first

- **Status:** Accepted (Phase 0)
- **Date:** 2026-10-08
- **Source:** `docs/PLAN.md` sections 6, 9, 12 and 15

## Context

The product has three surfaces (customer, admin with the store portal, driver) and one backend. Built
backend-first, the API is shaped by guesses about screens and is rebuilt when the screens change. In a
one-town pilot the screens are what learn fastest from real shopkeepers and households, so they should
settle first.

## Decision

1. **Surface order:** customer app, then admin panel (with the store portal), then driver app.
2. **Each surface has two phases:** a UI phase on mock data, then a live phase against the real API.
   Odd phases are UI (1, 3, 5), even phases are live (2, 4, 6).
3. **`packages/contracts` is the single source of truth.** Every request, response and shared type is a
   Zod schema there. The mock API (`packages/mocks`) and, from Phase 2, the real API (`apps/api`) both
   implement those schemas. Nothing is defined twice.
4. **Screens never import fixtures directly.** They call the API client; in UI phases the mock API
   (`handleMockRequest`) answers with data built from the contracts. Going live is therefore a swap of the
   transport, not a rewrite of the screens.
5. **A phase is done only when its gate passes** (lint, typecheck, unit tests, flow tests, build,
   accessibility, performance, zero open blocker or major defects) and a human signs off. Work is never
   started ahead of the current phase; ideas go into the next phase's notes file.

## Consequences

- No real order can flow end to end before Phase 2, and none runs without a spreadsheet before Phase 4.
  The manual WhatsApp pilot and the Phase 2 ops inbox cover that gap (PLAN section 15).
- Mock data can drift from the real API. The mitigation is rule 3 plus contract tests in CI from Phase 2.
- A contract change is a change to one package, and TypeScript shows every screen and handler it breaks.
