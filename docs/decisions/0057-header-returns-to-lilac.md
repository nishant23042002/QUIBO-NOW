# 0057. The header returns to lilac in the light theme, and "Know your shop" opens on a night stage

- **Status:** Proposed (Phase 1, sub-phase 1n). Supersedes [ADR 0050](0050-dark-aubergine-header.md) for the light theme. The dark
  theme's plum header is unchanged.
- **Date:** 2026-10-14
- **Source:** the owner, after seeing Home v5 on the phone ("the whole app header in lilac again"), and the plan in
  `docs/phases/PHASE-1-header-lilac.md`

## Context

ADR 0050 made the light theme's header deep aubergine. With the Home v5 canvas (the mosaic, the live order card, the strip) on it,
the owner preferred the lighter, softer header the app had before, on every screen. The deep aubergine is better kept for the bars
and for a few accent cards.

## Decision

1. **Light theme header tokens go back to the old values:** `headerBg` `#E9D8F0`, `onHeader` `#2A1033`, `onHeaderMuted` `#563E60`.
   The sheen keeps its mechanism and ends at a lighter lilac (`headerBgEnd` `#F1E6F7`). The dark theme keeps plum and white text.
2. **Every header wears it:** Home, the tab screens, category pages, the search screen and every screen with the app header (which
   read `chrome`, the dark bar colour, before). The logo in the app header uses its page-ground colours. The product page keeps its
   category tint.
3. **The status bar follows the header** (`ScreenStatusBar style="header"`): dark text on lilac, light text on plum.
4. **The deep aubergine has its own tokens, `plum`, `plumEnd`, `onPlum`, `onPlumMuted`,** for the dark cards that are not headers:
   the promise, the score tile and the trust tiles. They are the colours the header had under
   ADR 0050 in both themes, so those cards look as they did.
5. **"Know your shop" opens on a night stage:** the mock's near-black (`night`, `onNight`, `onNightMuted`) holds while the heading
   is read and then fades in one straight line into the page colour under the scene, so the scene and the cards sit on the page.
   The payment strip sits at the top of the stage, and the module is first under the header for every customer (it is not moved
   after Bestsellers for someone who has ordered), so Home reads the same on every phone.
6. **Where a block's colour meets the page's, its top edge is curved** at 16 (the strip and Fresh today's wash, and the Know
   stage), as the page's own top is. The green wash also draws a fine pistachio edge along that curve and down its sides, fading out
   with the wash, so the block is plainly divided from the page above it (`AccentWash`).
7. **The lilac fades from the search bar.** It starts to fade in one straight line at the search bar and is the page's own
   colour by the bottom of the category rail, so the hero (the mosaic) sits on the page colour and there is no edge between the
   header and the page (`PageFade`, drawn over the header's sheen in the lower part).
8. **The closing card of "Know your shop" is removed** (the avatars, the line "Behind every order is someone you can name", its
   button and its four messages), and the module is made compact: a shorter scene, tighter gaps and smaller answer text.
9. **The bars stay aubergine:** the bottom bar, the cart bar, the splash, the welcome and order-placed screens, and the tracking hero
   (all `chrome`).

## Consequences

- ADR 0050's points 1, 4, 5 and 6 are replaced for the light theme; its points 2, 3, 7 to 9 stand.
- The Home v5 mock (`docs/design/home-v5-mock.html`) was locked with a deep header; it stays as history and this ADR is the owner's
  change to it.
- Any new dark card uses `plum`, not the header tokens, so a header colour change never touches it again.
- Light page colour is now `#FBFAFC` (was `#F8F4F7`): a near-white with the faintest aubergine tint, so it reads as white and not
  as grey. It was chosen by eye; no verified reference value for another app was found. Cards stay `#FFFFFF` and are held by
  their border.
- Know your shop shows "Dark Store vs Connected Store" as one table with the two kinds of place side by side, five rows and a
  0 of 5 against 5 of 5 score at the foot. The swipeable cards and their dots are gone.
- The light page is plain white (`bg` `#FFFFFF`), and `surface` (cards, fields, sheets, the bottom bar) takes the tint the page had
  (`#FBFAFC`), so a card still reads as its own object, held by its fine border, and never merges into the page. This replaces the
  note above that put `#FBFAFC` on the page. The dark theme is unchanged.
