# 0049. Corners are squarer across the whole app

- **Status:** Proposed (Phase 1, sub-phase 1l). Amends the radius scale used by every earlier UI decision.
- **Date:** 2026-10-14
- **Source:** the owner, who found the app "rounded a lot" and liked the squarer filters and Daily essentials tiles

## Context

The radius scale was 6, 12, 16, 24 and a full pill. Filters, search, segmented controls, labels and buttons were pills, and cards were
16 to 24. The owner asked for a sharper, more premium look, first on the quick filters and the Daily essentials strip, then
consistently on every screen.

## Decision

1. **The scale is `sm` 6, `md` 8, `lg` 12, `xl` 16, `full`.** Each step is one notch tighter, so every card, sheet, button, picture
   and header that used a token follows without a per-screen edit.
2. **`full` is kept only for circles and thin tracks:** avatars, dots, radio rings, count badges, round icon buttons, progress bars and
   the sheet's grabber.
3. **Pills that were not circles are no longer pills.** Chips, the search fields, the segmented controls (`Segmented`, `SegmentedTabs`),
   the shops chip, the bottom bar's active indicator and the floating cart button use `md`; the small label pills (badges, category
   tags, shop open/closed labels, the pack count) use `sm`.
4. **The loading skeletons that mirror those controls take the same radius**, so nothing changes shape when content arrives.
5. The `sharp` options added to `Stepper`, `ItemControl` and `SegmentedTabs` for the first pass are removed: the default is now sharp.

## Consequences

- One token change reshapes every screen, so the review is by looking at each (Home, Categories, category, product, search, cart,
  checkout, orders, tracking, profile, help) on a phone, in the light and dark themes.
- A future component should take its corners from `radius`, never from a literal, so the scale can move again in one place.
- Photographs and emoji pictures keep their own proportions; only their corners change.
