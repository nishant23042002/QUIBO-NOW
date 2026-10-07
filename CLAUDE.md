# Project: hyperlocal grocery delivery for tier 3 and 4 Indian towns

## What we are building
A partner-store marketplace. Customers order from local kirana, dairy and vegetable shops in their own town. Shops accept and pack. Paid riders deliver. Partner stores by default; a single company dark store per town is an allowed alternative. We promise a delivery window, never minutes. One pilot town first; multi-town ready through town_id. Each town runs in a fulfilment mode (partner, dark or hybrid) that can be switched by configuration at any time.
Plan: docs/PLAN.md (read sections 4, 6, 7, 10 and 12 before coding).

## How we work: UI first, phase-gated
- Surface order: customer app, then admin panel (with the store portal), then driver app. Each surface is a mock-data UI phase, then a live phase.
- Work on exactly one phase at a time, described in docs/phases/PHASE-N.md. Never build ahead; park ideas in the next phase's notes file.
- Start every task with a written plan and wait for approval before writing code.
- UI phases run on mock data from packages/mocks, built from the Zod contracts in packages/contracts. Live phases swap mocks for the real API without changing screens.
- A phase is done only when its gate passes: lint, typecheck, unit tests, e2e tests, build, accessibility and performance checks, all with zero open blocker or major defects.
- At the end of a phase write docs/phases/PHASE-N-report.md, stop, and wait. The human signs off; then tag phase-N-complete.

## Surfaces
- apps/customer-web: Next.js PWA (phases 1 and 2)
- apps/admin: Next.js ops panel with the store portal and the dark-store console as route groups (phases 3 and 4)
- apps/driver: Expo React Native app (phases 5 and 6)
- apps/api: NestJS modular monolith, REST + OpenAPI (from phase 2)
- apps/worker: BullMQ jobs (from phase 2)
- packages: contracts, mocks, ui, i18n, db, config

## Non-negotiables
- TypeScript strict. Zod validation at every API boundary; contracts are the single source of truth.
- Money is integer paise. Never floats. Ledger entries are append-only.
- Order status changes only through OrderStateMachine.transition(); every change writes an order_events row.
- Payment and webhook handlers are idempotent.
- Fulfilment mode is town configuration. Order, payment, dispatch and ledger code never branch on it; differences live behind the FulfilmentStrategy interface (availability, accept, pick, settle).
- Every business table has town_id. Zones, fees, slots and limits live in the database, not in code.
- No hard-coded UI strings: use message keys for en, hi, mr.
- Collect minimal personal data, log consent, never log Aadhaar numbers or OTPs.
- No 10-minute copy. No rider penalties for lateness.
- Every screen has loading, empty, error and offline states and works on a low-end Android phone (2 GB RAM) on a weak network.

## Commands
pnpm install | pnpm dev | pnpm lint | pnpm typecheck | pnpm test | pnpm build | pnpm e2e | pnpm storybook

## Definition of done
Types and lint pass; tests added (Vitest for logic, Playwright for flows); accessibility check passes; migration and seed updated when data changes; docs updated if scope changed.

## Working style
Small commits with conventional messages. Ask before adding a dependency. Record architecture decisions in docs/decisions/. Never loosen or skip a check to get green.