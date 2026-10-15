# Phase 1: Home clean-up plan (nine changes, one at a time)

Status: **plan approved (decisions below).** Each change is its own step and ends in a phone
check, as in the moments plan.

## The nine changes, as read from the owner's screenshots

| #   | What is on screen now                                                                                                                                                      | What changes                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The mosaic "Right now in Roha" (tall Morning milk tile and four small ones) at the top, and "Picks for your routine" (four moment cards) lower down. Tea Break is in both. | One section, in the mosaic's layout and look. The four small tiles become the four moments. The old title goes.                |
| 2   | (the same two sections)                                                                                                                                                    | See 1. `ShopForNeed` leaves the feed, so there is no duplicate.                                                                |
| 3   | A wide banner "Monthly ration, one tap" between the shelves.                                                                                                               | Removed. "Monthly ration" stays in Featured this week.                                                                         |
| 4   | "Know your shop": a picture scene (Dark Store against Connected Store), then a separate card with the two scores.                                                          | One container: the scene on top, then the two scores and the "things you can check yourself" line, opening to the five checks. |
| 5   | "Featured this week": tall cards with a tag line, title, body, "Shop now" and a picture.                                                                                   | Vertically compact: the tag line goes (the section title says it), tighter padding, same words otherwise.                      |
| 6   | Product details sheet: Highlights chips and the "All details" rows have no edge.                                                                                           | A thin light border (the Home one, `line`) on them. Any card-like block that has a dark edge takes the same border.            |
| 7   | Sheet or page title "Tomato" is small. Card names are 16 dp medium.                                                                                                        | Title larger. Card names larger and a little bolder (18 dp, weight 600), clipped at two lines.                                 |
| 8   | Small prices cards use a plain bold price and a filled ADD.                                                                                                                | They use the locked price badge, the same card as every other row.                                                             |
| 9   | Home category tiles with artwork have a thick coloured frame.                                                                                                              | The frame goes; the tile has the same 1 dp light border as the rest.                                                           |

## Order of work

1. Remove the Monthly ration banner (#3). Small, and it shortens the feed.
2. Category tile frame (#9) and the light border sweep (#6).
3. Small prices on the locked price badge (#8).
4. Type sizes: product-card names and the details title (#7).
5. Featured, compact (#5).
6. Know your shop in one container (#4).
7. One mosaic section for the routine (#1, #2).

For each: code, unit tests where logic moves, skeleton kept matching the page, the browser preview in light, dark and Hindi, then stop.

## Notes for each change

- **#3.** Delete `ShelfBanner.tsx`, its call in `HomeFeed.tsx`, its part in `HomeSkeleton.tsx` and the `home.banner.title` string
  (en, hi, mr). The banner's `SHELF_BANNER_HEIGHT` goes with it. Nothing else reads them.
- **#9.** `ui/CategoryTile.tsx`: drop `framed` (the 3 dp band) so the plate sits in the normal 1 dp `line` border.
- **#6.** `DetailSection` and `FactChip` get a 1 dp `line` border. Then a sweep of card-like blocks that use the control border
  (`ctl`): closed-shop tags (`ShopHero`, `ShopInfoCard`), the "out of stock" label on a card, option cards (schedule, slot, pack).
  Inputs, checkboxes and radios keep `ctl` (see the open question on borders).
- **#8.** `PriceTile.tsx` and its skeleton go; the row uses `ItemTile` at the rail width, as every other row does. What stays
  special in Small prices is the three price stores and the filter chips above the row.
- **#7.** A `cardName` text variant (18 dp, weight 600, tight) used by `ProductCard`. Card height follows from
  `useProductCardMetrics`, so skeletons keep matching. Checked with long Hindi names.
- **#5.** `useFeaturedCardHeight` is recomputed without the tag line and with `space[3]` padding; the skeleton reads the same
  number.
- **#4.** `KnowYourShop`: the scene loses its own border and bottom radius and sits at the top of the same bordered card that holds
  the scores; the toggle row, the two scores and the five checks stay in order below it. The dark stage behind keeps its fade.
- **#1/#2.** `hero.ts` tiles: Morning milk stays the tall tile (with its "from" price); the four small tiles become Tea Break,
  Breakfast Ready, Cook Today and Movie Night (need targets, with the moment's emoji). `HeroMosaic` gets the new title.
  `ShopForNeed` is removed from the feed and the skeleton; `liveNeeds` still decides which moments show. The "meet the shops" strip
  stays under the mosaic. The sabzi, kirana and fruit tiles go, because the header rail and the category groups already open those
  categories.

## Decisions (made 2026-10-15)

1. The merged mosaic holds the four moments as its small tiles; Morning milk stays the tall tile.
2. The merged section is titled **Picks for your routine**.
3. Small prices uses the standard card.
4. Borders: light `line` on cards, tags, detail rows, option cards (pack, slot, schedule) and chips. Inputs, checkboxes and
   radios keep the stronger edge, because it is the only thing that shows where they are (the 3:1 rule in `palette.test.ts`).
5. The title to enlarge is the one at the top of the product details sheet.

Status: all seven steps built and checked in the browser preview; the owner's phone check and commit are next.

Notes from the build: #3 removed the banner and its strings; #9 and #6 also moved chips and option cards to the light border and
dropped `Chip`'s `light` option; #8 deleted `PriceTile` and the accent ADD; #7 added the `cardName` text style (18 dp, weight 600)
and `Sheet`'s `largeTitle`; #5 dropped the Featured tag line and its string; #4 gave `CompareScene` a `flush` option; #1/#2 turned
`HERO_TILES` into `heroTiles(needs)`, removed `ShopForNeed` and the `home.shopForNeed` strings, and renamed the mosaic title.
