# Phase 1: defects and known limits

Written at the end of the hardening pass (1h). The gate says "no open blocker or major defects; minor ones logged with an owner".
This is that log. Nothing is marked blocker or major, but several checks can only be made on a real phone or with real people, so
those are listed first as **not yet checked** rather than as passed.

## Major, open

| #   | What                                                                                                                                                                                                                                                                                                                                                         | Why it is major                                                                                    | Owner                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **The Categories tab is a placeholder.** It opens a page that says "This screen is built in a later section of the customer app". Sub-phase 1c promised "a category listing from the Categories tab and Home category tabs". The Home category tabs and "See all" work, and the Categories tab was never built. I found it in the hardening pass, not before | One of the four bottom tabs leads to a "coming soon" page, in a phase that is meant to be finished | Owner to decide: build a small listing (a grid of the five categories, each opening that category's items), or take the tab out of the bar until Phase 2 |

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

## Decided and parked

- **"Order again" (one-tap reorder).** Parked by the owner on 2026-10-10. The order now keeps its items; the cart side is left.
  See `PHASE-1-notes.md`.
