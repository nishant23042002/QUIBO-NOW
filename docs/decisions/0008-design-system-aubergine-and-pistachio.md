# 0008. The Quibo Now design system: aubergine and pistachio, light and dark

- **Status:** Accepted (Phase 0c). Builds on [0007](./0007-customer-and-driver-are-expo-apps.md).
- **Date:** 2026-10-08
- **Source:** the human's decisions after reviewing the parent QUIBO kit and two proposal pages: logo
  option A, the tagline, the palette, a light and a dark theme with a toggle, the two packages, and
  placeholder product images.

## Context

After Phase 0b the customer app ran in Expo Go but still looked like a placeholder: one hard-coded green
palette, light only, seven building blocks and no logo. The parent company QUIBO supplied a small brand kit
(an outlined wordmark, a Q mark and speed lines, in obsidian and lime). The human asked for an identity that
follows its feel without copying it, changed from "Home and Personal Services" to **Now**, and tuned for
grocery delivery. Phase 1 (twelve customer screens) should be built from locked parts, not invent styles
screen by screen.

## Decision

1. **Name and tagline.** The name stays **Quibo Now**. The tagline is **"Dukaan se ghar tak."** (Hindi
   दुकान से घर तक।, Marathi दुकानातून थेट घरी.). It says shop to home, in the language people speak, and makes
   no promise about minutes. Hindi and Marathi are drafts for a native speaker.
2. **Logo.** Option A, stacked: the parent's outlined wordmark and speed lines, with a **NOW** tag under the
   right end. The header uses the compact form of the same family (Q mark plus tag), because the stacked
   form is too tall for a header. A third form, the Q mark alone, serves tiny spaces and the app icon. All
   three are drawn with `react-native-svg` from path data in `src/ui/brand/paths.ts`: the wordmark, mark and
   lines are the parent's own outlines, and NOW is outlined once from Poppins Black (SIL Open Font
   License 1.1) with the same italic skew baked in. No font is needed at run time. The generated path data
   is committed; the generator and the font are not.
3. **Palette: aubergine and pistachio.** The parent's lime was too hot for a shopping app, and the human
   wanted something other than the first round (Leaf, Marigold, Teal and Coral). Of the second round (Teal
   and Mango, Indigo and Mint, Aubergine and Pistachio) the human chose aubergine and pistachio.
   All values are in `src/theme/palette.ts`, in two palettes of the same 28 roles (page, surface, tinted
   block, text, caption, decorative line, control border, header, accent, offer tag, status colours and
   their tints, and a modal scrim). A test measures 22 pairs in each theme: text at 4.5:1 or more and the
   edge of a control or shape at 3:1 or more. The lowest text pair is **4.70:1** (accent text on the light
   page) and the lowest control edge is **4.08:1**.
4. **Two themes and a toggle.** A button at the top of every header switches light and dark. The first
   launch follows the phone's setting; the first tap sets an explicit choice, remembered for the next
   launch. `ThemeProvider` holds the mode (`system`, `light` or `dark`), `useTheme()` gives the colours, and
   `useStyles(make)` builds a component's styles from them. A stored value that is missing or bad falls
   back to the phone's setting; a failing store never crashes the app. The language choice is remembered
   the same way.
5. **Rules that keep the look consistent**, each enforced by a check:
   - **Colours exist only in `palette.ts`.** ESLint bans hex, `rgb()` and `hsl()` literals everywhere else
     (test files are exempt, because contrast tests must write them). A component cannot import a colour:
     it asks the theme.
   - **The header and cart bar are dark in both themes**, so the logo and the main button look the same on
     every screen. The palette test checks it.
   - **The pistachio is a fill, never text or a border on a light surface** (1.2:1 on white). Text in the
     accent colour uses `accentInk`. The palette test checks both facts.
   - **`action`** is aubergine in the light theme and pistachio in the dark theme, for outlined buttons,
     steppers and selected edges, so the same component reads correctly on both.
   - **Text takes only the colours in `TextColor`**, each one tested against the surface it sits on.
