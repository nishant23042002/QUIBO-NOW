# Phase 1 notes

Things found or deliberately left out during Phase 0 and Phase 0b. Nothing here is built. Read this before
writing the Phase 1 prompt. Phase 1 is **customer UI on mock data** in the React Native app (PLAN sections 6
and 12; ADR 0007).

## First tasks, because Phase 0b stopped short of them

1. **Wire the mock API into the app.** `handleMockRequest` exists, and only the Components screen's device
   check calls it. Add a small API client in `apps/customer/src`: in UI phases it calls
   `handleMockRequest`, in live phases `fetch` on `EXPO_PUBLIC_API_URL`, and either way it parses the answer
   with the contract's Zod schema. Screens call the client and never import fixtures (ADR 0001).
   - `EXPO_PUBLIC_API_URL` is already in `publicEnvSchema` and `.env.example`. Expo only replaces the
     literal expression `process.env.EXPO_PUBLIC_X`, so `loadEnv(schema, process.env)` sees nothing on a
     phone: pass the value explicitly, `loadEnv(schema, { EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL })`.
   - Typing `process.env` needs Expo's types: add a `.d.ts` under `src` that references `expo/types`. Do
     not use `expo-env.d.ts`: the Expo CLI deletes it whenever typed routes are off.
2. **The four states, and offline.** `CLAUDE.md` requires loading, empty, error and offline states on every
   screen. The Components screen shows loading and error for cards, inputs and badges, but there is no
   shared empty, error or offline view, no way to detect being offline, and no stored cart. Build the
   shared view when the second screen needs it. Detecting offline and storing a cart need a package each
   (NetInfo, a storage library): ask before adding them.
3. **The 12 customer screens** (PLAN section 6 inventory), each in both fulfilment modes using the
   `partnerTown` and `darkTown` fixtures: Home lists shops in partner mode and opens straight into the
   one store in dark mode.
4. **Add the fixtures Phase 1 needs** to `packages/mocks` (stores, items, cart, orders), parsed through
   new schemas in `packages/contracts`, the way `towns.ts` is.
5. **Maestro flows** (simple YAML) for the phase's flows, in both fulfilment modes. Maestro needs its CLI
   and an emulator or phone on the machine that runs it. Update the gate wording in `PHASE-TEMPLATE.md`
   accordingly (Phase 0b already changed it from Playwright to flow tests).
6. **Remember the chosen language.** It is held in memory today and resets to the phone's language each
   launch. Needs a storage package (ask first).
7. **A title per screen in all three languages.** The header shows the app name on the home screen and
   "Components" on the gallery; every real screen needs its own key.
8. **Keep the Components screen out of production builds.** Only the home screen's link to it is hidden
   (`__DEV__`); the route itself can still be opened with a link such as `quibo://components`.

## Known gaps in what exists

- **`Sheet` has only been run in the desktop web preview, never on a phone.** Check the Android back
  button, the keyboard, the bottom safe area and the slide animation on a real device. In the preview the
  exit animation could not be watched finishing (the pane throttles animations), so the close paths were
  verified with the animation switched off.
- **No keyboard handling.** `Input` has no `KeyboardAvoidingView` behaviour; a form near the bottom of a
  screen will be covered by the keyboard.
- **`Input` errors rely on a live-region alert.** React Native has no `aria-invalid` or `aria-describedby`;
  the error text is announced when it appears (`role="alert"`). Check with TalkBack, Android's screen
  reader.
- **Text size is capped at 200% for `Text` only** (`maxFontSizeMultiplier`). `TextInput` has no cap; check
  large text on every input.
- **No icons.** The sheet's close icon is two bars. Add an icon approach when a screen needs one.
- **Cards are flat** (2 px border, no shadow) and the loading skeleton is static, both to stay cheap on
  low-end phones. A disabled card is dimmed with opacity, because React Native text does not inherit colour.
