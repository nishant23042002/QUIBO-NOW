# Phase 1 notes

Things found or deliberately left out during Phase 0, Phase 0b and Phase 0c. Nothing here is built. Read
this before writing the Phase 1 prompt. Phase 1 is **customer UI on mock data** in the React Native app
(PLAN sections 6 and 12; ADR 0007). The look is locked in ADR 0008: build screens from the components in
`apps/customer/src/ui` and the theme in `src/theme`, and do not add colours or one-off styles.

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
6. **A title per screen in all three languages.** The header shows the logo on the home screen and
   "Components" on the gallery; every real screen needs its own key.
7. **Keep the Components screen out of production builds.** Only the home screen's link to it is hidden
   (`__DEV__`); the route itself can still be opened with a link such as `quibo://components`.
8. **Build the eight components Phase 0c left out, when a screen needs each:** `EmptyState`, `StatusTimeline`,
   `Toast`, `ConfirmDialog`, `ItemRow` (a cart line), `Skeleton`, `DietMark` and `Divider`. Add each to the
   Components screen in every state, and add any new colour pairing to `palette.test.ts`.

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
- **Thirteen icons only** (`src/ui/Icon.tsx`, one stroke weight, drawn with `react-native-svg`). Add a shape
  there when a screen needs one; move to an icon library only if the count grows a lot (ADR 0008).
- **Cards are flat** (2 px border, no shadow) and the loading skeleton is static, both to stay cheap on
  low-end phones. A disabled card is dimmed with opacity, because React Native text does not inherit colour.
- **System fonts only.** Poppins for text would cost about 500 KB and one package; decide it with the
  bundle numbers below, and check Devanagari rendering on a real low-end phone first.
- **Typed routes are off,** so `router.push('/components')` is not checked. To adopt `experiments.typedRoutes`,
  note that the Expo CLI then writes `expo-env.d.ts` and `.expo/types` when `expo start` runs, so a fresh
  clone has no types until it is run: the same trap `next typegen` was in Phase 0.
- **Still placeholders in the brand:** the URL scheme `quibo`, and there is no operating-system splash
  image (the in-app animated splash covers loading). The Android package name is not set and cannot change
  after the first Play Store release. The app icon files exist but only show in a built app, never in Expo
  Go (ADR 0007).
- **A new colour pairing is not checked automatically.** `src/theme/palette.test.ts` lists the pairs by
  hand and checks each in both themes; add every new text-on-background or border-on-background pair.
- **Edge-to-edge on Android** is handled in the app (`AppHeader` insets, page colour behind the navigation
  buttons, `expo-navigation-bar`), but it has only been checked in the browser. Check the status bar area,
  the navigation buttons and the first load on a real phone, in Expo Go and then in a build: Expo Go may keep
  the system's own contrast bar. The status bar text is always light because the header is dark in both themes.
- **Add `KeyboardAvoidingView` behaviour to `Screen`** when the first form screen arrives; edge-to-edge changes
  how Android resizes for the keyboard.
- **The toggle never goes back to "follow the phone".** The first tap sets an explicit choice. If users
  need the automatic mode back, it belongs on a settings screen (`ThemeProvider` already supports the
  `system` mode).
- **The splash waits for the saved theme and language.** If the first paint ever flickers on a slow
  phone, draw with the phone's setting first and switch after (ADR 0008, Consequences).

## Using the Phase 0c components

- **Equal-height cards in a grid.** `ItemCard` and `ShopCard` do not stretch to their neighbour's height;
  the Components screen lines them up from the top. Make the Phase 1 grid rows `alignItems: 'stretch'`.
- **Weights and the cart contract.** `Stepper` counts in plain numbers (1, 0.5 kg, 2.25 kg) with
  `COUNT_RULE` and `WEIGHT_RULE`. The cart schema will store quantities the way `multiplyByQuantity` in
  `@quibo/contracts` expects (a fixed scale, ADR 0005): convert at the boundary, not inside the component.
