# 0032. A shops strip on Home, and a brand footer at the end of the long pages

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner, who liked how the quick-commerce apps close their long pages with their line, and asked for Quibo's own

## Decision

1. **"Shops in your town"** is one swipeable row of the same compact shop cards the header's shops panel uses, right after "Shop by
   category", under the same dotted-line title. There are only a handful of shops, so the row is the whole list and has no "See
   all". A card opens that shop's page.
2. **A brand footer** closes the Home feed ("All" view) and the Categories tab, and nothing else: the tagline "Dukaan se ghar tak."
   (in the chosen language: English, Hindi, Marathi) set large and ghosted, a short pistachio bar, and the journey the line names drawn
   as the dotted route the app already uses: a shop, the scooter on its way, a home. Under it one quiet sentence, "Packed by shops in
   Roha. Delivered to your door."
3. **It is only where it is wanted.** Pages that are used (cart, checkout, orders, an order's page, the item and shop pages) do not
   carry it: a closing line belongs at the end of a page that is browsed, not one that is acted on.
4. **It is not a copy.** It uses Quibo's own words, the app's own route and scooter, and no heart or logo wordmark; the colour is the
   ghosted ink with one spot of pistachio.

## Consequences

- The footer is one piece (`BrandFooter`) with no props, so a future browsed page can end with it in one line.
- The sentence names the town in its words (Roha, as the sample strings do); it moves with the town configuration in Phase 2.
