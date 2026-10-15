# Phase 1: Moments plan (four moment pages, shelf by shelf, each in its own colours)

Status: **approved by the owner (2026-10-15) with the recommendations taken; steps 1 and 2 built, awaiting the phone check of step 2.**

Decisions taken: the four names as proposed; dark mode gives the three light moments darker values of the same hues and Movie
Night stays as it is; Home's tiles keep their fixed order and only take the new names in this phase; the sample brands are chosen
by me from well-known Indian brands and listed for the owner's review before they go in.

Step 1 (done): `home/needs.ts` holds the four moments (ids `teaBreak`, `breakfast`, `cookToday`, `movieNight`; kinds in shelf
order, a line, "goes with" hints, and `soon` for Movie Night's cold drinks); the names, lines, hints and the "coming soon" word are
in en, hi and mr (the Hindi and Marathi are drafts for a native speaker); `theme/palette.ts` has `momentPalettes`, light and dark,
with contrast tests in `palette.test.ts`. The old ids `teaTime`, `partySnacks` and `cookingBasics` are gone, so the route is now
`/need/teaBreak`. The only visible change is the new names on Home's "Picks for your routine" and the hero tile.

The owner chose layout A ("Shelf by shelf") from the moments board and asked to start with four moments, named in plain
professional English. The board is a mock; this is the build plan from it.

## 1. The four moments and their names

| Today                     | Proposed name       | Other options                         | Line under it                                  | Kinds, in shelf order                                         |
| ------------------------- | ------------------- | ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Tea time                  | **Tea Break**       | Evening Tea, Tea and Snacks           | Milk, biscuits and something to dip.           | milk, sugar, biscuits, rusk, namkeen                          |
| Breakfast                 | **Breakfast Ready** | Quick Breakfast, Breakfast Essentials | Be out of the door on time.                    | bread, eggs, milk, pav, paneer, banana                        |
| Cooking basics            | **Cook Today**      | Dinner Tonight, Kitchen Restock       | Staples and fresh vegetables for today's meal. | atta, rice, dal, oil, tomato, potato, brinjal, paneer, masala |
| Party snacks (new moment) | **Movie Night**     | Snack Night, Night In                 | Snacks for the whole couch.                    | popcorn, chips, namkeen, chocolate, cake                      |

Names are English words a shopper sees on a shop sign. Hindi and Marathi names are written by a native speaker, not translated
word for word, and are reviewed before release.

## 2. What the page is (layout A)

- A header and a band in the moment's own colours (header, band, page background, card, line, accent), the name and its line, and a
  row of jump chips, one for each kind.
- One shelf for each kind, in the order above. A shelf is a swipeable row of every brand the town stocks of that kind, with a short
  "goes with" line under its title (a hint, never a bundle). A customer adds any brand of any kind, or skips a kind.
- A kind the town does not stock yet is not drawn as an empty shelf. A kind that is "coming soon" (cold drinks for Movie Night)
  is a quiet row with Notify me, as the categories do.
- The cart bar works as on every other page. Minutes stay a range; no countdown; prices as they are.

## 3. Colours

One palette for each moment, kept in `theme/palette.ts` (the only file that may hold a colour), with a light and a dark value, and
checked in `palette.test.ts` for 4.5:1 text on its header, band and background and for the button label on its accent.

| Moment          | Mood                        | Header    | Band      | Background | Accent    |
| --------------- | --------------------------- | --------- | --------- | ---------- | --------- |
| Tea Break       | Tea and biscuit browns      | `#F0D3A6` | `#F7DDB0` | `#FFF8EE`  | `#A8501A` |
| Breakfast Ready | Morning sun                 | `#FFE08A` | `#FFEDB5` | `#FFFCF2`  | `#B85A0D` |
| Cook Today      | Turmeric and chilli         | `#F6D463` | `#FBE6A0` | `#FFFBEF`  | `#C4351F` |
| Movie Night     | A dark cinema, popcorn gold | `#231A3B` | `#2D2150` | `#130F1F`  | `#FFC857` |

Decision needed: when the phone is in dark mode, the three light moments take a darkened value of the same colours and Movie Night
stays as it is. The alternative is to ignore the phone's setting on moment pages.

## 4. What has to change in the app

1. **Moment data.** `needs.ts` gains the names, kinds in shelf order, the line, the "goes with" hints, the "coming soon" kind and the
   palette key. Add `needs.names.*` and `needs.lines.*` in en, hi and mr. The route stays `/need/[id]`.
2. **Palette.** The four moment palettes in `theme/palette.ts`, light and dark, with tests.
3. **Page.** `NeedView` renders layout A: themed header and band, jump chips, a shelf for each kind from the town's own items, the
   "coming soon" row. The header is the page's own colour, so `CategoryHeader` takes a tint.
4. **Sample catalogue.** See the risk below.
5. **Home.** The "Right now in Roha" tiles and "Picks for your routine" open these four moments by their new names.
6. **Skeleton.** The page's skeleton is drawn from the same shelves (same rule as every other screen) and the moment's colours.
7. **Docs and tests.** An ADR for moments (data, not a catalogue concept), Vitest for the shelf order, the empty-kind rule and the
   palette contrast, a Maestro flow for opening a moment and adding two brands of one kind.

## 5. The risk: the sample catalogue is thin

The mock showed three or four brands on every shelf. The catalogue the app holds today (sample data until the API) has, for these
kinds: milk 5, biscuits 3, chips 2, chocolate 2, popcorn 1, atta 3, rice 2, oil 2, paneer 2, eggs 1, tomato 1, potato 1, brinjal 1,
banana 1. It has **no** sugar, rusk, namkeen, bread, pav, dal, masala, cake or mithai items.

So with no catalogue work the four pages would be short: Tea Break would be milk and biscuits only. The plan therefore includes
growing the sample catalogue to about two to four brands for each kind above (roughly 30 more items, each with an English name and
its Hindi and Marathi name, a pack and a price). This is the largest part of the work and needs the owner's say on brand names, and
on the trademark point in ADR 0036 (no logos, a letter mark only).

## 6. Order of work (one step at a time, each ends in a phone check)

1. Names, lines and palettes: data and tokens, with their tests. No visible change yet.
2. The sample catalogue for the four moments' kinds.
3. The page (layout A) with its colours, behind the existing route.
4. Home tiles and "Picks for your routine" use the new names.
5. Skeleton, accessibility pass, Maestro flow, docs; stop for sign-off.

## 7. Decisions needed

- The four English names above, or one of the other options in the table.
- Dark mode behaviour for the moment colours (section 3).
- Whether Home's tiles follow the clock and the rain (the mosaic board) in this phase, or keep their fixed order and only change names.
- Brand names for the sample catalogue, or whether I choose well-known Indian brands as samples and you review the list.

## Step 2: the sample catalogue (built)

29 sample items were added so each shelf has two to four brands where a brand exists (loose produce has none). Every brand is a
well-known Indian brand used as a sample, with a letter mark only (ADR 0036 is unchanged); the list is for the owner's review.

| Kind               | Brands now                                                 |
| ------------------ | ---------------------------------------------------------- |
| Milk               | Amul, Gokul, Chitale, Mother Dairy, Warana (already there) |
| Sugar              | loose, Tata, Madhur                                        |
| Biscuits           | Parle, Britannia, Sunfeast (already there)                 |
| Rusk (new kind)    | Britannia, Parle, a local bakery                           |
| Namkeen (new kind) | Haldiram's, Bikaji, Balaji                                 |
| Bread (new kind)   | Britannia, Modern, Harvest Gold                            |
| Pav (new kind)     | a local bakery, Britannia, Modern                          |
| Eggs               | farm eggs, Eggoz                                           |
| Paneer             | Amul, Gowardhan, Mother Dairy                              |
| Atta               | Aashirvaad, Pillsbury, Fortune (already there)             |
| Rice               | India Gate, Daawat, Kohinoor (already there)               |
| Dal (new kind)     | Tata, Fortune, loose                                       |
| Oil                | Fortune, Saffola, Dhara                                    |
| Masala (new kind)  | MDH, Everest, Catch                                        |
| Popcorn            | plain, Act II, Weikfield                                   |
| Chips              | Lay's, Haldiram's, Bingo, Kurkure                          |
| Chocolate          | Dairy Milk, KitKat, Amul (already there)                   |
| Cake (new kind)    | Britannia, Winkies, Monginis                               |

Not done in this step: product-page text (description, ingredients, tip) for the seven new kinds, which the product page leaves
out when it has none; nutrition figures; prices and packs are samples. Home's category rows now also list the new kinds (one item for
each kind), so the Snacks and Staples rows are longer.

