# Phase 1: Home spacing plan (rhythm first, thin rules where needed)

Status: **Part 1 built, Part 2 removed, thin rules added (2026-10-15); awaiting the owner's phone check.**

Part 2 (sections in white containers on a grey ground, behind a testing switch) was tried and then **removed completely at the
owner's request**: no container component, grey colour, switch or strings remain. In its place the owner asked for a thin divider
used only between the sections that need one. That is `ui/SectionRule.tsx`: a 1 px line in the existing `line` colour, in from
the 16 px edge, centred in the 32 px gap (16 above, 16 below, so the gap does not grow). It is used in three places in
`home/HomeFeed.tsx`, where one group of sections ends and another begins and no block of colour already divides them:

1. After the category groups, before Daily essentials (the aisles end; the routine begins).
2. After Featured, before the category shelves (what is on show ends; the shelves begin).
3. After the last shelf, before Quieter times (the shelves end; the closing begins).

Not ruled: anything next to a colour block (Know your shop, Buy again, Fresh today, Small prices) and the sections inside a group
(for example the shelves between themselves), which stay divided by space alone. The branded `SectionDivider` (line, Quibo mark,
line) is untouched and still used on the cart and shop page. The loading skeleton has no rules (a hairline, no height change).

Part 1 changed four files and nothing else: `HomeFeed.tsx` (section gap 32, category grid gaps 12 and padding 24),
`HomeSkeleton.tsx` (section gap 32), `BuyAgain.tsx` and `SmallPrices.tsx` (wash padding 24). Checked in the 375 px preview:
the gap between sections measures 32 px, and the category grid has 12 px gaps with 24 px above and below.

History: the first version of this plan (new product card, merged modules, new category grid, photography, colour changes) and its
interactive mock were **rejected by the owner on 2026-10-15**. The owner's replacement brief, in their words: only changes to
spacing and margin and similar things; no other changes; and, as a test, put every section in a container on a very light grey
page tint, built so it can be removed completely if they do not like it.

So the scope was two parts and nothing else; Part 2 is now replaced by the thin rules above.

## Part 1. Rhythm: spacing and margin only (stays on)

The page groups badly because the gap between sections (24) is barely larger than the gap inside a section (12). The change is
to the numbers that set those gaps. No component, card, colour, radius or string changes.

| Where                                                                                             | Now                         | Proposed                                                                |
| ------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| Between sections on Home (`HomeFeed` `rails.gap`)                                                 | 24                          | **32** (`space[8]`)                                                     |
| Same gap in the loading skeleton (`HomeSkeleton` `rails.gap`, ADR 0035: skeletons mirror content) | 24                          | **32**                                                                  |
| Fresh today to Bestsellers (`freshBlock` bottom 24 + `after` top 8)                               | 32                          | 32 (unchanged; it already matches)                                      |
| Title to its row, card to card, "See all" under a row                                             | 12                          | 12 (unchanged)                                                          |
| Category grid view (a category chosen in the rail): gaps between title, grid and "See all"        | 20, with 20 above and below | **12** between, **24** above and below, as the rows on Home             |
| Inside the washes (Buy again, Small prices): top and bottom padding                               | 20                          | **24**, so a band breathes like the gaps around it                      |
| Groups inside one module (`HomeCategories`)                                                       | 24                          | 24 (unchanged; stays smaller than 32 so the groups read as one section) |
| Left edge of every module                                                                         | 16                          | 16 (unchanged; already aligned)                                         |

Effect: three distances only, 12 inside a section, 24 between groups in one section, 32 between sections. The Home page gets
about 150 px longer (roughly 19 gaps by 8 px) out of about 11,400 px.

Honest expectation: spacing alone gives the grouping. The "built from the same parts" feel of Zepto and Blinkit also comes from
shared card and title patterns, which the owner has chosen not to change. Part 2 is the cheap way to see how much a container
look adds on top.

### Part 1 steps

1. Change the two gap constants and the grid-view gaps, the two wash paddings. One commit.
2. Check on the phone (Expo Go). The owner says "keep" or names a number to change.

## Part 2. Grey ground with a container per section (a test, off by default)

What it looks like when switched on: from Bestsellers down, the page behind the sections becomes a very light grey tint, and
each section sits in a full-width white container. Between containers about 8 of grey shows. Inside a container the section has
12 above and 12 below, so the distance from one section's content to the next section's title is still 32, the same as Part 1.
Containers are square and full width, so no new radius.

