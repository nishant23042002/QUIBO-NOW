# 0007. The customer and driver apps are Expo (React Native) apps

- **Status:** Accepted (Phase 0b). Supersedes [0006](./0006-locale-prefixed-static-routing.md) and the
  "customer web app (Next.js PWA)" choice in `docs/PLAN.md`.
- **Date:** 2026-10-08
- **Source:** the human's instruction after Phase 0: both phone apps are React Native, keep the repo
  simple, sorted and focused, and add the security layer later.
- **Updated in Phase 0c** ([0008](./0008-design-system-aubergine-and-pistachio.md)): colours moved from
  `tokens.ts` to a themed `palette.ts` and their tests to `palette.test.ts`, and the chosen language is
  now remembered. Those two places are marked below.

## Context

Phase 0 built the customer app as a Next.js PWA, as the plan said. The human decided the customer app and
the driver app should both be React Native. That raises three questions: which stack, whether the folder
layout still fits, and what to leave for later.

## Decision

1. **Stack.** Expo SDK 57 (React Native 0.86, React 19.2.3) with Expo Router (screens are files in
   `src/app`) and Expo Go for development. Styling is plain `StyleSheet` plus one `tokens.ts`. There is no
   styling library and no i18n library: `translate()` in `packages/i18n` is typed and unit-tested.
   `react-native-web` and `react-dom` exist only so `w` opens a preview in a desktop browser. It is a
   development convenience, not a product target.
2. **Layout stays one repository, `apps/` and `packages/`.** `apps/` holds what you run (customer, driver,
   admin, api, worker). `packages/` holds code several apps share (contracts, mocks, i18n, config). It is
   the standard pnpm and Turborepo shape, and one change to a contract shows every screen it breaks in a
   single `pnpm typecheck`. Separate repositories, or a folder per surface (`mobile/`, `web/`,
   `backend/`), would break that. No change was needed beyond renaming `customer-web` to `customer`.
3. **UI components live in `apps/customer/src/ui`.** Move them to a shared package when the driver app
   needs them (Phase 5); a folder move is mechanical, and one place to look is simpler until then.
4. **One React version in the whole repo (19.2.3),** the one Expo SDK 57 ships. A second copy breaks at
   run time.
5. **Delete the web kit.** `packages/ui` (Tailwind, Storybook, the axe run), the Next.js and Playwright
   tooling and MSW are removed; they stay in git history (last web commit `c4ac9ce`). The admin panel
   brings its own web kit in Phase 3.
6. **The mock API is plain functions** (`handleMockRequest` in `packages/mocks`) because MSW 3.0.2 has no
   React Native entry. An unmocked request throws, so a screen cannot quietly depend on a route nobody
   defined.
7. **`formatRupees` uses no `Intl`** (ADR 0005), so a price is the same on every JavaScript engine.
8. **Tests.** Vitest for logic, including `tokens.test.ts`, which keeps every text colour at 4.5:1 and every
   control edge at 3:1 (since Phase 0c that check is `palette.test.ts`, in both themes; `tokens.test.ts`
   keeps only sizes). The Components screen shows every building block in every state. Maestro (simple
   YAML flows) arrives with Phase 1; Playwright returns with the admin panel in Phase 3.

## Deferred on purpose (the "later layer")

Security hardening, push notifications, background location, over-the-air updates, crash monitoring,
store release setup (Android package name, signing, EAS), performance tuning for 2 GB phones, a mobile
build in CI, a public website, and a native app for store partners. `CLAUDE.md`'s basics still apply:
no secrets in git, never log OTPs or Aadhaar numbers.

## Consequences

- **What the PWA gave and we now give up.** The plan chose a PWA so that nobody had to install anything,
  shop pages could be shared on WhatsApp with a preview, iPhones were covered, and no Play Store approval
  was needed. With a React Native app, customers install from the Play Store (or a sideloaded file in the
  pilot), a shared shop link needs a small public web page if we want previews, and iPhones are not
  covered until there is an iOS build or such a page. The plan assumes Android dominates these towns.
- **Android package name** (`com.…`) cannot change after the first Play Store release. It is not set;
  decide it together with the brand name. The URL scheme `quibo` in `app.json` is a placeholder.
- **Expo Go is for development.** Real users get a built app; that setup is deferred.
- **Automated UI checks dropped** (25 end-to-end, 22 axe and 4 component tests). The contrast unit tests,
  the Components screen and manual checks replace them until Maestro exists.
- **Money maths uses BigInt on Hermes.** Metro and Hermes compile it (`pnpm build`); whether it _runs_ on a
  phone is checked by the "On this phone" section of the Components screen.
- **Bundle size is a number to watch:** the Android Hermes bundle is 3.3 MB. Expo Router brings in a
  971 KB icon font the app does not use, and Zod about 0.7 MB. Both are tuning work for later.
- **The language choice was held in memory only** and started from the phone's language each launch.
  Since Phase 0c it is remembered (ADR 0008).
- **pnpm settings that Expo needs** (peers not auto-installed, two ignored optional peers, one allowed
  deprecation) are recorded in ADR 0003.

## Alternatives considered

- **Keep the PWA, and use React Native only for the driver** (the original plan). Not chosen by the human.
- **A styling library such as NativeWind or Tamagui.** Rejected for now to keep the code easy to read and
  light on a low-end phone. Revisit if the 12 customer screens make plain styles repetitive.
- **A full i18n library** (i18next and similar). Rejected: three languages, no plurals yet, nothing to
  polyfill. Add one when a screen needs plurals or dates.
