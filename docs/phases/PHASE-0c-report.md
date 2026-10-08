# Phase 0c report: lock the design system

- **Branch:** `phase-0/foundation` (7 build commits and 1 docs commit on top of the Phase 0b cleanup
  `1d48d83`, plus this report). Not pushed, not merged, not tagged.
- **Status:** every automated check passes in a fresh clone of the final build commit `c985f6f`. **Nothing has
  run on a phone or an emulator yet.** That is yours to do (README, "Run the customer app on your phone"). The
  look was checked in Expo's browser preview, by script and by eye, which is not a phone.
- **Nothing outside Phase 0c was built.** What was found but not built is in `PHASE-1-notes.md`.

## 1. The answer to the question that started this phase

**The design is locked, and the app is built from it.** You chose logo option A, the tagline, the aubergine
and pistachio palette, a light and dark theme with a toggle, two packages and placeholder photos; all of
that is now code. Evidence: `ADR 0008` records each decision; the app opens with the stacked logo and the
tagline; a button at the top of every screen switches the theme; the choice and the language survive closing
and reopening (checked after a full page reload in the preview); and 44 colour checks pass, 22 pairs in each
theme. Phase 1 can now be built from these parts without inventing a style.

## 2. What exists

| Area             | Result                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity         | Logo A (stacked), a compact header logo and the Q mark, drawn from the parent's outlined paths with NOW outlined from Poppins Black. Tagline "Dukaan se ghar tak." in English, Hindi and Marathi                                     |
| Theme            | `src/theme`: 28 colour roles in a light and a dark palette, `ThemeProvider`, `useTheme()`, `useStyles()`. First launch follows the phone; the toggle sets and remembers a choice. Bad or missing stored values fall back             |
| Lint rule        | Colour literals (hex, `rgb()`, `hsl()`) are an error everywhere except `palette.ts` and test files                                                                                                                                   |
| Building blocks  | The seven existing ones restyled, and 14 new ones (`IconButton`, `Chip`, `SearchBar`, `Stepper`, `Price`, `Notice`, `ProductImage`, `ShopCard`, `ItemCard`, `CategoryTile`, `WindowPicker`, `AddressPill`, `CartBar`, `BillSummary`) |
| Icons and images | 13 outline icons in one `Icon` component; a placeholder product image (tinted tile, first letter, two faint speed lines)                                                                                                             |
| Pure logic       | `src/ui/logic`: quantity steps for counts and loose weight (in thousandths, no float noise), savings against the printed price, progress to free delivery. 14 unit tests                                                             |
| Screens          | Home restyled (logo, tagline, window note as an info banner). The Components screen shows every block in its states, on the surface it really sits on, in all three languages                                                        |
| Persistence      | `@react-native-async-storage/async-storage` holds `quibo.theme` and `quibo.language`; `src/storage.ts` swallows storage errors                                                                                                       |
| App icon files   | 1024 px icon (no transparency), Android adaptive foreground inside the safe circle, one-colour themed layer, and the SVG masters in `docs/brand/`. Only visible in a built app, never in Expo Go                                     |
| Docs             | ADR 0008, ADR 0003 (two new pins) and ADR 0007 (two statements marked as changed), README, `PHASE-0c.md`, `PHASE-1-notes.md` updated                                                                                                 |
| Dependencies     | Two added to `apps/customer`: `react-native-svg` 15.15.4 and `@react-native-async-storage/async-storage` 2.2.0, the exact versions Expo SDK 57 pins. Nothing else                                                                    |

## 3. Commits

| Commit    | Subject                                                         |
| --------- | --------------------------------------------------------------- |
| `b39f56c` | chore(customer): add react-native-svg and async-storage         |
| `5bee212` | feat(customer): add the aubergine theme with light and dark     |
| `8fd1ede` | feat(customer): add the logo, icons and remembered language     |
| `29bd414` | refactor(customer): restyle the building blocks for both themes |
| `da0a52c` | feat(customer): add the core components                         |
| `96315ad` | feat(customer): show every component in both themes             |
| `21b7592` | feat(customer): add the app icon files                          |
| `c985f6f` | docs: lock the design system                                    |

Against `1d48d83`: 68 files changed, 3,370 lines added and 385 removed; 157 files are tracked in the whole
repository. Each commit left lint, typecheck, tests and build green (run before the commit), and the commit
hooks (ESLint and Prettier on staged files, the commit message check) ran on every one.

## 4. Verification run

Run in a fresh clone of the final build commit `c985f6f` (Node 24.21.0, pnpm 10.34.5), then deleted. This
report is the only later commit and changes only documents.

