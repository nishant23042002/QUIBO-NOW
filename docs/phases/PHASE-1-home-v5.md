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
- **Ask your shops ("Can't find something?"):** built in step 8 and removed from Home after step 11 at the owner's request, with its
  code, tests, messages and the `quibo.requests` store. Kept in the plan: bring it back in a later phase only if wanted (a field to
  type what is missing, kept with when the shopper agreed, sent to the shops in Phase 2).
- **A palette change:** dropped for now. The display font is built (Bricolage Grotesque, see below).

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
- **Step 7, buy again and more: built, waiting for the owner's phone check.**
  - Buy again: a lettered title on the pistachio wash, above Fresh today, only for a customer who has orders on the phone. Two
    views, "Last order" and "Most ordered" (a pack counts once per order; cancelled, rejected and undelivered orders do not count).
    The cards are today's items at today's prices; an item that is out of stock is named under the row, and "Add 3 items · ₹192"
    puts one of each thing that can be bought into the cart (half a kilogram for loose items), skipping what is in it already.
  - Continue browsing: the products the shopper opened last (the product page notes only the product's id, kept on the phone as
    `quibo.viewed`, newest 8), after Bestsellers, with a Clear button. Out-of-stock and gone items are left out. Nothing shows until
    something has been opened.
  - Trending in Roha: a two-column grid with its own tabs (All items, Offers, Under ₹50, Veg) on a new `UnderlineTabs`, one of each
    kind, up to eight cards, then See all (the Categories tab). The tabs are views of the same items, not categories.
  - Brand stores: Shop by brand keeps its row of brand tiles; a tile now opens that brand's store under the row (its name, how many
    items, up to eight cards) and the store's button opens the brand's own page.
  - Logic with tests: `againRules.ts`, `viewed.ts`, `trendingRules.ts`. New: `BuyAgain`, `ContinueBrowsing`, `Trending`,
    `BrandStores`, `useViewed`, `UnderlineTabs`. `ShopByBrand` was replaced by `BrandStores`.
  - Checks: lint, typecheck, test and build pass. Looked at on the web preview at 375 px with a saved order injected into the
    preview's storage (Buy again at today's prices), a product opened (Continue browsing), Trending and the brand store. The
    test data was removed. Not seen on a real phone, at 200% text, or in Hindi and Marathi. The loading skeleton draws Trending and
    the brand store; Buy again and Continue browsing are not drawn in it (the close-out step).
- **Step 8, banners and close: built, waiting for the owner's phone check.**
  - Featured this week: the same three picks, now each card says "Featured", names the pick and ends with "Shop now".
  - Offers for you: a swipeable row of cards from what the app really has: free delivery over the town's line and the sample
    coupons (the same ones the Coupons page lists); every card opens that page.
  - Quieter times: a lettered title with a "cost less" sticker on a warm block, a big "Pick a window" tile and four windows spread
    across the day, each with what it saves against a rush hour from the town's own rules (a window inside the rush hours says
    "Rush hour" and promises no saving). Every tile opens the schedule page. It replaces the one-line note.
  - A banner between the shelves (the monthly ration, one tap) after the second shelf.
  - Can't find something: a field and "Ask shops". What was typed is kept on the phone (`quibo.requests`, the newest 20) with when
    and under which wording they agreed, and goes to the shops in Phase 2. After sending it says it was noted.
  - A help row opens Help, and the footer gains "Your money stays in Roha." under the line it had.
  - Logic with tests: `quieterTimes.ts`, `askShops.ts`. New: `QuieterModule`, `OffersForYou`, `ShelfBanner`, `CantFind`, `HelpRow`,
    `useAskShops`. `QuieterNote` and the `home.quieterNote` message are gone.
  - Page order now: header, Know your shop (with the strip), Buy again, Fresh today, Bestsellers, Continue browsing, the category
    groups and Coming soon, Daily essentials, Picks for your routine, Small prices, Trending, brand stores, Featured, Offers for
    you, Quieter times, the shelves with the banner, the promise, Can't find something, the help row and the footer.
  - Checks: lint, typecheck, test (740 customer tests) and build pass. Looked at on the web preview at 375 px: Quieter times, the
    end of the page, and Ask shops saving with its consent log (the test entry was removed). Not seen on a real phone, at 200% text,
    or in Hindi and Marathi.

- Owner change after step 8: Know your shop's five swipeable cards became one side-by-side table named "Dark Store vs Connected
  Store" (`KnowYourShop.tsx`; message `home.know.fiveTitle` is now `compareTitle`; labels read "Dark Store" and "Connected
  Store" in en, hi and mr, and the scene names match). The light page colour is `#FBFAFC`. Lint, typecheck and 740 tests pass;
  looked at on the web preview at 375 px. Hindi and Marathi wording is a draft for a native reader.
