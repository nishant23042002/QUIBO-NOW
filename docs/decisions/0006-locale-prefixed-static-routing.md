# 0006. Locale-prefixed static routing

- **Status:** Superseded by [0007](./0007-customer-and-driver-are-expo-apps.md) (Phase 0b). The customer
  app is now a React Native app, so it has no URLs, no `next-intl` and no routing by language. Kept as
  history. What still holds: messages are typed, and the lint rule `react/jsx-no-literals` rejects text
  typed straight into a screen (now through the `native` preset).
- **Date:** 2026-10-08
- **Source:** `docs/PLAN.md` sections 4 and 9; `CLAUDE.md` ("no hard-coded UI strings", weak networks)

## Context

The customer app launches in English, Hindi and Marathi, on low-end phones over weak networks, and shop
pages must produce good WhatsApp link previews. The language could live in a cookie (one URL, rendered
per request) or in the URL.

## Decision

- **The language is in the URL:** `/en`, `/hi`, `/mr` (`next-intl`, `localePrefix: 'always'`). Every page
  is generated at build time, so a page is a static file with no server work per visit.
- **`/` redirects** to the visitor's language using `Accept-Language`, falling back to English.
- **The language switcher is a list of plain server-rendered `<a>` links** (`/en`, `/hi`, `/mr`), so it
  works with JavaScript off and each language has its own shareable URL. Each link is written in its own
  language (हिन्दी, मराठी, English) and carries `lang` and `hreflang`.
- **Messages are typed.** `src/global.d.ts` types `t('...')` keys and locales from `packages/i18n`, and the
  lint rule `react/jsx-no-literals` rejects text typed straight into JSX in the customer app.
- **`proxy.ts` skips any path with a file extension** (`manifest.webmanifest`, `/pwa-icons/*.png`).
  Anything that must not get a locale prefix needs an extension in its URL.

## Consequences

- An unknown language such as `/fr` redirects to `/en/fr` and shows a 404.
- The web app manifest is one file for the whole site, so it uses the default language.
- **There is no `NextIntlClientProvider` and no `src/i18n/navigation.ts` yet, on purpose.** Importing the
  navigation module (which calls `createNavigation()`) registers next-intl's client `Link`, and Next then
  ships next-intl's client runtime with the page even if nothing renders it. Measured in Phase 0, that
  was 13.3 kB gzip of JavaScript on the home page (148.1 kB with it, 134.8 kB without). Add the provider
  and the navigation module only where a client component needs them, and give the provider only the
  messages that component uses (see `docs/phases/PHASE-1-notes.md`).
- Because the hrefs are written as `/${locale}`, a change to `localePrefix` must update the switcher; the
  e2e smoke test asserts every link's href.