| Check                                              | Result                                                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                   | Pass, **no warnings**. 837 packages in 13 s (822 after Phase 0b)                                                                   |
| `pnpm lint` (9 workspaces, root files, Prettier)   | Pass                                                                                                                               |
| `pnpm typecheck` (9 workspaces)                    | Pass                                                                                                                               |
| `pnpm test`                                        | Pass: **328 tests** (contracts 190, customer 81, i18n 30, config 16, mocks 11). Phase 0b had 276                                   |
| `pnpm build` (`expo export --platform android`)    | Pass: Metro bundled 1,468 modules and Hermes compiled them to a **3.5 MB** bundle (3.3 MB after Phase 0b)                          |
| `expo install --check`                             | "Dependencies are up to date"                                                                                                      |
| `expo-doctor` (run once with `dlx`, not installed) | 21 of 21 checks passed, no issues                                                                                                  |
| Dev server, Android and iOS manifests              | HTTP 200 and 200. The Android manifest carries the icon, the adaptive icon with its background and `userInterfaceStyle: automatic` |
| Dev server, Android and iOS bundles                | HTTP 200 (7.6 MB and 7.2 MB in development mode); the Android bundle contains the new tagline and `react-native-svg`               |
| Dev server, icon files                             | The adaptive foreground and monochrome PNGs are served with HTTP 200                                                               |
| `git status` after all of the above                | Clean: the Expo CLI rewrote no tracked file and left nothing untracked                                                             |
| `pnpm clean` (in the fresh clone)                  | Removed 12 folders; `node_modules`, `.env` and the git hooks untouched; a second run said "Nothing to clean"                       |

