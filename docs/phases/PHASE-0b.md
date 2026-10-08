# Phase 0b: React Native customer app and cleanup

**Surface:** customer app, plus repo-wide cleanup
**Kind:** foundation follow-up, no new product features
**Depends on:** Phase 0 (last web commit `c4ac9ce`). Phase 0 is not signed off yet; 0b is part of its gate,
and the tag `phase-0-complete` is pushed after this phase.

## Goal

The customer app is an Expo (React Native) app that opens in Expo Go on a phone and shows the placeholder
home, the English / Hindi / Marathi switch and a Components screen. The repository has no web-only
leftovers, and lint, typecheck, test and build pass on a fresh clone.

## Context

After Phase 0 the human asked for both phone apps (customer and driver) to be React Native, for a simple,
sorted and focused repository, for the security layer to come later, and for unneeded files and code to be
deleted before testing. The Phase 0 customer app had been a Next.js PWA. The decisions and what they cost
are in [ADR 0007](../decisions/0007-customer-and-driver-are-expo-apps.md); version pins in
[ADR 0003](../decisions/0003-toolchain-version-pins.md).

## Scope

### In

- [x] `apps/customer` is an Expo SDK 57 app with Expo Router: placeholder home, language switch
- [x] Building blocks `Text`, `Screen`, `Button`, `Input`, `Card`, `Badge`, `Sheet` and the design tokens,
      and a Components screen showing each in every state
- [x] The mock API as plain functions, `formatRupees` without `Intl`, a typed `translate()`
- [x] Web-only code and tooling removed (`packages/ui`, Next.js, Tailwind, Storybook, Playwright, MSW)
- [x] `pnpm clean`, sorted `package.json` files, tidy ignore files, a CI workflow that matches the commands
- [x] Docs: ADR 0007, updates to ADRs 0001, 0003, 0004 and 0006, the README with a phone guide, the Phase 1
      notes rewritten for React Native, three small edits to `CLAUDE.md` and one dated note in `PLAN.md`

### Out (not this phase)

- Driver, admin, api and worker code; they stay placeholders
- Security hardening, push notifications, background location, over-the-air updates, crash monitoring,
  store release setup, 2 GB-phone performance tuning, a mobile build in CI, a public website
- New screens beyond the home and the Components screen
- Maestro flow tests (Phase 1), typed routes, remembering the chosen language

## Plan

Written first and approved by the human on 2026-10-08, before any code. Its decisions are in ADR 0007. The
work was eleven small commits, each leaving lint, typecheck and tests green.

## Verification

1. [x] Fresh clone: `pnpm install --frozen-lockfile` prints no warnings
2. [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass
3. [x] `pnpm --filter @quibo/customer exec expo install --check` says "Dependencies are up to date"
4. [x] The dev server returns the Android manifest and bundle with HTTP 200
5. [x] Web preview at phone width: home, all three languages, the Components screen, the sheet closes with
       its X, a tap on the dimmed area and Escape, no console errors, no horizontal scroll
6. [x] Planted defects are caught and reverted: hard-coded text, a conditional hook, an unused variable, a
       misspelt message key, a low-contrast colour, a small tap target
7. [x] `pnpm clean` removes build output and caches and keeps `node_modules`, `.env` and the git hooks
8. [x] `git status` is clean afterwards: the Expo CLI rewrites no tracked file
9. [ ] On a real phone in Expo Go (the human; steps in the README)

## Budgets (working targets)

- Colour contrast: text at 4.5:1 or more, control edges at 3:1 or more (`tokens.test.ts`)
- Tap targets at 48 dp or more; text follows the phone's text-size setting up to 200%
- Android Hermes bundle: 3.3 MB at the end of this phase. No budget is set yet; set one in Phase 1 once real
  screens exist. Lighthouse and first-load JavaScript no longer apply to the customer app.

## Gate checklist for the human (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] Node 24.21.0 is active (`node -v`); a fresh clone installs with `pnpm install --frozen-lockfile`
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install with no warnings
- [ ] The app opens in Expo Go on a real phone; the home screen, the language switch and the Components
      screen work
- [ ] **"On this phone" shows `₹1,23,456.50` and `200 {"status":"ok"}`, each with a green `ok`.** This is the
      only check of money maths on the phone's own JavaScript engine (Hermes)
- [ ] With the phone's font size at the largest, nothing is cut off in any of the three languages
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] **Hindi and Marathi text reviewed by a native speaker** (drafted by the assistant, including the new
      Components screen strings)
- [ ] **The OrderStatus table matches the lifecycle diagram in PLAN section 7** (carried over from Phase 0;
      see `packages/contracts/src/order-status.ts`)
- [ ] **The costs of leaving the PWA are accepted for the pilot** (ADR 0007, Consequences): installing from
      the Play Store or a sideloaded file, no WhatsApp link previews, iPhones not covered
- [ ] No secrets in the repository; `.env.example` holds placeholders only
- [ ] No open blocker or major defects; minor ones are logged with an owner (see the report)
- [ ] Report read, demo done, sign-off recorded, tag `phase-0-complete` pushed

## Done means

Types and lint pass; tests added (Vitest for logic); the contrast tests pass; docs updated because scope
changed (`CLAUDE.md`, `PLAN.md`, the ADRs and the README).
