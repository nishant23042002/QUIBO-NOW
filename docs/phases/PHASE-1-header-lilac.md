# Phase 1: the header returns to lilac (sub-phase 1n)

**Surface:** customer app
**Kind:** UI on mock data (a colour change across every header)
**Depends on:** Home v5 steps 1 to 4 (ADR 0055), ADR 0050 (the deep aubergine header), ADR 0056

> **Status: approved by the owner on 2026-10-14 (light theme only; the old lilac `#E9D8F0`; the sheen; the closing card and the
> promise stay deep aubergine) and built in one pass at the owner's request, waiting for the phone check. Records: ADR 0057.**
> Follow-up the same day: the closing card of Know your shop was removed and the module made compact, and the lilac now holds
> only through the search bar, then fades in a straight line into the page colour, which it is by the bottom of the category
> rail (`PageFade`).
> Two additions from the owner at approval: curve the top of every section where the colour changes, and open "Know your shop" on
> the mock's near-black, fading in a straight line into the page colour.
>
> **Built:** the three light header tokens and the sheen end; new `plum`, `night` token sets; status bar follows the header; app
> header, search header and logo on the header colours; the glass card's sheen reads `onChrome`; the dark cards and the scene read
> `plum` and `night`; the stage holds the dark until the heading ends and then fades straight into the page. Checks: lint,
> typecheck, 697 customer tests (palette pairs included) and build pass; looked at on Home, Categories and Cart in light, and Home
> in dark. Not seen on a real phone, at 200% text, or in Hindi and Marathi.
> The owner asked for "the whole app header in lilac again". This reverses ADR 0050 for the light theme, so it needs its own
> record (ADR 0057, Proposed) and a plan before anything is touched.

## Goal

Every header in the app wears the soft lilac it had before ADR 0050, with dark text, and the colour is used the same way on every
screen: Home, the tab screens, category pages and every screen that has the app header (cart, checkout, orders, help, settings).
The page, the cards, the bottom bar, the cart bar, the splash and the pistachio accent do not change.

## What was there before (read from git, commit 16338f5)

| Token           | Before ADR 0050 | Now (ADR 0050)      |
| --------------- | --------------- | ------------------- |
| `headerBg`      | `#E9D8F0`       | `#3A1646`           |
| `onHeader`      | `#2A1033`       | `#FFFFFF`           |
| `onHeaderMuted` | `#563E60`       | `#D2BDDB`           |
| `headerBgEnd`   | did not exist   | `#4A2160` (a sheen) |

The dark theme's header was deep plum before ADR 0050 as well, and a dark theme with a pale header would be a different design, so
this plan changes the light theme only.

## What the change touches (from a search of the code, not a guess)

**Screens that wear the header colour** (they read `headerBg`, `onHeader`, `onHeaderMuted`, `headerControl`):

- `ui/HomeHeader.tsx`, `ui/TabHeader.tsx` (Categories and Orders), `ui/CategoryHeader.tsx`, `ui/HeaderIdentity.tsx`,
  `ui/CategoryTabs.tsx`, `ui/ShopsPanel.tsx`, `ui/ShopsChip.tsx`, `ui/LanguageChip.tsx`, `ui/IconButton.tsx`.
- `ui/AppHeader.tsx` uses `chrome` (dark in both themes), not the header tokens, so it must be moved to the header tokens to join in.
- `home/useHomeRail.ts` and `home/categories.ts` use `headerBg` as the rail's tint.

**Things that borrowed the header's colour as "brand dark" and must not turn lilac** (they read `headerBg` or `onHeader` today but
are dark cards, not headers): `ui/PlumCard.tsx` (the promise, and the closing card until it was removed), `home/CompareScene.tsx` (the sealed store and
its knob), the score tile and avatar rings in `home/KnowYourShop.tsx`, `ui/TrustTiles.tsx` (brand tiles) and the text on them. They
move to `chrome`, `onChrome` and `onChromeMuted`, which are the same dark values in both themes.

**Things that assume a dark header** and need a real change, not only a token:

- The status bar: five places pass `style="light"` (Home, tabs, category, search, app header). On lilac it must be dark in the
  light theme and light in the dark theme.
