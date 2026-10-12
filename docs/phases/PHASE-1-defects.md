# Phase 1: defects and known limits

Written at the end of the hardening pass (1h) and brought up to date on 2026-10-12 after the Home redesign and speed pass (1i). The
gate says "no open blocker or major defects; minor ones logged with an owner". This is that log. Nothing is marked blocker or
major, but several checks can only be made on a real phone or with real people, so those are listed first as **not yet checked**
rather than as passed.

## Major, open

**M1 was fixed on 2026-10-12** (see the row below): the Categories tab is built. The row stays for the record.

| #   | What                                                                                                                                                                                                                                                                                                                                                         | Why it is major                                                                                    | Owner                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **The Categories tab is a placeholder.** It opens a page that says "This screen is built in a later section of the customer app". Sub-phase 1c promised "a category listing from the Categories tab and Home category tabs". The Home category tabs and "See all" work, and the Categories tab was never built. I found it in the hardening pass, not before | One of the four bottom tabs leads to a "coming soon" page, in a phase that is meant to be finished | **Fixed.** The tab now shows grouped tiles four across; a main category opens Home on it and a finer tile opens search for its word. Awaiting your check on a phone |

## Not yet checked (needs a phone, a person or a tool)

| What                                                                                                | Why it is open                                                                                                   | Owner                           |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Every Maestro flow (`cart`, `first-run`, `order`, `order-dark`, `order-cancel`, `help`, `settings`) | Maestro is not installed on the machine the flows were written on, and the owner decided not to install it there | Owner, on a phone or emulator   |
| A TalkBack pass on each screen                                                                      | Needs an Android phone                                                                                           | Owner                           |
| The largest font size on each screen, from the phone's real setting                                 | The browser cannot set it; the layouts were checked by hand at a large size and use `useLargeText`               | Owner                           |
| Cold start and memory on a 2 GB Android phone, on a throttled network                               | Needs the phone                                                                                                  | Owner                           |
| Hindi and Marathi wording                                                                           | Drafts; the sheet is `PHASE-1-language-review.md`                                                                | A native speaker, via the owner |
| The people test: 5 households and 3 shop owners place a mock order, in both modes                   | Needs people                                                                                                     | Owner                           |
| Calling and WhatsApp from Help and from an order                                                    | Hands over to other apps, which the browser cannot do                                                            | Owner                           |

## Phone checks for 1i (the Home redesign and speed pass)

None of this has been seen on a phone. Each line is one thing to look at, so it is a short list rather than a test script.

| Where               | What to look at                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home, top to bottom | Shop by category (tiles four across, a main one opens Home on it, a finer one opens search), shops strip, Small prices tabs, Featured, the quieter-times note, footer |
| Product cards       | The 128 dp card is not stretched, rows keep one height, the name and price read at 16, the ribbon and add button are not cramped                                      |
| Cart taps           | Add and the plus and minus show a press at once; the number changes with no pause; nothing flashes                                                                    |
| Floating controls   | Free delivery note and cart button sit close together; the cart and bottom bar hide after a real scroll and come back on a short scroll up                            |
| Free delivery       | Crossing the free-delivery amount shows the moment once and for under three seconds; removing an item and adding it back does not repeat it                           |
| Stock limit         | Tapping plus at the limit shakes the stepper and shows the few words; it does not stack toasts                                                                        |
| Tab headers         | Categories and Orders wear the same header as Home; the compact search stays at the top while the page scrolls; the Orders chips sit under it                         |
| Dark mode           | Lilac tint, tile colours and the footer in the dark theme                                                                                                             |
| Hindi, Marathi      | The new lines fit in the tiles and chips at the largest text size without being cut                                                                                   |
| Low-end phone       | Scrolling Home is smooth; the first paint after opening the app is quick; use `pnpm dev -- --no-dev --minify` or a build                                              |

## Found and fixed since the hardening pass

- The Categories tab was a placeholder (M1 above); built as grouped tiles.
- A tap on add, plus or minus could take a visible beat before the number changed. Cart state now updates in a transition, the
  quantity store notifies only the tapped control, and the control shows its pressed state at once (ADR 0030).