6. **Components.** The seven existing blocks were restyled (`Text`, `Screen`, `Button`, `Input`, `Card`,
   `Badge`, `Sheet`) and 14 added: `IconButton`, `Chip`, `SearchBar`, `Stepper` (a count, or a loose weight in
   steps of 0.5 kg), `Price`, `Notice`, `ProductImage`, `ShopCard`, `ItemCard`, `CategoryTile`,
   `WindowPicker`, `AddressPill`, `CartBar` and `BillSummary`. They take their text as props, so the lint
   rule against typed-in strings still holds. Money is always `Money` in integer paise, and the delivery
   promise is always a clock window such as "Today 4–6 PM", never minutes. The pure logic (quantity steps,
   savings, progress to free delivery) lives in `src/ui/logic` with unit tests, because React Native cannot
   be imported in Vitest.
7. **Icons.** Thirteen outline icons, one stroke weight, in one `Icon` component drawn with
   `react-native-svg`. No icon library.
8. **Placeholder product images.** A tinted tile with the item's first letter and two faint speed lines.
   `ProductImage` is the only place a real photo plugs in.
9. **Fonts.** System fonts for text, as before. The wordmark is outlined, so it does not depend on a font.
10. **App icon.** The Q mark on the header aubergine, in three files for real builds (Expo Go ignores them):
    a 1024 px icon with no transparency, an Android adaptive foreground kept inside the safe circle, and a
    one-colour layer for themed icons. The SVG masters are in `docs/brand/`. A test checks the sizes and
    transparency and that the Android background matches the header colour.

## Deferred on purpose

- **Eight more components** wait until a screen needs them: `EmptyState`, `StatusTimeline`, `Toast`,
  `ConfirmDialog`, `ItemRow`, `Skeleton`, `DietMark`, `Divider`.
- **Poppins as the text font.** It would cost about 500 KB and one more package; decide it with the
  Phase 1 bundle-size numbers.
- **The splash screen at the operating-system level** and store release setup (ADR 0007). The in-app boot
  screen with the stacked logo and the tagline covers the moment the saved settings load.
- **Real product photos and category art.**
- **The driver, admin, api and worker placeholders** are untouched.

## Consequences

- **Two packages were added to `apps/customer`**, both the exact versions Expo SDK 57 pins and both needing
  only `react` and `react-native`: `react-native-svg` 15.15.4 (logo, icons, placeholder pattern) and
  `@react-native-async-storage/async-storage` 2.2.0 (the remembered theme and language). Recorded in
  ADR 0003. If a very old Android phone struggles with SVG, the fallback is PNG logos.
- **The first paint waits** for the saved theme and language, behind the boot screen. If it ever flickers,
  the fallback is to draw with the phone's setting and switch after.
- **`app.json` holds one colour literal** (the Android icon background), because JSON cannot import the
  palette. A test keeps it equal to the header colour.
- **A new colour pairing is not checked automatically.** The palette test lists its pairs by hand: add
  every new text-on-background or border-on-background pair to it.
- **The Android navigation bar colour in dark** is the one thing not checked yet; it needs a phone.
- **Bundle size** grew by about 0.2 MB (3.3 MB to 3.5 MB Hermes bundle) with the two packages, the logo
  paths and the components.

## Alternatives considered

- **The parent's own colours** (obsidian and lime). Lime as text or a border on a light page is unreadable,
  and the human asked for a palette suited to groceries.
- **Teal and coral, and the other first-round palettes.** The human liked teal but not coral; coral sat only
  8 degrees of hue from the error red, which is a risk of its own.
- **Teal and Mango, and Indigo and Mint** (second round). Both were contrast-checked and offered; not chosen.
- **Logo options B and C as the main logo.** Not chosen: the human picked A. The compact form (C) is used
  only in headers, because A is too tall for one; that was an assumption in the approved plan.
- **A theme or styling library** (NativeWind, Tamagui, Unistyles). Rejected for the same reason as in
  ADR 0007: plain code is easier to read and lighter on a 2 GB phone. Revisit if the twelve screens make
  `useStyles` repetitive.
- **An icon library.** Thirteen icons do not justify a dependency; add one when the count grows.
- **Dark mode only, or light only.** The human asked for both, with the choice in the header.