- `ui/GlassPanel.tsx` (the live order card) draws its sheen and edge in `onHeader`, which becomes dark ink on lilac. It should
  read `onChrome` (white in both themes), so the panel is frosted white on lilac and on plum.
- `ui/HeaderGradient.tsx` and `headerBgEnd`: a sheen from `#E9D8F0` to a slightly lighter lilac, or none (decision 3).
- The logo in the app header (`HeaderLogo`, `ground="chrome"`) is drawn for a dark ground: it needs the page-ground variant on
  lilac (to be checked in step 2).
- `ui/CategoryTabs.tsx`: the chosen tab's marker is `onHeader` (dark ink on lilac, as before ADR 0050).

**Things that stay deep aubergine, on purpose** (they are brand surfaces and bars, not headers): the bottom bar, the cart bar and
float, the splash, the welcome screen, the order-placed screen, the tracking hero, the brand promo card, and the product page,
which keeps its own category tint (ADR 0050 point 9).

## Decisions to confirm before step 1

1. **Light theme only.** The dark theme keeps its deep plum header. _Recommendation: yes._ A pale header in the dark theme would
   be a bright band on a dark page.
2. **The colour is the old header lilac `#E9D8F0`**, not the page's `lilac` token (`#EFE4F5`, the chosen-option tint). They are
   close; the header one is a little deeper, so it reads as a surface of its own. _Recommendation: `#E9D8F0`, and "Know your shop"'s
   stage uses the same colour so it joins the header._
3. **Flat, or the very light sheen.** ADR 0050's sheen runs left to right so the pieces of the header that move apart on scroll
   always match. _Recommendation: keep the mechanism and set the end colour to a lighter lilac (`#F1E6F7`), so the header has a gentle
   fade and no seam._ Flat is the safe alternative.
4. **Every header, including the app header** (cart, checkout, orders, help, settings) goes lilac, as you said. The bottom bar and
   cart bar stay aubergine and so the lilac sits between aubergine bars. _Recommendation: yes._
5. **The closing card and the promise stay deep aubergine** as the two accent cards. _Recommendation: yes_ (they are what the
   aubergine is left for on a lilac page).

## Steps (one at a time; after each I stop for the owner's phone check)

| #   | Step                       | What it does                                                                                                                                                                                         | Check                                       |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | **Separate the two jobs**  | Move the dark cards (plum card, scene, score tile, trust tiles) from the header tokens to the chrome tokens. No visible change.                                                                      | Home looks exactly as now                   |
| 2   | **Flip the header**        | The three light-theme tokens, a status bar that follows the theme, the app header on the header tokens, the logo on its page ground, the palette test pairs. Every header goes lilac.                | Home, Categories, Orders, a category, Cart  |
| 3   | **Polish the Home canvas** | The live order card's glass on lilac, the shops panel, the closed banner, the hero captions, and the sheen end colour; "Know your shop" stage on the header lilac with the strip, one straight fade. | Home with and without an order, both themes |
| 4   | **Records and the gate**   | ADR 0057 (Proposed, supersedes ADR 0050 for the light theme), the palette comment, the Home v5 plan note, lint, typecheck, test, build, a look at each header in light and dark.                     | Gate                                        |

## Risks

- **Contrast.** The old values passed the palette test (`onHeader` on `headerBg` 4.5:1 and `onHeaderMuted` too); the test pairs are
  kept and the sheen's end colour is added to them.
- **The glass card on a pale ground** is the one piece that needs design, not a token: step 3 checks it in both themes.
- **The logo** may need a page-ground lockup; if the art does not exist, the header uses the chip form the bottom bar already has.
- **Locked mock.** Home v5 was locked with a deep header; this changes it on the owner's word, and the mock file stays as history.

## Verification (per step, plus the gate)

1. [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass; the palette test covers every header pair.
2. [ ] Each header is looked at in the light and dark themes, in English and at 200% text.
3. [ ] Status bar text is dark on lilac and light on plum, on every screen, including after going back to a tab.
4. [ ] No colour literal outside `palette.ts`; the dark cards read the chrome tokens.
5. [ ] Owner phone check before the next step.
