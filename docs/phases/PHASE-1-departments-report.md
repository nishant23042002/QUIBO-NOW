# Phase 1, sub-phase 1l: categories, needs and department pictures, report

**Surface:** customer app, UI on mock data
**Plan:** [PHASE-1-departments.md](PHASE-1-departments.md), approved by the owner on 2026-10-13 (and extended by the owner's later
decisions, below)
**Decisions:** [ADR 0044](../decisions/0044-home-is-organised-by-departments-and-needs.md) (departments and needs; amended),
[ADR 0046](../decisions/0046-one-list-of-categories.md) (a department is a category: one list, one word),
[ADR 0047](../decisions/0047-need-cards-and-small-prices-redesign.md) (need cards and Small prices), and the notes added to
ADR 0031, ADR 0041 and ADR 0043.
**Status:** built, and each part was shown to the owner in the preview and approved in turn. Everything below that could be checked
on this machine was checked; a real-phone check of the whole is still to do, and what needs a phone or a person is listed at the end. The work is on `phase-1/customer-ui` and pushed to `origin`; ADRs 0044, 0046 and
0047 stay Proposed until you sign off.

## What this sub-phase became

The plan was six steps (departments as data, the header rail, a Shop by department grid, an All departments screen, needs, close-out).
Along the way the owner saw that **the Categories tab and All departments were the same list under two names**, asked for them to be
one, then asked for pictures, kinds as tiles, a redesign of two Home sections and a cleaner look for the quick filters. So the report
covers four things, in the order they were done.

## What exists now

**One list of categories, on the Categories tab (ADR 0046).**

- **Sixteen categories**: the seven the catalogue holds (Vegetables & Fruits, Dairy & Eggs, Atta Rice & Dal, Oil Ghee & Masala, Chips &
  Namkeen, Biscuits & Bakery, Sweets & Chocolates) and nine that are listed as coming (Beauty, Baby Care, Gym & Fitness, Electronics,
  Kids & Toys, Gaming, Jewellery, Home Decor, Automotive). A category is data: its group, delivery tag, rail name, picture, colour and
  kinds. One that is not stocked is the same shape with no kinds.
- **The Categories tab** shows each stocked category as a row of tiles four across: its own picture tile first, then its kinds that
  have stock. The picture tile opens the category, a kind opens it on that kind (`/category/[id]?sub=…`). Then "Coming to Roha" as
  softened, tagged tiles that open a page that says so, never an empty shelf. A find field appears only past 24 categories, and also
  matches a kind's name.
- **Kinds are listed before they are stocked** (Dal & Pulses, Ghee, Masala & Spices, Namkeen, Bread & Pav, Rusk & Cakes, Indian
  Sweets, and salt with sugar). A kind is offered only once an item of its type exists, so nothing is empty on screen.
- **One word**: "category" in English, श्रेणी in Hindi and Marathi, in every screen, label and message.

**Home.**

- **A header rail of live categories** (at most six, then More, which opens the Categories tab).
- **Quick filters under the banner** (All, Quick, Offers, Under ₹50, Veg): taller chips with a picture of what each does and a hard edge
  under them, led by a sliders badge, with the chosen one filled (ADR 0047).
- **Shop for your need**: four need cards (Breakfast, Tea Time, Party Snacks, Cooking Basics), each filled with three pictures and the
  words over them, opening a need page with a shelf per kind. A need with nothing in stock is not shown.
- **Shop by category**: a grid of eight (live first, then those coming) and an "All categories" button that opens the tab.
- **Small prices**: three price tiers as one segmented control over price-first cards (the price large beside a pistachio ADD). Only
  this row has the new card; the other ten screens that list items are unchanged.

**Pictures for the seven live categories.** Each is a 512 px WebP (22 to 39 KB, 236 KB in all) of the packs the category sells, made
by the owner in Gemini from the packs' own photographs, flattened to one neutral plate colour and centred, in `assets/categories/<id>.webp`. A
category with no picture keeps its emoji, so the nine coming categories still show one.

## Steps

