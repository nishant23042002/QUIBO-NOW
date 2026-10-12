# 0036. Products carry a brand, and brands are a way to browse and compare

- **Status:** Proposed (Phase 1, waiting for the owner's sign-off on the product page mock) Logos: the owner supplied official marks on 2026-10-12; see [0040](./0040-brand-logos-on-a-white-plate.md).
- **Date:** 2026-10-12
- **Source:** the owner, while reviewing the product page redesign

## Context

Delivery is store-led, but shoppers in Maharashtra choose by brand they trust: Amul and Gokul for milk and dairy, Dairy Milk and
KitKat for chocolate, and so on. The same kind of product (toned milk) is sold under several brands, and the plan only had `brand`
as a plain text field on `master_item`. The mock items so far are one item per shop, with no brand at all, so a shopper cannot
browse by brand, compare brands, or tell a shop's own packed milk from a branded pack.

## Decision

1. **Brand is its own thing, not a text field.** A brand has a name in English, Hindi and Marathi, a mark (a wordmark or a logo, see
   consequence 5), and the categories it sells in. Which brands count as "trusted in this town" is a town setting, not code.
2. **A product has a type and a brand.** The type is the plain thing ("Toned milk"); the brand makes it a product ("Amul Taaza").
   A master item is brand + type + variant name + pack size. Two items with the same type and different brands are the "other
   brands" of each other; this is also how substitution finds a match.
3. **Some things have no brand.** Loose vegetables and fruit, and a shop's own loose or packed goods, carry no brand. The screens show
   no brand line for them (never "Unbranded").
4. **A brand item can be sold by several shops.** Shops opt in to master items (PLAN section 7) and set a price at or below MRP, so one
   Amul Taaza can be on the shelf of several shops, each with its own price and availability. The product page shows one shop as
   "Sold by" and says how many others have it. **How that one shop is chosen is not decided here** (see Open question).
5. **Brand is a way to browse.** A brand line on the product page that opens a brand page; a "Shop by brand" strip on Home; a brand
   filter inside a category, on search results and on a shop's page; "Other brands of this" and "More from this brand" on the product page.
6. **Substitution follows brand.** The swap order becomes: the same brand in another size, then the same type from another brand,
   never at a higher price (ADR 0014); the shopper's per-item choice still comes first.
7. **No ratings, no paid placement.** Brands are listed by the town's own order and then by name; there are no "Ad" tags.

## Open question

Which shop is shown as "Sold by" when several have the item: the shopper's chosen or most-ordered shop, else the nearest open shop with
stock, else the lowest price? Recommendation: preferred shop, then nearest open with stock; the product page lists the others with
their prices so the shopper can switch. Needs the owner's decision before the data model is final (ADR 0009 allows one order to span
shops, so any choice works for the order itself).

## Consequences

1. `packages/contracts` gains `Brand` and `ProductType`; `master_item` gets `brand_id` (nullable) and `product_type_id`. `item_alias`
   also covers brand names ("amul", "gokul") and their Devanagari spellings.
2. `packages/mocks` and the app-local samples in `items.ts` gain brands; item names are stored without the brand and shown as
   brand + name in lists and the header.
3. Search, Categories, Home and the shop page each get a brand dimension (see the product page review for the list and order).
4. The admin Catalogue module manages brands; the store portal can opt in to a whole brand's items at once.
5. Brand logos are trademarks. Until the owner has checked what is allowed, brands are shown as a monogram or wordmark on a tint, and
   a pack photo shows whatever is printed on the pack. No logo files are added to the repo without that check.

## Progress (2026-10-12)

Built so far: brand and kind on items; brand + name everywhere; the brand row, the brand tiles and "Other brands" on the product page; brand
names found by search; the brand page (`/brand/[id]`); "Shop by brand" on Home; brand filter chips on a category, search results and a
shop page; brands as search results (a brand tile first when the query is its name); the swap wording in the cart and on the substitution sheet. All of the decision is built (sub-phase 1k, see
[PHASE-1-brands-and-polish-report.md](../phases/PHASE-1-brands-and-polish-report.md)). Open: which shop is "Sold by", and brand logos.
