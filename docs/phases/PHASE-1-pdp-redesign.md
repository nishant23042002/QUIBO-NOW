# Phase 1: product page redesign (sub-phase 1j)

**Surface:** customer app
**Kind:** UI on mock data
**Depends on:** the Home redesign close-out (commit `551a871`) and the owner's phone check of Home

> **Status: approved by the owner on 2026-10-12. All nine steps are built; the report is written and the page waits for the owner's phone checks and sign-off.**
> Progress is recorded in "Progress" at the foot of this file.

## Naming pattern (owner's instruction, applies to the whole page)

Facts are named the way the quick-commerce apps name them, in Title Case, as the attribute a shopper compares by: **Fat Profile,
Shelf Life, Biological Source, Processing Type, Sugar Profile, Dietary Preference, Good For, Storage Instructions, Country of
Origin, Packed On, Best Before, Packed By, Packer Address, Seller, Seller Address, Licence Number, Customer Care Details,
Disclaimer**. Values are Title Case too (Toned, Cow Milk, Pasteurized, No Added Sugar). Section names: **Highlights**,
**All details**, **Key Information**, **Nutritional Information**, **Info**; the size heading is **Select Unit**; the action
under a brand is **Explore all products**. For milk the highlights read, in order: Fat Profile, Shelf Life, Biological Source,
Processing Type. Kinds with no such facts fall back to Product Type, Dietary Preference, Good For, Shelf Life. Hindi and Marathi
keep their own natural words for the same attributes and are listed for the native-speaker review.

## Goal