Not boxed: Know your shop, Buy again and Fresh today (above the grey, unchanged), Small prices (it already has its own tinted
block, so it sits on the grey as it is), and the page footer. Quieter times, the promise and the help row are cards that already
have their own margin; they sit inside a container.

How it is built so it can be removed:

- **A switch in the testing tools** (Settings, development builds only): "Home layout: Current / Containers". It takes effect
  at once with no rebuild and is remembered on the phone. Default is Current, so nothing changes for anyone until it is flipped.
- **One new colour token** in `theme/palette.ts` for the grey ground, light and dark. Light is a very light, slightly
  aubergine-leaning grey (about `#F4F2F6`); dark is a touch darker than the dark page. No colour literal anywhere else.
- **One small component** (`ui/SectionPanel.tsx`) and a thin wrapper around each module in `HomeFeed.tsx`. With the switch on
  Current, the tree is exactly what it is today.
- Strings: three new dev labels in en, hi and mr.

To remove it completely, if the owner does not like it: delete the component, the token, the switch, its three strings and the
wrapper lines in `HomeFeed.tsx`. Part 1 stays. I would list those deletions in the commit so it is one revert.

Known limits to flag before it is built:

- Some modules draw nothing when they have nothing to show (Continue browsing before anything is viewed, Shop for a need, Brand
  stores, Bestsellers). The container measures its content and draws nothing for an empty one, so there is no empty white strip.
  The cost is that the container's white and padding can appear a frame after the content on first load. Fine for a test; if the
  owner keeps containers, the permanent build would put the container inside each module instead of measuring.
- The Fresh today wash fades to white and the grey starts after it, so there is a visible edge there. It is one of the things to
  judge on the phone.
- Dark theme gets a ground token too, but it will be checked by eye on the phone; there is no text on the grey, so no new
  contrast pair is needed.

### Part 2 steps (only after Part 1 is signed off, and only if the owner says go)

1. Token, component, switch, strings, `HomeFeed` wrapper. One commit, off by default.
2. Owner flips it on the phone and decides: keep, adjust (padding, grey), or remove.

## Out of scope (parked, not built)

New product card, merged or removed modules, new category grid, "See all" in the title row, photography, colour and radius
changes. They stay in this document's history only; nothing is built from them.

## Guardrails

- Minutes remain a range; no countdown timers; text 14 px or more; touch targets 48 dp or more; strings in en, hi, mr.
- Colour literals only in `palette.ts`. No new dependency.
- Each part is committed on its own and does not start until the previous one has the owner's sign-off.

## Skeleton refresh (2026-10-15)

Every skeleton in the app was brought onto the page it stands in for, and its animation was made light.

- **Light animation.** `ui/Skeleton.tsx`: one band of light (`assets/skeleton-shine.png`) sweeps across the whole group, then rests.
  It is a single native-driven view per screen (`SkeletonScope`); the blocks themselves do nothing, so a page of hundreds costs the
  same as one. It is white, so it shows over the grey blocks and not over the white page between them. Reduced motion keeps it still.
- **Same approach everywhere.** A skeleton is drawn from the page's own numbers and from what is known before the data arrives (the
  cart, the order, the saved addresses, the item lists), in the page's own cards, rows and gaps. Text that wraps is counted with
  `textLines` (`ui/logic/textLines.ts`) at the width the page gives it, a card row grows as the real card does
  (`home/cardContent.ts`), and static parts (the footer, the need's band, the category rail and toolbar, the divider) are the real
  ones. States are drawn too: an empty page is a `StatePanelSkeleton`, a coupon note under the coupon row, a saving line in the bill.
- **Measured.** In the 375 px preview each skeleton was laid over its page and compared: Home (every section, with Buy again and
  Continue browsing), Categories, Settings, Help, Report, Addresses, Coupons, Schedule, Cart, Checkout, Orders, Tracking, Need,
  Category, Shop, Brand and Product agree to within 1 or 2 px. Below the fold some rows of the Product, Cart and Tracking pages are
  approximate.
- **Not done.** Not seen on a real phone, and not measured in Hindi or Marathi, where lines wrap at different places (the
  estimates use a wider letter for Devanagari). A phone check on a low-end device is still to do.
