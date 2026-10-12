# 0039. Home lists one of each kind, and the product picture has an other-brands button

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner, looking at Home: the same product (toned milk) appeared once for each brand

## Context

ADR 0036 made products carry a brand and put several brands of the same kind into the catalogue. Home, which lists the catalogue, then
showed "Toned milk" four times (Amul, Gokul, Katraj, Chitale). That is noise on a page meant to be quick to read, and the product page
already has an "Other brands of this" row for exactly that comparison.

## Decision

1. **Home lists one item for each kind of product** (`oneOfEachKind`, `useHomeListing`). The kind is the item's `type`. The one shown is
   the first listed, or the first in stock when that one is sold out. It applies to the rows, a category's grid and Small prices (and the
   Home loading skeleton, so it has the same cards).
2. **Choosing a brand shows everything that brand makes.** On a category's grid, "All" is one of each kind; a brand chip lists that
   brand's items in the category, so browsing by brand is unchanged.
3. **Other places keep every brand:** search results, a shop's page, a brand's page, Shop by brand, the cart and the swap rule. Someone
   searching "milk" wants to compare, and a shop's page is what that shop stocks.
4. **The product picture has two corner buttons.** The insight ("good to know") button moves to the lower left and its card opens from
   there. A new button in the lower right (`OtherBrandsButton`: stacked sheets, the number of other brands on its corner) glides the
   page to the "Other brands" row in about half a second (instantly with "reduce motion"), stopping with the row's title just under
   the header. It shows only when the product has other brands. While the insight card is open the ribbon, the diet mark, the dots and
   this button step aside.

## Consequences

- Home is shorter and each row shows different things. The other brands of what the shopper sees are one tap away, on the product page.
- Nothing about the catalogue or the cart changes; this is only what Home lists and where two buttons sit.
- The sample data's first-listed item is the lead brand in every kind, so the choice is stable. When the API supplies the catalogue, the
  order of listing becomes the shop's or the town's ranking.
