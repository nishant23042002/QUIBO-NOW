# Phase 1: brand pages and the product page polish (sub-phase 1k)

**Surface:** customer app
**Kind:** UI on mock data
**Depends on:** the product page redesign (1j) and the owner's phone checks of it

> **Status: approved by the owner on 2026-10-12. All eight steps are built and wait for the owner's phone checks; the report is [PHASE-1-brands-and-polish-report.md](PHASE-1-brands-and-polish-report.md).**
> Progress is recorded in "Progress" at the foot of this file.

## Goal

Brands become a way to browse, as ADR 0036 says: a brand page, a "Shop by brand" strip on Home, brand filters where lists are long
(a category on Home, search results, a shop page), brands found by search, and a swap rule in the cart that knows about brands.
Alongside, four trial changes to the product page from `PHASE-1-pdp-open-points.md`, each behind one switch so the owner can go back
to the page as it is today by changing a word.

## Context

- [ADR 0036](../decisions/0036-products-carry-a-brand-and-brands-are-browsable.md): what is built (brand and kind on items, the
  brand row and brand tiles on the product page, brand names found by search) and what is not (the rest of this plan).
- [PHASE-1-pdp-open-points.md](PHASE-1-pdp-open-points.md): suggestions B, C, E and H (and "pre-select the best-value size") are
  the polish in this plan; the owner chose them on 2026-10-12.
- Search stands in for the brand page today: the brand row and the brand tiles open Search with the brand's name in the box.

## Part A: the trial switches (small, first)

One file, `home/pdpTrial.ts`, holds five switches, all `true` while on trial. Turning one to `false` restores today's behaviour for
that change and nothing else; the code for the old behaviour stays until the owner has decided.