- Know your shop's table is compact: it shows two rows, then "View more" opens the other three (and "View less" closes them);
  the 0 of 5 against 5 of 5 score sits under the button and is always on screen (`KNOW_ROWS_COLLAPSED` in `knowRules.ts`).
- **Step 9, language: built, waiting for the owner's phone check.**
  - The language chip on every tab's header opens a sheet (`i18n/LanguageSheet.tsx`, mounted once above the screens in
    `_layout.tsx`): English, हिन्दी and मराठी as large rows, each with its English name beneath, the one in use ticked, and a
    line naming the other two languages' headings so someone in a language they do not read can still find theirs. A choice
    changes the words at once, closes the sheet and is kept. Profile still has the same setting.
  - **First-run card on Home: not built, on purpose.** The sign-in flow already opens with a language step for every new customer
    (`account/FirstRun.tsx`, stage `language`), so nobody reaches Home without having chosen. A second card would never show.
    Say if you still want one (for example for a customer who skipped sign-in in a later phase).
  - Hindi and Marathi: every key added in steps 1 to 9 has both. The review sheet (`PHASE-1-language-review.md`) now includes
    the language sheet, Dark Store vs Connected Store and the Quibo promise. New Maestro flow `language.yaml`.
  - Checks: lint, typecheck, test (741 customer tests) pass. Looked at on the web preview at 375 px: the sheet in English, then
    Home in Hindi. Not seen on a real phone, at 200% text, or in Marathi.
- **Step 10, out of the area: built, waiting for the owner's phone check.**
  - When the chosen address is outside every delivery zone, Home is `OutOfArea` (under the header the other tabs wear, its
    estimate replaced by "Not here yet", so no minutes are promised): a plum card that says so, a pincode field (starts from a
    pincode found in the address text) with Notify me, "Where we deliver today" (Roha with its open shops; Mhasla and Tala with
    Notify me), and "Look around Roha anyway". Notify me is kept with the same consent log as the categories' (`pin:<code>` and
    `town:<id>` beside the category ids in `quibo.notify`).
  - Looking around shows Home's shops with a banner ("ordering is paused" and a way back), and checkout's button reads "We do
    not deliver here yet" and is off. The choice lasts until the app closes, or until another address is chosen.
  - Logic with tests in `areaRules.ts` (pincode, zone check, towns); state in `useAreaStatus.ts`; the towns are stand-ins for
    town data in Phase 2, as the zone shapes are (ADR 0016).
  - **Reaching it:** an address outside the area cannot be saved or chosen (ADR 0016), so today the screen appears only when the
    zones change under a saved address. A switch in Settings, in the testing tools ("Delivery area"), shows it in development
    builds. Maestro flow `area.yaml` uses it.
  - **Not built:** the mock's "Suggest a shop" card, which is not in this plan row. Parked for the owner to decide.
  - Checks: lint, typecheck, test (750 customer tests) and build pass. Looked at on the web preview at 375 px: the screen, the
    pincode and a town saved to Notify me (the test entries were removed), looking around, and checkout's off button.
    Not seen on a real phone, at 200% text, or in Hindi and Marathi.
- **Step 11, moment screens: built, waiting for the owner's phone check.**
  - **Launch:** the splash gains a small pill under the tagline with one fact's heading (a different one each day), shown with the
    tagline so it never changes language on screen. Not in a town served by one dark store.
  - **Between screens:** a "Why Quibo" screen (`FactMoment`) with one fact, about a second and a half, closed at a tap. It comes
    on the first screen opened and then every third, never twice within 20 seconds of any moment (launch and order placed
    count), and never in front of a task screen (cart, checkout, orders, addresses, search, help, profile). `momentRules.ts`
    holds the rules with tests; `momentClock.ts` is the shared clock.
  - **Order placed:** on pistachio now, as the mock has it, naming the shops the order is with and that one rider brings one bag
    with their names on it, with the order number, and a tap moves on at once. It still opens the order underneath while solid.
  - **Rules kept:** no progress line and nothing counts down (decision 4). With reduce motion on, or a screen reader on (the web
    cannot tell, so it is taken as off there), the between-screens fact does not appear at all; the launch and order screens only
    cover the change of screen, as they did.
  - **Copy:** the six facts are claims about shops and the plan; like Know your shop they need a legal read before launch.
  - Checks: lint, typecheck, test (757 customer tests) and build pass. Looked at on the web preview at 375 px: the launch pill,
    a fact on the third screen opened, and an order placed. Not seen on a real phone, at 200% text, or in Hindi and Marathi.
- Owner change after step 11: the light page is plain white and `surface` carries the faint tint (`#FBFAFC`), so cards, fields,
  sheets and the bottom bar no longer merge into a near-white page. One change in `palette.ts`; lint, typecheck and 757 tests pass.
  Looked at on the web preview at 375 px: Home, the comparison table, Fresh today, Categories and a product page.
