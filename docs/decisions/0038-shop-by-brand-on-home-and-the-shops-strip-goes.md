# 0038. "Shop by brand" on Home, and the shops strip goes

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner, who pointed out that "Shops in your town" on Home repeats the shops panel in the header, and chose brand as the next way to browse (ADR 0036)

## Context

Home carried a "Shops in your town" row of shop cards (ADR 0032). The header already opens a panel with the same shops and the same
cards, so the row said nothing the header did not. ADR 0036 makes brand a way to browse and asked for a "Shop by brand" strip on Home.

## Decision

1. **The "Shops in your town" row is removed from Home.** The shops are one tap away in the header's panel, with the same cards, and
   each opens its own page. ADR 0032 point 1 is amended accordingly; its brand footer (point 2) is unchanged.
2. **"Shop by brand" takes its place**, under "Shop by category" and above "Small prices": one swipeable row of brand tiles (the brand's
   letter and name, the same tile as "Brands in this category" on the product page), under the same dotted-line title as every row.
   A tile opens the brand's page. The row is the whole list (there are a dozen), so it has no "See all". A brand with no items is never
   shown, and a town with no branded items shows no row.
3. **Brands are listed in the order they first appear** in the items, until the town's own order (ADR 0036, "trusted first") is data.

## Consequences

- `ShopsStrip` and the shop-card skeleton used only by it are deleted; the loading skeleton for Home draws the brand row instead.
- The message `home.shopsStrip.title` is replaced by `home.shopByBrand.title` (English, Hindi and Marathi).
- PLAN section 6 lists "Shop by brand" on Home; "Your shops" lives in the header.
