# 0050. The header is deep aubergine in the light theme

- **Status:** Proposed (Phase 1, sub-phase 1l). Amends [ADR 0043](0043-home-header-chips-are-intents.md) (the header keeps one colour
  whichever tab is chosen: it still does, the colour changes) and the header description in the palette file.
- **Date:** 2026-10-14
- **Source:** the owner, who asked for a dark header from the theme palette and a page that suits it; option A of three drawn in
  `docs/design/home-layout-preview.html`

## Context

The light theme's header was a soft lilac (`#E9D8F0`) with dark text. The dark theme's header was already deep plum. The owner wanted
a darker, more premium header in the light theme, taken from the palette.

## Decision

1. **`headerBg` is `#3A1646`** (the aubergine of the cart bar and bottom bar), **`onHeader` is white** and **`onHeaderMuted` is
   `#D2BDDB`**, in the light theme only. White on it is 15.2:1, the muted text 8.7:1 and pistachio 10.7:1.
2. **The page is unchanged** (`#F8F4F7`), so every card, picture and tint behaves as before.
3. **The pale `tint*` colours are not changed.** They colour product pictures, category tiles, the need cards and the product page's
   header. Text on them moves from `onHeader` to `ink` (which is dark in the light theme and light in the dark one), so it is read
   from the block it sits on and no longer from the header's token.
4. **The status bar text is light** on the Home, tab and category headers in both themes.
5. **The chosen tab's marker is pistachio** (it was the header's text colour), in both themes.
6. **A very light sheen runs across the header** from `headerBg` at the left to `headerBgEnd` (`#4A2160`; `#4E2663` in the dark
   theme) at the right, drawn with `react-native-svg` (`HeaderGradient`, no new dependency). It runs across and not down, so the
   status bar's tint, the upper part and the search bar and tabs, which move apart as the page scrolls, always match.
7. **The offers sit on the page, outside the header**, under the tabs, on the page's own colour. The pagination dots take `ink`, and
   the white offer card keeps a hairline.
8. **Every header's lower edge is square** (Home, the tab headers, the app header and the need page's band).
9. **The product page keeps its category tint** for its header. It is the product's own colour, tied to the picture's backdrop. If the
   owner wants it dark too, it is a separate, small change.

## Consequences

- Home, the tab headers, the category header, the trust tiles and the saving ribbon follow the new token; the dark theme looks as it
  did except for the pistachio tab marker.
- The palette test pairs the tints with `ink` and `inkMuted` and the header with `onHeader` and `onHeaderMuted`; all clear 4.5:1.
- Options B (the banner inside the dark panel) and C (a plum-to-aubergine fade) remain drawn in the preview if wanted later.
