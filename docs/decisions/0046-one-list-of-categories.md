# 0046. A department is a category: one list, one word

- **Status:** Proposed (Phase 1, sub-phase 1l). Amends [ADR 0044](0044-home-is-organised-by-departments-and-needs.md) (the name, the
  All departments screen and where the data lives) and the Categories tab of [ADR 0041](0041-categories-have-their-own-screen-and-a-two-section-tree.md).
- **Date:** 2026-10-13
- **Source:** the owner, who saw that the Categories tab and All departments showed the same tiles

## Context

After ADR 0044 the app had two lists over the same seven things: the Categories tab (the catalogue tree's main categories) and All
departments (the departments, each holding exactly one main category, plus those not stocked yet). Each had its own tiles, hook,
words and screen, and a shopper met two names, "category" and "department", for one idea.

## Decision

1. **One concept, one word.** A department is a category. A `Category` in `home/catalogueTree.ts` carries its group, delivery tag,
   rail name, emoji, tint and kinds. One that is not stocked yet is the same shape with no kinds. The shopper-facing word is
   "category" (श्रेणी in Hindi and Marathi).
2. **One list, on the Categories tab.** The All departments screen and `/departments` are gone. Home's "All categories" button and
   the header rail's More open the tab.
3. **Each stocked category is a row of tiles, four across.** Its own tile comes first, with its picture and its name, and opens the
   whole category; then its kinds, each opening the category's screen on that kind (`/category/[id]?sub=…`). Categories sit in their
   groups (Grocery & Kitchen, Snacks & Drinks), then "Coming to Roha" as softened, tagged tiles.
4. **A kind is offered only when an item of its type exists.** The tree lists the kinds the pictures promise before they are stocked
   (Dal & Pulses, Ghee, Masala & Spices, Namkeen, Bread & Pav, Rusk & Cakes, Indian Sweets, and salt with sugar), so adding stock
   needs no code change and nothing is empty on screen.
5. **The find field appears only past 24 categories,** and it matches a kind's name too. With fewer it would repeat the pinned search.
6. **A category that is coming has its own page** at `/coming/[id]`; a live one redirects to its screen, and an id that matches none
   goes to the category screen's own "not found" page.
7. **Needs stay as they are.** A need is a list of kinds and is not a category (ADR 0044, decision 6).

## Consequences

- `departments.ts` is split into `categoryLists.ts` (rail, grid, index, route, name matching) and `needs.ts`; `DepartmentsView`,
  `CategoryBlock` and the second set of hooks are removed.
- Words move: `departments.*` is gone. Group, rail, soon and tag words are under `catalogue`, the list's words under
  `categoriesTab`, and the needs' under `needs`. Home's section is `home.shopByCategory`.
- Pictures live in `assets/categories/<id>.webp`, listed by `home/categoryPictures.ts`.
- The Hindi and Marathi words are drafts for the native-speaker review sheet.
- Phase 2 moves the tree into `packages/contracts` as Zod schemas with `town_id`, with the category's tag and kinds as data.