| Switch               | Suggestion | What it does when on                                                                                                                                                                               |
| -------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unitPriceOnBrands`  | E          | Each card in "Other brands of {name}" shows its price per litre, kilogram or piece ("₹54/L"), in green when it is lower than this item's, so brands compare on the same footing                    |
| `sizeSavings`        | H          | Each size card says what it saves ("Save ₹2") under its price, when it has a printed price above it                                                                                                |
| `preselectBestValue` | H          | The product page opens with the best-value size chosen (the lowest price per unit that can be bought), not the size the card showed. Cards elsewhere keep adding the size they show                |
| `singleGreen`        | C          | One tinted-pill style (the View details button's tint) for the delivery time, "Packed today", "Also at N shops", "Best value" and View details; the pistachio fill stays for the price badge alone |
| `groupedRows`        | B          | Sold by, the brand row and the replacement row become one card with dividers instead of three cards                                                                                                |

Note on `preselectBestValue`: a shopper who taps the 500 ml card on Home arrives at a page with 1 L chosen, and ADD there adds the 1 L.
The size cards and the price row say so, but it is the one trial that changes what a tap does, so it is the first to look at.

## Part B: brands (the rest of ADR 0036)

| #   | Piece                                                                                                                   | Notes                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Brand page**, `/brand/[id]`                                                                                           | Header as the shop page's; a brand card (the letter tile, the name, "N products · sold by M shops in Roha"); chips for the kinds it makes (All, Milk, Curd …); the items in a two-column grid. Loading skeleton, empty, not found, error and offline states |
| B2  | The product page's brand row and brand tiles open the brand page; "See all" on Other brands stays a search for the kind | Replaces the search stand-in                                                                                                                                                                                                                                |
| B3  | **"Shop by brand" on Home**                                                                                             | A row of brand tiles under "Shop by category" and above "Shops in your town" (this moves the approved shops strip down one place: ADR 0031 and 0032 are amended). Every brand fits in the row, so no "See all"                                              |
| B4  | **A brand filter** (`ui/BrandChips`: All, then the brands) in three places                                              | A category on Home (above its grid), search results (under the box, when the results hold two or more brands), and a shop page (above its sections). One component, single choice, "All" by default                                                         |
| B5  | **Brands in search results**                                                                                            | A query that is a brand's name (any language) puts the brand first, as a tile that opens its page, above the items                                                                                                                                          |
| B6  | **The swap rule in the cart**                                                                                           | The "Swap" help says what the swap does ("the same brand in another size, then the same kind from another brand, never at a higher price"). The customer app only words and records the choice; the matching is the shop's and ops' (Phases 3 and 4)        |

Out: brand logos (a letter on a tile until the trademark question is settled), which shop is "Sold by" when several have the item,
a "see all brands" list page, brand-level offers, and anything in the admin panel or store portal.

## Steps (one at a time, then stop for the owner's phone check)

1. **Part A, switches E and H** (`pdpTrial.ts`, unit price on brand cards, size savings, best-value pre-selected).
2. **Part A, switches C and B** (the shared tinted pill, the grouped card).
3. **B1 and B2:** the brand page and the product page links to it.
4. **B3:** "Shop by brand" on Home.
5. **B4:** the brand filter in the three places.
6. **B5:** brands in search results.
7. **B6:** the swap wording in the cart (and on the substitution sheet).
8. **Close-out:** the skeletons, states, Hindi and Marathi words, a Maestro flow (`brand.yaml`), the docs (ADRs 0031, 0032 and 0036,
   PLAN screen inventory), the gate and a report.

## Verification

1. [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass after the close-out; lint, typecheck and tests after every step.
2. [x] With every switch `false` the product page is as it is today (compare in the preview).
3. [x] The brand page lists exactly the items of that brand, in all three languages, and filters by kind.
4. [x] "Shop by brand" shows every brand that has an item, and a brand with no items never shows.
5. [x] A search for "amul", "अमूल" or "gokul" puts the brand tile first.
6. [x] An item with no brand is never offered a brand page, a brand chip or a brand tile.
7. [x] Nothing in order, payment, dispatch or ledger code branches on a brand.

## Risks

- **Home order.** Putting "Shop by brand" above the shops strip changes a page the owner already approved. It is one line to put back.
- **Pre-selecting a size** changes what ADD does from the page (see above). It is on trial for that reason.
- **Sample data.** Twelve brands and sixteen items are enough to look right, not to judge a real town's catalogue.

## Progress

- **Step 1, built 2026-10-12 (awaiting the phone check).** `home/pdpTrial.ts` holds the switches (three so far: `unitPriceOnBrands`,
  `sizeSavings`, `preselectBestValue`). Each pack and each item now knows its price per litre, kilogram or piece (`unit`); the
  cards in "Other brands of {name}" show it beside the pack ("500 ml · ₹54/L"), in green when it is lower than the selected size's
  (`cheaperPerUnit`); size cards say "Save ₹2" under the price; and the page opens on the best-value size when it can be bought
  (`startingPackId`). Tests added for both helpers. **Also done in this step, at the owner's request:** the ADD bar is back to
  appearing only after the in-page ADD has scrolled past (ADR 0024 item 5; the "show while below the first screen" change is
  reverted). Lint, typecheck and tests pass (543 customer tests); checked at 360 dp: no ADD bar at the top, 1 L chosen on opening
  Toned milk with the savings on both cards, the unit prices on the brand cards, and the bar rising after the row scrolled past.

- **Step 2, built 2026-10-12 (awaiting the phone check).** Two more switches in `home/pdpTrial.ts`. `singleGreen` (C): a new
  `ui/TintPill` (the View details button's tint: pale pistachio fill, 1 dp green edge, green words) is used for "Packed today"
  (with a tick) and "Also at N other shops"; the "Best value" tag on a size is the same soft tint instead of a solid pistachio pill
  (`PackPicker` `tagTone`); the View details button's edge drops from 1.5 to 1 dp to match; the delivery time in the header was
  already this pill. The price badge keeps the pistachio fill. `groupedRows` (B): Sold by, the brand row and the replacement row are
  one card with dividers (the skeleton draws one card). Both switches `false` bring back the three cards, the plain green
  "Packed today" line and the solid tag. Lint, typecheck and tests pass (543); checked at 360 dp.

- **Step 3, built 2026-10-12 (awaiting the phone check).** The brand page, `/brand/[id]` (`app/(tabs)/brand/[id].tsx`, in the tab
  group so the bottom bar stays, `BrandView`, and the helpers in `brandPage.ts`, tested). It has the shop page's header; a brand card
  (the letter on a tile, the name, "N products", "Sold by N shops in Roha"); a row of chips for the kinds the brand makes (All, then
  one per kind, named by its first item; shown when there are two or more); and the brand's items in the two-column grid. States:
  loading skeleton, offline notice at the top, nothing-listed, and a not-found page with a way back for an id that is no brand. The
  brand is read from the items, so a brand with none is never offered. The product page's brand row and the "Brands in this category"
  tiles open it; "See all" on Other brands still searches for the kind. Hindi and Marathi words are in the `brandPage` group (drafts).
  Lint, typecheck and tests pass (550); checked at 360 dp: Amul (3 products, 3 shops), the Paneer chip, an unknown brand, and Gokul
  reached from the product page.

- **Step 4, built 2026-10-12 (awaiting the phone check), with the owner's change to the shops row.** The "Shops in your town" row is
  removed from Home (it repeated the shops panel in the header): `ShopsStrip` and the shop-card skeleton used only by it are deleted,
  and ADR 0032 point 1 is amended (new [ADR 0038](../decisions/0038-shop-by-brand-on-home-and-the-shops-strip-goes.md)). "Shop by
  brand" (`ShopByBrand`) is under "Shop by category": a swipeable row of the same brand tiles as the product page, each opening the
  brand's page; no "See all", and no row when no item has a brand. The Home skeleton draws it in place of the shop cards (`brandsOfItems`
  is tested). Lint, typecheck and tests pass (552); checked at 360 dp.

- **Step 5, built 2026-10-12 (awaiting the phone check).** Brand filter chips (`ui/BrandChips`: "All", then one chip per brand, swipeable)
  on three lists: a category's grid on Home, the items in search results, and a shop's page. Each shows the chips only when the list
  holds two or more brands. The choice is local to the screen: on Home it is remembered with its category (another category starts on
  All), and `activeBrand` drops a chosen brand that is no longer in the list (a new search, another shop) so the shopper is never left
  on an empty filter. An item with no brand does not stay while a brand is chosen (`filterByBrand`, `activeBrand`; both tested).
  The row is named "Filter by brand" for a screen reader (`brandPage.filterByBrand`; Hindi and Marathi are drafts). Lint, typecheck
  and tests pass (556); checked at 360 dp: Dairy on Home (All, Amul, Gokul, Katraj, Chitale; Gokul leaves the two Gokul items),
  search "milk" (Gokul Toned milk) and the shop page /shop/one.

- **Step 6, built 2026-10-12 (awaiting the phone check).** Brands as search results. A query that is a brand's name puts a
  "Brands" section first, above the shops and the items, with the brand as the same letter tile as everywhere; it opens the brand's
  page and remembers the search. "Is a name" is stricter than item search (`searchNames` in `search.ts`, tested): the whole name, the
  start of it once two letters are typed ("am", "dairy m"), the name with a slip ("amool"), spaces ignored ("kitkat" is "Kit Kat"),
  in English, Hindi or Marathi. A word inside a name is not the name: "milk" does not offer "Dairy Milk" (it finds the milks, as
  before). The index lists only brands that have items (`SearchIndex.brands`). A query that finds only a brand is no longer an empty
  result. New word `search.brands` ("Brands"; Hindi and Marathi are drafts). Lint, typecheck and tests pass (560); checked at 360 dp:
  "amu" (Amul tile, then its items; the tile opens /brand/amul), "kitkat", and "milk" (no tile).

- **Step 7, built 2026-10-12 (awaiting the phone check).** The swap rule in words, no new screen. "If something is unavailable"
  (the sheet from the cart) now says what Swap does: "We send the same brand in another size first, then the same kind from another
  brand. Never at a higher price than the item you chose." (`substitute.swapHelp`), and the help-centre answer "What if an item is out
  of stock?" says the same. Hindi and Marathi are drafts. The choices, their storage and the per-item overrides are unchanged. The app
  only words and records the choice; the matching is the shop's and ops' (Phases 3 and 4). ADR 0014 point 3 carries an amendment note
  pointing to ADR 0036 point 6. Lint, typecheck and tests pass.

- **Step 7, see above. Step 8, built 2026-10-12 (awaiting the phone check): the close-out.** The states were checked (brand page:
  loading, offline, nothing listed, not found; Home's skeleton draws the brand tiles; the filter rows never leave an empty filter).
  `scripts/language-review.mjs` lost the removed `home.shopsStrip` group and gained the brand, brand-name, search and swap words; the
  sheet was regenerated. `brand.yaml` was written and `product.yaml` updated (not run: Maestro is not installed here). ADR 0031
  carries an amendment note. Gate: lint, typecheck, tests (560 in the customer app), Prettier and `pnpm build` pass; the Hermes bundle is
  4.25 MB (budget 5.0). With all five switches `false` the product page was checked in the preview as it was before, then the switches
  were put back to `true`. The report is
  [PHASE-1-brands-and-polish-report.md](PHASE-1-brands-and-polish-report.md).

## Approval

Approved by the owner in chat on 2026-10-12.
