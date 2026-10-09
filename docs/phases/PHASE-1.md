# Phase 1: Customer app on mock data

**Surface:** customer app (`apps/customer`, Expo React Native)
**Kind:** UI on mock data
**Depends on:** Phase 0c signed off (design kit built, waiting on the phone check)

## Goal

At the end, a person can open the customer app on a phone and do the whole journey on mock data: pick a language,
sign in with a phone OTP, set an address, browse shops and items, fill a cart, check out, track the order, see past
orders and get help. It works in both fulfilment modes (partner shops and one dark store), in English, Hindi and
Marathi, in light and dark, with loading, empty, error and offline states on every screen.

## How this phase runs: eight small sub-phases

Phase 1 is too big to build and judge in one go, so it is cut into **1a to 1h**. Each sub-phase is small enough
to review in one sitting. Every sub-phase follows the same loop, and the next one does not start until you say so:

1. **Mini plan.** Before any code I write what the sub-phase will build and which files it touches. You approve it.
2. **Build.** Small commits, conventional messages. Nothing from a later sub-phase gets built; ideas go to
   `PHASE-2-notes.md`.
3. **I verify.** `pnpm lint`, `typecheck`, `test` and `build` pass with zero warnings. I run the app in the preview in
   light and dark, English, Hindi and Marathi, both fulfilment modes and 200% text, and read the console for errors.
   I report the results with screenshots and the Android bundle size. Failures are reported, never skipped.
4. **You verify.** I give you a short "look at these things" list for your phone (and what to tap). You check the
   design and the behaviour.
5. **Sign-off.** You reply "approved" or send changes. I fix and repeat steps 3 to 5.
6. **Close.** I commit, tag `phase-1a-done` (and so on), and stop. Design changes you ask for later are cheap
   until 1h; after that they go in the next phase's notes.

The phase gate (section "Gate checklist") runs once, at the end of 1h.

## Design direction (open, replaces the locked parts of ADR 0008)

Phase 0c locked a look. You have now said **nothing from the design is locked**: colours, header, navigation,
components and behaviour can all change. Sub-phase 1a writes **ADR 0010** to record the new direction and mark the
parts of ADR 0008 it replaces (the "header is always dark" rule, the flat cards, the no-bottom-tabs layout and
anything else we change). The aubergine and pistachio palette stays only until you choose otherwise.

**Inspired by the Blinkit and Zepto home screens, not copied.** Their _layout habits_ are what shoppers already
know, so we use the habits and make the look our own.

What the two screenshots do that we adopt as patterns:

| Pattern                                                                                                                                           | What we do                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tinted top block** holding the address row, a profile button and the search bar; its colour follows the selected category tab                   | Same idea in our palette. Each category tab sets a soft tint behind the header, so switching tabs feels like switching aisles                                |
| **Address row** with a small dropdown arrow                                                                                                       | Town and area on one line, tap to change; **a delivery window ("Today 4–6 PM") instead of "5 minutes"**                                                      |
| **Search bar** with a hint like "Search 'stationery'" and a mic                                                                                   | Search bar with a rotating hint in the user's language ("dudh", "aata" work as typed-in-English Hindi and Marathi); mic stays a V2 icon, hidden until then   |
| **Category tabs** with an icon and a label, one underlined                                                                                        | Horizontal tabs under the search bar (All, Dairy, Vegetables, Fruits, Staples, Snacks, and so on)                                                            |
| **Hero banner** under the tabs                                                                                                                    | One banner slot for festival or shop news, from the Content module later                                                                                     |
| **Round category chips with an offer line**                                                                                                       | Chips for sub-categories, with an offer line only when a real offer exists                                                                                   |
| **Product cards** with the image on top, a round "ADD" or "+" on the image corner, then price, strike-through price, name, pack size and "2 left" | Our `ItemCard`, restyled: ADD turns into a stepper in place; "2 left" only in dark-store mode (stock count), while partner mode shows an in/out toggle state |
| **Horizontal rails** of cards, with a cut-off card showing there is more                                                                          | Same: rails for "Your shops", "Order again" and each category                                                                                                |
| **Bottom tab bar**                                                                                                                                | Home, Order again, Categories, Orders, with the cart bar floating above it                                                                                   |
| **Floating cart bar and "Unlock free delivery, shop for ₹49"**                                                                                    | Floating bar with item count and total, plus a progress line to free delivery                                                                                |

