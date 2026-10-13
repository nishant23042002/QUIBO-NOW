# Phase 1: departments and needs on Home (sub-phase 1l)

**Surface:** customer app
**Kind:** UI on mock data
**Depends on:** categories on their own screens (ADR 0041), filters and sort (ADR 0042), the Home chips as intents (ADR 0043)

> **Status: plan, written 2026-10-13 and waiting for the owner's approval. No code has been written for it.**
> The mock is [Quibo Home departments](https://claude.ai/artifact/K8puFqbvNCKqCMtPsRpqdq) (boards: Home, All departments, a need page).

## Goal

The catalogue will keep growing (Beauty, Electronics, Kids, Gym, Gaming and more), and a header rail cannot hold a list that never
stops. Home gets four layers with one job each, and a department or a need is **data per town**, so adding one is a data change and
not an app release.

| Layer                                 | Job                                                                                           | Scales because                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Header rail** (departments)         | The few departments a shopper uses most, then **More**                                        | Capped at about six plus More               |
| **Shop for your need** (Home section) | Cards for a need that cuts across departments ("Tea time", "Party snacks"); each opens a page | A need is a list of kinds, not a department |
| **Shop by department** (Home section) | A grid of eight, then **All departments**                                                     | Eight is a glance, not a scroll             |
| **All departments** (screen)          | Every department in groups, each with an honest delivery tag (Today, Tomorrow, Soon)          | It is an index, so it holds 17 or 70        |

## Decisions (the owner said "go with the departments decisions" on 2026-10-13: the recommendations in the mock message stand)

1. **The chips leave the header.** Quick, Offers, Under ₹50 and Veg become a small filter row under the "All" page's banner. The
   header rail shows departments. ADR 0043 is superseded for placement; the intents themselves (`homeIntents.ts`) are unchanged.
2. **Both needs and departments**, as in the mock.
3. **Launch with what Roha can stock.** The seven departments the catalogue already holds are live; the rest are listed as "Soon"
   and open a "Coming to Roha" page, never an empty shelf.
4. **No look changes** to the three mock boards. The header stays lilac and the active tab keeps its underline.

## What is live at launch, from the catalogue as it stands

| Department (rail / grid label) | Holds                                                                                         | Tag   |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ----- |
| Vegetables & fruits            | `vegFruit`                                                                                    | Today |
| Dairy & eggs                   | `dairyEggs`                                                                                   | Today |
| Atta, rice & dal               | `attaRice`                                                                                    | Today |
| Oil & masala                   | `oilMasala`                                                                                   | Today |
| Chips & namkeen                | `chips`                                                                                       | Today |
| Biscuits                       | `biscuits`                                                                                    | Today |
| Sweets & chocolates            | `sweets`                                                                                      | Today |
| Soon (not stocked)             | Beauty, Baby care, Electronics, Kids and toys, Jewellery, Gaming, Home decor, Automotive, Gym | Soon  |

Needs are built only from kinds that are stocked today, so no need page is empty: **Breakfast** (milk, eggs, atta, sugar, oil),
**Tea time** (milk, sugar, biscuits, chips), **Party snacks** (chips, popcorn, chocolate, biscuits), **Cooking basics** (atta, rice,
oil, sugar, tomato, potato). "Gym Freak" and "Baby care" from the mock stay on the Soon list until there is stock behind them.

## Steps (one at a time; after each I stop for the owner's phone check)

| #   | Step                   | What it builds                                                                                                                                                                                                                                                                                                                    | Check                                 |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | **Data**               | `home/departments.ts`: a department (id, label key, emoji, tint, group, status live or soon, delivery tag, the main categories it holds), a need (id, label key, emoji, the kinds it holds) and a group. Helpers: live departments in rail order, the first eight for the grid, items of a need. Unit tests. ADR 0044 (Proposed). | Tests only; nothing changes on screen |
| 2   | **Chips move**         | The intents leave the header and become a filter row under the All page's banner; the header rail shows the live departments, and choosing one opens that page's feed (reusing the Home category grid). More appears only when there are more than six.                                                                           | Home header and the filter row        |
| 3   | **Shop by department** | The Home section: eight tiles (live first, then Soon dimmed with their tag) and an All departments button.                                                                                                                                                                                                                        | The Home page                         |
| 4   | **All departments**    | The screen: search, groups, tiles with delivery tags, a "Coming to Roha" group; a Soon tile opens a short "Coming to Roha" page. Loading, empty, error and offline states.                                                                                                                                                        | The new screen                        |
| 5   | **Shop for your need** | The Home section (tinted cards) and the need page: its own coloured band, a sideways tab rail by kind, and product rows under it, built from the category screen's parts.                                                                                                                                                         | The need page                         |
| 6   | **Close-out**          | Words in English, Hindi and Marathi, skeletons that mirror the content, Maestro flow, docs (PLAN screen inventory, ADR 0043 marked superseded, ADR 0044 Accepted when the owner signs off), gate, report.                                                                                                                         | Gate and report                       |

## Left out on purpose (parked for Phase 2 notes)

- **Pinned and learned departments, and "Jump back in":** they need real order and usage history.
- **Flash deals:** needs a schedule from the API; the wording would be "Ends tonight, 9 PM", never a countdown.
- **Beauty, Electronics and the rest as real catalogues:** they need products, brands and shops behind them.
- **"Tell me when it arrives" on a Soon page:** needs a notification service.

## Risks and how they are handled

- **A rail that depends on data can be empty or wide.** The rail always has "All", never shows a Soon department, and shows More
  only past six.
- **Tabs, chips and departments must not fight.** The header chooses a department; the filter row narrows what that page shows; the
  category screen stays the place to browse deeply.
- **Mock data stands in for the API.** The shapes are written so Phase 2 can move them into `packages/contracts` as Zod schemas
  with `town_id`, as the catalogue tree already is.

## Progress

- **Departments and categories merged in the data, 2026-10-13 (stage 2 of the integration plan, owner approved).** A department
  was a second list over the same seven categories, so `Department` is gone: a `Category` in `home/catalogueTree.ts` carries its
  group, tag, rail name, emoji, tint and kinds, and a Soon category is the same shape with no kinds. `departments.ts` is split into
  `home/categoryLists.ts` (rail, grid, index, route and name matching) and `home/needs.ts`. No screen changed. Next: one screen for
  the Categories tab and All departments, then kinds shown under each category, then one word in all three languages.
- **Department pictures begun, 2026-10-13.** Real artwork replaces the emoji one department at a time, each approved by the owner
  before the next. Done: Vegetables & Fruits (a mixed natural pile of every kind the catalogue stocks, plus coriander), Dairy &
  Eggs (Amul and Gokul pouches, Amul paneer tray, Gokul Dahi, white eggs, copied from the owner's pack screenshots) and Atta, Rice &
  Dal (redone twice on 2026-10-13, the second time upright: Aashirvaad, India Gate, Daawat, Fortune sugar, Tata Sampann toor dal,
  Fortune chana dal and Tata Salt) and Oil, Ghee & Masala
  (redone 2026-10-13: Saffola Gold jar, Fortune bottle, Gemini pouch, Gowardhan and Chitale ghee, Everest Tikhalal and Suhana
  masala) and Chips & Namkeen
  (Lay's, Kurkure, Balaji, Chitale Bakarwadi, Bingo and Haldiram's; Kurkure, Balaji and Chitale are not in the mock items yet, so
  the picture shows brands the catalogue will gain) and Biscuits & Bakery (Parle-G, Good Day, Amul Butter Cookies, Lotte Choco
  Pie, Britannia Toastea rusk and a sliced bread loaf; bread and rusk are not in the mock items yet) and Sweets & Chocolates
  (Cadbury Celebrations, Dairy Milk Silk, KitKat, Munch Bites, Amul Fruit 'n' Nut and Haldiram's Gulab Jamun), so all seven live
  departments have a picture. From here on a picture shows what the department will sell, not only what the mocks stock, and Atta, Rice & Dal and Oil, Ghee & Masala have been redone to
  match. Pictures are
  made in Gemini, then flattened to the `artworkPlate` colour (`#F7F7F7`), centred at 84% of the width and exported as 512 px WebP
  into `assets/departments/<id>.webp`; `home/departmentPictures.ts` lists them and a department without one keeps its emoji.
  `CategoryTile` draws a picture on the plate (kept hairline, no department tint). Pictures are baked on the plate, so the dark
  theme shows a light square; a cut-out (transparent) version is parked for later if that is not wanted.
- **Step 5 built (Shop for your need), 2026-10-13.** `ShopForNeed` (a swipeable row of tinted cards, above "Shop by department"; a card
  names the first three shelves it gathers) opens `/need/[id]` (`NeedView`): the need's name on a band of its colour, a chip row for
  its shelves, and a swipeable row of items per shelf or one shelf as a grid. Shelves group kinds by the sub-category they sit in
  (`needSections`), so tomato and potato are one "Fresh Vegetables" shelf. States: skeleton, offline notice, failed load, empty
  (nothing in stock for it) and not found. The Home skeleton has the section. Words: `home.shopForNeed.title`,
  `departments.needBand`, `needRail`, `needEmpty`, `needNotFound`. Tests for `needSections` and `needBlurb`.
- **Step 4 built (All departments, Coming to Roha), 2026-10-13.** `/departments` (`DepartmentsView`): the lilac category header, a
  field to find a department by name, the live departments in their groups, then "Coming to Roha"; skeleton, offline notice, failed
  load, empty and no-match states. `/department/[id]` (`ComingToRohaView`): a department not stocked shows its picture, "Coming to
  Roha", one sentence and "Shop what is here today"; a live id redirects to its category, an unknown one says so. Soon tiles on Home
  now open that page; "All departments" and the rail's More open the new screen. `departmentRoute` and `departmentsMatching` are
  tested. `CategoryHeader`'s search button is optional. Words: `departments.find`, `comingTitle`, `comingBody`, `seeToday`, `empty`,
  `noMatch`, `notFound`.
- **Step 3 built (Shop by department), 2026-10-13.** `ShopByDepartment` replaces "Shop by category" on the All page: up to eight
  tiles from `useDepartmentTiles` (seven live, then Beauty softened with "Soon"), and an "All departments" button that opens the
  Categories tab until step 4. `CategoryTile` gained a tag and a softened state. A Soon tile does nothing yet (its "Coming to Roha"
  page is step 4). `ShopByCategory` and `useHomeCategoryTiles` are removed; ADR 0031 points to ADR 0044. Words: `home.shopByDepartment`,
  `departments.all`.
- **Step 2 built (chips move, rail from data), 2026-10-13.** The header rail is All, then the live departments (six at launch, so
  "More" shows), built by `home/useHomeRail.ts`. The chips (`IntentChips`) sit under the banner on every page. A department's page
  is its items, one of each kind, in the grid, narrowed by the chip, with a "See all" button to its category screen. More opens the
  Categories tab until step 4 builds All departments. Words added: `departments.rail.*`, `departments.more`,
  `departments.railLabel`. ADR 0043 notes that ADR 0044 supersedes its chip placement. Maestro `category.yaml` has a department step.
- **Step 1 built (data), 2026-10-13.** `home/departments.ts` with its tests, the `departments` words in en, hi and mr, and ADR 0044
  (Proposed). Nothing changes on screen. Words in `departments.tags` are for step 3 and 4; the language-review sheet is regenerated at
  close-out.
