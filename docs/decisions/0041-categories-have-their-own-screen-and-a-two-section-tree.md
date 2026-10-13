# 0041. Categories have their own screen, and the catalogue is a two-section tree

- **Status:** Accepted (Phase 1). The Categories tab's layout (point 3) is amended by
  [ADR 0046](0046-one-list-of-categories.md): each category is a row of tiles, its own first, then its kinds.
- **Date:** 2026-10-13
- **Source:** the owner, comparing the Categories tab and a category page with Blinkit's

## Context

Home's header rail switched Home's feed in place, so "Dairy" was a filter on the front page, not a place. Vegetables and Fruits were
separate, the Categories tab held a long list of small tiles, and nothing let a shopper sort or narrow a category.

## Decision

1. **The catalogue is a tree** (`home/catalogueTree.ts`): two sections (Grocery & Kitchen, Snacks & Drinks), seven main categories
   (Vegetables & Fruits, Dairy & Eggs, Atta Rice & Dal, Oil Ghee & Masala, Chips & Namkeen, Biscuits & Bakery, Sweets & Chocolates),
   and under each its kinds, which are sets of product types. A product type is in exactly one place (a test enforces it), so a new
   brand of a kind needs nothing here.
2. **A main category has its own screen** (`/category/[id]`, optionally `?sub=`): a lilac header with a square lower edge, a left rail
   of kinds ("All" first) 80 dp wide, and a two-column grid on the category's own colour (lightened, so the pictures stand out).
   Every brand of a kind is listed here, because this is where a shopper compares; Home lists one of each (ADR 0039).
3. **Everything that names a category opens that screen:** the Categories tab's tiles (now the two sections), Home's "Shop by
   category" tiles (the same seven), a Home row's "See all" and the featured picks. Back falls back to the Categories tab (or Home)
   when the screen was opened from an address.
4. **The screen has its own states:** a skeleton of the rail and the grid, an offline notice, an empty message, and a "category not
   found" page.

## Consequences

- Home no longer switches departments in place; its header chips are intents (ADR 0043).
- The tree is sample data until the catalogue comes from the API (Phase 2); the screen reads only the tree and the items.
- The old per-tile data of the Categories tab and Home's tiles, and their words, are gone.