The product page matches the signed-off mock (option B with Quibo's header): a picture stage under the header, one info card
that holds size, price and ADD, a short highlights strip that opens a details sheet, three single-line rows, and sideways rails
that end in the brand footer. Products carry a brand (ADR 0036) and the page uses it.

## Context

- Mock: https://claude.ai/artifact/B73ifPQ2G2nGq3jY41YEW5 (the whole page, the scrolled state, the details sheet, the header).
  The first mock (option A) is https://claude.ai/artifact/8BbdhavgK3m1jDmgshfk8q and also holds the brand page and Home brand
  strip sketches.
- Decisions: [ADR 0036](../decisions/0036-products-carry-a-brand-and-brands-are-browsable.md) (brand) and
  [ADR 0037](../decisions/0037-product-page-stage-details-sheet-and-sideways-rails.md) (this layout). Both are Proposed.
- What exists: `PHASE-1-pdp-review.md` lists what works and the gaps; this plan keeps everything under "What works" and
  "Done since this review" (per-size cart count, packaging labels, offline and error states, stock limits).
- PLAN sections: 6 (customer screens, brands), 10 (data model: `brand`, `product_type`).

## The page, top to bottom

| #   | Block                                | Source today                          | Change                                                                               |
| --- | ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | **Header**                           | `ProductHeader.tsx`                   | **Locked.** Same block, same fade; gets brand + name; reveal distance from the stage |
| 2   | Picture stage                        | `ProductGallery` card                 | New full-width stage; ribbon, tip button kept; dots; diet mark top right             |
| 3   | Highlights strip                     | Highlights card                       | Three chips + View details (opens the sheet)                                         |
| 4   | Info card                            | title card + size card                | One card: range and Packed today, name, sizes, price, ADD                            |
| 5   | Sold by row                          | shop card                             | One row, "Also at N other shops" when the data has it                                |
| 6   | Brand row                            | none                                  | Brand mark, name, "Explore all products"                                             |
| 7   | Replacement row                      | four trust tiles                      | One row                                                                              |
| 8   | Rail: Other brands of {type}         | none                                  | New; See all                                                                         |
| 9   | Rail: Popular in {category}          | same                                  | Restyled to the card in the mock if it differs                                       |
| 10  | Row: Brands in this category         | none                                  | New, swipes sideways                                                                 |
| 11  | Brand footer                         | none                                  | `BrandFooter`, as on Home and Categories                                             |
| -   | Sticky ADD bar, bottom bar, cart bar | ADR 0024                              | Unchanged                                                                            |
| -   | Details sheet                        | Highlights, Information, seller cards | New `Sheet` content                                                                  |

Removed from the page: thumbnail strip and "2/3" count, "Net quantity" line, Highlights card, Information card, seller card,
trust tiles, "More from {shop}", per-card "View more" buttons.

## Header and how the new page sits under it

The header keeps its behaviour. After the owner's first look at the built page (2026-10-12) it is **square at the bottom** with a fine
line along its edge, and the delivery time is a **compact green-tinted pill** (the View details button's tint). The strip that was
behind its rounded corners is gone.

- **Unchanged:** the tint, the delivery line and address, back, search and share, the name-to-product-card fade (`FADE` of 56 dp),
  the status bar style and the tap targets. `ProductHeader`'s props do not change except that `name` receives brand + name.
- **One number changes:** `revealAt` is 75% of the stage's height, computed the same way as the picture card's was.
- **Scroll side effects unchanged:** scrolling down hides the bottom bar and shrinks the cart bar; the ADD bar rises once the
  in-page price row has scrolled past (ADR 0024 item 5); `reduceMotion` is respected.

## Scope

### In

- [ ] Brand and product type on the sample items, plus enough other-brand items for the rails (still app-local samples, as `items.ts`)
- [ ] Brand + name shown in the header, on item cards, and in search rows
- [ ] The stage, info card, highlights strip and details sheet, the three rows, the rails, the brand footer
- [ ] The page's skeleton mirrors the new layout (ADR 0035), and loading, empty, error and offline still work
- [ ] English, Hindi and Marathi words for everything new (brand names included); 200% text; dark theme
- [ ] Unit tests for the new helpers; a Maestro flow for the page; docs and ADRs updated

### Out (not this plan)

- Brand page, "Shop by brand" on Home, brand filters on Categories, Search and shop pages (ADR 0036 lists them; own steps later)
- Choosing between several shops that stock the same item (open question in ADR 0036; the page shows the item's own shop)
- "People also bought" (needs order history; park in the Phase 2 notes)
- Heart / wishlist, ratings, reviews, "Ad" tags (not in the plan)
- A full-screen picture viewer with pinch to zoom (still a P2 in the review)
- Loose items by weight on this page (still waits for the cart's weight stepper, sub-phase 1d)

## Defaults I have assumed (change any before the step that uses it)

| #   | Question                           | Default taken                                                                                                          | Used in step |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | Thumbnails or dots                 | Dots; swipe stays                                                                                                      | 3            |
| 2   | Name size                          | 24 dp (was 36)                                                                                                         | 4            |
| 3   | Seller details                     | Inside the sheet, not on the page                                                                                      | 5            |
| 4   | Size heading                       | "Select Unit" (owner's naming pattern; done in step 1 for the current page, with Hindi and Marathi drafts)             | 1            |
| 5   | Delivery chip                      | Shows the range for every item (the header already says it); "Packed today" only when it was packed today or yesterday | 4            |
| 6   | Brand row, brand chips and See all | Open Search with the brand or type as the query (`/search?q=`), until a brand page exists                              | 6, 7         |
| 7   | Brand marks                        | A monogram on a tint; no logo files (ADR 0036 consequence 5)                                                           | 1, 6         |
| 8   | "Also at N other shops"            | Shown only when an item's data says so; tapping opens the shop shown. Switching shop is not built                      | 6            |
| 9   | Brand footer on this page          | Yes (amends ADR 0032)                                                                                                  | 8            |
| 10  | Rails                              | Other brands, Popular in {category}, Brands row; "More from {shop}" dropped                                            | 7            |

## Plan (one step at a time, then stop for the owner's phone check)

Each step: build only it, run lint, typecheck and the tests, commit, then stop and wait for a check in Expo Go.

1. **Brand data, no screen change.** Add `brand` and `type` to the samples (Amul, Gokul, Katraj, Chitale, Warana for dairy; a
   few for staples and snacks), add the other-brand items the rails need, and `HomeItem.brand`, `HomeItem.type`,
   `HomeItem.otherShops`. Helpers in `product.ts`: `otherBrands`, `brandsInCategory`. Brand names in en, hi and mr. Tests.
2. **Brand + name in lists and the header.** `ItemTile`, search rows and `ProductHeader` show brand + name; items with no brand show
   the name only. Check the compact card still fits (ADR 0029: no vertical stretch).
3. **The stage.** New `ui/ProductStage` (picture, swipe, dots, ribbon from the header edge, diet mark, tip button and card);
   the corner strip; `revealAt` from the stage. Remove `ProductGallery`. The skeleton's picture block follows.
4. **The info card.** Delivery range and Packed today, name, size cards (restyle `PackPicker`: label, price with struck price,
   unit price, Best value tag, "N in cart" tag), price badge, saving, taxes, ADD or the stepper. Remove "Net quantity". Move the three
   price-row measures here so the ADD bar logic is unchanged. Skeleton follows.
5. **Highlights strip and details sheet.** Strip: first three highlight facts + "View details". Sheet (`ui/Sheet`): Highlights
   chips, then Key Information, Nutritional Information and Info as collapsible sections (Info holds description, shelf life,
   packing, packer, seller, licence, customer care and disclaimer), price and ADD pinned.
   Remove the Highlights, Information and seller cards. Sheet contents come from `productDetails.ts` unchanged.
6. **The three rows.** Sold by (with "Also at N other shops"), brand, replacement. Remove the old shop card and trust tiles
   from this page (`TrustTiles` stays: the cart page uses it).
7. **The rails.** "Other brands of {type}", "Popular in {category}", "Brands in this category". Remove "More from {shop}".
8. **The footer.** `BrandFooter` at the end of the page; amend ADR 0032 point 3.
9. **Close-out.** Skeleton mirrors the whole page; loading, empty, error and offline checked; 200% text; Hindi and Marathi at
   360 dp; dark theme; Maestro flow (open a product, change size, add, open View details, open a brand); `PHASE-1-pdp-review.md`
   updated; gate re-run; report.

## Verification

1. [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` pass after every step.
2. [ ] `pnpm build` passes at the close-out.
3. [ ] On a phone (Expo Go, weak network): the header behaves as before: product card appears after most of the picture scrolls
       away, the bottom bar slides off, the ADD bar rises after the in-page price row has gone.
4. [ ] Price and ADD are visible on the first screen of a 360 x 760 phone, for one-size and two-size items.
5. [ ] An item with no brand shows no brand line, no brand row and no "Other brands" rail.
6. [ ] Hindi and Marathi: nothing clips at 360 dp or at 200% text.
7. [ ] The skeleton, when shown, has the same blocks in the same places as the loaded page.

## Risks

- **The drape** (header corners over the stage) is the only new visual risk; it has a plain fallback.
- **Brand + name** is longer text on compact cards and in the header; step 2 checks it before anything else is built on it.
- **Sample data grows** (new items and their names in three languages); kept app-local, not in `packages/contracts`, until the API
  phase, as for the Home redesign.
- **ADR 0036 is not final** (which shop is "Sold by"); this plan avoids depending on it.

## Gate checklist

- [x] Plan approved before coding; nothing outside the plan built
- [x] `lint`, `typecheck`, `test` and `build` pass, no unexplained warnings
- [ ] Maestro flow for the page passes
- [ ] Contrast, screen-reader pass and the largest font size checked on the phone
- [ ] Checked by hand on a low-end Android phone with a throttled network
- [ ] No open blocker or major defects
- [ ] ADRs 0036 and 0037 set to Accepted; ADR 0032 amended

## Progress

- **Step 1, built 2026-10-12 (awaiting the phone check).** Brand and type on the samples (`brands.ts`: `BRAND_OF`, `TYPE_OF`);
  six other-brand samples (Gokul, Katraj and Chitale toned milk, Amul Masti dahi, KitKat, Britannia biscuits) kept in
  `useCatalogue()` so Home and search do not change yet; `HomeItem.type` and `HomeItem.brand`; `otherBrands` and
  `brandsInCategory` with tests; product facts now looked up by kind of product. **Also done, as asked:** the naming pattern
  above, on the page as it is today (Fat Profile, Shelf Life, Biological Source, Processing Type; Select Unit; Info; Packed On;
  and so on), with Hindi and Marathi drafts. Lint, typecheck and tests pass (537 customer tests, 30 i18n tests).

- **Step 2, built 2026-10-12 (awaiting the phone check).** `HomeItem.fullName` (brand, then name; just the name for an
  unbranded item) is what cards, search results, the cart, the share message, the sticky ADD bar and the product header and title
  now show. `useHomeItems` now includes the six other-brand items, so Home, search and the shop pages list them. Search finds an
  item by its brand in any language ("amul", "अमूल") and by brand + name, and every brand of a kind is found by that kind's
  spellings ("dudh"). The compact card keeps two lines for the name; checked at 360 dp in English and Hindi (the longest names:
  Fortune Sunflower oil, फ़ॉर्च्यून सूरजमुखी तेल). Lint, typecheck and tests pass.

- **Step 3, built 2026-10-12 (awaiting the phone check).** New `ui/ProductStage` replaces `ProductGallery` (removed): a full-width
  stage in a lighter shade of the header's tint (a gradient into the page, drawn with `react-native-svg`, so no new package), the
  picture swiping sideways, dots instead of thumbnails and the "2/3" count, the ribbon hanging from the stage's top edge, the diet
  mark in the top right (so the title card's "Vegetarian" row is gone), and the insight button and card as before. The header is
  wrapped one layer higher and a 16 dp strip in the stage's top colour sits behind its rounded corners, fading out over the first
  48 dp of scroll; `revealAt` is 75% of the stage's height (same rule). The skeleton's picture block is the same full-width
  stage. `mixColor` (tested) makes the shade. Lint, typecheck and tests pass (541 customer tests); checked at 360 dp in the
  preview: stage, ribbon, dots, diet mark, insight card open and closed, and the header turning into the product card on scroll.

- **Step 4, built 2026-10-12 (awaiting the phone check).** The title card and the size card are one info card: the delivery range
  and, for fresh goods, "Packed today" ("Packed yesterday" at one day; older goods say nothing); the name at 24 dp; "Select Unit"
  and the size cards (size, price with the printed price struck through, price per unit, Best value tag, "N in cart" badge); a
  divider; then the price badge with the saving and the tax line stacked under it and ADD or the stepper at the right. "Net
  quantity" is gone (kept only as the weighed-when-packed line for loose items). The three price-row measures that drive the ADD
  bar sit on the new card unchanged. An out-of-stock item shows no delivery chip. The skeleton draws the same blocks. Lint,
  typecheck and tests pass; checked at 360 dp for a two-size item, a one-size item and a loose item.

- **Step 5, built 2026-10-12 (awaiting the phone check).** A highlights strip (`ui/HighlightsStrip`: the first three highlights as
  chips that slide sideways, and a pinned "View details" button) sits between the stage and the info card, as in the mock. The
  button opens the details sheet (the app's `Sheet`): Highlights (all of them, as chips), then All details as three collapsible
  sections (`ui/DetailSection`): Key Information (open first), Nutritional Information (only when there are figures) and Info
  (description, ingredients, shelf life, storage, origin, packed on, best before, packer and address, seller, address, licence,
  customer care, disclaimer: every labelling row the page had before). The price and ADD (or the stepper) are pinned at the foot
  of the sheet and share the cart with the page. The Highlights card and the Information card (with the seller rows) are gone from
  the page; the "Sold by" shop card stays until step 6. Product details are now grouped as `highlights`, `keyInformation`,
  `nutrition` and `info`. For kinds with no such facts the strip reads Product Type, Shelf Life, Dietary Preference. The skeleton
  draws the strip in place of the two cards. Lint, typecheck and tests pass; checked at 360 dp (strip, sheet, a section opened,
  ADD from the sheet).

  **Flagged for the owner:** with the strip above the info card, as in the mock, the price row and ADD sit below the first screen
  of a 360 x 760 phone and the ADD bar only rises once the row has been scrolled past (ADR 0024). Options: (a) accept; (b) show
  the ADD bar whenever the in-page row is not on screen, below it as well as above it; (c) put the strip under the info card.

- **Step 6, built 2026-10-12 (awaiting the phone check), with the ADD bar change the owner chose (option b).** Three single-line rows
  follow the info card: **Sold by** (the shop, its status and since when, and "Also at N other shops" when the data says so;
  taps open the shop), the **brand** row (a monogram, the name, "Explore all products"; taps open Search with the brand's name,
  until a brand page exists; only for branded items) and **Replaced or refunded if not right** (not tappable: there is no policy
  page to open). The four "Our promises" tiles are gone from this page (`TrustTiles` stays for the cart). `HomeItem.otherShops`
  is sample data (Toned milk 2, Curd, Atta, Oil and Biscuits 1). **ADD bar (ADR 0024 item 5, amended):** it now shows whenever the
  page's own price and ADD are not fully on screen, below the first screen as well as scrolled past; before any scrolling the
  answer comes from where the row ends against the scroll area (less the bottom bar), and after that from each scroll. Lint,
  typecheck and tests pass; checked at 360 dp: at the top the bar is up, with the row in view it is away, and the brand row opens
  Search holding "Amul" with its three items.

- **Step 7, built 2026-10-12 (awaiting the phone check).** The page ends with three sideways rows in the page's own rail pattern:
  **Other brands of {name}** (the same kind of product from other brands, with a See all that opens Search for the product's
  name; only for a branded item that has other brands), **Popular in {category}** (the category's items, without repeating the
  other brands above), and **Brands in this category** (a row of brand tiles, `ui/BrandTile`; each opens Search with the brand's
  name; only when the category has two or more brands). "More from {shop}" is gone from this page (`moreFromShop` stays in
  `product.ts`, tested, for the shop page). The skeleton draws the same rows (item cards, or brand tiles). Lint, typecheck and
  tests pass; checked at 360 dp for Toned milk (all three rows) and Farm eggs (no other brands).

- **Step 8, built 2026-10-12 (awaiting the phone check).** `BrandFooter` ends the page, after the rails ("Dukaan se ghar tak.",
  the pistachio bar, the shop-scooter-home route and the one quiet sentence), the same piece Home and Categories end with. ADR 0032
  point 3 is amended. The skeleton does not draw it (it is the same on every item and holds no data). Lint, typecheck and tests
  pass; checked at 360 dp: it sits under the last row with the ADD bar below it, clear of the last row at the bottom of the scroll.

- **Step 9, built 2026-10-12 (awaiting the owner's sign-off).** The skeleton's chip and row heights now come from the same line
  heights as the page (the Sold by row's extra line included); the Marathi "Other brands" title is reworded; the five Maestro flows
  use "Amul Toned milk"; `product.yaml` is the flow for this page; the gate was re-run (lint, typecheck, tests, build and format
  all pass; the Android bundle is 4.24 MB against the 5.0 MB budget); and the report is
  [PHASE-1-pdp-redesign-report.md](PHASE-1-pdp-redesign-report.md). The page was checked at 360 dp in English, Hindi and Marathi
  and in the dark theme.

- **Changes after the owner's first look at the built page, 2026-10-12.** (1) The details sheet opens to 72% of the screen and stays
  there (`Sheet` gained `heightPercent`); each time it opens, Key Information is open and the other sections are shut.
  (2) One design for every product: the size block ("Select Unit", the size card, the price row) is on every item. A product that
  comes in one size shows that size and a dashed tile after it, "Other sizes: Coming soon" (a loose item shows "Any weight: In
  half-kilo steps" instead), so the card has the same shape everywhere (`PackPicker` gained `placeholder`; the skeleton draws it).
  (3) ADD is a large, solid, 48 dp control (`Stepper` gained `large`), the same in the info card, the ADD bar and the sheet's foot,
  with the press ring and bounce it already had and a visible dip on press. (4) The header is square at the bottom, with a fine line
  along its edge; the strip behind its rounded corners is gone. (5) The delivery time in the header is a compact green-tinted pill
  (the View details button's tint) with a green clock and text. ADR 0037 point 1 and the "Header" section above are amended by (4)
  and (5).

- **ADD bar, 2026-10-12 (later).** Option (b) was reverted at the owner's request: the ADD bar shows only once the in-page ADD has
  scrolled out of sight above, as ADR 0024 first said, and not while the row is below the first screen.

## Approval

Approved by the owner in chat on 2026-10-12, with the defaults above and the naming pattern added.