What we deliberately do **not** take: their logos, fonts, illustrations, banners, copy, colour values, lightning
bolts, "minutes" language, ad labels, "Price drop" tags, or any layout detail beyond the patterns above. Quibo's own
differences stay visible: **a "Your shops" strip** (a local kirana, dairy or vegetable shop is the hero, not an
anonymous warehouse), **delivery windows**, **both fulfilment modes in one screen**, and Hindi and Marathi first.

Constraint kept from the project rules: **no hard-coded UI strings**, colours only from the theme, and a screen has to
work on a 2 GB Android phone on a weak network (no heavy shadows, blur or animation libraries).

## Sub-phases

### 1a. Look and feel: the Home screen, static

_Goal: you approve the design before any other screen exists._

- **Build:** ADR 0010 (new design direction). Revised theme tokens if needed. Bottom tab shell (Expo Router tabs:
  Home, Order again, Categories, Orders; the last three show a placeholder). A **static** Home: tinted header block
  with address row, profile button and search bar; category tabs; hero banner; sub-category chips; two product
  rails; the floating cart bar. Product cards restyled with the "ADD" interaction. All built from fixed sample data
  in the screen itself (replaced in 1b), so the look can change fast.
- **Show:** screenshots of Home in light and dark, three languages, both fulfilment modes, 200% text, plus the same
  on your phone through Expo Go.
- **Your check:** is this the look? Header tint, card shape, ADD button, tab bar, colours, type size, density. I
  expect one or two rounds of changes here, and that is the point of 1a.
- **Not in 1a:** real data, search results, navigation beyond the tabs, cart logic.

### 1b. Data and plumbing

_Goal: Home runs on mock data through the same path the live API will use._

- **Build:** Zod schemas in `packages/contracts` for store, item, category, price, stock, address, delivery window,
  cart, order. Fixtures in `packages/mocks` (shops with Hindi and Marathi aliases, 40 to 60 items across the
  categories, and orders), parsed through the schemas like `towns.ts`. An API client in `apps/customer/src` that calls
  `handleMockRequest` in UI phases and `fetch` on `EXPO_PUBLIC_API_URL` later, always parsing with the contract
  schema; screens never import fixtures. The `EXPO_PUBLIC_API_URL` and Expo-types workaround from the Phase 1 notes.
  The shared state views: `Skeleton`, `EmptyState`, an error view with retry, and an offline banner. Offline
  detection. Home now reads everything from the client, in both fulfilment modes (partner mode shows "Your shops",
  dark mode opens the one store).
- **Needs your approval for a package:** `@react-native-community/netinfo`, to detect being offline. (The cart can
  use `AsyncStorage`, which is already installed.)
- **Tests:** Vitest for schemas, fixtures and the client (success, bad data, network failure). A first Maestro flow
  (open app, see Home) if the tool is available; otherwise the flow files are written and the run waits for it.
- **Your check:** Home looks the same as in 1a but now shows real mock items; turn airplane mode on and see the offline
  state; switch town mode and see the Home change.

### 1c. Browse: shop page, in-shop search, global search, category listing

- **Build:** the **shop page** (header with shop name, open or closed, rating-free info, hours, minimum basket; items
  by category), **in-shop search**, **global search** (typed-in-English Hindi and Marathi, spelling tolerance on the
  mock data, recent searches, empty and "no result" states), and a category listing from the Categories tab and Home
  category tabs. The Stepper works on cards but writes to a temporary in-memory cart (made permanent in 1d).
- **Fulfilment modes:** partner mode shows an in/out state per shop item; dark mode shows a stock count and "only N
  left".
- **Tests:** Vitest for search ranking and spelling tolerance; Maestro flow: search "dudh", open the shop, add an item.
- **Your check:** is browsing fast and clear? Does "dudh" find milk? Is the shop page what a shop owner would be
  proud of?

### 1d. Cart

- **Build:** the **cart screen** (lines, steppers, weights in 0.5 kg steps for loose items, remove with undo, the
  `BillSummary`, the free-delivery progress line, the minimum-basket notice, a substitution choice per item, the
  estimated-weight tolerance note), the permanent cart store (kept across app restarts), and the floating
  `CartBar` wired to it. Money is integer paise throughout; weights go through `multiplyByQuantity` in
  `@quibo/contracts`.
