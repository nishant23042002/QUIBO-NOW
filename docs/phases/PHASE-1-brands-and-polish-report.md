# Phase 1, sub-phase 1k: brand pages and product page polish, report

**Surface:** customer app, UI on mock data
**Plan:** [PHASE-1-brands-and-polish.md](PHASE-1-brands-and-polish.md), approved by the owner on 2026-10-12
**Decisions:** [ADR 0036](../decisions/0036-products-carry-a-brand-and-brands-are-browsable.md) (brand),
[ADR 0038](../decisions/0038-shop-by-brand-on-home-and-the-shops-strip-goes.md) (Shop by brand; the shops strip goes), and the notes added
to ADR 0014 (the swap order), ADR 0031, ADR 0032 and ADR 0024 item 5.
**Status:** built in eight steps, each stopped for the owner's phone check. Everything below that could be checked on this machine was
checked; what needs a phone or a person is listed at the end. Not committed yet.

## What exists now

**Brands are a way to browse.**

- **A brand page**, `/brand/[id]`: the shop page's header, a brand card (the letter, the name, "N products", "Sold by N shops in Roha"),
  chips for the kinds the brand makes, and its items in the two-column grid. States: loading skeleton, offline notice, nothing listed,
  and a not-found page for an id that is no brand. The product page's brand row and "Brands in this category" tiles open it.
- **Shop by brand on Home**, a swipeable row of brand tiles under "Shop by category". The "Shops in your town" row is gone (the owner:
  it repeated the shops panel in the header).
- **A brand filter** (`ui/BrandChips`: All, then each brand) on a category's grid on Home, on search results and on a shop's page. It
  shows when the list holds two or more brands, and drops back to All when the chosen brand is no longer in the list.
- **Brands in search**: a query that is a brand's name (the whole name, the start of it, a slip, in any language) puts a "Brands"
  section first, with a tile that opens the brand's page. "milk" is not the name "Dairy Milk".
- **The swap rule in words**: "If something is unavailable" and the help-centre answer now say the same brand in another size first,
  then the same kind from another brand, never at a higher price.

**Trial switches on the product page** (`home/pdpTrial.ts`, all on): unit price on other-brand cards (E), "Save ₹2" under sizes and the
best-value size pre-selected (H), one tinted-pill style (C), and Sold by, brand and replacement rows as one card (B). Each goes back to
today's behaviour with one word.

## Steps

| Step | What                                                                                  | Phone check |
| ---- | ------------------------------------------------------------------------------------- | ----------- |
| 1    | Switches E and H; the ADD bar back to showing only after the in-page ADD scrolls past | Waiting     |
| 2    | Switches C and B                                                                      | Waiting     |
| 3    | The brand page and the product page links to it                                       | Waiting     |
| 4    | Shop by brand on Home; the shops strip removed                                        | Waiting     |
| 5    | The brand filter on a category, search results and a shop page                        | Waiting     |
| 6    | Brands in search results                                                              | Waiting     |
| 7    | The swap wording                                                                      | Waiting     |
| 8    | Close-out: states, words, Maestro `brand.yaml`, docs, gate, this report               | Waiting     |

## Gate

| Check                                    | Result                                                                                                                                                                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                              | Pass, no warnings                                                                                                                                                                                                                                              |
| `pnpm typecheck`                         | Pass, 9 of 9                                                                                                                                                                                                                                                   |
| `pnpm test`                              | Pass: customer 560 tests in 54 files (541 in 53 before this sub-phase), i18n 30, contracts 200, mocks 11, config 16                                                                                                                                            |
| `pnpm build`                             | Pass                                                                                                                                                                                                                                                           |
| Prettier                                 | Pass                                                                                                                                                                                                                                                           |
| Android Hermes bundle                    | 4,254,347 bytes (4.25 MB, 4.06 MiB), inside the 5.0 MB budget (4.24 MB before this sub-phase)                                                                                                                                                                  |
| Maestro flows                            | `brand.yaml` written; `product.yaml` updated (the brand opens its page). **Not run**: Maestro is not installed here (as in `PHASE-1-defects.md`)                                                                                                               |
| Checked in the browser preview at 360 dp | Every step in English: the brand page and its kind chips, Shop by brand, the brand filter in all three places, "amu", "kitkat" and "milk" in search, the swap words in the cart, and the product page with all five switches `false` (then restored to `true`) |