- Owner change after step 11: Daily essentials is back to the list it had before step 6 (ADR 0048): the segmented control over one
  card of tickable rows, a hairline between them, the "Select all" and "Add N items" bar under it, and the green in-cart rows with
  a stepper. The tile grid and its lettered title are removed, with the three strings only they used (`home.essentials.word`,
  `sticker` and `sub`). Behaviour is unchanged; lint, typecheck and 757 tests pass, and ticking and adding was tried on the web
  preview at 375 px.
- Owner change after step 11: a fine, light border (`line`) on the tinted tiles and cards that sat on the white page without one:
  the "Right now in Roha" tiles and the shops strip, the Bestsellers tiles, Picks for your routine, Brand stores, Quieter times and
  the shelf banner. No new colour. Lint, typecheck and 757 tests pass; looked at on the web preview at 375 px.

## Changes after step 11 (owner's list, 2026-10-15)

1. **Strip chip:** "Visited shops only" is replaced by "Quieter times · Save up to ₹4", which opens the delivery windows. The
   "visited in person" message is said in Know your shop and the promise. The chip shows in dark-store towns too.
2. **Coming soon to Roha** (the row of cards) is removed from Home, with its component and strings; the Categories tab has them.
3. **Light borders:** "All categories" and the other "See all" buttons, the filter chips and "Select all" now take the cards' light
   border (`line`). The ADD button and the steppers keep their stronger border, as the main action.
4. **Trending in Roha** is two rows that scroll sideways together, with the same filter chips as Small prices.
5. **Quieter times** moved to the end (after the shelves, before the promise) and is one small card: a head with "Pick a window", one
   line of words, and a row of windows that scrolls sideways (about 150 px, down from about 230).
6. **Know your shop:** four compact designs were put to the owner, who chose option B (the check matrix); see "Know your shop, option B" below.
7. **Ask your shops** removed (see "Left out on purpose").
8. **The promise** is one small card with a two by two grid: each promise a short claim over how it is kept, and a "How we check"
   link.
9. **Font:** Bricolage Grotesque (SemiBold and Bold) is installed (`@expo-google-fonts/bricolage-grotesque`, `expo-font`) and used
   for the display text styles only (title, hero, heading, subheading) in English. Body text, labels and prices keep the phone's
   font, and Hindi and Marathi keep it too (the font has no Devanagari). The splash waits for the font.

## Know your shop, option B, and the strip moved (owner's choice, 2026-10-15)

- **The stage stays as it was:** the heading, the intro and the drag scene are unchanged.
- **Under the scene, one matrix** replaces the "Dark Store vs Connected Store" table: the five checks as rows (each with its picture),
  a cross under Dark Store and a tick under Connected Store, and the 0 of 5 against 5 of 5 score under them. "View more" opens a
  sentence for each kind of store under each row. It sits on the same dark-to-white stage, so the scene and the matrix read as one
  module. About 330 px below the scene, against about 560 px for the table.
- **Rows, not columns:** the option's mock had the five checks across with icon-only headings. The project's rule is text of 14 and up,
  and five columns leave about 44 px each, so the checks run down the side with their words, and the two kinds of store are the two
  columns. It says the same thing at a glance and holds at 200% text and in Devanagari.
- **The strip** (Pay on delivery, Quieter times, Free delivery, UPI) left the Know your shop stage and is now the first thing in the
  header's hero, above "Right now in Roha", on the page, with the cards' light border. It shows in every town, including dark-store
  towns.
- Removed: `KNOW_ROWS_COLLAPSED`, the table's strings (`home.know.compareTitle` is now `home.know.matrixTitle`) and the strip's
  `lead` slot and ground colours.
- **Rounder dividing blocks (2026-10-15):** a new corner radius, `radius.section` (28, was 16), is used for the top corners of the
  coloured blocks that divide Home: the Know your shop stage, the Fresh today and Small prices washes (and the pistachio edge drawn
  along them), Buy again, and the sheet the page slides up in. Cards keep `radius.xl`.
- **Know your shop, collapsed by default (2026-10-15):** under the scene there is now one compact row, "Things you can check
  yourself" with the 0 of 5 and 5 of 5 scores and a chevron. A tap opens the five checks beneath it, smoothly (a height and opacity
  run of 280 ms, instant with reduced motion). Each check has its picture, a cross under Dark Store and a tick under Connected
  Store; the store names, the scores and the marks all sit in one block of two equal columns, so everything lines up. The "View
  more" answers are removed completely, with the ten answer strings, `home.know.more`, `home.know.less` and the matrix title; two
  short phrases ("Can be checked", "Cannot be checked") were added for screen readers.