| Part | What                                                                                                                                                 | Commits                                 | Owner                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1    | Departments and needs as data; header rail; chips under the banner; Shop by department; All departments; need page; pictures for the seven live ones | `702214d` `9e504b9` `f1b3f5d`           | Approved step by step                                                                    |
| 2    | Merge department into category in the data; the Categories tab shows every category and those coming; the second screen removed                      | `f509d36` `38fa500` `76db82b`           | Approved                                                                                 |
| 3    | Kinds as tiles; the kinds the pictures promise; one word; Layout B (the picture is the first tile of the row) and the clean-up                       | `e3ae025` `49823e9` `59c8d0d` `a7d3caa` | Chose Layout B, then said commit                                                         |
| 4    | Need cards and quick filters redesigned; Small prices redesigned                                                                                     | `bee189a` `a6a2538` `91c718f` `f6b744b` | Chose variants A and B; asked for the cards and filters to change once, then said commit |

## Gate

| Check                                                                | Result                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` (turbo, the root files and the repo-wide Prettier check) | Pass, exit 0                                                                                                                                                                                                                                                                                                                            |
| `pnpm typecheck`                                                     | Pass, 9 of 9                                                                                                                                                                                                                                                                                                                            |
| `pnpm test`                                                          | Pass: customer 639 tests in 62 files (633 at the end of step 5 of the plan), i18n 30, contracts 200, mocks 11, config 16                                                                                                                                                                                                                |
| `pnpm build` (`expo export --platform android`)                      | Pass: Metro bundled 1,736 modules                                                                                                                                                                                                                                                                                                       |
| Android Hermes bundle                                                | 4,353,066 bytes (4.35 MB, 4.15 MiB), inside the 5.0 MB budget (4.25 MB at the end of 1k)                                                                                                                                                                                                                                                |
| Assets                                                               | The seven pictures add 236 KB on disk; they are assets, not part of the JavaScript bundle                                                                                                                                                                                                                                               |
| Maestro flows                                                        | `category.yaml` updated (the rail, a need, the Categories tab with Coming to Roha, a kind). **Not run**: Maestro is not installed here (as in `PHASE-1-defects.md`)                                                                                                                                                                     |
| Checked in the browser preview at 375 dp                             | The Categories tab (groups, rows of tiles, Coming to Roha, a kind, the category's own tile, Back keeping the scroll), Home (rail, More, quick filters and the chosen state, need cards, Shop by category, Small prices with ADD turning into the stepper and a tier change), `/coming/beauty`, an unknown id, and light and dark themes |

## Verification list

| #   | Check                                                                               | Result                                                                                                            |
| --- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | lint, typecheck, test and build pass                                                | Done, above                                                                                                       |
| 2   | A category with nothing in stock reads as coming and never opens an empty shelf     | Done: `resolveCategories` and `categoryRoute` are tested; the Coming page redirects a live id to its screen       |
| 3   | A need with no items is not shown, and a need page never offers an empty shelf      | Done: `liveNeeds` and `needSections` are tested                                                                   |
| 4   | A kind with no items is not offered                                                 | Done: `subsWithItems` is tested, including the new kinds                                                          |
| 5   | Every category, group, rail name and kind has words in English, Hindi and Marathi   | Done: a test enforces it for all sixteen categories                                                               |
| 6   | Each product type sits in exactly one kind                                          | Done: a test enforces it across the whole tree                                                                    |
| 7   | An old address and an unknown id end somewhere sensible                             | Done: `/department/…` is gone with the screen; `/coming/<unknown>` opens the category screen's "not found" page   |
| 8   | Nothing in order, payment, dispatch or ledger code branches on a category or a need | Done: they live only in `home/` and the screens                                                                   |
| 9   | The loading skeletons are the shape of what replaces them                           | Done in code for the Categories tab, the need cards and Small prices (shared measurements); to be seen on a phone |

## Found and fixed during the work

| What                                                                                                                                             | Fix                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| A picture showed blank on the web build: the image kept its own 512 px size and the tile clipped it to an empty corner                           | The picture is sized to 100% of the tile                                                                      |
| The grey plate was almost the page's colour, so a pictured tile had no edge beside the tinted ones                                               | The hairline is kept on pictured tiles                                                                        |
| I overwrote an existing `home/categories.ts` (the Home tint hook) with the new helpers                                                           | Typecheck caught it at once; it was restored from git and the helpers live in `categoryLists.ts`              |
| Atta, Rice & Dal and Oil, Ghee & Masala showed only what was stocked (no dal, ghee or masala), against the owner's "show what it will sell" rule | Both were redone, upright, with dal and salt, and with ghee and masala                                        |
| Gemini invented a Saffola pack (a blue tin with rice) that does not exist                                                                        | Replaced with the real Saffola Gold jar from the owner's reference                                            |
| The first need card cropped its emoji at a corner (it looked broken) and card titles sat on different lines                                      | The card is filled with three pictures with a fixed-height text plate, so titles and arrows share their lines |
| The Canva boards used for the redesign invented products, prices, tabs and a "30 to 45 min" line                                                 | They were treated as direction only; sizes and words come from the app's own tokens and message files         |
| The Hindi and Marathi review sheet listed the old `departments.*` words                                                                          | It was regenerated after the words moved                                                                      |

## Not yet checked (needs a phone, a person or a tool)

- Every part above on a real Android phone: the Categories tab rows, the quick filters, the need cards, Small prices.
- The seven pictures in the **dark theme**: they are baked on a light grey, so they show as light squares on a dark screen.
- The three-picture need cards on a phone: whether 40 to 68 dp emoji stay sharp, and the text plate over them.
- The 148 dp price tile in Hindi and Marathi (the price, the ADD pill and the stepper on one line) and the three tier labels in the
  segmented control ("₹100 से कम" and the Marathi equivalent).
- Long Hindi and Marathi category and need names on the Categories tab and in the need plate.
- The largest font size from the phone's real setting, on the same places.
- TalkBack on the category rows ("Dairy & Eggs", then "Milk"), the radio group of price tiers and the filter row.
- Every Maestro flow, including the changed `category.yaml`.
- Hindi and Marathi wording: the new words are in `PHASE-1-language-review.md`, regenerated (the category list's words under
  `categoriesTab`, the kinds' under `catalogue.subs`, the needs' under `needs`). They are drafts for a native speaker.

## Open for the owner

1. **Brand packs and a person's likeness in the pictures.** The pictures show real brand packs, and some carry a person's photograph
   (Daawat, Tata Sampann, Chitale, Lay's). That is the open trademark question of ADR 0036, and a person's likeness is a bigger one
   than a logo. Decide before the pictures ship; swapping a pack for a plainer one is a one-line change in the prompt.
2. **The pictures show brands the mocks do not have yet** (Kurkure, Balaji, Chitale, Oreo, Priyagold, Lotte, Tata Sampann and others).
   They need to join the brand list and the sample items, or the tile promises something a shopper cannot find.
3. **The new kinds have no sample items**, so Dal, Ghee, Masala, Namkeen, Bread, Rusk and Indian Sweets do not show yet. Adding sample
   items (a name, a brand, a size and a price each, in three languages) would make them appear on the phone.
4. **Two card shapes on Home.** Small prices has the price-first card and every other row the older one. Going app-wide touches ten
   screens, their skeletons and any flow that taps ADD (ADR 0047).
5. **The pictures were made with an AI image tool from the owner's own pack photographs.** Check that the packs' owners allow that use
   before shipping.
6. **ADRs 0044, 0046 and 0047** are Proposed; they become Accepted on your sign-off.
7. **Not built, on purpose:** pictures for the nine coming categories and for each need, "tell me when it arrives" on a Coming page,
   pinned and learned categories, and Flash deals. They are parked in `PHASE-1-notes.md`.
8. **Pushed to `origin`, no pull request, no tag.** Say when to open the pull request and tag `phase-1-complete` (that tag is for the
   whole of Phase 1, which still has its other parts).
