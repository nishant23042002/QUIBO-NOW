# Phase 1, sub-phase 1j: product page redesign, report

**Surface:** customer app, UI on mock data
**Plan:** [PHASE-1-pdp-redesign.md](PHASE-1-pdp-redesign.md), approved by the owner on 2026-10-12
**Mock:** https://claude.ai/artifact/B73ifPQ2G2nGq3jY41YEW5
**Decisions:** [ADR 0036](../decisions/0036-products-carry-a-brand-and-brands-are-browsable.md) (brand),
[ADR 0037](../decisions/0037-product-page-stage-details-sheet-and-sideways-rails.md) (layout), ADR 0024 item 5 and ADR 0032 item 3
amended.
**Status:** built in nine steps, each stopped for the owner's phone check. Everything below that could be checked on this machine was
checked; what needs a phone or a person is listed at the end. Not committed yet.

## What exists now

The product page, top to bottom: the header (unchanged); a full-width picture stage in a lighter shade of the header's tint, with the
ribbon hanging from the header's edge, the diet mark top right, dots instead of thumbnails and the insight button and card; a
highlights strip (three chips and View details); one info card (delivery range, Packed today, the name, Select Unit, the price
badge with the saving, ADD or the stepper); a Sold by row (with "Also at N other shops"), a brand row and a replacement row; three
sideways rows (Other brands of {name}, Popular in {category}, Brands in this category); and the brand footer. The ADD bar rises
once the in-page price row has scrolled past (it was briefly shown also below the first screen; reverted). The details sheet holds Highlights, then Key Information, Nutritional
Information and Info, with the price and ADD pinned.

Products now carry a brand and a kind (ADR 0036, sample data): twelve brands, six other-brand items, brand + name in every list, the
header and the cart, brand names found by search, and facts held by kind so every brand of milk reads the same.

Facts are named the way shoppers see them named elsewhere, as the owner asked: Fat Profile, Shelf Life, Biological Source,
Processing Type, Select Unit, Key Information, Nutritional Information, Info, Packed On, Best Before and so on.

## Steps

| Step | What                                                                                                          | Phone check |
| ---- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| 1    | Brand and kind on the samples, other-brand items, helpers and tests; the naming pattern on the page as it was | Waiting     |
| 2    | Brand + name in lists, search, cart and header; other brands on Home                                          | Waiting     |
| 3    | The picture stage, the drape behind the header's corners, dots, diet mark                                     | Waiting     |
| 4    | The info card                                                                                                 | Waiting     |
| 5    | The highlights strip and the details sheet                                                                    | Waiting     |
| 6    | Sold by, brand and replacement rows; the ADD bar shows when the row is not on screen                          | Waiting     |
| 7    | The rails and the brand row                                                                                   | Waiting     |
| 8    | The brand footer                                                                                              | Waiting     |
| 9    | Close-out: skeleton heights, Marathi wording, Maestro flows, gate, this report                                | Waiting     |

## Gate

| Check                                    | Result                                                                                                                                                                                                                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                              | Pass, no warnings                                                                                                                                                                                                                                                                                  |
| `pnpm typecheck`                         | Pass, 9 of 9                                                                                                                                                                                                                                                                                       |
| `pnpm test`                              | Pass: customer 541 tests in 53 files, i18n 30, contracts 200, mocks 11, config 16                                                                                                                                                                                                                  |
| `pnpm build`                             | Pass                                                                                                                                                                                                                                                                                               |
| Prettier                                 | Pass                                                                                                                                                                                                                                                                                               |
| Android Hermes bundle                    | 4.24 MB (4.04 MiB), inside the 5.0 MB budget                                                                                                                                                                                                                                                       |
| Maestro flows                            | `product.yaml` written; the other flows' item names updated. **Not run**: Maestro is not installed here (as in `PHASE-1-defects.md`)                                                                                                                                                               |
| Checked in the browser preview at 360 dp | Every block, in English; Hindi and Marathi at the top, the rows and the first rail; the dark theme at the top; the sheet and its sections; ADD from the sheet; brand taps opening Search with the brand typed in; the ADD bar at the top, in the middle and past the row; the footer at the bottom |

## Defects found and fixed during the close-out

| What                                                                                                                      | Fix                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| The Maestro flows named items as "Toned milk"; since step 2 the screen-reader name is "Amul Toned milk"                   | The five flows that used it were updated                                                                         |
| The skeleton's chip and row heights were smaller than the real strip and rows (the Sold by row grew a line for "Also at") | The skeleton now takes both from the same line heights as the page, with the Sold by and brand rows' own heights |
| The Marathi title "{name} चे इतर ब्रँड" read badly when the name is "टोन्ड दूध"                                           | Reworded to "{name}: इतर ब्रँड"                                                                                  |

## Not yet checked (needs a phone, a person or a tool)

- Steps 1 to 9 on a real Android phone, one screen at a time (the owner's phone checks; each step's list is in the plan file).
- The largest font size from the phone's real setting. The new blocks have no fixed heights except the brand tile's mark and the
  stage's ratio; the header's own fixed heights are the review's old P1 item and are unchanged.
- The skeleton against the loaded page on a real phone: nothing should jump when the page replaces it.
- TalkBack on the strip, the sheet's sections and the rails.
- Every Maestro flow, including the new `product.yaml`.
- Hindi and Marathi wording: the new and changed words are listed at the end of this file for the native speaker.
- The drape behind the header's rounded corners on a real phone, in light and dark.