- A toast stayed long enough to feel in the way, and the gap between it and the floating cart was too large; it now shows for
  2.8 seconds and sits close above the cart controls.
- The item page's promise tiles were laid out differently from the cart's; they now match (`7f7cf4d`).
- Switching to the Categories or Orders tab could flash the skeleton; the tabs are built early and never show it on a return.
- The header gradient was tried twice and removed because it did not look right (`938d87b`).

## Found and fixed in the hardening pass

- A failed read of saved data could be written over by the next save (orders, cart, addresses, reports and the rest). Storage now
  refuses to write to a key whose read failed. Tests added.
- A phone always counted as online. The phone's own connection report is now used (ADR 0020).
- The bill's total line was read out as two headings. It is no longer a heading.
- Hindi and Marathi: times read "3:10 वाजता ला" and the like; the extra word is gone. The WhatsApp button wrapped; the label is shorter.
- The rider card squeezed its name into a narrow column in Hindi; it now wraps under the name (fixed in 1g-0).
- A delivered cash order still said "Pay ₹59 to the rider" in the Orders list (fixed in 1g-0).
- Contrast tests added for the colours 1f and 1g use (ended-order text on cards, the cross on an ended step, the order outline, the
  tick on the placed screen and others). All pass in both themes.

## Minor, open

| #   | What                                                                                                                                                                                                                               | Severity | Owner                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| 1   | The testing switch names ("Pretend offline", "Next order ends" and the rest) are in the translation files, so they are in release builds as text, though no screen shows them                                                      | Minor    | Phase 2 (split dev strings out)                              |
| 2   | A 971 KB icon font (Material Symbols) is bundled as an asset because expo-router's native tabs import it, and this app does not use them. It is not in the JavaScript bundle, only the download. A Metro resolver rule can drop it | Minor    | Phase 2, if the install size matters                         |
| 3   | Zod is about 13% of the bundle's source (805 KB of 6.5 MB before minifying). The JavaScript bundle is 4.1 MB against a 5.0 MB budget, so it is not touched                                                                         | Minor    | Phase 2 decision (`zod/mini` is a rewrite of every contract) |
| 4   | Orders and reports are kept on the phone only, the newest 50 and 50. They are gone with the app's data. This is the Phase 1 design                                                                                                 | Minor    | Phase 2                                                      |
| 5   | "Call" buttons use `tel:` and do nothing in a web browser                                                                                                                                                                          | Minor    | None (a phone-only feature)                                  |
| 6   | The mock order clock only runs while the app is open and online; on return it catches up with the true times                                                                                                                       | Minor    | None (a mock)                                                |
| 7   | Loose items show "≈" for ever, because a weighed price is not stored                                                                                                                                                               | Minor    | Phase 2, with weighing at the shop                           |
| 8   | Many phones' "reduce motion" setting is honoured by the new screens, but the check was on a browser only                                                                                                                           | Minor    | Owner, on a phone                                            |
| 9   | The test browser lost its stored orders between sessions twice. It could not be reproduced and survived reloads; it is probably the pane clearing storage. The real hazard behind it is fixed above                                | Minor    | None                                                         |
| 10  | The Home sections added in 1i (category groups, price tiers, featured picks) use sample data kept inside the app, not contract-parsed fixtures from `packages/mocks`                                                               | Minor    | Phase 2 (move to the API with the real catalogue)            |
| 11  | The Featured picks use emoji as stand-in pictures, which can look different from one Android version to another                                                                                                                    | Minor    | Phase 2 (real pictures from the shop or the town's settings) |
| 12  | Opening a category from a tile on the very first load of Home may not switch the tab, because Home reads the choice after it mounts                                                                                                | Minor    | Owner to confirm on a phone; fix is small if it shows        |
| 13  | Haptics on add and on the stock-limit shake are not built; they need `expo-haptics`                                                                                                                                                | Minor    | Owner (a yes to the dependency)                              |
| 14  | Speed figures for 1i come from a production web bundle; no native Android release build has been run here                                                                                                                          | Minor    | Owner, on a phone                                            |

## Decided and parked

- **"Order again" (one-tap reorder).** Parked by the owner on 2026-10-10. The order now keeps its items; the cart side is left.
  See `PHASE-1-notes.md`.