## Step 3: the moment page (built, awaiting the phone check)

- `/need/<moment>` now wears the moment's colours from the header to the background. `MomentTheme` (theme/ThemeProvider.tsx) lays the
  moment's palette over the app roles with `momentColors`, so cards, chips, the stepper and skeletons follow without knowing about
  moments. Movie Night is dark in both themes, so under it the scheme is dark and the status bar text turns light. The cart bar keeps
  the app's own colours.
- The page: a band with the name, the line, "Picked from shops in Roha" and the moment's picture; a row of chips that jump to the
  shelves (sticky under the header, shown only with more than one shelf; a chip scrolls, it does not filter); one swipeable shelf for
  each catalogue sub-category the moment's kinds sit in, every brand on every shelf, with a one-line hint (`needs.goes.*`, never a
  bundle); a quiet "coming soon" row with Notify me at the end (cold drinks for Movie Night, sharing the Categories tab's choice).
- The skeleton mirrors the band, the chip row, the shelf titles with their hints and the cards. Chip widths are an estimate
  (`chipWidthOf`), so a long chip can be a few dp off.
- Tests: moment palettes laid over the app roles keep every role and 4.5:1 accent text; `sectionHint` is covered in needs.test.ts.
- Not in this step: Home tiles and "Picks for your routine" (step 4), accessibility pass and Maestro flow (step 5).