**Web preview** (Expo's browser preview on the working copy at the same commit; not a phone). I measured it
instead of judging by eye:

- **Text contrast of every text node**, 214 per run, in English, Hindi and Marathi, each in the light and
  the dark theme (six combinations). The only two hits in every run were the hidden "enable JavaScript"
  notice and the header title, which a check by element position showed to be white on the dark header
  (a false positive of my script, which looks for a background on a parent).
- **No horizontal scroll and no clipped text** in any of the six, at the pane width; the item cards and the
  window picker were also looked at in a 360 px wide phone frame, in Hindi and in the dark theme.
- **Behaviour through real pointer events:** ADD turns into a stepper; a loose-weight stepper goes 1.5, 2,
  1.5, 1 kg in steps of 0.5; stepping down from 1 returns to ADD; only one delivery window is ever selected,
  and the full one cannot be chosen and is read out as "full"; the free-delivery bar and the bill lines show
  the right amounts, including `₹1,23,456.50`.
- **Toggle and persistence:** from empty storage the first tap switched to dark and stored it; picking
  Marathi stored it; after a full reload the page was still dark (background `#170A1E`), still Marathi, the
  toggle label and the tagline were in Marathi, and the console had no errors or warnings.

**Planted defects, each caught by the right check, then reverted** (working tree clean afterwards): a hex
colour typed into a screen (the colour lint rule), a theme token that does not exist (TypeScript), a
low-contrast caption colour (the palette test, 2.96:1 against the 4.5:1 needed), a bad stored value accepted as
a theme mode (the mode test), a wrong Android icon background (the app test), and an icon with transparency
(the config test).

## 5. Deviations from the approved plan

1. **The toggle shipped in the restyle commit, not the logo commit.** The plan put the toggle in step 3 and the
   restyle in step 4. The toggle, the header and the boot screen depend on the restyled blocks, so `8fd1ede`
   holds the logo, icons and remembered language, and `29bd414` holds the restyle together with the toggle.
   Each commit is still green on its own.
2. **Test files are exempt from the colour lint rule**, as well as `palette.ts`. The contrast tests have to
   write hex values. The rule still covers every screen and component.
3. **The storage helper is `src/storage.ts`, not inside `src/theme`,** because the theme and the language
   provider both use it.
4. **The icon tests are split in two.** The app test (`apps/customer/src/appIcon.test.ts`) checks the
   `app.json` settings and that the Android background equals the header colour. The file checks (size,
   transparency) are in `packages/config`, because the customer app has no Node types on purpose (they clash
   with React Native's timer types), and `packages/config` already reads repository files in a test.
5. **The icon is centred on what is painted, not on the logo's view box,** and the generator refuses to write
   files if any painted corner leaves Android's safe circle (it measured 290 px against the 313 px limit).
   The plan only said "inside the safe zone".
6. **`pnpm clean` was run in the fresh clone, not in the working copy,** because your dev server is running
   in the working copy and `clean` deletes the Expo caches. The script itself is the one verified in Phase 0b.
7. **The Components screen follows the header toggle** instead of showing both themes side by side. To see
   both, tap the toggle on that screen.

**Found while checking, and fixed before the commit:** closed shop cards were faded to 70%, which put their
muted text at about 3.4:1 (the "Opens 7 AM" text already says the shop is closed, so the fade was only a cost);
item card footers overflowed at 360 dp with a weight stepper, so they now wrap; the pack size could be cut off
by the other-script name, so the pack comes first; and the shop card was too narrow for "Today 4–6 PM".

## 6. Numbers

| Number                       | Value                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Android Hermes bundle        | 3.5 MB, 1,468 modules (3.3 MB and 1,323 after Phase 0b)                                                                |
| Packages installed           | 837 (822 after Phase 0b)                                                                                               |
| Lowest text contrast         | 4.70:1 (accent text on the light page); AA needs 4.5:1                                                                 |
| Lowest control-edge contrast | 4.08:1 (the control border on the light page); AA needs 3:1                                                            |
| Contrast pairs checked       | 22 per theme, 44 in all                                                                                                |
| Tap targets                  | 48 dp minimum for the page's own controls; chips, steppers and notices are 36 dp with 6 dp of touch slop on every side |
| Text size                    | Follows the phone's setting, capped at 200% on `Text`                                                                  |
| New messages                 | 38 per language (35 sample strings, the tagline and two toggle labels)                                                 |

## 7. Open risks and decisions for you

1. **Node.** The Node on this machine's PATH is still `v26.7.0` whenever a command runs without my helper,
   which `engine-strict` rejects (`>=24.21.0 <25`). Every command above ran with a portable Node 24.21.0 that
   lives outside the repository. Install 24.21.0 from <https://nodejs.org/dist/v24.21.0/node-v24.21.0-x64.msi>,
   open a new terminal, and `node -v` must print `v24.21.0`. If you would rather stay on Node 26, say so:
   widening the pin is a deliberate change to ADR 0003.
2. **Expo Go must support SDK 57.** Update it from the store before scanning.
3. **Nothing in this phase has run on a phone.** Specifically unchecked: the toggle and the remembered choice
   on a device, that the SVG logo and icons draw correctly on Hermes, the **Android navigation bar colour in
   the dark theme**, the **`Sheet` in both themes** (it was restyled but not re-measured open; the audit above
   saw it closed), the largest font size, and a low-end phone on a weak network.
4. **The palette itself is yours to judge on a real screen.** The numbers pass, but the aubergine and
   pistachio were chosen from a proposal page. If it does not feel right outdoors or on your phone, the whole
   look changes in one file, `src/theme/palette.ts`.
5. **Hindi and Marathi are the assistant's drafts,** now 38 more strings per language including the tagline.
   They need a native speaker, and Hindi and Marathi often run longer than English.
6. **The app icon files cannot be seen in Expo Go.** They are checked for size, transparency, safe zone and
   colour, and I looked at the PNGs, but they show only in a built app, which is deferred (ADR 0007).
7. **The optional `CLAUDE.md` line is not applied.** It would add, under Non-negotiables, "No hard-coded
   colours: use theme tokens (enforced by lint)". The lint rule already enforces it; you did not say yes or no,
   so I left `CLAUDE.md` untouched. Say yes and I add it in a small commit.
8. **`app.json` has one colour literal** (the Android icon background) because JSON cannot import the palette;
   a test keeps it equal to the header colour.
9. **Carried over:** the OrderStatus table is a reconstructed stub to confirm against PLAN section 7; the costs
   of leaving the PWA (ADR 0007); no test yet on a real low-end phone; the bundle includes a 971 KB icon font from
   Expo Router that the app does not use.
10. **No security layer, push, background location, OTA updates, crash monitoring or release setup,** by your
    earlier instruction. `CLAUDE.md`'s basics hold.

## 8. Gate checklist for you

It is in [`PHASE-0c.md`](./PHASE-0c.md). The steps that need your hands:

1. Install Node 24.21.0, open a new terminal, `pnpm install`, update Expo Go, run `pnpm dev` and scan the QR
   code.
2. Tap the round button at the top right of the home screen: the app should switch between light and dark.
   Close the app completely and reopen it: the theme and the language should be as you left them.
3. Open **Components** and look through it in both themes and all three languages. Try ADD, the + and -
   buttons, the loose-weight stepper, the window picker, and open the sheet in both themes.
4. Check **On this phone** still shows `₹1,23,456.50` and `200 {"status":"ok"}`, set the phone's font size to
   the largest, and look at the dark theme's navigation bar at the bottom of the screen.
5. If it all looks right, sign off and push the tag `phase-0-complete`. Phase 0, 0b and 0c close together.