- **Text comes in as props.** `CartBar`, `BillSummary` and `ItemCard` take finished strings, so the screen
  resolves plurals (there are no plurals in `translate()`; the Components screen uses two keys,
  `itemCountOne` and `itemCountMany`) and the "add ₹X more" line.
- **Delivery windows are clock ranges** ("4–6 PM"), never minutes. `WindowPicker` shows a full window
  struck through and dimmed, and reads out "full" to a screen reader; a dimmed disabled control is exempt
  from the contrast rule, while an open or closed shop is not dimmed at all, so its text stays readable.
- **`SearchBar` is always a light field,** because it sits on the dark header. Check it on a phone in both
  themes. Parts that live on the header (`AddressPill`, `IconButton`, `CartBar`) take a `ground` or are
  always dark; keep them there.
- **Real photos** replace the placeholder in one place: pass `photoUri` to `ItemCard` or `uri` to
  `ProductImage`. Choose a loading and a failed-image state with the first real photos.

## Accessibility

Automated checks cover colour pairs only (`palette.test.ts`: text 4.5:1, control edges 3:1, in both
themes) and sizes (`tokens.test.ts`). Nothing automated checks screen-reader labels or large text. In
Phase 0c the web preview was also audited by script: every text node's contrast in six language and theme
combinations, horizontal overflow and clipped text. Reuse that approach for new screens until Maestro runs. For every Phase 1 screen, by hand and in every
language: a TalkBack pass, the phone's largest font size, and Devanagari rendering on a real low-end phone
(system fonts; if the glyphs look poor, a subset font can be bundled at a cost in bytes).

## Translations and numbers

- The Hindi and Marathi strings are the assistant's drafts, including the Components screen's. Have them
  reviewed by a native speaker before any user sees them; Hindi and Marathi text also often runs longer than
  English, so check wrapping.
- Prices use **Latin digits in every language** (ADR 0005). Confirm with real users.

## Performance

- **The Android Hermes bundle is 3.5 MB** at the end of Phase 0c (3.3 MB after Phase 0b, 2.6 MB before the
  building blocks, `contracts`, `mocks` and Zod were added; Phase 0c added the two packages, the logo
  paths and the 14 components). Zod and the contracts are most of that increase; `zod/mini` is smaller, but moving to it is
  a rewrite of every contract, so decide it with the numbers in hand. `pnpm build` prints the size; report
  it for every phase.
- **Expo Router bundles a 971 KB icon font** (Material Symbols) that the app does not use. Find which
  import pulls it in, and whether it can be left out.
- Set a budget per key screen once real screens exist, and measure on a 2 GB Android phone with a
  throttled network: cold start and memory. Performance tuning is deferred (ADR 0007), but the first
  measurement belongs in the Phase 1 gate (PLAN section 16).
- **Money maths runs on Hermes.** The Components screen is the on-device check. If it ever shows `wrong`,
  fall back to plain integer maths in `money.ts` (amounts stay below 2^53).

## For the hardening section (1h)

- **A failed read is saved over.** `readSetting` returns nothing both when the key is empty and when reading failed, and each
  provider then writes its (empty) state back. If a read ever failed on a phone, the orders, reports, cart or addresses would be
  replaced by nothing on the first write. Fix: tell "empty" from "failed" in `src/storage.ts`, and do not write until a read has
  succeeded. Seen once in the test browser only as orders that were missing when a new session began; it could not be made to
  happen again, so the cause there is probably the pane clearing its storage, but the hazard is real.

## Parked by the owner

- **"Order again" (one-tap reorder), parked 2026-10-10.** Not part of 1g for now. What it needs when it is taken up: the order
  must keep what was bought (pack ids, quantities, the loose weights) as well as the shops, payment and total; the cart then
  needs a way to add those packs back, cut to what is in stock now (the cart already does this when it restores itself), and to
  say which ones are gone. The plan's "reorder strip" on Home (PLAN section 5) is the same piece of work.
  **Update (2026-10-10):** the first half is done. The order now keeps its items (pack id, name, picture, quantity, line
  total) and its address, because the order screens show pictures of what was bought. What is left is the cart side: adding
  those packs back, cut to stock, and saying which are gone.

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
