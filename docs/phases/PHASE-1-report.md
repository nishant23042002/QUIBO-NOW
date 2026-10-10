# Phase 1 report: the customer app on mock data

- **Branch:** `phase-1/customer-ui` (133 commits ahead of `master`). Pushed up to the last commit before the hardening pass; the
  hardening commits are local until you say "push". Not merged, not tagged.
- **Status:** the whole customer app is built and every automated check passes in a fresh clone (install from the lockfile, then
  lint, typecheck, test and build). **Nothing has run on a phone, with TalkBack, on a throttled network or with people.** Those are
  the open gate items below, and they are yours.
- **One thing inside Phase 1 was not built: the Categories tab.** It is still a "coming soon" page. I found it during hardening, not
  earlier, and it is logged as the one open major defect (`PHASE-1-defects.md`, M1). It needs your decision before sign-off.
- **Nothing outside Phase 1 was built.** "Order again" was cut by decision and is parked. What was found and not built is in
  `PHASE-1-notes.md`, and what is open is in `PHASE-1-defects.md`.

## 1. What a shopper can do now

A shopper can open the app for the first time, choose a language, sign in with a number and a test code, and land on Home with
their address and an estimated delivery time. They can browse shops and categories, search, open an item, and put things in the cart
from several shops, loose items by weight. They can check out with cash or a test UPI payment, place the order once, and watch it
go from the shop to the rider to the door. They can cancel it before the shop has packed it, see what happens to their money when
it does not arrive, find all of it again under Orders, get help or report a problem, and change language and appearance.

All of it runs on mock data from `packages/mocks` and the contracts in `packages/contracts`, in English, Hindi and Marathi, with a
loading, empty, error and offline state on each screen.

## 2. What was built, by sub-phase

| Sub-phase | Result                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1a        | The Home screen, static: header, categories, rails, banners, the cart bar                                                                      |
| 1b        | Data and plumbing: loading, offline and error handling on every screen, the mock API through the contracts                                     |
| 1c        | Browse: shop page, in-shop search, global search, category listing, item page with packs and loose weight                                      |
| 1d        | Cart: lines, steppers, weights in half kilograms, coupons, tip, delivery time, substitution choices, saved for later, the dynamic bill         |
| 1e        | First run and address: language, number and code, saved addresses with a mock map pin and a delivery-area check (ADR 0016, 0017)               |
| 1f        | Checkout and tracking: payment choice and cash limit, test UPI, place once, live timeline, cancel, the three endings, refunds (ADR 0018, 0019) |
| 1g        | Orders with pictures of what was bought, Help with FAQ, call, WhatsApp and reports, Settings, testing tools kept out of release builds         |
| 1h        | Hardening: storage safety, phone connection state (ADR 0020), contrast tests, accessibility and wrapping sweeps, this gate run                 |

## 3. The gate (PLAN section 16)

| Gate item                                                                                      | State                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan approved before coding; nothing outside the phase built                                   | **Met.** Every piece was planned and approved before it was built                                                                                                            |
| `lint`, `typecheck`, `test` and `build` pass on a clean install, with no unexplained warnings  | **Met.** Fresh clone, `pnpm install --frozen-lockfile`, all four exit 0, no warnings                                                                                         |
| Maestro flows pass in both fulfilment modes                                                    | **Not met.** Seven flows are written; none has been run, because Maestro is not installed here and you chose not to install it                                               |
| No serious accessibility issues: contrast tests, a TalkBack pass, the largest font size        | **Partly met.** Contrast tests pass in both themes for every pair in use. Every screen's controls have names and roles. TalkBack and the real text-size setting are not done |
| Bundle size inside the budget; a cold start recorded on a 2 GB phone                           | **Half met.** The Android bundle is 4.1 MB against 5.0 MB. No cold start has been recorded: that needs the phone                                                             |
| Tested by hand on a real low-end Android phone with a throttled network                        | **Not met.** Needs the phone                                                                                                                                                 |
| No open blocker or major defects; minor ones logged with an owner                              | **Not met.** One major: the Categories tab is a placeholder (M1). Minor ones are in `PHASE-1-defects.md`, each with an owner                                                 |
| `PHASE-1-report.md` written, demo done, human sign-off recorded, tag `phase-1-complete` pushed | **Report written.** Demo, sign-off and tag are yours                                                                                                                         |

## 4. Numbers

| Measure               | Result                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Automated tests       | 725 in all: 468 in the customer app, 200 contracts, 30 i18n, 16 config, 11 mocks                                                                                               |
| Android Hermes bundle | 4.1 MB (3.5 MB at the end of Phase 0c), 1,639 modules. Budget 5.0 MB                                                                                                           |
| Largest shares        | React Native 32%, expo-router 19%, the app's own source 13%, Zod 13% of the pre-minified source                                                                                |
| Decisions recorded    | 20 ADRs; this phase added 0009 to 0020                                                                                                                                         |
| Screens               | Home, categories, shop, item, search, cart, coupons, delivery time, address list and form, checkout, order placed, Orders, order page, Help, report, Settings, first-run steps |
| Languages             | English, Hindi, Marathi: 176 lines for review on the sheet, plus the older screens                                                                                             |

## 5. Things I would want you to know before you sign

- **The mock order clock is the product's shape, not its behaviour.** A real order moves because a shop and a rider move it. The
  screens read the order's own state, so Phase 2 swaps the clock for the server without a screen changing.
- **Money is integer paise throughout; payment is a status, never an edited balance.** A paid UPI order that does not arrive
  becomes `refunding`. The real ledger, refunds and gateway are Phase 2.
- **Saved data is on the phone only.** Orders and reports are kept as the newest 50 each. They go with the app's data.
- **The phone's connection state is real now** (ADR 0020). Airplane mode shows the offline screens. The testing switches remain.
- **The contact number for Help is `+91 90112 85958`**, held in the zone settings in the code, so it is in the repository.
- **The Hindi and Marathi are drafts.** A few were corrected during this pass for how time and grammar read; the rest is as I
  wrote it.

## 6. What is yours to do, in the order I would do it

0. **Decide the Categories tab** (M1): build a small listing, or take the tab out of the bar.
1. **Run the app on your phone** and go through the "Your check" lists in `PHASE-1.md` for 1f and 1g.
2. **Record a cold start** on a low-end phone, with the network throttled, and look at memory.
3. **A TalkBack pass** on the main flow: Home, an item, the cart, checkout, the order page, Help.
4. **Run the Maestro flows** once the tool is on a phone or emulator, in both modes.
5. **Send `PHASE-1-language-review.md`** to a native Hindi and Marathi speaker.
6. **The people test:** 5 households and 3 shop owners place a mock order unaided, in both modes.
7. **Sign off**, and I will tag `phase-1-complete`.

## 7. Where the evidence is

- Decisions: `docs/decisions/` (0009 to 0020 are this phase).
- Open issues and known limits: `docs/phases/PHASE-1-defects.md`.
- Parked and for later: `docs/phases/PHASE-1-notes.md`.
- Wording for review: `docs/phases/PHASE-1-language-review.md`, made by `node scripts/language-review.mjs`.
- Test flows: `apps/customer/.maestro/`.
