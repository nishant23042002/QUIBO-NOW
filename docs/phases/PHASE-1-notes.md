# Phase 1 notes

Things found or deliberately left out during Phase 0. Nothing here is built. Read this before writing the
Phase 1 prompt. Phase 1 is **customer UI on mock data** (PLAN sections 6 and 12).

## First tasks, because Phase 0 stopped short of them

1. **Wire the mock API into customer-web.** Phase 0 ships `@quibo/mocks/browser` (a typed MSW worker) but
   not the pieces that make it run in the app, to keep to "nothing more" for customer-web:
   - generate `apps/customer-web/public/mockServiceWorker.js` with MSW's CLI (check the v3 command; the
     file also ships inside the package at `msw/lib/mockServiceWorker.js`);
   - a small client component that starts the worker before the first fetch, only when a flag such as
     `NEXT_PUBLIC_API_MOCKING=enabled` is set (add it to `publicEnvSchema` and `.env.example`; the env
     test will then force the example and the schema to agree);
   - **MSW 3 renamed the unhandled-request option** to `onUnhandledFrame` (`'error'`, `'warn'`,
     `'bypass'`). The worker needs `bypass` or Next's own assets will be reported; the node server in
     tests uses `error` on purpose.
   - Screens call an API client; they never import fixtures (ADR 0001).
2. **Service worker and offline.** The PWA shell is manifest only. `CLAUDE.md` requires loading, empty,
   error and **offline** states on every screen, so the offline shell, cache strategy and install prompt
   belong here. Real behaviour needs a real service worker, which Next does not provide by itself.
3. **The 12 customer screens** (PLAN section 6 inventory), each in both fulfilment modes using the
   `partnerTown` and `darkTown` fixtures: Home lists shops in partner mode and opens straight into the
   one store in dark mode.
4. **Add the fixtures Phase 1 needs** to `packages/mocks` (stores, items, cart, orders), parsed through
   new schemas in `packages/contracts`, the way `towns.ts` is.

## Known gaps in what exists

- **The language switcher always links to each language's home (`/en`, `/hi`, `/mr`).** It should keep the
  current path once there is more than one page. A server component can build the target from the
  request path; avoid making it a client component with `usePathname` unless the weight is accepted.
- **There is deliberately no `NextIntlClientProvider` and no `src/i18n/navigation.ts`.** Merely importing
  the navigation module (it calls `createNavigation()`) puts next-intl's client runtime on the page: 13.3 kB
  gzip, measured (ADR 0006). When the first client component needs translations, add the provider with
  only the messages that component uses, re-measure first-load JavaScript, and decide the budget with
  that number in hand.
- **The unknown-language 404 is not localised.** `/fr` goes to `/en/fr` and shows Next's default 404.
  Use `global-not-found`.
- **`<title>` is the brand name on every page.** Each screen needs its own title in all three languages.
- **Brand is a placeholder.** Name ("Quibo Now"), palette, and the "Q" icon are stand-ins. The brand colours
  are repeated in `tokens.css`, `layout.tsx` (`themeColor`), `manifest.ts` and `pwa-icons/[name]/route.tsx`
  because CSS variables cannot be read there. When the brand is chosen, make one source file for them.
- **`Sheet` does not lock page scroll** behind it and has only been run in desktop Chromium. Test the native
  `<dialog>` on a low-end Android WebView and on iOS Safari before relying on it.
- **No `Skeleton`, icon set, toast, tabs or bottom navigation primitives.** `Card` and `Badge` have inline
  skeletons. Add shared ones when the second screen needs them, not before.
- **No dark mode.** Tokens are light only (`color-scheme: light`).
- **System font stack.** Chosen so nothing downloads on a weak network and because Android and Windows ship
  Devanagari fonts. Check rendering of Hindi and Marathi on real low-end phones; add a subset web font only
  if it is poor.

## Accessibility: a blind spot in axe

**axe-core silently skips some Devanagari text when it measures contrast.** On `/hi` it checked 4 text
nodes and skipped 2 (the subtitle and the active "हिन्दी" link). Planting a low-contrast Hindi link did not
make the axe test fail. `apps/customer-web/e2e/contrast.ts` measures every text node from the browser's
computed colours instead, with tests that prove it fails on bad contrast. Use it on every Phase 1 screen in
every language. **The Storybook run (`pnpm a11y`) very likely has the same blind spot** (it uses the same
axe-core engine; this was not tested there) and its stories are English; when stories use Hindi or Marathi
text, check contrast with the helper there too.

## Translations and numbers

- The Hindi and Marathi strings are the assistant's drafts. Have them reviewed by a native speaker before
  any user sees them; Hindi and Marathi text also often runs longer than English, so check wrapping.
- Prices use **Latin digits in every language** (ADR 0005); Marathi's `Intl` default would be Devanagari.
  Confirm with real users.
- The 200% text size check is done for the placeholder only. Do it for every screen.

## Performance

- **The framework floor is 133.9 kB gzip** (a bare Next 16.4.0 + React 19.3.0 page: React DOM 72 kB, Next's
  client runtime 50 kB, the rest small). The Phase 0 home page is 134.8 kB. The 130 kB budget proposed in
  the plan cannot be met by any Next 16.4 page; the human decides the replacement at sign-off (140 kB
  recommended). Set a budget per key screen in `PHASE-1.md` as "floor plus what the screen needs", and
  re-measure after each new client component. Next 16 does not print "First Load JS" in `next build`;
  measure it from the network trace.
- Lighthouse runs by hand in Phase 0 (`pnpm dlx lighthouse@13.5.0`, not in the lockfile). Adding it to CI
  (for example Lighthouse CI) would make the gate automatic.
- Add a throttled-network Playwright project to approximate a weak connection, and keep the real low-end
  Android check as a manual step.

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

- Remove the `peerDependencyRules` entries in `pnpm-workspace.yaml` when `eslint-plugin-react`, `-import`
  and `-jsx-a11y` publish ESLint 10 peers; move to TypeScript 7 when typescript-eslint supports it; consider
  pnpm 12 as its own change (ADR 0003).
- Run `actionlint` on `.github/workflows/ci.yml` (Docker was not running in Phase 0; the file was checked
  structurally only).
- Turborepo restores a cached `.next` **over** the existing folder without deleting stale files. After
  switching between branches or experiments, delete `apps/customer-web/.next` before trusting a cached
  build. CI starts from an empty checkout, so it is not affected.
- Playwright's Chromium and headless shell take about 720 MB on disk.
- `eslint-plugin-storybook` and `@storybook/addon-docs` were not added (not requested).