- **Search bar hint (2026-10-15):** the typewriter (typing, erasing and a blinking caret) is removed from `SearchBar.tsx`, with its
  timers. "Search" stays still; beside it the example words (milk, atta, vegetables, bread) take turns: each holds about 2.2 seconds,
  then slides up a few points and fades out while the next slides up from below and fades in (0.38 s, on the phone's animation
  thread). With reduce motion on it shows the first example, still. Nothing else in the bar moves.
- **Heading weight (2026-10-15):** after the display font went in, section headings (the `heading` and `subheading` styles, such as
  "Daily essentials" and "Trending in Roha") read thin: Bricolage SemiBold is lighter than a phone's own bold at the same size. They
  are now Bricolage Bold, like the title and hero styles, and the SemiBold file is no longer loaded. Nothing else changed: labels,
  names, prices and body text keep their weights.
- **Offers in the strip (2026-10-15):** "Offers for you" is removed from Home (its component, loading shape and strings, and the
  unused `offers.ts` with its old carousel strings). The strip at the top now holds the best offers: Pay on delivery (the green
  chip, unchanged), Free delivery over ₹99, the best coupon ("Save up to ₹50", code WELCOME50, chosen as the one that takes most off
  a ₹299 basket by `bestCoupon`), and Quieter times (only when a window saves something). At most four. Free delivery and the coupon
  open the Coupons page; Quieter times opens the delivery windows. The "Pay by UPI" chip is gone: Pay on delivery already says
  "Cash or UPI at the door".
- **Home's opening is for "All" only (2026-10-15):** the offers strip and "Right now in Roha" (with the shops strip) no longer stay
  when a category is chosen in the header rail (Fresh, Dairy and the rest). The order's live card and the delivery and out-of-area
  notices still follow the shopper onto any category, and the hero's padding is cut so the category's list starts right under the
  rail. Choosing "All" brings the opening back.
- **Own tint for each wash (2026-10-15):** the washes that divide Home each have their own faded tint, all from the theme and all with
  the same curved top and fine edge: Fresh today stays pistachio; Buy again is a lighter butter yellow (`warningBg`, edge `tagBg`);
  Small prices is a faint lilac (`lilac`, edge `onChromeMuted`), the brand's aubergine at a whisper. `AccentWash` takes a `tone`.
  All three follow the dark theme through the same tokens.
- **Header spacing and the slot button (2026-10-15):** the address line sits closer under the delivery estimate (4 dp where it was 8; it was
  held 40 dp tall, its touch area is now made with hit slop), and keeps its 8 dp of room below it before the shops chip. The search bar's button reads "Schedule slot" on one line, in a
  slot that does not shrink, so it no longer breaks on a phone. A stray NUL character in `SearchBar.tsx` (written by a script
  instead of the `\u0000` escape) was fixed.
- **Clearing test data on a phone (2026-10-15):** Settings, Testing tools (development builds only) now has "Clear test data (orders,
  cart, viewed)". It removes the orders and help reports, the cart and what was put aside, the coupon, delivery window,
  substitution choice and delivery notes, the products opened and the Notify me choices, then reloads the app. The language, theme,
  account and saved addresses are kept. The storage keys now live in one file, `storageKeys.ts`, so the tool and the screens that
  save them cannot drift apart.
- **Know your shop, names that no longer break (2026-10-15):** on a real phone with a larger system font, "Connected Store" broke into
  "Conne / cted / Store" in its narrow column. The two store names are now a legend of two pills above the rows (each on one line,
  the colours of the score pills), the result columns are only as wide as a score pill needs (40%, never under 128 dp), and the
  check names beside them have the room (no mid-word breaks at 320 dp, or with the text enlarged by a quarter).
- **Know your shop, in two rows (2026-10-15):** the matrix's five rows all said the same cross and tick, and the store names had to
  squeeze into narrow columns. The card is now two rows. Row one is always in view: Dark Store and Connected Store as two equal
  halves, each a name and its score (0 of 5, 5 of 5), in the scene's colours. Row two opens with a tap on the title, smoothly: "In
  a Connected Store you can check:" and the five checks once, each a chip with its picture. The ✕ ✓ columns, the score pills in the
  title row and the legend are gone. At 320 dp, and with the text enlarged by a quarter, both halves stay equal and on one line.
- **Know your shop, comparison first again (2026-10-15):** the chip list under the two stores told what can be checked but did not
  compare. The card is the two stores side by side (name and score, always in view) and, opening under them, the five checks as
  comparison rows read left to right: a plum cross (a Dark Store), what is checked with its picture, a pistachio tick (a
  Connected Store). The cross and the tick sit at the card's two edges, under the store each belongs to, in that store's colour.
  No name is squeezed into a column; at 320 dp, or with the text enlarged by a quarter, a long check name wraps at a space and
  nothing overflows.
