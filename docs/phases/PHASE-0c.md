# Phase 0c: lock the design system

**Surface:** customer app (design system only; no product screens)
**Kind:** foundation follow-up, no new product features
**Depends on:** Phase 0b. Phase 0 is not signed off yet; 0b and 0c are part of its gate, and the tag
`phase-0-complete` is pushed after the phone check of this phase.

## Goal

The customer app opens with the Quibo Now identity, switches between a light and a dark theme with a
button at the top of every screen, remembers that choice and the language, and has every building block the
twelve Phase 1 screens need, shown in both themes on the Components screen. Phase 1 is then built from locked
parts instead of inventing styles screen by screen.

## Context

After Phase 0b the app ran in Expo Go but looked like a placeholder. The human supplied the parent QUIBO
brand kit, reviewed two proposal pages (twelve palette options in all) and decided the look. The decisions
and their reasons are in [ADR 0008](../decisions/0008-design-system-aubergine-and-pistachio.md); the two new
package pins are in [ADR 0003](../decisions/0003-toolchain-version-pins.md).

## Scope

### In

- [x] Logo option A (stacked), the Q mark (the header later changed to the stacked logo), drawn with `react-native-svg` from the
      parent's outlined paths, with NOW outlined from Poppins Black
- [x] The tagline "Dukaan se ghar tak." in English, Hindi and Marathi
- [x] The aubergine and pistachio palette in a light and a dark theme (28 colour roles), a `ThemeProvider`,
      `useTheme()` and `useStyles()`, and a toggle button in every header
- [x] The chosen theme and language are remembered (`@react-native-async-storage/async-storage`); first launch
      follows the phone
- [x] A lint rule that bans colour literals outside `palette.ts`, and 44 contrast checks (22 pairs, two themes)
- [x] The seven existing blocks restyled for both themes
- [x] 14 new blocks: `IconButton`, `Chip`, `SearchBar`, `Stepper`, `Price`, `Notice`, `ProductImage`, `ShopCard`,
      `ItemCard`, `CategoryTile`, `WindowPicker`, `AddressPill`, `CartBar`, `BillSummary`; 13 icons; a placeholder
      product image; pure logic (weight steps, savings, free-delivery progress) with unit tests
- [x] The Components screen rebuilt around the full set, and a restyled home with the logo and tagline
- [x] App icon files for real builds (icon, Android adaptive foreground, themed one-colour layer), with the SVG
      masters in `docs/brand/`
- [x] Docs: ADR 0008, ADR 0003 and 0007 updated, README, `PHASE-1-notes.md`, this file and the report

### Out (not this phase)

- Product screens (Phase 1), real photos and category art
- Eight components that wait for a screen that needs them: `EmptyState`, `StatusTimeline`, `Toast`,
  `ConfirmDialog`, `ItemRow`, `Skeleton`, `DietMark`, `Divider`
- Poppins as the text font, the operating-system splash screen and store release setup
- Any change to the driver, admin, api or worker placeholders

## Plan

Written first and approved by the human on 2026-10-08, before any code. Its decisions are in ADR 0008. The
work was a series of small commits, each leaving lint, typecheck, tests and build green.

## Verification

1. [x] Fresh clone: `pnpm install --frozen-lockfile` prints no warnings
2. [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass
3. [x] `expo install --check` says "Dependencies are up to date"; `expo-doctor` passes
4. [x] The dev server returns the Android manifest and the Android and iOS bundles with HTTP 200
5. [x] Web preview in all three languages and both themes: the toggle works, the choice and the language
       survive a reload, text contrast and overflow are measured on every text node, no console errors
6. [x] Planted defects are caught and reverted: a hex colour in a screen (lint), a missing theme token
       (typecheck), a low-contrast token (test), a bad stored value (test), a wrong icon background, an icon
       with transparency
7. [x] `git status` is clean afterwards; `pnpm clean` removes build output and caches and keeps
       `node_modules`, `.env` and the git hooks (run in the fresh clone, because a dev server is using the
       working copy)
8. [ ] On a real phone in Expo Go (the human; steps in the README)

## Budgets (working targets)

- Colour contrast: text at 4.5:1 or more, control edges at 3:1 or more, in both themes (`palette.test.ts`)
- Tap targets at 48 dp or more (a 36 dp control has 6 dp of touch slop on every side)
- Android Hermes bundle: no budget yet; set one in Phase 1 once real screens exist

## Gate checklist for the human (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] Node 24.21.0 is active (`node -v`); a fresh clone installs with `pnpm install --frozen-lockfile`
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install with no warnings
- [ ] The app opens in Expo Go on a real phone; the toggle in the header switches between light and dark
      on the home screen and on the Components screen, and after closing and reopening the app the theme
      and the language are as you left them
- [ ] The Components screen looks right in both themes and all three languages: logos, icons, buttons,
      cards, steppers (try ADD, then + and -, and the loose-weight one), the window picker, the cart bar and
      the bill with its free-delivery bar
- [ ] **"On this phone" shows `₹1,23,456.50` and `200 {"status":"ok"}`, each with a green `ok`** (carried over
      from Phase 0b)
- [ ] With the phone's font size at the largest, nothing is cut off in any of the three languages
- [ ] **The palette looks right to you on a real screen** (aubergine and pistachio, outdoors if you can)
- [ ] **The colour of the Android navigation bar in the dark theme** looks right. This is the one thing
      nothing could check without a phone
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] **Hindi and Marathi text reviewed by a native speaker** (drafted by the assistant, now including about
      35 more strings in the Components screen and the tagline)
- [ ] **The OrderStatus table matches the lifecycle diagram in PLAN section 7** (carried over from Phase 0)
- [ ] **The costs of leaving the PWA are accepted for the pilot** (ADR 0007, Consequences)
- [ ] No secrets in the repository; `.env.example` holds placeholders only
- [ ] No open blocker or major defects; minor ones are logged with an owner (see the report)
- [ ] Report read, demo done, sign-off recorded, tag `phase-0-complete` pushed

The app icon files are not on this list because Expo Go ignores them: they show only in a built app, which
is deferred (ADR 0007).

## Done means

Types and lint pass; tests added (Vitest for logic and for the icon files); the contrast tests pass in both
themes; docs updated because scope changed (ADR 0008, the README and the Phase 1 notes).
