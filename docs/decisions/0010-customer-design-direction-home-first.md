# 0010. Customer design direction: a tinted, scroll-linked Home with tabs

- **Status:** Accepted (Phase 1a). Replaces parts of [0008](./0008-design-system-aubergine-and-pistachio.md).
- **Date:** 2026-10-08
- **Source:** the product owner's feedback while the Home screen was built one section at a time and checked
  on a phone in Expo Go; the patterns listed in `docs/phases/PHASE-1.md` ("Design direction").

## Context

ADR 0008 locked a look in Phase 0c before any real screen existed. When Phase 1 started, the product owner
said nothing in that look was locked. Home was then built section by section, each one checked on a phone,
and the look moved a long way from 0008. This records where it ended up so later screens follow it.

## Decision

1. **Home is a tinted block over a scrolling page.** The header holds the address row, the profile button,
   the shops chip, the search bar and the category tabs. The offers sit under the tabs. It collapses as the
   page scrolls until only the search bar and the tabs remain, using transforms and opacity driven by one
   scroll value so it runs on the phone's native thread. Opening the shops row pushes the page down the
   same way, with no layout work.
2. **Each category tab sets the header's tint** (dairy, vegetables, fruits, staples, snacks). The header,
   the status bar area and the shops row share one colour, with a 1 dp overlap between layers so no seam can show.
3. **The header is no longer dark in both themes** (replaces the "header is always dark" rule of 0008).
   Light theme: the category's soft tint. Dark theme: black and graphite with an aubergine header and a pistachio
   accent. Text on the header uses the `onHeader*` roles, each tested for contrast.
4. **A bottom navigation bar** with Home, Order again, Categories and Orders replaces the "no bottom tabs"
   layout. It is solid, 64 dp plus the phone's bottom inset, and the docked cart bar and every tab page
   leave room for it (`BOTTOM_BAR_HEIGHT`).
5. **Cards and badges.** Product cards show an emoji picture on the category tint (until real photos
   exist), a ribbon with the saving in rupees (never a percentage), ADD that turns into a compact
   stepper, a price badge, a veg or non-veg mark and stock states. Only items that can come in the next
   window carry a delivery-window line. Cards are the same height whatever the name.
6. **Sheets** (product detail, cart, shops) dim the whole screen, status bar included, with a backdrop that
   fades on its own while the sheet slides.
7. **Cart bar and cart.** A docked bar above the tab bar shows pictures of what was added, the shop or the
   number of shops, the total, what was saved and the progress to free delivery. One cart is one order from
   any number of shops ([0009](./0009-one-order-many-shops-one-delivery.md)); free delivery counts the whole
   cart.
8. **Motion rules.** Only transform and opacity animate on the native driver; colour, width and height use the
   JS driver on a separate node, and the two are never mixed on one node. Motion obeys the phone's reduce-motion
   setting. No haptics and no shadows (both tried and removed).
9. **Palette.** Aubergine and pistachio stay, in two themes, with new roles for the header, per-category
   tints and the accent edge. Colours still live only in `palette.ts`. System fonts only.

## Consequences

- ADR 0008 still stands for the name, the tagline, the logo, the rule that colours live only in `palette.ts`
  and the contrast tests. Its "header is always dark", flat card and no-bottom-tabs points are replaced here.
- New screens use the same header habits, the same cards and the same sheets, not their own styles.
- Hindi and Marathi strings remain drafts until a native speaker reviews them (sub-phase 1h).
- Still unchecked on a real phone at this point: the status bar and navigation-button behaviour, and the
  native animations. The web preview cannot show them.
