# 0044. Home is organised by departments and needs, and both are data

- **Status:** Proposed (Phase 1, sub-phase 1l). Supersedes ADR 0043 for where the intents sit; the intents themselves stay.
- **Date:** 2026-10-13
- **Source:** the owner, after the departments mock; see `docs/phases/PHASE-1-departments.md`

## Context

The catalogue will keep growing (Beauty, Electronics, Kids, Gym, Gaming and more). A header rail that lists everything cannot hold a
list that never stops, and a shopper thinks "I am hosting tonight", not "which department".

## Decision

1. **Four layers, one job each.** The header rail shows the few live departments a shopper uses (at most six, then More). "Shop for
   your need" shows cards for needs that cut across departments. "Shop by department" is a grid of eight, then All departments. The
   All departments screen indexes every department in groups.
2. **A department and a need are data.** A department holds catalogue main categories; a need holds product kinds. Both are listed
   per town (`home/departments.ts` today, a record with `town_id` once the API exists), so adding Gaming is a data change and not an
   app release.
3. **A department that is not stocked is "Soon".** It is listed with a Soon tag and opens a "Coming to Roha" page, never an empty
   shelf. A live department with nothing in stock reads Soon too.
4. **Delivery tags are honest.** A department says Today, Tomorrow or Soon, never a number of minutes (ADR 0012).
5. **The intents (Quick, Offers, Under ₹50, Veg) leave the header** and become a filter row under the All page's banner. The header
   stays lilac and the active tab keeps its underline.
6. **Needs are built only from kinds that are stocked,** so no need page is empty. A need with no items is not shown.

## Consequences

- "Shop by department" replaces "Shop by category" on Home (ADR 0031): up to eight tiles, live departments first, then those that
  are coming, softened with their tag; a live tile opens the screen of the main category it holds, and "All departments" sits under it.
  A tag is shown only when it is not "Today", so the usual case is not repeated on every tile.
- The header rail is data-driven: it always has "All", never shows a Soon department, and shows More only past six.
- Pinned and learned departments, "Jump back in" and Flash deals are not built; they need order history and a schedule from the API.
- Phase 2 moves the shapes into `packages/contracts` as Zod schemas with `town_id`, as the catalogue tree will be.
- ADR 0043 is marked superseded for chip placement when step 2 of the plan lands.