## Open for the owner

1. **Which shop is "Sold by" when several have the item** (ADR 0036). The page shows the item's own shop and says how many others
   have it; choosing between them is not built.
2. **Brand logos** are trademarks. The page uses a letter on a tile until the owner has checked what is allowed.
3. **The rest of ADR 0036:** the brand page, "Shop by brand" on Home, brand filters on Categories, Search and the shop page, and
   brand-aware swaps in the cart. Each is its own step. Search stands in for the brand page today.
4. **ADRs 0036 and 0037** are still Proposed; they become Accepted on the owner's sign-off.
5. **Not built, on purpose:** the heart, ratings and reviews, "People also bought" (needs order history, Phase 2), a full-screen
   picture viewer, the mock's floating close button above the sheet (the app's own sheet has its close in its header).
6. **Tidying left for later:** `moreFromShop` and the `product.viewMore`, `product.viewLess` and `product.netQuantity` messages are
   no longer used by the page; they were left in place for the shop page and the language review.

## Words for the Hindi and Marathi review

The review sheet (`PHASE-1-language-review.md`) does not cover the product page, so the words this redesign added or changed are
listed here, with the drafts, for the native speaker.

| Key                              | English                           | Hindi (draft)              | Marathi (draft)                  | OK or change to |
| -------------------------------- | --------------------------------- | -------------------------- | -------------------------------- | --------------- |
| `product.pickSize`               | Select Unit                       | इकाई चुनें                 | एकक निवडा                        |                 |
| `product.information`            | Info                              | जानकारी                    | माहिती                           |                 |
| `product.viewDetails`            | View details                      | विवरण देखें                | तपशील पहा                        |                 |
| `product.allDetails`             | All details                       | सभी विवरण                  | सर्व तपशील                       |                 |
| `product.keyInformation`         | Key Information                   | मुख्य जानकारी              | मुख्य माहिती                     |                 |
| `product.nutritionalInformation` | Nutritional Information           | पोषण संबंधी जानकारी        | पोषणविषयक माहिती                 |                 |
| `product.closeDetails`           | Close details                     | विवरण बंद करें             | तपशील बंद करा                    |                 |
| `product.packedToday`            | Packed today                      | आज पैक किया गया            | आज पॅक केलेले                    |                 |
| `product.packedYesterday`        | Packed yesterday                  | कल पैक किया गया            | काल पॅक केलेले                   |                 |
| `product.alsoAtOne`              | Also at 1 other shop              | 1 और दुकान पर भी           | आणखी 1 दुकानात उपलब्ध            |                 |
| `product.alsoAtMany`             | Also at {count} other shops       | {count} और दुकानों पर भी   | आणखी {count} दुकानांत उपलब्ध     |                 |
| `product.exploreAll`             | Explore all products              | सभी उत्पाद देखें           | सर्व उत्पादने पहा                |                 |
| `product.replacementRow`         | Replaced or refunded if not right | ठीक न हो तो बदला या रिफ़ंड | योग्य नसल्यास बदलून किंवा परतावा |                 |
| `product.otherBrands`            | Other brands of {name}            | {name} के अन्य ब्रांड      | {name}: इतर ब्रँड                |                 |
| `product.brandsIn`               | Brands in this category           | इस श्रेणी के ब्रांड        | या श्रेणीतील ब्रँड               |                 |
| `product.rows.fatProfile`        | Fat Profile                       | वसा प्रोफ़ाइल              | फॅट प्रोफाइल                     |                 |
| `product.rows.biologicalSource`  | Biological Source                 | जैविक स्रोत                | जैविक स्रोत                      |                 |
| `product.rows.processingType`    | Processing Type                   | प्रसंस्करण प्रकार          | प्रक्रिया प्रकार                 |                 |
| `product.rows.sugarProfile`      | Sugar Profile                     | चीनी प्रोफ़ाइल             | साखर प्रोफाइल                    |                 |
| `product.rows.brand`             | Brand                             | ब्रांड                     | ब्रँड                            |                 |
| `product.rows.servingSize`       | Serving Size                      | सर्विंग साइज़              | सर्व्हिंग साइज                   |                 |
| `product.rows.energy`            | Energy                            | ऊर्जा                      | ऊर्जा                            |                 |
| `product.rows.storage`           | Storage Instructions              | भंडारण निर्देश             | साठवणुकीच्या सूचना               |                 |
| `product.rows.care`              | Customer Care Details             | ग्राहक सेवा विवरण          | ग्राहक सेवा तपशील                |                 |
| `product.attr.toned`             | Toned                             | टोंड                       | टोंड                             |                 |
| `product.attr.fullCream`         | Full Cream                        | फुल क्रीम                  | फुल क्रीम                        |                 |
| `product.attr.cowMilk`           | Cow Milk                          | गाय का दूध                 | गायीचे दूध                       |                 |
| `product.attr.hen`               | Hen                               | मुर्गी                     | कोंबडी                           |                 |
| `product.attr.pasteurized`       | Pasteurized                       | पाश्चराइज़्ड               | पाश्चराइज्ड                      |                 |
| `product.attr.noAddedSugar`      | No Added Sugar                    | चीनी नहीं मिलाई            | साखर घातलेली नाही                |                 |
