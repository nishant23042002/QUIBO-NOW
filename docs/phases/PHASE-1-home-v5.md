# Phase 1: Home v5, the locked redesign (sub-phase 1m)

**Surface:** customer app
**Kind:** UI on mock data
**Depends on:** departments and needs on Home (1l), the trust and plan decisions (ADR 0053, ADR 0054)

> **Status: plan, written 2026-10-14 and waiting for the owner's approval. No code has been written for it.**
> The locked design is the mock [Quibo Home Redesign](https://claude.ai/artifact/NqSBx7fveEofH75RhhG3Ty), version 5, kept in the
> repo as `docs/design/home-v5-mock.html`. The colour change was dropped, so the palette stays aubergine and pistachio.

## Goal

Home is rebuilt to the locked mock: one canvas at the top, the payment and trust strip, the "Know your shop" argument, grouped
categories with Coming soon and Notify me, and the modules after them. The app keeps working at every step, and I stop after each
step for a phone check in Expo Go.

## Context

- Every feature traces to PLAN section 4 (rows 11 and 12 are new) and to ADR 0053 and ADR 0054. Nothing here needs a backend.
- The mock uses the current palette, so `palette.ts` does not change. Components read colours only from the theme.
- Several things in the mock already have a real source in the app, so they are wired to it and not faked:
  | Mock piece            | Source in the app today                                            |
  | --------------------- | ------------------------------------------------------------------ |
  | Buy again             | the orders the phone already keeps (`OrdersProvider`)              |
  | Live order card       | `OrdersProvider` and the mock order clock (ADR 0018)               |
  | Pay on delivery badge | the payment choice and cash limit (ADR 0019)                       |
  | Out-of-area screen    | saved addresses and the delivery zone (ADR 0016)                   |
  | Shops closed state    | the quick-delivery hours (ADR 0012, `ZONE.quick`)                  |
  | Language chip         | `LanguageProvider` (English, Hindi, Marathi), today set in Profile |
  | Coming soon cards     | `ComingSoon` and the departments data (ADR 0044, ADR 0046)         |

## What this supersedes

- ADR 0050 in part: the offers no longer slide under the tabs; the mosaic takes that place and offers move to "Offers for you".
- ADR 0031 and ADR 0046 in part: "Shop by category" becomes the grouped list. Its tiles, picture frame (ADR 0051) and
  Categories tab data are reused.
- ADR 0052: the lean switch is replaced by the new-customer layout, which puts "Know your shop" first and hides Buy again.
- ADR 0043 is superseded in full by ADR 0056: the quick-filter row (the intents) is gone from Home. "Trending in Roha" takes its
  tabs from its own plan when step 7 is written.

## Decisions to confirm before step 1

1. **Display font.** The mock uses Bricolage Grotesque for module titles. That is a new dependency, and the working rule is to ask
   first. **Recommendation:** start with the system font in heavy weight and the sticker motif (the price badge shape) for the
   lettering. Add the font later only if the phone check shows the titles need it.
2. **Corners.** The mock uses 14 to 22 dp on cards and modules. ADR 0049 says squarer corners app-wide (6, 8, 12, 16).
   **Recommendation:** build to 12 and 16 and keep the layout as is.
3. **Pills in Daily essentials.** The mock's Morning, Cooking, Evening control is a round pill; you rejected pills in essentials
   earlier (ADR 0048). **Recommendation:** keep the squared segmented control that is built, with the new tile grid under it.
4. **No countdown.** The moment screens in the mock show a thin progress line that fills as the screen closes. That reads as a
   countdown timer, which the project rules forbid. **Recommendation:** no progress line; the screen closes by itself after the
   same time and on any tap.
5. **Real facts only.** "Know your shop" names Sharma Dairy and "since 2009", which exist in the sample shop data. The owner's
   name and quotes in the mock are not in the data and are dropped. Anything shown must come from a shop record.
6. **Notify me and Ask your shops are stored on the phone** in this phase, with consent logged, and sent to the API in Phase 2.

## Steps (one at a time; after each I stop for the owner's phone check)

| #   | Step                             | What it builds                                                                                                                                                                                                                                                                                                                                     | Check                                                |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 0   | **Housekeeping**                 | Commit the plan edits already made (PLAN, CLAUDE.md, ADR 0053 and 0054, the parked notes). Save the mock into `docs/design/`. Write ADR 0055 (Home v5, Proposed).                                                                                                                                                                                  | Docs only                                            |
| 1   | **Header and hero**              | Delivery range as the big line with the "N shops open" pill, a Schedule slot in the search bar, the language chip, the category tabs as they are, and the "Right now in Roha" mosaic with the "Meet your shops" strip, all on one canvas. The offers carousel leaves the header. The shared header keeps Categories and Orders working (ADR 0028). | Home top, Categories and Orders headers              |
| 2   | **Strip and states**             | The payment and trust strip (Pay on delivery only when cash is allowed, Visited shops only, Free delivery, UPI and cards), the live order card, and the shops-closed banner with the header's next window.                                                                                                                                         | Home with no order, an active order, and after hours |
| 3   | **Fresh today and Bestsellers**  | Icon-tab rail (Under ₹30, Veggies, Fruits, Dairy, New in) using the unchanged product card, and the 3 by 2 collage tiles.                                                                                                                                                                                                                          | Home                                                 |
| 4   | **Know your shop**               | The scene you drag, five question cards, the 0 of 5 against 5 of 5 score and the close; the Quibo promise and the How we check a shop sheet. New customers see it right under the strip, returning customers after Bestsellers.                                                                                                                    | Home                                                 |
| 5   | **Categories, grouped**          | Zepto-style groups with a wide first tile, Coming soon tiles with Notify me, a "Coming soon to Roha" row including Pharmacy and Only on Quibo, and the Categories tab with Find a category. Replaces "Shop by category".                                                                                                                           | Home and the Categories tab                          |
| 6   | **Essentials, prices, routines** | Daily essentials as a tick-and-add tile grid, Small prices as three price stores with filters, Picks for your routine. The existing logic and data are kept.                                                                                                                                                                                       | Home                                                 |
| 7   | **Buy again and more**           | Buy again from saved orders (today's prices, out of stock named), Continue browsing, Trending in Roha with its own tabs (the quick filters were removed, ADR 0056), Brand stores.                                                                                                                                                                  | Home with and without past orders                    |
| 8   | **Banners and close**            | Featured banners, Offers for you, the Quieter times module, shelves with a banner between, Can't find something, help row, footer.                                                                                                                                                                                                                 | Home, end to end                                     |
| 9   | **Language**                     | The language sheet from the chip, the first-run card for a new customer, and Hindi and Marathi for every new key.                                                                                                                                                                                                                                  | Home in three languages, 200% text                   |
| 10  | **Out of the area**              | The out-of-area screen with pincode, Notify me, towns served and "Look around Roha anyway".                                                                                                                                                                                                                                                        | A saved address outside the zone                     |
| 11  | **Moment screens**               | Launch (extends `AppSplash`), between navigation (first, then every third, never twice in 20 seconds), order placed. Reduced motion respected.                                                                                                                                                                                                     | The three moments                                    |
| 12  | **Close-out**                    | Skeletons that mirror each new section (ADR 0035), Maestro flow, accessibility pass, docs (PLAN screen inventory, ADR 0055 Accepted), gate and report.                                                                                                                                                                                             | Gate and report                                      |

## Left out on purpose (parked)

- **Standing orders (daily, chosen days, monthly list):** not designed yet; parked in `PHASE-1-trust-and-plan-notes.md`.
- **Real shop stories and photos:** removed from the design; they need shop data and consent.
- **Pharmacy and Only on Quibo as real catalogues:** placeholders only (ADR 0053).
- **A new display font and a palette change:** dropped for now.

## Risks and how they are handled

- **The shared header touches three tabs.** Step 1 is checked on Home, Categories and Orders before anything else is built.
- **Home gets long.** Sections use the existing lazy rows and skeletons, and the new-customer layout stays short. I measure the
  first screen and the scroll length on a 2 GB phone at step 8.
- **Copy that argues against a competitor.** "Know your shop" states only what a customer can check, names no company, and needs a
  legal read before launch (ADR 0054).
- **Mock data drifts from the API.** New shapes live next to `items.ts` with `town_id`, ready to move into `packages/contracts` in
  Phase 2.

## Verification (per step, plus the gate)

1. [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass; new logic has Vitest tests.
2. [ ] The step's screen works in light and dark, in English, Hindi and Marathi, at 200% text size.
3. [ ] Loading, empty, error and offline states exist for each new section.
4. [ ] Text never goes below 14, touch targets stay 48 dp, and the product card, bottom bar and cart bar are unchanged.
5. [ ] Owner phone check in Expo Go before the next step.

## Approval

Approved by the owner on 2026-10-14 ("approved"), with the recommendations on the six points above standing.

## Progress

- **Step 0, housekeeping: done.** The plan edits and the plan itself are committed; ADR 0055 is written (Proposed).
- **Step 1, header and hero: built, waiting for the owner's phone check.**
  - Header: the estimate leads (a small "Estimated delivery" label, then the range in big type), the language chip sits beside the
    profile button (it opens Profile until the sheet is built in step 9), and the search bar has a "Schedule a slot" button that
    opens the schedule page. Categories and Orders wear the same header through `TabHeader`.
  - Hero: "Right now in Roha" replaces the sliding offers, on the header's colour, with a tall milk tile showing the lowest milk
    price in town, four small tiles, and a "Meet your shops" strip that opens the shops row. The page slides up over it with
    rounded corners (16).
  - Checks: lint, typecheck, test (664 customer tests) and build pass; looked at on the web preview in light and dark, on Home,
    Categories and Orders. The Maestro assertions on the header line now look for "Estimated delivery" or "Scheduled delivery".
  - Not yet looked at on a real phone, at 200% text, or in Hindi and Marathi.
- **Step 2, strip and states: built, waiting for the owner's phone check.**
  - Payment and trust strip under the mosaic: Pay on delivery (the one filled chip, with the price badge's stamped edge; shown
    only where cash is allowed, ADR 0019), Visited shops only, Free delivery over the town's line, and Pay by UPI. The chips are
    statements; "Visited shops only" opens its sheet in step 4.
  - Live order card on the canvas above the mosaic while an order is still going: the arrival range or window (never a countdown),
    segments for where it is, the headline and the shops, and Track, which opens the order page. It reads the orders the phone
    keeps and goes when the last one is over.
  - Closed banner while quick delivery is closed (the town's quick hours): says so, names the window the order is set for, and puts
    the schedule page one tap away. It reads `quickClosed` and `hasWindow`, added to the shared delivery words.
  - **Follow-up, 2026-10-14 (owner's phone check).** The live card was rebuilt to the mock: a state kicker, the arrival range,
    four named steps (Accepted, Packed, On the way, Delivered), the shops packing and, once packed, who brings it, and Track. It is
    drawn on a new `GlassPanel` (a white sheen, an accent glow, a bright edge; no blur library, so no new dependency). A true
    backdrop blur would need `expo-blur` and shows nothing on a flat canvas, so it was not added.
  - **Bug fixed: a second order could not be placed without reloading.** Checkout stays mounted in the tab group, so after an
    order its "placed" step and its order key carried over: "Place order" did nothing and a second order would have been taken for
    the first. The page now resets the flow, the payment choice and the key once it is left after an order. A test covers the flow.
- **Step 3, Fresh today and Bestsellers: built, waiting for the owner's phone check.**
  - Fresh today: a lettered title ("Fresh" with a "today" sticker that has the price badge's stamped edge), a soft pistachio wash,
    round tabs (Under ₹30 as a stamped price, Veggies, Fruits, Dairy, New in) and the usual item cards of the chosen tab. Out of
    stock items are left out and the Under tab is cheapest first. See all opens that tab's category, or the Categories tab for
    Under and New in. "New in" uses a sample list of types until the API says what is new.
  - Bestsellers: the town's live categories as three-across collage tiles (four pictures, "+N more", the name under). With no sales
    data in Phase 1 the order is the town's own order; the API supplies real ranking later. A tile opens the category screen.
  - New parts: `LetteredTitle`, `IconTabs` and `AccentWash` in `ui`; `fresh.ts` and `bestsellerTiles.ts` hold the rules, with tests.
  - Test orders placed in the web preview while checking steps 1 and 2 were removed from its storage.
  - Not done yet: the loading skeleton does not draw these two sections (that is the close-out step).
  - Checks: lint, typecheck, test (670 customer tests) and build pass. Looked at on the web preview in light: the strip, and the
    live card after placing a real mock order. The closed banner depends on the clock and has not been seen on screen.
  - **Follow-up, 2026-10-14 (owner's phone check).** The quick-filter row was removed (ADR 0056), the payment strip and Fresh
    today share one pistachio wash, and the page sheet now clips to its rounded top corners.
- **Step 4, Know your shop: built, waiting for the owner's phone check.**
  - Know your shop: a lilac stage (the soft aubergine tint the header wore before it went deep) that fades in one straight line
    into the page colour, holding the heading ("Would you trust what you can't see?") and a scene to drag (a sealed dark store
    against an open shop; the divider stays between 10% and 90%, and for a screen reader it is a slider with increase and
    decrease). Under it, five swipeable question cards (each answered for a dark store and for a shop, with a count that follows
    the swipe and dots), the 0 of 5 against 5 of 5 score. (A closing card with a Meet your shops button was built and then removed at the owner's request,
    2026-10-14, ADR 0057; the mosaic's strip already opens the shops row.)
  - The shop named in the answers is a real one from the shop data (its name and the year it joined Roha). The owner's name and
    quotes from the mock are not in the data and are dropped (decision 5 above).
  - The Quibo promise (four lines and a "How we check a shop" button) sits near the bottom, before the footer. "How we check a
    shop" is a sheet with four steps; it opens from that button and from the "Visited shops only" chip, which is now a button.
  - Placement: right under the header for every customer, with the payment strip at the top of its lilac-to-page stage so strip,
    heading and scene are one fade, and Fresh today under it on a wash of its own. (It first moved after Bestsellers for someone
    who had ordered; the owner saw the phone, which had orders, and the web, which had none, show different pages, so it is the same
    everywhere, 2026-10-14.)
  - The payment strip scrolls on its own: each chip snaps to the page's left margin, the last one ends with the same margin, and
    a fade on the stage's colour shows on whichever side has more chips, so a chip never looks cut by the screen edge.
  - Dark-store towns: the argument is not true of what the customer buys there, so Know your shop and the promise are not shown,
    and the "Visited shops only" chip leaves the strip (`stripChips` now reads the store kind; a test covers it).
  - New parts: `PlumCard` in `ui`; `CompareScene`, `KnowYourShop`, `QuiboPromise`, `HowWeCheckSheet` and the rules in
    `knowRules.ts` (with tests) in `home`. `HomeHeader` accepts a function as its children so a section far down can open the
    shops row. No new palette tokens: the dark store is the header's colour under the overlay glass.
  - Copy to review: the whole module argues against dark stores. It names no company and carries a line saying it compares only
    what a customer can check; it still needs a legal read before launch (ADR 0054). The four promise lines and the four steps are
    drafts until the first shops are visited; the sheet says so.
  - Not done yet: the loading skeleton does not draw the module (close-out step); Hindi and Marathi are drafts.
  - Checks: lint, typecheck, test (681 customer tests) and build pass. Looked at on the web preview at 375 px: the scene and its
    drag, the cards, the score and the sheet. The returning-customer place and the dark-store case are covered
    by the placement test and have not been seen on screen.
- **Step 5, categories grouped: built, waiting for the owner's phone check.**
  - Home: "Shop by category" is replaced by the groups the town stocks (Grocery & Kitchen, Snacks & Drinks), each a title and a
    grid whose first tile is wide with the pictures of what it holds. The categories of the group that are coming sit beside the
    live ones, softened, with a "Soon" tag. Under them, "Coming soon to Roha": a card for each group that is only coming (Beauty &
    Care, Tech & Play, Home & Style, Pharmacy, Only on Quibo) with a Notify me button, then "All categories".
  - Notify me: a tap on a coming tile or card turns it on and off. The tile turns pistachio and says Notify; the card says it will
    tell the shopper. It is kept on the phone (`quibo.notify`) with when and under which wording they first agreed (the consent
    log), and goes to the API in Phase 2. Pharmacy and Only on Quibo are placeholders, never catalogues (ADR 0053).
  - Categories tab: a Find a category field that is always there, every group (the stocked categories as rows, then the group's
    coming ones as tiles with Notify me, and the groups that are only coming as just those tiles). The "Coming to Roha" page keeps a
    Notify me button for a deep link.
  - Data: eight categories that are coming (Breakfast & Sauces, Meat & Fish, Cold Drinks & Juices, Ice Creams, Medicines, Health &
    Wellness, Quibo Picks, Gift Boxes) and the groups Pharmacy and Only on Quibo, all sample data until the API supplies them.
  - Removed: `ShopByCategory`, `useCategoryTiles`, the grid and index helpers of `categoryLists`, the `FIND_FROM` rule, and the
    `home.shopByCategory` messages. New: `HomeCategories`, `ComingSoonRail`, `useCategoryGroups`, `notify.ts` and `useNotify.ts`
    (with tests), `subsEmojis`.
  - Checks: lint, typecheck, test (705 customer tests) and build pass. Looked at on the web preview at 375 px: the groups, a wide
    tile, the soon tiles, the cards, Notify me on a tile and a card (kept across screens), and the Categories tab. Not seen on a
    real phone, at 200% text, or in Hindi and Marathi. The loading skeleton mirrors the groups and the cards.
- **Step 6, essentials, prices, routines: built, waiting for the owner's phone check.**
  - Daily essentials: a lettered title ("Daily" with an "essentials" sticker and the line "Tick what you need, then add them in one
    tap"), the squared Morning, Cooking, Evening control and a grid of tiles, two to a row, on a soft aubergine block. A tile has its
    picture with a tick box, the name (two lines), the price over the pack or "3 left", and a tap ticks it. A tile already in the
    cart is green-washed with the usual stepper. Select all and "Add 3 items" stay under the grid. The ticking, the basket and the
    tab data (`essentials.ts`) are unchanged; only the rows became tiles.
  - Small prices: a lettered title on the pistachio wash (curved top and edge, like Fresh today), three price stores as price bands (up to
    ₹30, ₹30 to ₹50, ₹50 to ₹100: each holds only what the one below does not, so "Under ₹100" is not a repeat of "Under ₹30") as
    big buttons with the chosen one stamped, a row of filter chips (All, Dairy, Vegetables, Fruits, Staples, Snacks)
    and the same cheapest-first card row. The picking rule gained an optional category (`pickUnder(..., category)`, tested).
  - Picks for your routine: "Shop for your need" is renamed and shown as soft tinted cards two to a row with a line saying what
    they are; each opens its need page as before. The needs data is unchanged.
  - The lean switch (ADR 0052) is removed: `EXPO_PUBLIC_HOME_FIRST_RUN_LEAN`, its code, tests and `.env` lines are gone, so Picks,
    Small prices and Featured show for every customer and the page is the same on every phone (ADR 0055 said it was replaced).
  - Checks: lint, typecheck, test (701 customer tests) and build pass. Looked at on the web preview at 375 px: the tile grid (tick,
    add, an in-cart tile with its stepper), the stores and chips (the Dairy filter), and the routine cards. Not seen on a real phone,
    at 200% text, or in Hindi and Marathi. The loading skeleton mirrors the three sections.
