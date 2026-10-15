# Home screen redesign (v5): review, diagnosis and what is left

> **Status note:** this review was written at commit `da438bd`. Home has changed since (the strip now holds the offers, "Offers
> for you", "Coming soon to Roha" and "Can't find something" are gone, Know your shop is a collapsible matrix, and more). Those
> changes are listed in `PHASE-1-home-v5.md` under "Changes after step 11". The diagnosis below is kept as it was written.

- **Date:** 2026-10-14
- **Branch:** `phase-1/customer-ui` at `da438bd`
- **Scope:** the Home tab and the screens built with it (language sheet, out of the area, moment screens), as planned in
  `PHASE-1-home-v5.md` and ADR 0053 to 0057.
- **How this was checked:** the 375 px web preview in light and dark, the full gate (lint, typecheck, test, build) and a read of
  the code. It was **not** checked on a real phone, at 200% text, in Hindi and Marathi end to end, or by running the Maestro flows.
  Where something is a judgement and not a measurement, it says so.

## 1. Verdict

The redesign is built and works end to end on mock data. Eleven of the twelve planned steps are done. What Home says is clear and
differentiated: a customer is told, on the first screen, what a Connected Store is and why it is not a dark store, and can see it
side by side. The build is solid in logic (757 customer tests) and consistent in tokens.

It is **not yet a verified release candidate**. Nothing in the redesign has been measured on a low-end phone, the Hindi and
Marathi are unreviewed drafts, the trust copy has not had a legal read, and the page is long (about 11,400 px, 13 to 14 screens
at 375 px wide). Those are the things that decide whether it ships, and they are the next work, not more features.

## 2. Rating

| Area                            | Score        | Why                                                                                                                                                                                                                                                                                     |
| ------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual design and brand         | **8.0 / 10** | A clear hierarchy, a consistent aubergine and pistachio language, a dark "Know your shop" stage that fades into the page, light bordered cards on a white page, and a working dark theme. Held back by the number of different background treatments and a few rough spots (section 6). |
| Trust story and differentiation | **8.5 / 10** | "Dark Store vs Connected Store" is the strongest part: one idea, shown, with a score. Held back by the same message being said in five places.                                                                                                                                          |
| Functionality on mock data      | **8.0 / 10** | Every section does something: tick and add, price bands, notify me, ask your shops, buy again, language, out of area, moments. Persistence and consent logging are in place. Real data is Phase 2.                                                                                      |
| System consistency              | **7.0 / 10** | Tokens only, no stray colour literals, borders now mostly consistent. Still six or seven different block treatments on one page.                                                                                                                                                        |
| Copy and localisation           | **6.5 / 10** | Every string exists in English, Hindi and Marathi. The Hindi and Marathi are drafts for a native reader, and the trust claims need a legal read.                                                                                                                                        |
| Accessibility                   | **6.5 / 10** | Designed in (text 14 and up, 48 touch targets, roles and labels, reduced-motion and screen-reader handling) but **not verified**: no pass at 200% text, no screen reader run.                                                                                                           |
| Performance readiness           | **5.5 / 10** | Not measured. The page mounts a very long feed with many cards and several SVG gradients, which is the main risk on a 2 GB phone.                                                                                                                                                       |
| Test and verification coverage  | **6.5 / 10** | Strong logic tests (46 test files in `home/`). The phone-app flows (Maestro) are written but have never been run, and there is no device pass.                                                                                                                                          |
| Completeness against the plan   | **9.0 / 10** | Steps 0 to 11 built. Step 12 (close-out) is not started.                                                                                                                                                                                                                                |
| **Overall**                     | **7.3 / 10** | A strong build that has earned a verification phase.                                                                                                                                                                                                                                    |

**What would make it a 9:** a real-phone pass on a low-end Android, the page cut by a third for first-time visitors,
the Hindi and Marathi read by a native speaker, the legal read of the trust copy, the Maestro flows run green, and the
accessibility pass at 200% text.

## 3. Progress

### 3.1 Plan steps

| Step | What                                                                             | State                                        | Commit               |
| ---- | -------------------------------------------------------------------------------- | -------------------------------------------- | -------------------- |
| 0    | Housekeeping, plan and ADR 0055                                                  | Done                                         | `f89d63d`            |
| 1    | Header (estimate leads, language chip, Schedule a slot) and the hero mosaic      | Done                                         | `9166b32`            |
| 2    | Payment and trust strip, live order card, closed banner                          | Done                                         | `632502c`, `0236a36` |
| 3    | Fresh today and Bestsellers                                                      | Done                                         | `18d9e2a`            |
| 4    | Know your shop (the stage, the scene, the comparison, the promise, How we check) | Done                                         | `f11f345`            |
| 5    | Categories grouped, Coming soon, Notify me                                       | Done                                         | `317f759`            |
| 6    | Daily essentials, Small prices, Picks for your routine                           | Done (essentials later returned to a list)   | `9e4b7b6`            |
| 7    | Buy again, Continue browsing, Trending, Brand stores                             | Done                                         | `5199eda`            |
| 8    | Featured, Offers, Quieter times, shelf banner, Ask your shops, help row          | Done                                         | `c38f78a`            |
| 9    | Language sheet                                                                   | Done (first-run card deliberately not built) | `71cd715`            |
| 10   | Out of the area                                                                  | Done                                         | `b7e0466`            |
| 11   | Moment screens                                                                   | Done                                         | `5942c65`            |
| 12   | Close-out: skeletons, Maestro run, accessibility pass, docs, gate and report     | **Not started**                              | n/a                  |

### 3.2 Changes you directed beyond the plan

| Change                                                                                                  | Where     |
| ------------------------------------------------------------------------------------------------------- | --------- |
| Home quick filters removed, with all their code (ADR 0056)                                              | `5140ae8` |
| Lilac header returns, fading to the page; near-black "Know your shop" stage (ADR 0057)                  | `f11f345` |
| "Dark Store vs Connected Store" as one side-by-side table, two rows and View more, score always visible | `f5f299d` |
| Page is white, cards take the faint tint, essentials back to a list, light borders on tiles             | `da438bd` |
| Lean first-run Home switch removed, so everyone sees one Home                                           | `9e4b7b6` |

### 3.3 Numbers

|                                    |                                                   |
| ---------------------------------- | ------------------------------------------------- |
| Commits for the redesign           | 16                                                |
| New or rewritten Home components   | 24                                                |
| Customer tests                     | 757 (all packages: about 1,014)                   |
| Languages                          | English, Hindi, Marathi, every key in all three   |
| Page length (preview, sample data) | about 11,400 px, 13 to 14 screens                 |
| Decisions recorded                 | ADR 0053 to 0057 (0055 and 0057 still "Proposed") |

## 4. The Home screen now, top to bottom

| #   | Section                            | What it does                                                                                                                |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Header (lilac, fading to the page) | Estimated delivery as a range, address, language chip, profile, shops-open chip, search with Schedule a slot, category rail |
| 2   | Right now in Roha                  | Morning milk with the lowest price, four small tiles, and a "Meet your shops" strip that opens the shops row                |
| 3   | Payment and trust strip            | Pay on delivery, Visited shops only (opens How we check), Free delivery, UPI                                                |
| 4   | Know your shop                     | The dark stage, the drag scene, "Dark Store vs Connected Store" with View more and the 0 of 5 / 5 of 5 score                |
| 5   | Buy again                          | Only for customers with orders; today's prices, out of stock named                                                          |
| 6   | Fresh today                        | Round-tab rail (Under 30, Veggies, Fruits, Dairy, New), product cards, See all                                              |
| 7   | Bestsellers                        | Collage tiles per category                                                                                                  |
| 8   | Continue browsing                  | The last products opened, with Clear                                                                                        |
| 9   | Grouped categories and Coming soon | Wide first tile, "Soon" tiles, Notify me, All categories                                                                    |
| 10  | Daily essentials                   | Morning / Cooking / Evening; tick rows, Select all, add in one tap, in-cart steppers                                        |
| 11  | Picks for your routine             | Four ready-made basket cards                                                                                                |
| 12  | Small prices                       | Three non-overlapping price bands with category chips                                                                       |
| 13  | Trending in Roha                   | Own tabs (All, Offers, Under 50, Veg)                                                                                       |
| 14  | Shop by brand                      | Brand strip with an expanding brand store                                                                                   |
| 15  | Featured this week                 | Two banners with Shop now                                                                                                   |
| 16  | Offers for you                     | Offer cards                                                                                                                 |
| 17  | Quieter times                      | Delivery windows with the saving for each                                                                                   |
| 18  | Product shelves                    | Five shelves, with a Monthly ration banner after the second                                                                 |
| 19  | The Quibo promise                  | Four commitments and How we check a shop                                                                                    |
| 20  | Can't find something?              | Free text, with consent, kept for the shops                                                                                 |
| 21  | Help row and footer                | A way to a person, then "Dukaan se ghar tak"                                                                                |

Other states: a **dark store town** hides Know your shop, the promise and the "Visited shops only" chip. An address **outside the
area** replaces Home with the out-of-area screen (section 5).

Screenshots of every section, in light and dark, are in the shared page version of this report.

## 5. How it functions

| Area            | What works                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adding things   | Tick several essentials and add once; an item already in the cart shows its stepper in place; an item added from any shelf updates every other place at once                                                          |
| Prices          | Small prices are three bands, each with only its own range; offers show as a struck MRP and a saving badge                                                                                                            |
| Notify me       | On a coming-soon category or group, a pincode and a town; kept on the phone with the time and wording agreed (the consent log), ready to send in Phase 2                                                              |
| Ask your shops  | Free text, 20 kept, with consent; nothing but the words                                                                                                                                                               |
| Memory          | Opened products (8), notify choices, asked items, language, saved addresses, cart, orders                                                                                                                             |
| Language        | The chip opens a sheet on every tab; a choice changes the words at once and is kept                                                                                                                                   |
| Out of the area | Pincode with Notify me, towns served, "Look around Roha anyway" (ordering paused, checkout off)                                                                                                                       |
| Moments         | A launch pill, a "Why Quibo" screen on the first and every third screen (never twice in 20 s, never before a task screen, off for reduced motion and screen readers), and an order-placed screen that names the shops |
| Rules honoured  | Minutes only as ranges, no countdown timers, no progress lines, money in paise, every string in three languages                                                                                                       |

## 6. Diagnosis: what I found

Ordered by what matters for the release, not by how easy it is to fix.

### 6.1 Things that block a release (not code)

| #   | Finding                                                                                                                                                                                                                                      | Evidence                                         | What to do                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| D1  | **The trust copy has had no legal read.** "Prices at or below MRP, checked every week", "shops pay a flat plan, not a cut", "every shop is visited in person" and the comparison rows are claims about shops and about other kinds of store. | `home.know.*`, `home.promise.*`, `moment.fact.*` | Legal and owner read before launch; the shops must really do these things |
| D2  | **Hindi and Marathi are drafts.** Several are new this phase (comparison table, moments, out of the area).                                                                                                                                   | `PHASE-1-language-review.md` (477 lines)         | A native speaker reviews the sheet; fix text that is long in Devanagari   |
| D3  | **Nothing is measured on a device.** No frame rate, memory, or time to first content on a 2 GB phone.                                                                                                                                        | The preview is a desktop browser                 | A low-end Android pass in step 12, with the page profiled                 |

### 6.2 Product and design findings

| #   | Finding                                                                                                                                                                                                                  | Severity        | Evidence                                                         | Suggested fix                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| D4  | **The page is too long for a first visit.** About 11,400 px with 21 sections, five of them product shelves. A customer reaches Know your shop quickly but may never reach Offers, Quieter times or the promise.          | Medium          | Measured scroll height in the preview                            | Show fewer shelves first with "More shelves"; hide Offers and Quieter times when empty; trim for new customers |
| D5  | **The same trust message appears five times:** Know your shop, the Visited shops chip, the promise, the moment facts, and the footer. Repetition dilutes the strongest section.                                          | Medium          | Rows 3, 4, 19 and 21 of the table in section 4, plus the moments | Keep Know your shop and the promise; let the others carry different information                                |
| D6  | **Quieter times is the roughest module.** The "Pick a window" tile is a tall, heavy dark block next to three tiles stacked in one column, and all three windows say "Save ₹4", so the module is large for what it tells. | Medium          | Screenshot, Quieter times                                        | Two by two tiles, a lighter "Pick a window" tile, and show only windows with different savings                 |
| D7  | **Too many background treatments.** Lilac header, near-black stage, two pistachio washes, a lilac inset (brand stores, the essentials control), an amber block (Quieter) and the aubergine promise.                      | Low to medium   | Whole page                                                       | Choose a budget of three or four and use them with intent                                                      |
| D8  | **Trending's grid is ragged.** Cards with "Only 3 left" or a time line leave uneven whitespace below their neighbours.                                                                                                   | Low             | Screenshot, Trending                                             | Reserve the note line in each row, as the rails already do                                                     |
| D9  | **The footer tagline is faint on white.** It is deliberately ghosted (20% opacity) and decorative, but on a white page it reads as washed out.                                                                           | Low             | `BrandFooter.tsx`                                                | Raise it a little, or leave as a design choice                                                                 |
| D10 | **Checkout still says "Delivering in 15–20 mins" for an address outside the area**, above a disabled "We do not deliver here yet" button.                                                                                | Low             | Checkout with the testing switch on                              | Hide the estimate row when the address is outside the area                                                     |
| D11 | **The out-of-area screen cannot be reached normally.** An address outside the area cannot be saved or chosen (ADR 0016), so it appears only if zones change.                                                             | Low (by design) | `useAreaStatus.ts`                                               | Fine for Phase 1; becomes real with Phase 2 zones. A testing switch shows it                                   |
| D12 | **Emoji stand in for pictures** on tiles, shelves and moments; the brand fonts and a display face are parked.                                                                                                            | Low             | Whole page                                                       | Real art when available                                                                                        |

### 6.3 Engineering findings

| #   | Finding                                                                                                                                                                                                                           | Detail                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| E1  | **Skeletons do not yet mirror every new section.** Buy again, Continue browsing, Trending, Offers and Quieter times are missing or approximate, so the load can jump (ADR 0035).                                                  | Step 12                        |
| E2  | **The Maestro flows have never been run.** Thirteen flows exist, three of them written in this redesign (`area`, `language`, `moments`) and `category` and `cart` updated for it; the tool is not installed on the build machine. | Install and run on a device    |
| E3  | **ADR 0055 and ADR 0057 are still "Proposed".**                                                                                                                                                                                   | Accept at close-out            |
| E4  | **The web preview reports a screen reader as always on**, so the moment screen would never show there. The code treats web as off; native uses the real setting.                                                                  | Documented in `FactMoment.tsx` |
| E5  | **A hot reload can leave a stale copy of an in-memory store** in the preview (seen once with the area switch). Not a product issue; a full reload clears it.                                                                      | None                           |
| E6  | **Colour literals stay in `palette.ts` only**, and contrast pairs are tested. The white-page change passed all pairs.                                                                                                             | OK                             |

## 7. What is remaining

### 7.1 Planned

1. **Step 12, close-out:** skeletons that mirror Buy again, Continue browsing and the other new sections; the PLAN screen
   inventory; ADR 0055 and 0057 accepted; the gate and the phase report.
2. **A phone pass** on a low-end Android in light and dark, at 200% text, in all three languages.
3. **The accessibility pass** with a screen reader, on Home, the language sheet, the out-of-area screen and the moments.
4. **Run the Maestro flows** and fix what they find.
5. **Native-speaker review** of Hindi and Marathi.
6. **The legal read** of the trust copy.

### 7.2 Parked, waiting for your decision

| Item                                              | Note                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| Suggest a shop (in the mock's out-of-area screen) | Not in the plan row; needs a small form and its own consent   |
| First-run language card on Home                   | Not built: sign-in already asks first, so it would never show |
| Standing orders UI                                | Parked in the plan                                            |
| Real shop stories                                 | Parked; needs content from shops                              |
| Pharmacy and "only on Quibo" catalogues           | Placeholders only                                             |
| Display font                                      | Parked                                                        |

## 8. Improvements, in the order I would do them

### Quick (hours each)

1. Quieter times: two by two, lighter lead tile, only distinct savings (D6).
2. Trending: reserve the note line per row (D8).
3. Checkout: hide the estimate for an out-of-area address (D10).
4. Footer tagline a touch stronger (D9).
5. Border and tint pass on the last flat blocks (D7).

### Medium (a day or two each)

1. **Shorten Home for a first visit** (D4): three shelves then "More shelves", empty modules hidden, and Offers and Quieter times
   after the promise for new customers. This is the highest-value change.
2. **Render the long feed lazily** below the fold, so a 2 GB phone is not drawing 100 cards and many gradients at once (D3).
3. **Cut the repeated trust message** to two places (D5).
4. **A colour budget**: pick the block treatments and retire the rest (D7).
5. **Section-level events** (viewed, tapped) so Phase 2 can tell which sections earn their place.

### Larger

1. Real pictures in place of emoji, and the display face.
2. Shop stories and the standing-orders UI, once the content exists.
3. Personalising the order of sections by time of day and by what the customer buys.

## 9. Risks

| Risk                                                             | Likelihood | Effect                                                           | Mitigation                                                          |
| ---------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| The long page is slow or janky on a 2 GB phone                   | Medium     | The first impression is poor, and the trust story is not reached | Measure first, then lazy render and shorten                         |
| A trust claim is not true of a real shop                         | Medium     | Reputation, and possibly legal                                   | Legal read; make the claims conditional on the checks actually done |
| Devanagari text overflows a tight cell (comparison table, tiles) | Medium     | Clipped or tall rows                                             | Native review at 200% text                                          |
| Too many modules dilute the main idea                            | Medium     | Customers scroll past                                            | Shorten and cut repetition                                          |

## 10. Decisions I need from you

1. Do you want the **shorter first-visit Home** (section 8, medium 1)? It changes what a new customer sees.
2. Should the **repeated trust messages** be cut to Know your shop and the promise only?
3. Is **Suggest a shop** wanted in this phase?
4. Who does the **legal read** and the **native-language review**, and by when?
5. Should step 12 go ahead now, or the quick fixes in section 8 first?