- **No dark mode** (`userInterfaceStyle` is `light`) and system fonts only.
- **Typed routes are off,** so `router.push('/components')` is not checked. To adopt `experiments.typedRoutes`,
  note that the Expo CLI then writes `expo-env.d.ts` and `.expo/types` when `expo start` runs, so a fresh
  clone has no types until it is run: the same trap `next typegen` was in Phase 0.
- **Brand is a placeholder.** Name ("Quibo Now"), the palette in `src/ui/tokens.ts` (now the single
  place), the URL scheme `quibo`, and no icon or splash image. The Android package name is not set and
  cannot change after the first Play Store release.
- **A new colour pairing is not checked automatically.** `tokens.test.ts` lists the pairs by hand; add
  every new text-on-background or border-on-background pair to it.

## Accessibility

Automated checks cover colour pairs only (`tokens.test.ts`: text 4.5:1, control edges 3:1). Nothing
automated checks screen-reader labels or large text. For every Phase 1 screen, by hand and in every
language: a TalkBack pass, the phone's largest font size, and Devanagari rendering on a real low-end phone
(system fonts; if the glyphs look poor, a subset font can be bundled at a cost in bytes).

## Translations and numbers

- The Hindi and Marathi strings are the assistant's drafts, including the Components screen's. Have them
  reviewed by a native speaker before any user sees them; Hindi and Marathi text also often runs longer than
  English, so check wrapping.
- Prices use **Latin digits in every language** (ADR 0005). Confirm with real users.

## Performance

- **The Android Hermes bundle is 3.3 MB** (2.6 MB before the building blocks, `contracts`, `mocks` and Zod
  were added). Zod and the contracts are most of that increase; `zod/mini` is smaller, but moving to it is
  a rewrite of every contract, so decide it with the numbers in hand. `pnpm build` prints the size; report
  it for every phase.
- **Expo Router bundles a 971 KB icon font** (Material Symbols) that the app does not use. Find which
  import pulls it in, and whether it can be left out.
- Set a budget per key screen once real screens exist, and measure on a 2 GB Android phone with a
  throttled network: cold start and memory. Performance tuning is deferred (ADR 0007), but the first
  measurement belongs in the Phase 1 gate (PLAN section 16).
- **Money maths runs on Hermes.** The Components screen is the on-device check. If it ever shows `wrong`,
  fall back to plain integer maths in `money.ts` (amounts stay below 2^53).

## For Phase 2 (parked, not for now)

- **Confirm `OrderStatus` against the PLAN section 7 diagram.** It is a reconstructed stub
  (`packages/contracts/src/order-status.ts`): five states (placed, accepted, ready, picked_up, delivered)
  and three exits (rejected, cancelled, undelivered).
- `OrderStateMachine.transition()` with the table of allowed moves **per actor**, writing an `order_events`
  row every time. Phase 0 has only the status-to-status table.
- `FulfilmentStrategy` (availability, accept, pick, settle), ADR 0002.
- `packages/db` (schema, migrations, seed). `TownId` is a UUID by assumption; change it before the schema
  exists if another id type is preferred.
- **How NestJS consumes the source-only packages** (ADR 0004).
- Idempotency keys for orders, payments and webhooks; contract tests in CI.

## Tooling follow-ups

- Remove the `eslint-plugin-react` entry in `peerDependencyRules` (`pnpm-workspace.yaml`) when it publishes
  an ESLint 10 peer; move to TypeScript 7 when typescript-eslint supports it; consider pnpm 12 as its own
  change (ADR 0003).
- Run `actionlint` on `.github/workflows/ci.yml` (Docker was not running in Phase 0; the workflow has not run
  on GitHub, and was checked structurally only).
- A mobile build in CI (an Expo build service or a local Android build) is deferred; `pnpm build` only
  proves the code bundles and compiles for Hermes.
- Upgrade Expo by SDK, never one package at a time (ADR 0003), and run
  `pnpm --filter @quibo/customer exec expo install --check` after any change to `apps/customer`'s packages.
