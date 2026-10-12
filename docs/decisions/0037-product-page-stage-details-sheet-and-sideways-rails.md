# 0037. The product page: a picture stage under the header, a details sheet, and sideways rails

- **Status:** Proposed (Phase 1, waiting for the owner's sign-off on the plan)
- **Date:** 2026-10-12
- **Source:** the owner, after reviewing the product page mocks (options A and B) and choosing option B with Quibo's own header

## Context

The page was one long stack of boxes: a picture card with thumbnails, a title card, a size card, Highlights, Information, a seller
card, a shop card, two rails and four trust tiles. Price and ADD sat low on the first screen, and the facts a shopper reads before
buying were spread over three boxes. The owner asked for a layout in the quick-commerce pattern, in Quibo's own colours, keeping the
page header and its scroll behaviour whole.

## Decision

1. **The header keeps its behaviour, with two changes the owner asked for after seeing it built (2026-10-12): it is square at the
   bottom, and the delivery time is a compact green-tinted pill (the View details button's tint).** Otherwise it is as before: the delivery line, back, search, share, and the name that turns into a product card once the picture
   has scrolled away. Only the name it is given (brand + name) and the scroll distance at which it changes (from the stage's height)
   differ. ADR 0024 (bottom bar, cart bar, ADD bar) is unchanged.
2. **A picture stage replaces the picture card.** Full width, lighter than the header's tint and fading into the page, starting
   under the header's rounded edge. The offer ribbon hangs from the header's lower edge; the tip button and its glass card stay at
   the picture's lower right; the diet mark moves to the top right; dots replace the thumbnail strip and the "2/3" count.
3. **One info card holds what is bought:** the delivery range and, for fresh goods, "Packed today"; the name (24 dp); the sizes;
   the price, the saving in rupees and "Inclusive of all taxes"; and ADD. The "Net quantity" line goes (the size says it).
4. **A short highlights strip opens a details sheet.** Three chips and "View details". The sheet holds Highlights, then three
   collapsible sections (Key Information, Nutritional Information, Info) with the price and ADD pinned at its foot.
   Highlights, Information and the seller block leave the page; the legally required labelling moves into the sheet, unchanged.
5. **Three single-line rows follow:** who sells it (and how many other shops have it), the brand (ADR 0036), and the replacement
   promise. The four trust tiles are retired from this page (the cart page keeps them).
6. **Lists swipe sideways in the page's own rail pattern** (title with a dotted line, 128 dp cards, price badge, ADD on the picture,
   See all under the row): "Other brands of {type}", "Popular in {category}", and a row of "Brands in this category". "More from
   {shop}" is dropped from this page (the shop is one tap away). "People also bought" is not built: it needs order history.
7. **The brand footer closes the page.** This amends ADR 0032 point 3, which kept it off item pages.

## Consequences

- `ProductView.tsx` is split into pieces that each own a block and its skeleton (stage, info card, details sheet, rows, rails).
- `ProductGallery` (thumbnails, count) is replaced by a stage component; it is used nowhere else.
- Brand data (ADR 0036) is needed for the brand row and the "Other brands" rail; until a brand page exists, brand taps open Search
  with the brand as the query.
- Nothing in Order, payment, dispatch or ledger code changes.
