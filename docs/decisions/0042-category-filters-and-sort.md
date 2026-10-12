# 0042. Each category has its own filters, and a sort that includes the biggest saving

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-13
- **Source:** the owner, from Blinkit's sort and filter sheets

## Decision

1. **A toolbar above the grid** has a button for Filters, Sort, and then one for each filter the category offers. The buttons are
   square-cornered (6 dp), 36 dp high, with an icon in front and a chevron after, and are drawn chosen (lilac with a green edge, with
   their count) when they are doing something.
2. **Sort** is a sheet of radio choices with no rules between them: Relevance, Price low to high, Price high to low, Biggest saving
   (rupees saved, the owner's addition). A stable sort; sold-out items always come last.
3. **Filters** is a sheet with the list of filters at the left and the choices of the open one at the right, each with how many items
   it has, and "Clear all" and "Apply (n)" at the bottom, where n is how many items the choices would leave. Nothing changes until
   Apply. A filter's button in the toolbar opens the sheet at that filter.
4. **The filters depend on the category** (`MAIN_FACETS` in `home/facets.ts`), as they do for the shopper on the shelf: Vegetables &
   Fruits has Type, Price, Country of Origin and Properties; Dairy & Eggs has Quantity, Brand, Fat Profile, Type, Source, Processing
   Type and Price; Oil, Ghee & Masala has Quantity, Price, Brand, Country of Origin and Type; the others have Quantity, Brand, Type,
   Price and Properties. A filter of values is dropped when the list has fewer than two choices. Properties holds Veg, Non-veg and On
   offer.
5. **Sort and filters carry across the kinds in the rail,** and a choice the chosen kind does not have is quietly ignored, so nobody
   is filtered on something they cannot see.

## Consequences

- Fat Profile, Source and Country of Origin read the same facts as the product page (`productAttributes.ts`).
- Blinkit's Atta Type and Refinement Type are not offered: the sample items have no such facts. They come in with the catalogue.
- The sort and filter logic is plain functions with tests (`categoryFilters.ts`, `facets.ts`).
