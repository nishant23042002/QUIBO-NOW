# 0058. Moment pages: shelf by shelf, every brand, their own colours

- **Status:** Accepted (built in Phase 1, mock data)
- **Date:** 2026-10-15
- **Source:** the product owner's decisions of 2026-10-15; plan `docs/phases/PHASE-1-moments-plan.md`; builds on ADR 0044 and ADR 0047

## Context

Home's "Picks for your routine" opens a page for a moment of the day. The first version listed a few items in one grid, under
Hindi-accented names, with the app's own colours. The owner wanted wide brand choice (no locked combos), plain professional
English names and a mood of its own for each page.

## Decision

1. **Four launch moments:** Tea Break, Breakfast Ready, Cook Today and Movie Night. Names are English, short and plain. A
   moment is a list of product kinds, not a category (the code still calls them needs). The old ids `teaTime`, `partySnacks` and
   `cookingBasics` are gone.
2. **Layout A, shelf by shelf.** A band with the name, a line and the moment's picture; jump chips under the header; one swipeable
   shelf for each catalogue sub-category the moment's kinds sit in, with every brand on it. A shelf may carry a one-line hint
   ("Goes with sugar"), never a bundle: any brand can be bought alone. A kind the town does not stock (cold drinks for Movie Night)
   is a quiet "coming soon" row with Notify me, sharing the Categories tab's choice.
3. **Own colours, from the header to the background.** Each moment has a palette (`momentPalettes`), laid over the app's colour
   roles by `MomentTheme`, so no component knows about moments. Dark mode darkens the three light moments; Movie Night is dark in
   both themes. The cart bar, picture plates and status colours stay the app's. Every pairing is contrast-tested (4.5:1 for text
   and accent text, 3:1 for control edges).
4. **Home keeps its fixed order.** Tiles only take the new names; following the clock or the weather is a later decision.
5. **Jump chips scroll, they do not filter.** They are announced as buttons ("Go to Biscuits"), not as pressed or not pressed.
6. **No claim of a time or a bundle** on these pages (ADR 0012): delivery stays an estimated range.

## Consequences

- Adding a moment is a record in `needs.ts`, a palette in `palette.ts`, and strings in en, hi and mr.
- "Moment screens" in ADR 0054 are the launch and between-navigation trust cards, a different thing from these pages.
- The sample catalogue grew by 29 items, 7 kinds and 16 brands; the sample brands are placeholders until real shops list.
- Open: native-speaker review of the Hindi and Marathi text; product-page text for the seven new kinds; tea leaves, besan and cold
  drinks are not in the catalogue.