## Verification list from the plan

| #   | Check                                                                               | Result                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | lint, typecheck, test and build pass                                                | Done, above                                                                                                                                                  |
| 2   | With every switch `false` the product page is as it was                             | Done in the preview: 500 ml chosen, no "Save" lines, plain "Packed today", solid "Best value" tag, three separate cards, no unit price on other brands       |
| 3   | The brand page lists exactly the brand's items, in all three languages, and filters | English checked in the preview (Amul: 3 products, Paneer chip). The items come from the id, not the words, so the languages differ only in the message files |
| 4   | Shop by brand shows every brand that has an item and never one without              | Done: twelve brands shown; `brandsOfItems` is tested                                                                                                         |
| 5   | "amul", "अमूल" or "gokul" puts the brand tile first                                 | "amu" and "kitkat" checked in the preview; the Devanagari name and the other cases are unit tests (`searchNames`)                                            |
| 6   | An item with no brand is never offered a brand page, chip or tile                   | Done: `brandsOfItems` and `filterByBrand` skip it (tested); the product page draws no brand row for it                                                       |
| 7   | Nothing in order, payment, dispatch or ledger code branches on a brand              | Done: a search of the apps and packages finds `brand` only as Zod's branded types and a comment on the splash                                                |

## Found and fixed during the close-out

| What                                                                                                                       | Fix                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `scripts/language-review.mjs` still listed `home.shopsStrip`, a message group step 4 removed, so its sheet was out of date | The script lists `home.shopByBrand` and the new brand, brand name, search and swap words; the sheet was regenerated |
| `product.yaml` still said the brand opens search                                                                           | It says the brand opens its own page and asserts the page                                                           |
| ADR 0031 did not say what sits under the category tiles                                                                    | An amendment note points to ADR 0038 and ADR 0036                                                                   |

## Not yet checked (needs a phone, a person or a tool)

- Steps 1 to 8 on a real Android phone, one screen at a time (the owner's phone checks; each step's list is in the plan file).
- The brand page, Shop by brand and the brand filter in Hindi and Marathi on a phone (long names, the chip row).
- The largest font size from the phone's real setting on the brand card, the chip rows and the Brands tile.
- TalkBack on the brand tile, the chip rows ("Filter by brand", "Filter by kind") and the brand page's card.
- Every Maestro flow, including the new `brand.yaml`.
- The skeleton against the loaded Home on a real phone: the brand tiles replace the shop cards, so nothing should jump.
- Hindi and Marathi wording: the new words are in `PHASE-1-language-review.md` ("Shop by brand, on Home", "Brand page and brand
  filter", "Brand names", "Brands in search results", "If something is unavailable").

## Open for the owner

1. **Which shop is "Sold by" when several have the item** (ADR 0036). The page shows the item's own shop and says how many others have
   it; choosing between them is not built.
2. **Brand logos** are trademarks. Every brand is a letter on a tile until the owner has checked what is allowed.
3. **Keep or go back** on each trial switch (E, H, C, B and the pre-selected size). The page can go back to today's with one word each.
4. **ADRs 0036 and 0037** are still Proposed; they become Accepted on the owner's sign-off. ADR 0038 is Accepted.
5. **The sample catalogue is small** (twelve brands, sixteen items): enough to look right, not to judge a real town. Brand order on
   Home follows the sample's order; the real order (trusted brands first) comes with the catalogue in Phase 2 and the admin panel.
6. **Not built, on purpose:** a "see all brands" page, brand-level offers, brand logos, and the matching for swaps (the shop's and ops',
   Phases 3 and 4).
7. **Nothing is committed.** Say when to commit and in how many pieces.