- **One cart, one order (ADR 0009):** the cart can hold several shops. It shows each shop's items as that shop's
  part, with one total, one free-delivery line on the whole cart, and one delivery window set by the slowest shop.
- **Tests:** Vitest for totals, fee bands, free-delivery threshold, rounding and weight conversion (these are
  the bugs that cost real money later); Maestro flow: add items, change a quantity, remove an item.
- **Your check:** bill numbers add up by hand; weights and rupees look right; empty cart is helpful.
- **Built in phases (the cart follows the design the user chose from reference screenshots).** A: page frame and
  bill (done, then corrected by ADR 0011: no minimum order, a flat list of items, a delivery fee that follows the
  trip and is capped at 30 rupees, a handling fee under 18 rupees set by the most delicate item, a plain bill with
  "Why this price?", the savings strip, the checkout bar; fees and limits live in `ZONE` in `home/delivery.ts`). B (done, then reshaped by ADR 0012: quick delivery is the default with an estimate in minutes, and "Schedule" opens
  the page for one-hour windows today and tomorrow; windows too soon to pack removed, full ones locked, each window shows
  its delivery fee; the choice is kept on the phone and feeds the delivery fee). C (done):
  coupons and offers as placeholders: a coupon card on the cart that suggests the best coupon, a coupons page with a code field and
  three sample coupons (percent with a limit, flat, small-order), applying and removing, a coupon row in the bill and in the
  savings, kept on the phone; free delivery is judged before the coupon; a coupon the cart no longer qualifies for is taken
  off at once with a note saying why, and an emptied cart keeps no coupon. The cart also says when the chosen delivery window
  has gone or quick delivery has closed, instead of changing the delivery silently. D (done): a tip and delivery instructions card (a Tip view with ₹10, ₹20, ₹30 and a typed amount up to ₹100, nothing chosen by
  default and one tap to take it away, all of it for the rider; an Instructions view with a row of icon tiles to slide through and a note that is saved with a button and shown back, kept on the
  phone), placed after the bill, a rider-tip line in the bill, and "You might also like", a row of items that go with the cart, each with ADD. E (done, apart from the refund for lighter weighed items, which comes with F): a "Delivering to" row in the
  delivery card with a Change link (the address screens are built in 1e), a "Packed by verified shops" card (shield,
  name, Verified mark and food licence number for each store, or the one Quibo store), four promises (price, safe
  careful handover, easy fix, one trip), a bookmark on each item to put it aside for later with a "Saved for later" list that is
  kept on the phone and shown even when the cart is empty, and a share button for the cart. F: loose items sold by weight and the "if unavailable" choice. G: offline and error
  states, accessibility, large text, Hindi and Marathi review.

### 1e. First run and address: language, phone OTP, address

- **Build:** **language** screen (en, hi, mr), **phone and OTP** (mock: one fixed test OTP in the dev fixtures, a
  resend timer, wrong-code and expired-code errors; consent text and log, never logs the OTP), and the **address**
  screens (saved addresses, add and edit: landmark text, ward or mohalla, alternate phone, a **serviceability check
  against mock zone polygons**, so an address outside the town shows a clear "we do not deliver here yet" state).
  Keyboard handling lands here (the first forms): `Screen` and `Input` avoid the keyboard, checked with the
  largest font.
- **Map pin:** decided in the open questions below. The default is a **mock map picker** with the landmark and ward
  fields doing the real work, and a real map added in Phase 2.
- **Tests:** Vitest for phone validation, OTP state and zone check; Maestro flow: first launch to a saved address.
- **Your check:** can a first-time user get from install to Home unaided? Is it short enough?

### 1f. Checkout and tracking

- **Build:** **checkout** (address, delivery-window picker with full windows struck through, payment choice with a
  COD cap for new customers and UPI in test form, order summary, place order with an idempotency key kept in the
  mock) and **order tracking** (`StatusTimeline` through placed, accepted, ready, picked up, delivered, plus the
  rejected, cancelled and undelivered exits; call shop, call rider, COD
  amount). A mock "order clock" moves an order through the states on a timer so you can watch tracking work.
- **Several shops, one rider (ADR 0009):** tracking is one order with one rider. The timeline shows each shop's
  part as packed or picked up, then one trip to the customer.
