# 0056. The quick-filter row leaves Home, and the payment strip shares Fresh today's wash

- **Status:** Accepted (Phase 1, sub-phase 1m). Supersedes [ADR 0043](0043-home-header-chips-are-intents.md) in full (its
  point 1, the intents, no longer stands) and the filter row of [ADR 0044](0044-home-is-organised-by-departments-and-needs.md).
- **Date:** 2026-10-14
- **Source:** the owner, while checking Home on the phone during step 3 of [ADR 0055](0055-home-v5-the-locked-redesign.md)

## Context

Home carried a row of quick filters (a sliders badge, then All, Quick, Offers, Under ₹50 and Veg) between the mosaic and the
page. With Home v5 the page already offers the same ways in as sections of their own: Fresh today (a price tab, vegetables,
fruits, dairy, what is new), the header's category rail and Small prices. The row repeated them, pushed the first real
section down, and turned the page into a flat grid that no longer matched the sections.

## Decision

1. **The row is removed**, with the code that only it used: the chips component, the intent list and its matching rules, the
   hook that translated them, their tests, the `solid` tone of `Chip`, the `leaf` and `rupee` icons, and the `home.intents.*`
   messages. A category chosen in the header rail still shows its own grid with a See all button.
2. **The payment strip and Fresh today are one section.** They sit on one pistachio wash, strongest under the mosaic and gone
   at the end of Fresh today, so the strip reads as part of the section and not as a bar between two.
3. The empty state of a category's page keeps its words under `home.categoryEmpty`.

## Consequences

- ADR 0055's step 7 listed "Trending in Roha with the intents as tabs". The intents no longer exist, so that module takes its
  tabs from its own plan when step 7 is written (the tab rules would live with the module, as `fresh.ts` does for Fresh today).
- Offers, Quick and Veg are not on Home as filters any more. Offers and diet filters stay on the category screens (ADR 0042).
- Fewer tabs on the first screen; one less state to hold in the Home screen and in the Maestro flow.
