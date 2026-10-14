# 0048. Home gets Daily essentials, and its sections change order

- **Status:** Proposed (Phase 1, sub-phase 1l). Builds on [ADR 0044](0044-home-is-organised-by-departments-and-needs.md),
  [ADR 0046](0046-one-list-of-categories.md) and [ADR 0047](0047-need-cards-and-small-prices-redesign.md).
- **Date:** 2026-10-14
- **Source:** the owner, after a design review of the whole Home screen against quick-commerce apps, using a clickable mock
  (`docs/design/home-layout-preview.html`)

## Context

Home put "Shop for your need" first, then categories, brands, Small prices and Featured. A shopper who already knows what they want
(milk, bread, eggs, potatoes) had to browse a category or search. The owner asked for something customer-centric that lets a shopper
order the everyday things quickly, without searching or scrolling to a product.

## Decision

1. **A new section, "Daily essentials".** Under the category tiles: one segmented control (Morning, Cooking, Evening) over a
   two-column grid of up to six tiles. Each tile has a small picture, the name and pack, the price, and its own ADD that turns into the
   stepper in place. The tab that suits the time of day opens (morning before 11, cooking until 5 in the evening, then evening). The
   picture and words open the product page; the control writes to the cart through the same `ItemControl` every card uses, so the count
   shows everywhere the item shows.
2. **The list is data, not code.** `ESSENTIAL_TABS` lists item ids per tab until the mock API supplies it; in live phases it is a
   town-level table with `town_id`, so each town sets its own. An id that is not stocked or is out of stock is left out, a tab with
   nothing is left out, and with no tab left the section is not shown.
3. **The order below the quick filters becomes:** Shop by category, Daily essentials, Shop for your need, Small prices, Featured this
   week, Shop by brand, then the category rows. Categories are the door for browsing and now come first; essentials are the fast path
   and peek in at the fold; needs open a page, so they follow; a brand matters to a shopper who already has a favourite, so it moves
   below the price and featured rows. Only the order changes: every section is the same component as before.
4. **Not in this change.** The header's delivery line is unchanged (its wording is shared with the cart, checkout and category
   pages). "Order again" stays parked (owner, 2026-10-10); a "Your usual" tab built from past orders is a follow-up once order history
   is mocked.

## Consequences

- One new component (`DailyEssentials`), one data file (`essentials.ts`) with tests, and three new words in en, hi and mr (the title and
  the three tab names; the hi and mr wording needs a native-speaker check, as all new words do).
- The loading skeleton takes the same order and a tile skeleton of the real tile's height, so nothing moves when the strip loads.
- Maestro flows that look for "Shop for your need" must scroll to it, as it is now below the first screen.
- Items shown in Daily essentials also appear in their category rows, so a tap on "Add Amul Toned milk" can match two cards; both
  write the same cart line.
- The sample catalogue has no bread, onion, tea or salt yet, so the tabs are built from what exists (milk, curd, eggs, banana, biscuits,
  apple; tomato, potato, carrot, atta, rice, oil; chips, popcorn, chocolate, sugar). They grow with the catalogue.