- **Fulfilment modes:** dark mode skips the "shop accepts" step; the timeline reflects the mode without the screen
  branching in code (it reads the town's configuration, as ADR 0002 requires).
- **Tests:** Vitest for the timeline for each mode; Maestro flow: cart to placed order to watching it delivered, in
  both modes.
- **Your check:** the full order, end to end, on your phone, in both modes.

### 1g. Past orders, reorder, help, settings

- **Build:** **past orders** list and detail, a one-tap **reorder** into the cart, **help** (FAQ topics, call and
  WhatsApp the operator, report a problem on an order), and **settings** (language, theme, saved addresses, log
  out). The `/components` gallery is removed from production builds.
- **Tests:** Maestro flow: reorder a past order; help opens the call and WhatsApp links.
- **Your check:** reordering feels effortless; help answers the real questions.

### 1h. Hardening and gate

- **Build nothing new.** Fix what the checks find, then run the gate:
  - **Accessibility:** automated contrast tests for every new colour pair; a TalkBack pass on each screen; the
    largest font size on each screen.
  - **Real low-end phone:** every Maestro flow on a 2 GB Android phone with a throttled network; cold-start time and
    memory recorded.
  - **Languages:** Hindi and Marathi strings sent for review by a native speaker; wrapping checked on every screen.
  - **Performance:** bundle size reported; Zod and the 971 KB unused icon font looked at if the budget is missed.
  - **Test with people** (PLAN section 12): 5 households and 3 shop owners place a mock order unaided, in both
    modes.
- **Close:** `docs/phases/PHASE-1-report.md`, your sign-off, tag `phase-1-complete`.

## Scope

### In

- [ ] The twelve customer screens of PLAN section 6, each with loading, empty, error and offline states
- [ ] Both fulfilment modes, driven by town configuration, never branched on in order logic
- [ ] English, Hindi and Marathi for every string, light and dark themes
- [ ] The new design direction, recorded in ADR 0010
- [ ] A bottom tab bar, a floating cart bar, and the shared state views
- [ ] Contracts, fixtures and an API client so that Phase 2 swaps the mocks for the real API with no screen change
- [ ] Maestro flows for each journey in both modes, and Vitest tests for all logic

### Out (not this phase)

- Real API, database, real OTP, real payments, real map, push or WhatsApp messages (Phase 2)
- Voice search (V2)
- Admin panel, store portal, driver app (Phases 3 to 6)
- Real product photos and a custom font, unless 1a decides on a font (it costs about 500 KB)
- Performance tuning beyond measuring and the budgets below (ADR 0007)

## Budgets (working targets)

- Android Hermes bundle: **5.0 MB or less** (3.5 MB today; reported at the end of every sub-phase)
- Cold start on a 2 GB Android phone: **recorded in 1h, with a target to be set after the first measurement in 1b**
- Every screen usable at 200% text size and on a throttled network

## Verification (per sub-phase, then the gate in 1h)

1. [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass with zero warnings
2. [ ] The sub-phase's screens checked in light, dark, English, Hindi, Marathi, both modes and 200% text
3. [ ] No console errors or warnings in the preview
4. [ ] The sub-phase's Maestro flow written, and run once the tool is available
5. [ ] You have checked it on your phone and replied "approved"

## Gate checklist (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install, with no unexplained warnings
- [ ] Maestro flows pass in both fulfilment modes
- [ ] No serious accessibility issues: contrast tests, a TalkBack pass, the largest font size
- [ ] Bundle size inside the budget; a cold start recorded on a 2 GB phone
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] No open blocker or major defects; minor ones logged with an owner
- [ ] `PHASE-1-report.md` written, demo done, human sign-off recorded, tag `phase-1-complete` pushed

## Decisions and open questions

Decided by the human:

1. **Offline detection (1b):** add `@react-native-community/netinfo` only if it turns out to be necessary; ask again
   at the point of adding it, with the reason.
2. **Map pin (1e):** a mock picker now; a real map in Phase 2.
3. **Font (1a):** system fonts. Poppins is dropped for this phase.
4. **Palette (1a):** start from aubergine and pistachio; the human will ask for changes after seeing it.

Still open:

5. **Maestro (1b onwards):** is there an Android emulator or a phone with USB debugging on this machine? Without
   one, flows are written but only run in 1h.

## Plan approval

Approved by: _pending_ Date: _pending_
