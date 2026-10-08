# Tier 3/4 Quick Commerce: 0-to-1 Product & Build Plan

Oct 8, 2026 · @workspace.nishant

> **Update, 2026-10-08 (Phase 0b):** the customer app is now an Expo (React Native) app, like the driver app, not a Next.js PWA, and `apps/customer-web` is now `apps/customer`. Wherever this plan says PWA, customer web app, service worker or Lighthouse for the customer app, read it as the React Native app. What the PWA choice was protecting (no install, WhatsApp link previews, iPhone coverage) and what it costs now are in [ADR 0007](decisions/0007-customer-and-driver-are-expo-apps.md). The admin panel and store portal stay Next.js web. Nothing else in this plan changed.

## 1. Read this first

Build one delivery product that runs in two switchable modes per town: partner stores first, and a single small dark store of your own when the numbers justify it; either way it is not a smaller copy of Blinkit. Writing the app is only part of the job; winning shops, riders and trust in one town is the rest.

| Your brief | What this plan does instead | Why |
| --- | --- | --- |
| Giants have not reached these towns yet | Target towns where their dark-store model does not pay, not towns they have merely not reached | Flipkart Minutes and Amazon Now are already pushing into tier 2 and 3; the break-even maths is in section 2 |
| Dark stores and 10-minute delivery | Partner stores by default and one company dark store per town as a switchable option; a 30 to 45 minute promise and scheduled slots | Partner mode carries no rent, stock or picker payroll; dark-store mode trades that for control of stock and margin; reliability matters more than raw speed in small towns |
| UI and screens first: customer app, then admin panel, then driver app | Same order, but each surface runs as a mock-data UI phase, then a live phase, with a tested gate between phases | A tested screen is cheap to change; a backend built against a signed-off screen and contract is not rebuilt |
| Build everything, then launch | Run a manual WhatsApp version in one town while you build | Two to three weeks of manual orders show what to build and what to skip |

**Two modes, one product.** Fulfilment mode (partner stores, one dark store, or both) is a per-town setting, so you can start in either mode and switch at any point in the build. The customer app, order flow, payments, riders and ledger are identical in both modes; only the supply side differs (stock counts, receiving and picking instead of shop toggles). Section 7 gives the switch triggers and procedure, and section 14 shows what a dark store costs. Also decide the starting mode per town.

PWA = progressive web app: a website that installs like an app, works on weak networks and needs no Play Store approval.

**Cost of UI-first:** real orders cannot flow end to end until the admin panel is live, so phase 2 ships a small ops inbox with WhatsApp alerts, the manual pilot keeps running in parallel, and the driver app waits until volume justifies it (sections 12 and 13).

Lock these before writing code:

- [ ] First town chosen using the filters in section 3
- [ ] Launch categories fixed: staples, dairy, fruits and vegetables, snacks, household essentials
- [ ] Delivery model fixed per zone: store's own delivery staff or your own riders
- [ ] Legal entity and FSSAI route decided (section 11)
- [ ] Languages and brand name decided

This doc exports to Markdown for the repo; section 16 is the handoff written for Claude Code.

## 2. Why the giants are not in your town, and what that implies

The giants are moving into tier 2 and 3 fast, but only where a dark store can clear roughly 800 orders a day; towns that cannot generate that stay unserved, and that structural gap is your market.

| Fact | Figure | Source |
| --- | --- | --- |
| Dark stores at end of FY26 | Blinkit 2,243; Instamart 1,143; Zepto 1,139 | [Outlook Business](https://www.outlookbusiness.com/corporate/flipkart-minutes-hits-1000-stores-amid-deferred-ipo), Jun 2026 |
| Flipkart Minutes | 1,000 centres in 130 cities, about 90 of them tier 2 or 3; target 1,500 centres in 180+ cities | [Outlook Business](https://www.outlookbusiness.com/corporate/flipkart-minutes-hits-1000-stores-amid-deferred-ipo), Jun 2026 |
| Amazon Now | Live in 15+ cities, expanding towards 300 cities | [Outlook Business](https://www.outlookbusiness.com/corporate/flipkart-minutes-hits-1000-stores-amid-deferred-ipo), Jun 2026 |
| New-store pattern | Nearly 9 in 10 new dark stores opened in pincodes already served; 2,722 serviceable pincodes in total | [Ascendants, citing Bernstein](https://ascendants.in/industry_events/india-quick-commerce-dark-stores-metro-saturation/), Jul 2026 |
| Blinkit's direction | 75% of its latest store additions were outside metros | [Ascendants, citing Bernstein](https://ascendants.in/industry_events/india-quick-commerce-dark-stores-metro-saturation/), Jul 2026 |
| Break-even per dark store | About 800 orders a day in tier 2, about 1,300 in tier 1 | [Business Standard](https://www.business-standard.com/industry/news/blinkit-zomato-tailor-quick-commerce-for-india-s-tier-2-tier-3-cities-125123000066_1.html), Dec 2025 (Emkay Global) |
| Volume needed | 1,000+ orders a day; below that the catchment grows from 2 to 3 km to 6 to 8 km and delivery slips to 20 to 30 minutes | [Outlook Business, Bain](https://www.outlookbusiness.com/interviews/can-quick-commerce-scale-beyond-metros-flipkart-bain-execs-decode), Jul 2025 |
| Customer tolerance | PwC India says tier 2 and 3 shoppers barely notice delivery faster than 30 minutes | [Business Standard](https://www.business-standard.com/industry/news/blinkit-zomato-tailor-quick-commerce-for-india-s-tier-2-tier-3-cities-125123000066_1.html), Dec 2025 |
| 10-minute promise | Labour ministry persuaded platforms to drop 10-minute branding | [Storyboard18](https://www.storyboard18.com/amp/how-it-works/govt-pulls-brakes-on-10-minute-delivery-forces-quick-commerce-rethink-87542.htm), Jan 2026 |

What this means for the plan:

- **The window is real and closing.** Flipkart is already opening in district towns such as Darbhanga, Purnia, Jorhat and Tenali. Treat 12 to 24 months of head start as a working guess, shorter in bigger towns.
- **Your real competitor is the kirana's own phone and WhatsApp delivery.** Kiko Live, a kirana software firm, claimed in March 2024 that call and WhatsApp home delivery is already over 10% of kirana business, an $80 billion plus market by its estimate ([Retail4Growth](https://retail4growth.com/news/will-ondc-and-its-enablers-drive-growth-of-kirana-e-commerce-6676)). It is a company claim, so treat it as indicative.
- **Win where a dark store loses.** Wide catchments, small baskets, credit, trust, local language and cash payment are cheap for a partner-store model and expensive for a dark-store model; section 4 turns each into a feature. A single small dark store stays available as a switchable fallback (section 7).
- **Do not promise 10 minutes.** The giants dropped the claim under regulatory pressure, and small-town customers do not reward it; promise a window you can keep.

## 3. Target towns, users and personas

Pick one town of roughly 30,000 to 1,50,000 people that no giant serves yet, win it end to end, and only then copy the playbook to the next town; many of the district towns Flipkart is entering are larger (from general knowledge), so aim below them. The population range is a working assumption to tune after the pilot.

**Town selection filters**

| Filter | Why it matters | How to check |
| --- | --- | --- |
| Not served by Blinkit, Zepto, Instamart, Minutes or Amazon Now | Otherwise you fight their catalogue and discounts on day one | Enter the town's pincodes in each app; check Minutes and Amazon Now city lists |
| Compact core, most homes within 3 to 4 km of the main market | Keeps delivery inside a 30 to 45 minute promise on two-wheelers | Draw a 4 km circle on a map around the main market and count wards inside it |
| Dense supply: many kiranas, dairy, vegetable and bakery shops in one market | Assortment without owning stock | Walk the market and count shops that already take WhatsApp orders |
| UPI and smartphone habit | Decides how much of your volume is prepaid | Count shops showing a UPI QR; ask 20 households which phone and data plan they use |
| Someone you trust on the ground daily | The pilot is operations-heavy, not code-heavy | A family or partner contact in the town |
| A wholesale source within about 30 km | Restocking staples and fresh produce for partner shops | Locate the nearest mandi or distributor |
| A shop-sized unit available near the centre | Needed only if you switch the town to a dark store | Ask three brokers for 600 to 1,000 sq ft rentals within 2 km of the main market and note the rent |

**Personas**

| Persona | What they do today | What they need | Product implication |
| --- | --- | --- | --- |
| Household buyer (homemaker, 28 to 50) | Calls or WhatsApps the kirana; walks to the market for vegetables | Fair price, freshness, trust, the usual shop's items | Shop-first browsing ("your shops"), reorder in one tap, local-language item names |
| Student, PG or young worker | Buys snacks and essentials on impulse, pays by UPI | Speed, late hours, small baskets | Scheduled and instant slots, UPI intent checkout, low delivery fee on small orders |
| Elder or low-tech user | Phones the shop; relatives order for them | A human voice, no typing | Call-to-order, voice and photo list orders, family ordering on a parent's behalf (a hypothesis to test) |
| Store partner (kirana, dairy, produce seller) | Takes orders on calls and WhatsApp, delivers with a helper, gives credit | More orders without losing control, quick payouts | Simple app that opens by voice or photo, daily payouts, no forced price changes |
| Rider (local youth, often part-time) | Informal delivery for shops, cash daily | Predictable pay, no delivery deadlines, same-day payout | Zone-based batching, no late penalties, daily payout, cash-in-hand handling |

**Who is already in this white space**

| Player | What it does | Note |
| --- | --- | --- |
| [BazaarNow](https://indiantelevision.com/mam/bazaarnow-raises-rs-72-crore-to-bring-quick-commerce-to-smaller-cities/) | Vernacular-first grocery for tier 2 and 3 with call-to-order and in-house riders; raised Rs 72 crore led by Peak XV (Jun 2026) | Claims 1,800+ orders a day per store in its pilot market and plans to expand to neighboring towns within 6 to 12 months |
| [KiranaPro](https://itln.in/e-commerce/kiranapro-becomes-first-ondc-powered-quick-commerce-company-1354510) | Hyperlocal model that connects kiranas directly to customers over ONDC | Company press release |
| [SuperK](https://yourstory.com/2024/08/tier-3-india-ready-dmart) | Upgrades partner kirana stores with stock, systems and brand | Offline-led model |
| [Ghar Tak](https://www.startinup.up.gov.in/crm/Welcome/startup_user_details/643963323966663936333764623065393762613933383532663934306137396235363338623030653534623766373361366461646430666261363265373832313432303562626461393034393339346135353830313338333136326138343232633839393735343065366431343939653261363630653031346635353364343370364b784a53657455756171586c34536636724647334b377677347675554c5337596d6c37474d303238303d) | Hyperlocal delivery in Kaimganj (Uttar Pradesh) with 13 vendors | Self-reported: about 48 orders a day, which is a realistic early benchmark |

The lesson from this table: the idea is not unique, so the moat is being first, local and cheap to run in towns the funded players reach last.

## 4. Town reality to product decisions

Every feature in this plan traces back to one of these ten patterns of small-town buying; if a feature cannot be traced to a row, it waits. The left column is a working assumption, so each row is tested in the manual pilot (section 12) before it is built.

| # | Town reality (assumption to validate) | Product decision | Where it shows up |
| --- | --- | --- | --- |
| 1 | Trust sits with the neighborhood shop, not an app | Shop-first marketplace: customers see "Sharma Kirana", not "Store 12"; regulars reorder from their usual shop | Stores are a first-class entity with their own catalogue, prices and hours |
| 2 | People already order by phone and WhatsApp; the Kiko Live claim puts call and WhatsApp delivery above 10% of kirana business ([Retail4Growth](https://retail4growth.com/news/will-ondc-and-its-enablers-drive-growth-of-kirana-e-commerce-6676), 2024) | WhatsApp ordering and call-to-order are launch features, not extras | Click-to-chat link per shop; chat orders land in the same order system |
| 3 | Low-end Android phones, patchy data, wary of installing apps | Web app (PWA) first, light pages, offline cart, install later | Small bundle, compressed images, tested on 2 GB RAM phones |
| 4 | Hindi, Marathi and other local languages; names like "atta", "dudh", "jeera" | Vernacular-first UI with typed-in-English-letters search ("dudh" finds milk) and voice search | Item alias table; language switch on first screen |
| 5 | Addresses are landmarks and mohallas, not street numbers; big catchments (Bain puts small-town catchments at 6 to 8 km, [Outlook Business](https://www.outlookbusiness.com/interviews/can-quick-commerce-scale-beyond-metros-flipkart-bain-execs-decode)) | Pin drop plus landmark text plus ward, always a call-the-customer button | Structured area field; driver app has one-tap call and WhatsApp location |
| 6 | Cash on delivery and UPI side by side; informal credit (udhaar) is normal | COD and UPI both first class; doorstep UPI QR; store credit only later and capped | Rider cash ledger; COD limits per new customer |
| 7 | Baskets are staples, milk and vegetables, bought often and in monthly lists | Monthly list and repeat orders; fixed morning and evening slots | Reorder, saved lists, subscriptions in V2 |
| 8 | Low order density means few orders per street per hour | Zone-based batching and delivery windows rather than one rider per order | Batch by ward; fee bands by distance; free delivery above a basket threshold |
| 9 | Certainty beats speed; PwC India says shoppers barely notice delivery faster than 30 minutes ([Business Standard](https://www.business-standard.com/industry/news/blinkit-zomato-tailor-quick-commerce-for-india-s-tier-2-tier-3-cities-125123000066_1.html)) | Promise a window ("by 7:30 pm") and keep it; no hard rider deadlines | Live status over WhatsApp; late-risk alerts to ops, not penalties to riders |
| 10 | Loose items sold by weight, with prices that move daily (vegetables) | Variable-weight items with a tolerance band and a final bill from the shop | Unit conversions, price override per shop, partial-fill and substitution flow |

Two more patterns shape operations rather than screens. Festivals, wedding season and weekly market days spike demand for specific items, so the admin panel needs seasonal collections. Shops lose power and signal, so the store portal needs a loud new-order alert, a retry queue and a phone-call fallback.

The same table is the answer to "why not just clone Blinkit": a dark-store app assumes dense demand, owned stock and a 10-minute promise; none of the three holds in these towns.

**Switchable by design.** Rows 1 and 10 change shape in dark-store mode (one branded store, weighing done in-house); rows 2 to 9 hold in both modes, which is why the customer app is built once and tested in both (section 12).

## 5. Product scope by phase

The MVP is one town, three apps (customer, admin with a store portal, driver) on one backend, and a manual fallback for anything not built yet; everything in V2 and V3 is earned by pilot data, not guessed.

| Area | MVP (phases 1 to 4) | V2 (phases 5 to 7) | V3 (after pilot data) |
| --- | --- | --- | --- |
| Customer | PWA: phone OTP login, shop list, search in Hindi or English letters, cart, pin and landmark address, COD and UPI, order tracking, reorder | WhatsApp order bot, saved monthly lists, scheduled slots, milk and vegetable subscriptions, ratings | Android app on Play Store, voice ordering in local language, ONDC visibility |
| Store partner | Store portal inside the admin app: accept or reject, mark ready, stock and price toggles, loud new-order alert, daily summary | Catalogue upload by photo or Excel, weight adjustment, payout statement, store-delivered orders | Store credit (khata) with limits, B2B restocking, store analytics |
| Rider | Ops assigns by phone and WhatsApp and marks Picked up and Delivered in admin on the rider's behalf | React Native app: auto-assign, batching, navigation hand-off, cash ledger, earnings screen | Incentives, shift planning, automated KYC |
| Admin and ops | Order board, store onboarding, catalogue editor, zones, manual assign, refunds, basic reports | Settlement and payout runs, cash reconciliation, festival collections, support inbox | Multi-town tenancy, demand forecast, fraud rules, AI ops assistant |
| Payments | COD, UPI through a gateway, refunds | Prepaid offer, doorstep UPI QR, reconciliation | Wallet or credits, ONDC settlement |
| Messaging | WhatsApp utility templates, SMS or WhatsApp OTP, web push | Rider and store push, ops alerts to a WhatsApp group | Smart nudges, reorder reminders |
| Trust | FSSAI number shown per shop, order OTP at delivery, bill photo | Ratings, complaint tracking, store quality score | Verified-shop badges |
| Fulfilment modes | Partner mode live in the pilot town; dark-store mode designed in contracts, data model and admin screens and switched off by a per-town setting | Dark-store mode live in the pilot town if the switch triggers in section 7 are met; goods receipt, stock counts and pick lists in daily use | Hybrid towns, expiry and wastage analytics, reorder suggestions, supplier price tracking |

**Deliberately not built yet**

- **More than one dark store per town, forecasting and auto-purchasing.** One dark store per town is supported by design and switchable by setting; more than one waits for proof that a single store runs above its break-even volume.
- **Native iOS app.** Android dominates in these towns by assumption; the PWA covers iPhones.
- **Wallet, coins, referral engine.** Discount machinery hides whether the product itself works; run one simple first-order offer.
- **Live ML delivery estimates.** Use fixed windows per zone until you have data.
- **Pharmacy, alcohol, electronics.** Each adds licenses and returns handling that a solo team cannot absorb.
- **AI support chat.** Human replies on WhatsApp teach you what customers actually ask.

## 6. The apps: customer, store, rider, admin

Build in this order: customer web app, then the admin panel (which includes the store portal), then the driver app; each starts as a mock-data UI phase and goes live in a second phase against the shared API. An order can hold items from several shops (ADR 0009): each shop packs only its own part, one rider collects from every shop on one trip, and the customer gets one delivery, one bill and one tracking page.

**Two modes, one UI.** Screens read the town's fulfilment mode: in partner mode Home lists shops, in dark-store mode Home opens straight into the one branded store; item availability is a toggle in one mode and a stock count in the other. Build each screen once and design both states in Phase 1.

### Customer web app (Next.js PWA)

- **Screens:** language and phone OTP; home with "Your shops", categories and a reorder strip; shop page with in-shop search; global search; cart; address; checkout; order tracking; past orders; help.
- **Search:** typed-in-English-letters Hindi and Marathi ("dudh", "aata"), spelling tolerance, voice search in V2.
- **Address:** map pin, landmark text, ward or mohalla, alternate phone number; serviceability checked against zone polygons.
- **Checkout rules:** minimum basket per zone, distance-band delivery fee, free delivery above a threshold, COD cap for new customers, per-item substitution choice, estimated weight bill with a stated tolerance.
- **Tracking:** status timeline, call shop, call rider, WhatsApp updates for every state change.
- **Delivery proof:** customer OTP or photo at the door; COD amount shown to the rider.

### Store partner portal (inside the admin app)

- **New order:** full-screen alert with a loud tone and a spoken announcement in the local language; big Accept and Reject buttons; prep-time chips (10, 15, 20 minutes).
- **Fulfilment:** mark an item unavailable (starts substitution or partial fill), adjust loose-item weight, mark ready, hand over with a rider code.
- **Shop control:** open or close, stock toggle, price edit inside an allowed band, holiday hours.
- **Money:** today's orders, payable amount, payout history.
- **Onboarding:** shop photos, FSSAI number, GST if applicable, bank or UPI account, hours, delivery radius.
- **Failure handling:** an order unaccepted for 90 seconds triggers an ops call; a shop that keeps missing orders is auto-paused.

### Driver app (React Native, phases 5 and 6)

- **Until the app ships:** ops assigns by call or WhatsApp and marks Picked up and Delivered in admin on the rider's behalf.
- **Driver app:** duty on and off, offer card (pickup, drop, distance, payout), hand-off to Google Maps or Ola Maps navigation, pickup code, call customer, drop OTP, show UPI QR, record COD cash.
- **Rules by design:** no countdown timers, no late penalties, up to 3 orders batched inside one ward, payout per delivery with a distance band, same-day payout.
- **Cash ledger:** every COD rupee collected is a liability until the rider deposits it; the app blocks new offers above a cash limit.

### Admin panel (Next.js, internal, role-based, with the store portal)

| Module | What it does |
| --- | --- |
| Order board | Live columns by state, late-risk highlights, call buttons, manual assign |
| Assisted order | A form for phone and WhatsApp orders so you can run the concierge version from day one |
| Stores | Onboarding checklist, document check, commission, hours, quality score |
| Catalogue | Master catalogue with Hindi and Marathi aliases, bulk import, image review |
| Zones | Draw delivery polygons, set fee bands, slots, minimums |
| Customers and support | Lookup, order history, refunds, COD risk flags, blocklist |
| Riders | Onboarding, documents, working-day count for gig-worker registration (section 11) |
| Finance | Payout runs, rider cash reconciliation, refunds, invoices |
| Content | Festival collections, banners, notices |
| Access and audit | Roles (owner, ops, support, finance), audit log of every change |

### WhatsApp channel (cross-cutting)

- **MVP:** the operator receives the chat and creates the order in the Assisted order form; customers get status updates through utility templates.
- **V2:** a parser turns "2 kg aloo, 1 litre dudh" into a draft order from the customer's usual shop and asks for a yes; the order then enters the same pipeline as any app order.

### Screen inventory and build order

Every screen below is designed and built on mock data first, then wired to the live API in the next phase; a feature without a row here waits.

| Surface and phases | Screens, in build order | Every screen must also have |
| --- | --- | --- |
| Customer app, phases 1 and 2 | 1 language and phone OTP; 2 home with Your shops, categories and reorder strip; 3 shop page; 4 search results; 5 item sheet (pack size, loose weight, substitution choice); 6 cart; 7 address and map pin; 8 checkout (slot, COD or UPI); 9 order tracking; 10 order history and reorder; 11 help; 12 profile and saved addresses | Loading, empty, error and offline states; Hindi and Marathi text, which often runs longer than English; 200% text size; the main action within thumb reach; every screen shown in both fulfilment modes |
| Admin panel and store portal, phases 3 and 4 | Admin: login; order board; order detail; Assisted order form; stores list and onboarding; catalogue editor; zone editor; customers and support; finance (payouts, cash close); content; staff and roles. Store portal: new-order alert; pack screen; availability and prices; today and payouts; shop profile. Dark-store console (enabled per town): goods receipt, stock list and counts, expiry and wastage, pick list, pack and handover, reorder list | The same four states; keyboard use; search and filters on every list; an audit trail on every change |
| Driver app, phases 5 and 6 | 1 login and duty switch; 2 offer card; 3 pickup with code; 4 navigation hand-off; 5 drop with OTP and COD amount; 6 UPI QR; 7 cash ledger and deposit; 8 earnings; 9 support and SOS | Large buttons usable on a bike stand; works on poor signal; no timers or penalties |

## 7. Operations model

Operations decide whether this works: onboard shops by hand, deliver with a handful of paid riders, and settle cash every night.

&#91;embedded content: order lifecycle · 5 states, 3 exceptions\]

The three dashed exits are the cases ops handles by phone in the MVP; the app only needs to record how each one ended.

| Area | Pilot rule | Why |
| --- | --- | --- |
| Shop onboarding | Visit each shop in person, verify the FSSAI number, take photos, set up a UPI payout and train the owner in 15 minutes; start with 8 to 10 strong shops (a dairy, two large kiranas, a vegetable seller, a bakery, a general store) | Trust is local, and the person who visits is the product |
| Catalogue | One master catalogue of about 800 to 1,500 fast-moving items with local names; shops opt in per item and set a price at or below MRP; loose items sold per kg or per piece | Stops every shop typing its own catalogue and keeps search clean |
| Stock | No stock counts; shops toggle available or unavailable, and an item auto-pauses after two cancellations | Real stock sync is unsolved at kirana level; availability is the workable version |
| Pricing | Weekly check against three nearby shops; flag any shop more than 5% above market | Protects the "fair price" promise |
| Delivery | 5 to 10 riders paid per delivery; shop helpers deliver within 1 km for a lower fee; zones by ward; peak windows 7 to 10 am and 5 to 9 pm | Matches low density and avoids paying idle time |
| Cash | Rider carries COD and deposits by UPI each night; new offers block above a cash limit (start at Rs 3,000); ops closes every day against the ledger | Cash is the largest leakage risk |
| Substitution | Customer picks per item: substitute, remove, or call me; a price rise above 10% needs consent | Prevents disputes at the door |
| Refunds | Damaged or wrong items refunded to source within 24 hours; perishables need a photo; cost follows fault (shop, rider or platform) | Keeps disputes cheap and traceable |
| Support | One WhatsApp number and phone line, 8 am to 10 pm; every ticket linked to an order | Human replies teach you what to build next |
| Shop quality | Weekly score on acceptance, fill rate, cancellations, complaints and price; coach or pause the bottom 10% | Supply quality is the product |

Every number in this table is a working default to tune with pilot data.

### Dark-store mode: one store per town

Switching a town to dark-store mode adds one company-owned store with counted stock; the customer app, riders, payments and order flow do not change.

| Area | Dark-store rule (working default) | Why |
| --- | --- | --- |
| Premises | One 600 to 1,000 sq ft unit within 2 km of the main market, ground floor, easy loading; rent budget about Rs 25,000 a month | Close to demand keeps delivery inside the window; small keeps fixed cost low |
| Assortment | The 300 fastest items plus daily milk, vegetables and bakery; widen only on request data | A few items drive most orders; slow items become dead stock |
| Sourcing | Packaged goods weekly from a wholesaler or cash-and-carry; milk and vegetables daily; cap stock cover at about 7 days | Limits cash tied up and expiry |
| Receiving | Every delivery logged as a goods receipt with batch and expiry; first-expiry-first-out; cold storage for milk and curd | Traceability for FSSAI and fewer expired items |
| Picking and packing | One pick list per order sorted by shelf; aim for 8 minutes from accept to ready; substitutions need consent exactly as in partner mode | Speed without dark-store scale |
| Stock control | Daily count of the 30 fastest items and a weekly full count; adjust only through logged movements | Keeps the on-hand number trustworthy |
| Wastage | Under 3% of sales; mark down short-dated items before they expire | Fresh categories decide margin |
| Pricing | At or below MRP; weekly check against three nearby shops | Same fair-price promise as partner mode |
| Staffing | A manager, 3 pickers and packers, 2 or 3 riders; shop-and-establishment rules apply | Roughly Rs 64,000 a month of staff cost in the section 14 sketch |
| Cash | Pay suppliers weekly; hold no more than about Rs 6 lakh of stock; COD handled as before | Working capital is the new risk |

**When to switch (working triggers)**

| Signal | Threshold | Why it matters |
| --- | --- | --- |
| Shops accepting within 90 seconds | Below 60% for 4 weeks despite coaching | Partner supply cannot keep the promise |
| Fill rate | Below 85% for 4 weeks | Stock-outs at partner shops hurt reorders |
| Demand density | 100+ orders a day for 2 weeks, still growing, inside one 3 km radius | Within reach of the dark-store break-even in section 14 |
| Order concentration | The top 300 items make up roughly 70% of orders | A small assortment can serve most demand |
| Cash available | About Rs 9.6 lakh: three months of fixed cost plus a stock float, per the section 14 sketch | A dark store burns cash before it breaks even |
| Premises and licences | Unit identified and FSSAI route clear (section 11) | A switch cannot wait on paperwork |

**How to switch**

1. Freeze new shop onboarding and tell partner shops the date.
2. In admin, create one store of type dark, owned by the company, with counted stock and auto-accept on; load opening stock as goods receipts.
3. Run both modes for two weeks and compare fill rate, on-time rate and contribution per order.
4. Set the town's fulfilment mode to dark; partner shops are hidden but their data is kept.
5. Orders in flight finish under the store they were placed with.
6. To go back, reverse steps 2 to 4 and sell the remaining stock down first.

You may switch earlier for strategic reasons; the plan supports it, and section 14 shows what it costs.

## 8. System architecture

Three apps share one API and one database; payments, messaging and maps are rented, and the only custom infrastructure is a worker for timers and sends.

&#91;embedded content: architecture · 4 clients, 12 modules, 4 data blocks, 3 external services\]

Dashed boxes are rented services; swapping any one of them should touch one module.

**Design rules**

- **Modular monolith, one deployable.** One NestJS codebase with a module per chip above; split a module out only when it needs different scaling or a different team.
- **Orders are a state machine.** Every transition is an append-only row in `order_events` (who, what, when, why), and guards stop impossible moves such as Delivered before Picked up.
- **Money is integers.** Store paise as integers; every payment, commission, payout, refund and COD deposit is a ledger entry, never an edited balance.
- **Everything is retryable.** Idempotency keys on order creation, payments and webhooks; the store portal and driver app queue transitions offline and replay them.
- **Timers are jobs.** The 90-second accept timeout, the ready timeout and unassigned-order alerts run as delayed jobs so a restart does not lose them.
- **Real time, cheaply.** Server-sent events for customer tracking, push plus a socket for store and rider alerts, WhatsApp for everything the customer should see outside the app.
- **Config lives in the database.** Zones, fee bands, slots, minimums and COD limits sit in tables with admin screens, not in code.
- **Multi-town from day one.** A `town_id` on every business table is cheap now and painful to retrofit.
- **Security basics.** OTP rate limits, role-based access, signed upload URLs, an audit log of admin actions and minimal personal data (section 11).

**Fulfilment mode is configuration.** `town.fulfilment_mode` (partner, dark or hybrid) and `store.stock_mode` (toggle or counted) decide supply behaviour. Order, payment, dispatch and ledger code never branch on them; one small `FulfilmentStrategy` per module covers the differences in availability, accept, pick and settle.

## 9. Tech stack

Use TypeScript end to end on a PostgreSQL-backed modular monolith, with web apps first and React Native only where the phone's hardware demands it. This keeps one language, one repo and one deploy for a solo builder, and every choice below is a skill employers hire for.

| Layer | Choice | Why | Later or alternative |
| --- | --- | --- | --- |
| Repo | pnpm and Turborepo monorepo: `apps/` (customer-web, admin, driver, api, worker) and `packages/` (contracts, mocks, db, ui, i18n, config) | Shared types between API and apps; Claude Code navigates a typed monorepo well | Nx |
| Customer web | Next.js (App Router), TypeScript, Tailwind, PWA service worker, next-intl for Hindi, Marathi and English, TanStack Query | Server-rendered shop pages give WhatsApp link previews and fast first load; no install needed | Vite and React if you drop SSR |
| Admin panel | Next.js, shadcn/ui, TanStack Table, React Hook Form, Zod | Fast to build CRUD-heavy internal tools; also hosts the store portal as a role-based route group | Retool for week-one prototyping |
| Store portal | Role-based portal inside the admin app with web push and a sound alert; React Native (Expo) with high-priority push later if alerts prove unreliable | A PWA cannot guarantee a loud alarm on a locked phone, so keep a phone-call fallback until the native app ships | Capacitor wrapper |
| Driver app | React Native (Expo) with a foreground location service | Reliable background GPS needs a native app | Native Kotlin if scale demands it |
| Backend | Node.js, NestJS, REST with OpenAPI, Zod validation, BullMQ for jobs | NestJS enforces the module boundaries a monolith needs and is widely hired for | Express or Fastify for less ceremony |
| Database | PostgreSQL with PostGIS (zone polygons) via Prisma or Drizzle | Orders, stock toggles and the ledger need multi-row transactions, joins and reporting | MongoDB works for a demo but you would rebuild the ledger on SQL |
| Cache and queue | Redis (Upstash or managed) | Rate limits, sessions, job queue, locks | None needed |
| Search | Postgres full-text plus trigram matching plus an alias table | No extra service below roughly ten thousand items | Typesense or Meilisearch |
| Auth | Phone OTP (WhatsApp first, SMS fallback), short-lived JWT with refresh, role-based access | No passwords for low-literacy users | Truecaller one-tap later |
| Payments | Razorpay or Cashfree for UPI, refunds and payouts; COD tracked in your own ledger | Fastest to integrate; fees matter, see section 11 | PhonePe PG |
| Messaging | WhatsApp Business Platform through a provider or Meta Cloud API; SMS through a DLT-registered sender; FCM for push | WhatsApp is the main channel in these towns | Telegram for ops alerts |
| Maps | Ola Maps or Google Maps Platform for autocomplete, geocoding and directions; MapLibre to draw maps; wrap behind a `MapsProvider` interface | Controls cost; small-town address data is weak everywhere, so rely on pin drop | Mappls |
| Files | Cloudflare R2 (S3-compatible), client-side image compression | Cheap storage and egress | S3 |
| Hosting | Web on Vercel or Cloudflare; API and worker on Render, Railway or Fly; PostgreSQL in a Mumbai region | Low latency from India, little ops work | AWS ap-south-1 when you outgrow it |
| Observability | Sentry for errors, PostHog for analytics and feature flags, uptime monitor, structured logs | See problems before customers call | Grafana stack later |
| Quality | GitHub Actions, Vitest, Playwright covering the full order flow, lint hooks, preview deploys | Production habits you can show in interviews | k6 load test before launch |
| AI layer (V2+) | An LLM to parse WhatsApp orders and turn shelf or price-list photos into catalogue entries, behind a service with human fallback | Real operational value and strong interview material | Voice ordering in local language |

**UI-first tooling**

- **Design tokens and components:** colours, type scale, spacing and motion as CSS variables with a Tailwind preset in `packages/ui`; Storybook with the accessibility add-on documents every component and every state.
- **Contracts and mocks:** `packages/contracts` holds a Zod schema for every request and response; `packages/mocks` serves them through MSW so screens run with no backend, and the real API later implements the same contracts.
- **Tests that carry over:** Playwright runs the same flow against the mock API and later the real one; axe and Lighthouse checks run in CI.
- **Design review:** judge screens in a browser on a real low-end Android phone with throttled network; Figma is optional and only useful if you want to iterate on layout before coding.

**Skip for now:** microservices, Kubernetes, GraphQL, Kafka, custom payment handling, a native iOS app. Each adds cost without helping a one-town pilot.

**Cost at pilot scale:** roughly Rs 3,000 to 8,000 a month for hosting, database and tooling, before messaging and payment fees. This is an approximate figure from general knowledge, so check current plans before budgeting.

**Plain-English decoder**

- **Modular monolith:** one application with clearly separated rooms inside, instead of many small applications.
- **Queue and worker:** a to-do list for background jobs, and the helper that works through it.
- **Idempotency key:** a unique tag so that sending the same request twice has the same effect as once.
- **Ledger:** a notebook where money is only ever added as new lines, never erased or edited.
- **PWA:** a website that installs like an app and still opens on a weak network.

## 10. Core data model

The model is about 23 tables, five of them used only in dark-store mode; the hard parts are the order snapshot, weighed items, the zone check and the ledger, not the table count. Every business table carries `town_id`, and all money is stored as integer paise.

| Entity | Key fields | Notes |
| --- | --- | --- |
| `town` | name, state, status, fulfilment\_mode (partner, dark, hybrid), settings | The tenant; one row per launched town |
| `zone` | town\_id, polygon, fee bands, minimum order, slots | PostGIS polygon; drives serviceability and fees |
| `user` | phone (unique), name, role, language | One table for customers, store owners, riders and staff |
| `address` | user\_id, zone\_id, lat, lng, landmark, ward, alt\_phone | Zone is computed when saved |
| `store` | type (partner or dark), stock\_mode (toggle or counted), owner, name, FSSAI number, GST number, location, hours, status, commission, auto\_accept, self\_delivery | Status: onboarding, active, paused |
| `master_item` | names in en, hi, mr; brand; unit type; pack size; MRP; category | The shared catalogue |
| `item_alias` | item\_id, alias, language | Powers "dudh" finding milk |
| `store_item` | store\_id, master\_item\_id, price, available, max\_qty, sold\_by\_weight, tolerance | Availability toggle in partner mode; in dark-store mode the count is derived from stock movements |
| `order` | customer, address snapshot, status, payment method and status, totals, promised\_by | One order, one delivery, however many shops it has |
| `order_shop` | order\_id, store\_id, status (placed, accepted, packed, picked up, rejected), subtotal, packed\_at, picked\_at | The part of the order one shop packs; the store portal and pick tasks work on this row |
| `order_item` | order\_shop\_id, name and price snapshot, ordered qty, final qty, final price, substitute\_of | Final values come from weighing and packing |
| `order_event` | order\_id, from and to status, actor, reason, time | Append-only; the audit trail |
| `payment` | order\_id, provider, provider\_ref, amount, status, idempotency\_key | One row per attempt |
| `delivery` | order\_id, rider\_id, delivered\_at, distance, payout, COD collected, proof | One per order; the pickups are the order's `order_shop` rows. Batch id when orders share a ride |
| `rider` | user\_id, vehicle, documents, status, cash\_in\_hand, engagement\_days | Engagement days support the gig-worker rules in section 11 |
| `ledger_entry` | account, debit or credit, amount, ref type and id | Double-entry; never edited |
| `payout` | party (store or rider), period, amount, status, bank reference | Created by a settlement run |
| `refund` | order\_id, amount, reason code, fault (shop, rider, platform, customer) | Fault decides who bears the cost |
| `ticket`, `audit_log`, `notification_log` | order link, actor, before and after, provider message id | Support and traceability |
| supplier | name, contact, GSTIN, payment terms | Dark-store mode only |
| goods\_receipt | store\_id, supplier\_id, invoice number, lines (item, qty, cost, expiry), received\_by | One receipt creates stock batches and movements |
| stock\_batch | store\_id, item\_id, qty\_on\_hand, cost, expiry, received\_at | Picked first-expiry-first-out |
| stock\_movement | store\_id, item\_id, batch\_id, type (receipt, reserve, release, pick, wastage, adjustment, return), qty, reference | Append-only; on-hand is derived from it |
| pick\_task | order\_shop\_id, picker\_id, status, picked and short lines, started and finished at | One per order\_shop in dark-store mode |

**The hard parts**

1. **Snapshots.** Copy item names, prices and the address into the order at placement so later edits never rewrite history.
2. **Weighed items.** Store the ordered quantity and the final quantity. For prepaid orders in the MVP, take payment only after the final bill, or limit prepaid to fixed-price items.
3. **Availability or counted stock.** A toggle plus `max_qty` and a daily cutoff prevents most overselling in partner mode; in dark-store mode available stock is on hand minus reserved, derived from stock movements, with a reservation at checkout that is released on cancel or timeout.
4. **Zone check.** Point-in-polygon on the saved pin decides serviceability, fee band and slots; block checkout outside every zone.
5. **One state machine.** All transitions go through a single function with a table of allowed moves per actor; nothing updates `status` directly.
6. **Ledger accounts.** Use accounts such as customer receivable, rider cash, store payable, platform revenue and gateway clearing; every order creates balanced entries, and a COD rupee stays on the rider's account until the nightly deposit clears it.
7. **Idempotency.** Unique keys on order creation and payment attempts, and the provider's event id on webhooks, so retries never double-charge or double-credit.
8. **Personal data.** Keep Aadhaar-linked rider documents and consent records in a separate access-controlled table with retention rules (section 11).

**Switching modes is data, not code.** To start a dark store, create one store row of type dark with counted stock, load opening stock as goods receipts and set the town's fulfilment mode; to go back, reverse it. Orders in flight keep the store they were placed with.

## 11. Compliance and money

Three rules change the build: a food-ordering platform needs its own FSSAI licence, platforms that engage riders now have gig-worker reporting duties, and collecting customers' money for shops can make you a payment aggregator. This is a map of what to ask a CA and a lawyer, not legal advice; items marked "from general knowledge" were not verified in this research.

| Area | What applies | What the product must do |
| --- | --- | --- |
| FSSAI | A platform that lists food and also takes orders needs a Central licence regardless of turnover, per excerpts of the [FSSAI e-commerce direction](https://foodsafetyhelpline.com/?p=75407); the licence does not automatically cover each shop. A secondary source puts the fee near Rs 7,500 on [FoSCoS](https://www.lawrbit.com/industry-specific/fssai-license-ecommerce-food-business/) | Store each shop's FSSAI number, block shops without one, show it on every listing; confirm the exact route on FoSCoS before launch (the FSSAI PDF itself did not open during research) |
| Gig and platform workers | The Code on Social Security came into force on 21 November 2025 and the Social Security (Central) Rules took effect on 8 May 2026: aggregators register workers on a government portal in real time or daily, update details quarterly, file a provisional contribution by 30 June and a final statement by 31 October, with 1% monthly interest on delays; workers qualify after 90 days with one aggregator or 120 across several ([MediaNama](https://www.medianama.com/2026/05/223-social-security-central-rules-2026-gig-workers-90-days-work/)). Food and grocery delivery is a listed category and the contribution is capped at 5% of payouts to workers ([Taxmann](https://www.taxmann.com/post/blog/analysis-aggregator-obligations-code-on-social-security/)) | Capture rider identity with consent, count engagement days per rider, keep an export ready for the portal; ask a labour-law CA whether a one-town startup is covered and what the notified rate is |
| 10-minute promise | The labour ministry persuaded platforms to drop 10-minute branding in January 2026 ([Storyboard18](https://www.storyboard18.com/amp/how-it-works/govt-pulls-brakes-on-10-minute-delivery-forces-quick-commerce-rethink-87542.htm)) | Promise delivery windows, never minutes, and never penalise riders for lateness |
| Data protection (DPDP) | The DPDP Rules were notified in November 2025; consent-manager rules start about a year later and the main duties (notice, consent, breach reporting within 72 hours, children's data) apply from about 13 May 2027 ([Hogan Lovells](https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)) | Plain-language privacy notice, consent log, data deletion on request, retention schedule, minimal data from day one |
| Payments and aggregation | From 15 October 2026 UPI payments above Rs 2,000 attract 0.4% MDR; payments up to Rs 2,000 and small P2PM merchants stay at zero ([Inc42](https://inc42.com/?p=572596)). Gateways still charge their own fee; Razorpay's blog states a standard platform fee of 2% plus 18% GST ([Razorpay](https://razorpay.com/blog/upi-charges-explained-mdr-vs-platform-fees/)) | Use the gateway's split-settlement product so shop money settles without passing through your account (from general knowledge: holding customers' funds to pay shops later can need RBI payment-aggregator authorisation); keep COD and doorstep UPI QR first class to control fees |
| Tax at source | From general knowledge: e-commerce operators have GST TCS and income-tax TDS duties on sales they facilitate, plus GST on commission and delivery fees | Record every order with GSTIN, HSN and tax split; ask a CA for rates and filing dates |
| Consumer rules | From general knowledge: the Consumer Protection (E-Commerce) Rules, 2020 require a grievance officer, seller and price disclosure and a stated refund policy; Legal Metrology rules govern MRP and weighing scales | Footer with grievance contact, refund policy page, MRP and net quantity on listings, shops use verified scales |
| Messaging | SMS needs DLT registration of sender and templates (from general knowledge); WhatsApp needs a verified business and approved templates; Meta's October 2026 reports put utility messages near Rs 0.115 and marketing near Rs 0.86 each before GST ([TelecomTalk](https://telecomtalk.info/whatsappbusiness-price-reveal-telegram-arattai-may-benefit/1012403/)) | Send order updates as utility templates, keep promotions opt-in and rare |
| Dark-store mode | From general knowledge and FSSAI direction excerpts: an inventory-based e-commerce operator owns the stock it sells, unlike a marketplace; the premises need their own licence or registration and cold-chain hygiene; you become the seller, so you issue GST invoices and claim input credit on purchases, and the marketplace payment-aggregator and TDS questions mostly fall away for your own sales; shop-and-establishment registration, fire safety and labour rules apply to the unit | Number invoices per order, keep batch, expiry and supplier records, feed goods receipts to GST input claims, and add a licence-expiry reminder per store in admin; confirm every point with a CA before switching |

**Before the pilot launches**

- [ ] Entity chosen and registered; GST, Udyam and shop-and-establishment registrations done
- [ ] FSSAI Central application filed; every pilot shop's FSSAI number collected
- [ ] Gateway account with split settlement approved
- [ ] DLT sender and WhatsApp templates approved
- [ ] Terms of use, privacy notice, refund policy and rider agreement drafted by a lawyer
- [ ] One hour with a CA on TCS, TDS and gig-worker contribution

## 12. Where to start and in what order

Build UI first, one surface at a time: customer app, then admin panel with the store portal, then driver app; each surface gets a mock-data UI phase and a live phase, and the next phase starts only when its gate passes with no open blocker or major defects.

| Phase (weeks) | Build | On the ground | Gate to pass before the next phase (working targets) |
| --- | --- | --- | --- |
| Manual pilot (1 to 3, in parallel) | One-page site with a WhatsApp order button, a sheet for orders, a UPI QR | Sign 8 to 10 shops, take real orders, deliver with 2 or 3 riders | 100+ orders, shops accept 90%+, 25%+ of customers reorder, 85%+ delivered in the promised window, customers accept the delivery fee |
| 0. Foundation (1 to 2) | Monorepo, tooling, design tokens and UI kit, contracts package (with the fulfilment-mode types), mock API, CI (the Phase 0 prompt in section 16) | Collect shop photos and real item names for fixtures | Install, lint, typecheck, test, build, Storybook and the smoke e2e all pass on a clean clone; CI green; no open defects |
| 1. Customer UI on mock data (3 to 5) | Every customer screen and state from section 6, Hindi and Marathi, both fulfilment modes, PWA shell, mock API, Playwright flows | Show the clickable build to 5 households and 3 shop owners | 5 of 5 testers place a mock order unaided in both fulfilment modes; axe shows no serious issues; Lighthouse mobile 90+ on key screens; usable on a 2 GB Android phone with throttled network; zero open blocker or major defects |
| 2. Customer live (6 to 8) | NestJS API, PostgreSQL schema (including the stock tables), OTP auth, catalogue, cart, order state machine, COD and UPI in test mode, ops inbox and WhatsApp alerts; mocks swapped for the API | Pilot-town customers start ordering in the app; ops handles each order from the ops inbox | Contract tests pass; real orders complete end to end; payment and refund reconcile to zero; no double charge on retry |
| 3. Admin UI on mock data (9 to 10) | Every admin, store-portal and dark-store-console screen and state, role-based layout, mock data | One operator and 3 shop owners try the screens | Operator and shop owners finish their tasks unaided; same accessibility and performance bars; zero open blocker or major defects |
| 4. Admin live (11 to 13) | Assisted order, order board, store onboarding, catalogue, zones, finance basics, store alerts with the 90-second timeout; dark-store console (receiving, stock counts, pick lists) behind a per-town switch | Move every pilot order and shop onto admin and retire the sheet | All pilot orders run in admin; 80%+ accepted inside 90 seconds; every admin change appears in the audit log; a test town switches from partner to dark-store mode and back with no code change |
| 5. Driver UI on mock data (14 to 15) | Every driver screen and state in Expo on mock data | 3 riders walk through a mock delivery | 3 of 3 riders complete a mock delivery unaided; usable one-handed on a bike stand; zero open blocker or major defects |
| 6. Driver live (16 to 18) | Offers, batching, location, drop OTP, UPI QR, cash ledger, earnings | Move riders onto the app; nightly cash close | Cash reconciles to zero daily for a week; 90%+ delivered inside the window |
| 7. Harden and replicate (19 to 21) | Monitoring, backups, load test, runbooks, town setup by configuration | Pick town two using the section 3 filters | Backup restore tested; load test passes; town two launches with under a week of engineering |

Why this order:

- **Customer first.** The screens decide what the API must do; a signed-off screen turns backend work into a known target.
- **Mock data, then real data.** UI phases run on a mock API built from the same Zod contracts the real API will implement, so going live is a swap, not a rewrite.
- **Admin second.** Ops needs a tool before riders arrive, and the store portal lives inside it so shops get a surface without a fourth app.
- **Driver last.** One or two riders can be run by phone and WhatsApp until volume justifies the app; admin marks Picked up and Delivered for them.
- **Gates are hard.** A failed gate stops the next phase: fix, retest on a clean install, tag the release, then continue.
- **The cost of this order.** No real order flows end to end before phase 2, and none runs without a spreadsheet before phase 4; the manual pilot and the ops inbox cover that gap.

**Switching to a dark store mid-build.** Because fulfilment mode is a per-town setting, you can switch between any two phases once the section 7 triggers are met; phases 3 and 4 build the dark-store console, so the switch needs configuration and opening stock, not new code.

Timing note: Diwali falls around 8 November 2026 (check your local calendar). Shops are busiest and festival items spike demand, so read pilot retention numbers from that week with care.

## 13. 21-week roadmap and launch checklist

Customers place real orders in the app from 7 December, admin runs every order from 10 January, and the driver app goes live by 14 February; each surface's UI is signed off before its live phase starts.

&#91;embedded content: typed in chat · 9 phases and 3 milestones, Oct 2026 to Mar 2027\]

Each phase ends with a gate review on its last day: run the checklist, fix every defect, tag the release, and start the next phase on Monday. Diwali and your own availability will move these dates.

**Checklist before the first in-app customer order**

- [ ] 8 to 10 shops live with FSSAI numbers on file
- [ ] 2 or 3 riders with signed agreements; cash limit and nightly deposit rule set
- [ ] Delivery zones drawn; fee bands and minimum basket set
- [ ] Gateway tested in live mode, including one real refund
- [ ] WhatsApp templates approved and SMS fallback tested
- [ ] Database backup restored once in a test; error alerts reach your phone
- [ ] Support line staffed from 8 am to 10 pm
- [ ] Fallback rehearsed: ops can take any order by phone and enter it in the ops inbox within minutes
- [ ] Privacy notice and refund policy pages published

## 14. Metrics and unit economics

At base assumptions one order earns about Rs 2 and a town needs roughly 870 orders a day to break even, which no small town delivers; with realistic levers it needs about 71, so the pilot's job is to prove the levers, not to add features. Every number here is an illustrative assumption to replace with pilot data.

**One order, worked example**

| Line | Base (Rs per order) | With levers (Rs per order) | Assumption |
| --- | --- | --- | --- |
| Basket value | 350 | 450 | Bain expects lower spend per order in small towns ([Outlook Business](https://www.outlookbusiness.com/interviews/can-quick-commerce-scale-beyond-metros-flipkart-bain-execs-decode)), so 450 is a stretch to test |
| Commission from shops | 24.5 | 40.5 | 7% against 9%; the most contested number, so test 5, 7 and 9% with shops |
| Delivery and small-basket fees | 20.0 | 25.0 | A free-delivery threshold keeps the average below the headline fee |
| **Revenue** | **44.5** | **65.5** | Sum of the three lines above |
| Rider cost after batching | 27.7 | 20.0 | Rs 36 per trip divided by 1.3 or 1.8 orders per trip |
| Payment gateway | 5.2 | 6.7 | 60% prepaid at 2% plus 18% GST on basket and fee |
| Messaging and OTP | 1.0 | 1.0 | About four utility messages plus occasional SMS |
| Refunds and shrink | 5.3 | 6.8 | 1.5% of basket value |
| Support | 3.0 | 3.0 | One part-time agent spread across volume |
| **Contribution per order** | **2.3** | **28.0** | Revenue minus the five costs above |
| **Break-even orders per day** | **about 870** | **about 71** | Rs 60,000 fixed cost a month (town manager 25,000, support 15,000, tools 8,000, local marketing 12,000) divided by contribution times 30 days |

&#91;embedded content: illustrative assumptions typed in chat · two scenarios, 25 to 150 orders a day\]

Commission, batching and basket size move the result most; test them in that order.

**Same basket, dark-store mode (illustrative)**

| Line | Partner stores, with levers (Rs per order) | One dark store (Rs per order) | Assumption |
| --- | --- | --- | --- |
| Basket value | 450 | 450 | Same basket in both modes |
| Commission or margin | 40.5 | 49.5 | 9% commission against an 11% gross margin on items bought from a wholesaler |
| Delivery and small-basket fees | 25.0 | 25.0 | Same |
| **Revenue** | **65.5** | **74.5** | Sum of the three lines above |
| Rider cost after batching | 20.0 | 20.0 | Same |
| Payment gateway | 6.7 | 6.7 | Same |
| Messaging and OTP | 1.0 | 1.0 | Same |
| Wastage and shrink | in refunds line | 13.5 | 3% of basket; milk, vegetables and bakery drive it |
| Refunds | 6.8 | 6.8 | 1.5% of basket; includes shrink in partner mode |
| Support | 3.0 | 3.0 | The manager absorbs more of this in a dark store |
| **Contribution per order** | **28.0** | **23.5** | Revenue minus the costs above |
| Fixed cost per month (Rs) | 60,000 | 119,000 | Dark store: manager 22,000, three pickers 42,000, rent 25,000, utilities and tools 12,000, stock financing 6,000, local marketing 12,000 |
| **Break-even orders per day** | **about 71** | **about 169** | Fixed cost divided by contribution times 30 days |

In this sketch a dark store roughly doubles fixed cost and needs about 2.4 times the daily orders to break even, and it ties up about Rs 6 lakh of stock (roughly a week of sales) that the table does not show. It buys control of availability and fill rate, the retail margin instead of a commission, and no commission dispute with shops. The sketch is far smaller than the giants' stores, whose tier 2 break-even is about 800 orders a day (section 2) because their stores are larger and discount-heavy.

**Dark-store metrics to add (working targets)**

- Stock accuracy of 98% or better on the weekly full count
- Wastage under 3% of sales
- Under 8 minutes from accept to ready
- 97% or better shelf availability on the top 100 items
- Stock cover of about 7 days or less

**Metrics to watch (working targets, tune with pilot data)**

| Metric | Aim for | Why it matters |
| --- | --- | --- |
| Shop acceptance within 90 seconds | 80% or more | Missed orders cost trust fastest |
| Fill rate (items delivered divided by items ordered) | 92% or more | Stock-outs are the biggest leak in quick commerce |
| Orders delivered inside the promised window | 90% or more | Certainty is the promise |
| Cancellation rate | under 5% | Signals supply or dispatch problems |
| Refund rate | under 2% of orders | Quality and accuracy |
| 14-day repeat rate | 25% in the manual pilot, 40% later | Habit is the whole business |
| Orders per rider trip | 1.5 or more | Drives rider cost, the largest variable cost |
| COD cash variance | zero at each nightly close | Cash discipline |
| Contribution per order | positive after levers | Proof the model can pay for a town |
| Orders per day per town | at or above the break-even line | The only number that matters at scale |

## 15. Risks, what the brief missed, and open decisions

The biggest risk is not technical: it is that unit economics, shop adoption or a giant's arrival undo the pilot before the software matters. Treat this as a five-month experiment with a stop or continue gate at the end of the manual pilot.

| Risk | Mitigation | Early signal |
| --- | --- | --- |
| A giant or funded player reaches the pilot town early | Pick towns they reach last; compete on shop relationships, credit later, local language and call-to-order; check the Minutes and Amazon Now city lists monthly | A competitor's app starts serving your pincodes |
| Unit economics never turn positive | Prove the levers in section 14 in the pilot; cap fixed cost; fall back to selling the ordering tools to shops (software for kiranas) | Contribution per order stays under Rs 10 after 8 weeks |
| Shops drift back to phone orders | In-person training, loud alerts, Assisted order fallback, weekly shop scores | Acceptance within 90 seconds below 60% |
| Rider cash leakage or fraud | Cash limits, nightly close, ID checks, small first-order COD cap | Variance at any nightly close |
| Solo bandwidth: code and operations at once | Time-boxed phases with hard gates, part-time ops helper from week 4, strict scope per phase | Releases slip two weeks in a row |
| Rules shift (gig-worker contribution, DPDP, UPI fees) | Fees, thresholds and consent text stay configurable; one CA review before launch | New notification affecting aggregators |
| Food-safety incident | FSSAI-licensed shops only, milk and dairy handling rules, a recall switch in admin | Any complaint about spoilage |
| Pilot data distorted by Diwali | Compare against the same festival week later and read retention after it | Spike then collapse in orders |
| UI-first leaves no real order flow until phase 2 and no spreadsheet-free operations until phase 4 | Run the manual pilot in parallel; phase 2 includes an ops inbox and WhatsApp alerts; hold each phase to its window | Orders sit unanswered in the ops inbox |
| Mock data drifts from the real API | One contracts package feeds both the mock API and the real API; contract tests run in CI; screens never import fixtures directly | A bug in a live phase that the mock phase never showed |
| Gates drag on or get waved through | Time-box each gate to its phase window; only blocker and major defects stop a gate; log minor ones and fix them in the next phase's first week | A phase runs two weeks over, or a gate passes with known defects |
| Switching to a dark store before volume, burning cash on rent, staff and stock | Switch only on the section 7 triggers; cap stock at about 7 days; start with 300 items; run both modes for two weeks; keep the reverse path rehearsed | Wastage above 3% of sales or stock-outs on top items |
| Mode-specific logic leaks into shared code | A FulfilmentStrategy boundary per module; CI runs the whole order flow in both modes | A branch on fulfilment mode appears in order, payment, dispatch or ledger code |
| Dark-store stock counts drift from reality | Daily counts of fast items, a weekly full count, every adjustment logged with a reason | Variance above 2% on a weekly count |

**Things the brief did not mention but the build needs**

- **Shop agreement:** commission, payout day, price rules and a penalty-free exit.
- **Fraud and abuse controls:** COD no-shows, fake pins, repeated refunds, rider and shop collusion, a blocklist.
- **Acquisition plan:** shop-door QR posters, neighbourhood WhatsApp groups, PG and hostel tie-ups, local ambassadors, and Meta click-to-WhatsApp ads as the natural paid channel.
- **Analytics from day one:** an event plan covering visit, add to cart, checkout, paid, delivered and reorder, so every funnel drop is visible.
- **Elder-friendly design:** large type, icon-led screens, a phone number on every page.
- **Operations kit:** runbooks, backups, an on-call phone, feature flags, a status page.
- **Rider safety:** accident insurance, no timers, helmet and licence checks.
- **Brand and legal basics:** name search and trademark check, domain, terms and privacy pages.
- **Replication checklist:** a written playbook so town two is configuration plus a field visit.
- **Competitor response plan:** decide now whether you stay a local specialist or become a delivery or franchise partner if a giant arrives.

**Open decisions for you**

- [ ] Which town is first, and who is your person on the ground there?
- [ ] Brand name and launch languages (Hindi, Marathi or another)
- [ ] Bootstrap the pilot or raise money (BazaarNow raised Rs 72 crore for a similar thesis, so a solo pilot competes on cost, not capital)
- [ ] Revenue model: commission on shops, a price markup, or fees only
- [ ] Rider model: shop helpers, your own riders, or a mix per zone
- [ ] Launch categories, and whether to join ONDC later
- [ ] How many hours a week this gets in the first six weeks, given everything else on your plate

* [ ] Confirm the store portal lives inside the admin app (the default in this plan) or becomes its own app

- [ ] Confirm the switch triggers in section 7 and who decides, and whether the pilot town starts in partner mode or dark-store mode

## 16. Handoff to Claude Code

Export this doc to Markdown as `docs/PLAN.md` in a new empty repository, add the `CLAUDE.md` below at the root, then run one phase per Claude Code session: plan, build, test, review, gate, tag. Run only the Phase 0 prompt first; each later prompt is written at the start of its phase from the results of the one before.

**`CLAUDE.md` (copy as is, then rename the product)**

```markdown
# Project: hyperlocal grocery delivery for tier 3 and 4 Indian towns

## What we are building
A partner-store marketplace. Customers order from local kirana, dairy and vegetable shops in their own town. Shops accept and pack. Paid riders deliver. Partner stores by default; a single company dark store per town is an allowed alternative. We promise a delivery window, never minutes. One pilot town first; multi-town ready through town_id. Each town runs in a fulfilment mode (partner, dark or hybrid) that can be switched by configuration at any time.
Plan: docs/PLAN.md (read sections 4, 6, 7, 10 and 12 before coding).

## How we work: UI first, phase-gated
- Surface order: customer app, then admin panel (with the store portal), then driver app. Each surface is a mock-data UI phase, then a live phase.
- Work on exactly one phase at a time, described in docs/phases/PHASE-N.md. Never build ahead; park ideas in the next phase's notes file.
- Start every task with a written plan and wait for approval before writing code.
- UI phases run on mock data from packages/mocks, built from the Zod contracts in packages/contracts. Live phases swap mocks for the real API without changing screens.
- A phase is done only when its gate passes: lint, typecheck, unit tests, e2e tests, build, accessibility and performance checks, all with zero open blocker or major defects.
- At the end of a phase write docs/phases/PHASE-N-report.md, stop, and wait. The human signs off; then tag phase-N-complete.

## Surfaces
- apps/customer-web: Next.js PWA (phases 1 and 2)
- apps/admin: Next.js ops panel with the store portal and the dark-store console as route groups (phases 3 and 4)
- apps/driver: Expo React Native app (phases 5 and 6)
- apps/api: NestJS modular monolith, REST + OpenAPI (from phase 2)
- apps/worker: BullMQ jobs (from phase 2)
- packages: contracts, mocks, ui, i18n, db, config

## Non-negotiables
- TypeScript strict. Zod validation at every API boundary; contracts are the single source of truth.
- Money is integer paise. Never floats. Ledger entries are append-only.
- Order status changes only through OrderStateMachine.transition(); every change writes an order_events row.
- Payment and webhook handlers are idempotent.
- Fulfilment mode is town configuration. Order, payment, dispatch and ledger code never branch on it; differences live behind the FulfilmentStrategy interface (availability, accept, pick, settle).
- Every business table has town_id. Zones, fees, slots and limits live in the database, not in code.
- No hard-coded UI strings: use message keys for en, hi, mr.
- Collect minimal personal data, log consent, never log Aadhaar numbers or OTPs.
- No 10-minute copy. No rider penalties for lateness.
- Every screen has loading, empty, error and offline states and works on a low-end Android phone (2 GB RAM) on a weak network.

## Commands
pnpm install | pnpm dev | pnpm lint | pnpm typecheck | pnpm test | pnpm build | pnpm e2e | pnpm storybook

## Definition of done
Types and lint pass; tests added (Vitest for logic, Playwright for flows); accessibility check passes; migration and seed updated when data changes; docs updated if scope changed.

## Working style
Small commits with conventional messages. Ask before adding a dependency. Record architecture decisions in docs/decisions/. Never loosen or skip a check to get green.
```

**Repository layout**

```text
hyperlocal/
  apps/
    customer-web/   Next.js PWA (phases 1 and 2)
    admin/          Next.js ops panel, store portal and dark-store console as route groups (phases 3 and 4)
    driver/         Expo React Native app (phases 5 and 6)
    api/            NestJS modular monolith (from phase 2)
    worker/         BullMQ processors (from phase 2)
  packages/
    contracts/      Zod schemas, types, money helpers, order state table
    mocks/          MSW handlers and typed fixtures
    ui/             design tokens, Tailwind preset, components, Storybook
    i18n/           en, hi, mr message files and key checks
    db/             schema, migrations, seed (from phase 2)
    config/         tsconfig, eslint, env validation
  infra/            docker-compose for PostgreSQL with PostGIS and Redis
  docs/
    PLAN.md         this document, exported
    decisions/      one short file per decision
    phases/         PHASE-N.md checklist and PHASE-N-report.md per phase
```

**Gate checklist (every phase repeats this)**

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] lint, typecheck, test and build pass on a clean install, with no unexplained warnings
- [ ] Playwright flows for the phase pass locally and in CI, in both fulfilment modes
- [ ] axe shows no serious accessibility issues; screens stay usable at 200% text size
- [ ] Lighthouse mobile performance 90 or higher on the phase's key screens, and first-load JavaScript inside the budget set in PHASE-N.md (working targets)
- [ ] Tested by hand on a real low-end Android phone with throttled network
- [ ] No open blocker or major defects; minor ones are logged with an owner
- [ ] Verification report written, demo done, human sign-off recorded, tag phase-N-complete pushed

**Phase 0 prompt: run this first, in an empty repository**

```text
You are working in an EMPTY repository. This is PHASE 0 (Foundation) of a phase-gated build. Do not start Phase 1.

CONTEXT
We are building a hyperlocal grocery delivery product for tier 3 and 4 Indian towns: partner kirana stores by default (with an option to switch a town to one company dark store), paid riders, and delivery windows instead of 10-minute promises. The working rules are in CLAUDE.md and the full plan is in docs/PLAN.md. If either file is missing, stop and ask me to add it; do not invent them.
Approach: UI first and contract first. Surface order: customer app, then admin panel (with a store portal), then driver app. Each surface gets a mock-data UI phase, then a live phase. Fulfilment is switchable per town between partner stores and one dark store, so nothing may hard-code either. Phase 0 only creates the foundation those phases stand on.

GOAL
Create the monorepo skeleton, tooling, design-system foundation, shared contracts package, mock-API package, i18n scaffold and CI, so that Phase 1 (customer UI on mock data) can start with zero setup work.

WORKFLOW (follow exactly)
1. Read CLAUDE.md and docs/PLAN.md (sections 4, 6, 7, 8, 9, 10, 12 and 16).
2. Enter plan mode and write a plan: file tree, dependency list with a reason for each, commands you will run, risks, and anything in this prompt you would change. Wait for my approval. Write no code before approval.
3. After approval, work in small steps with one conventional commit per step. Run the relevant checks after each step and fix failures before moving on.
4. When everything is built, run the full verification list below, write docs/phases/PHASE-0-report.md with the results, show me a summary, and STOP. Do not begin Phase 1.

DELIVERABLES

A. Workspace and tooling
- pnpm workspaces and Turborepo. Pin the Node version in .nvmrc and in engines; set the packageManager field.
- TypeScript strict everywhere (strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes) with a shared base config in packages/config.
- ESLint (flat config), Prettier, EditorConfig, Husky with lint-staged, commitlint for conventional commits.
- Vitest for unit tests. Playwright for end-to-end tests. Storybook for packages/ui with the accessibility add-on.
- GitHub Actions workflow: frozen-lockfile install, lint, typecheck, test, build, Playwright smoke test; cache pnpm and Turborepo.
- .env.example and a Zod-validated env loader in packages/config. No secrets in the repository.

B. Folder structure (create exactly what CLAUDE.md lists)
- apps/customer-web: a runnable Next.js app (App Router, TypeScript, Tailwind) with a PWA shell: web app manifest, placeholder home screen, and a language switcher for en, hi and mr. Nothing more.
- apps/admin, apps/driver, apps/api, apps/worker: placeholder workspaces only. Each has a package.json that passes lint and typecheck and a README.md saying which phase builds it. No framework code yet.
- packages/contracts: Zod schemas and types for Money (integer paise, branded type, helpers for add, subtract, multiply by quantity and rupee formatting, with unit tests), TownId, FulfilmentMode (partner, dark, hybrid), StockMode (toggle, counted), StoreType (partner, dark), and an OrderStatus enum with the allowed-transitions table stubbed from section 7 of the plan. One index export.
- packages/mocks: MSW configured with a single /health handler and two tiny fixtures typed by the contracts: one town in partner mode and one in dark-store mode.
- packages/ui: design tokens as CSS variables (colour, type scale with large sizes, spacing, radius, motion) plus a Tailwind preset; primitives Button, Input, Card, Badge and Sheet, each with a Storybook story covering default, disabled, loading and error states; tap targets at least 48 px.
- packages/i18n: en, hi and mr message files with a few shared keys and a test that fails if any key is missing in any language.
- packages/config: tsconfig, eslint, env validation.
- infra/docker-compose.yml with PostgreSQL + PostGIS and Redis (unused until Phase 2) and a README.
- docs/: docs/decisions/0001-ui-first-contract-first.md; docs/decisions/0002-fulfilment-mode-is-configuration.md; docs/phases/PHASE-0.md (this checklist); docs/phases/PHASE-TEMPLATE.md for later phases. Do not overwrite PLAN.md or CLAUDE.md.

C. Guardrails
- Write a root README with setup steps, commands and the phase workflow.
- Look up current stable versions at install time (pnpm view); do not rely on memory. Ask before adding any dependency not named in this prompt.
- No business logic, no real screens beyond the placeholder home and the Storybook primitives, no API endpoints, no database schema.

VERIFICATION (all must pass; show a summary of each result)
1. Simulate a fresh clone: remove node_modules, run pnpm install --frozen-lockfile.
2. pnpm lint, pnpm typecheck, pnpm test, pnpm build.
3. pnpm dev serves customer-web on port 3000; the home page loads; the language switcher changes visible text for en, hi and mr.
4. pnpm storybook builds; axe reports no serious violations on the primitives.
5. pnpm e2e smoke test passes (home loads, language switch works).
6. Lighthouse mobile run on the home page: report scores and first-load JavaScript size.
7. The CI workflow file is valid and its steps match the commands above.
8. Money unit tests cover rounding, addition, negative values and rupee formatting.
9. Contract tests show FulfilmentMode, StockMode and StoreType accept valid values and reject invalid ones.

RULES
- Stay inside Phase 0. Write anything useful for later into docs/phases/PHASE-1-notes.md instead of building it.
- If a check fails, fix the cause. Never skip, disable or loosen a rule to get green.
- State every deviation from this prompt explicitly in the report.
- Final message: repo tree to two levels, commands run with pass or fail, Lighthouse numbers, open risks, and the Phase 0 gate checklist for me to verify by hand. Then wait.
```

**Prompts that follow (each written after the previous gate passes)**

1. **Phase 1, customer UI on mock data.** Every customer screen and state from section 6, Hindi and Marathi, both fulfilment modes, PWA shell, mock API, Playwright flows.
2. **Phase 2, customer live.** API, database (with the stock tables), OTP auth, catalogue, cart, order state machine, payments in test mode, ops inbox, WhatsApp alerts.
3. **Phase 3, admin UI on mock data.** Every admin, store-portal and dark-store-console screen and state.
4. **Phase 4, admin live.** Assisted order, order board, onboarding, catalogue, zones, finance basics, store alerts and timeouts, and the dark-store console behind a per-town switch.
5. **Phase 5, driver UI on mock data.** Every driver screen and state in Expo.
6. **Phase 6, driver live.** Offers, location, batching, OTPs, UPI QR, cash ledger.
7. **Phase 7, harden and replicate.** Monitoring, backups, load test, runbooks, town two by configuration.

Each phase prompt reuses the Phase 0 structure: context, goal, workflow with plan approval, deliverables, verification, rules, then stop. Keep pull requests small, write the state-machine and ledger tests first in the live phases, and start a fresh session per phase so context stays clean.

## 17. Sources

Research was done on 8 October 2026. Market and platform figures come from the pages opened in full; legal, payment and pricing points come from search results and should be confirmed with the official source or a professional before you rely on them. Numbers labelled working target, working default or illustrative are assumptions of this plan, not sourced facts.

**Opened in full**

- [Blinkit, Zomato tailor quick-commerce for tier-2, tier-3 cities](https://www.business-standard.com/industry/news/blinkit-zomato-tailor-quick-commerce-for-india-s-tier-2-tier-3-cities-125123000066_1.html), Business Standard (Bloomberg), 30 Dec 2025
- [Flipkart Minutes hits 1,000 stores](https://www.outlookbusiness.com/corporate/flipkart-minutes-hits-1000-stores-amid-deferred-ipo), Outlook Business, 24 Jun 2026
- [Can quick commerce scale beyond metros?](https://www.outlookbusiness.com/interviews/can-quick-commerce-scale-beyond-metros-flipkart-bain-execs-decode), Outlook Business (Bain), 23 Jul 2025
- [Quick commerce expansion turns inward](https://ascendants.in/industry_events/india-quick-commerce-dark-stores-metro-saturation/), Ascendants citing Bernstein, 16 Jul 2026
- [Will ONDC and its enablers drive growth of kirana e-commerce?](https://retail4growth.com/news/will-ondc-and-its-enablers-drive-growth-of-kirana-e-commerce-6676), Retail4Growth (Kiko Live claims), 26 Mar 2024
- [BazaarNow raises Rs 72 crore](https://indiantelevision.com/mam/bazaarnow-raises-rs-72-crore-to-bring-quick-commerce-to-smaller-cities/), Indian Television, 9 Jun 2026
- [Social Security (Central) Rules, 2026 explained](https://www.medianama.com/2026/05/223-social-security-central-rules-2026-gig-workers-90-days-work/), MediaNama, 12 May 2026

**Seen in search results only (verify before relying)**

- [Govt pulls brakes on 10-minute delivery](https://www.storyboard18.com/amp/how-it-works/govt-pulls-brakes-on-10-minute-delivery-forces-quick-commerce-rethink-87542.htm), Storyboard18, 13 Jan 2026
- [Aggregator obligations under the Code on Social Security](https://www.taxmann.com/post/blog/analysis-aggregator-obligations-code-on-social-security/), Taxmann
- [FSSAI e-commerce FBO licensing excerpt](https://foodsafetyhelpline.com/?p=75407) and [licence procedure summary](https://www.lawrbit.com/industry-specific/fssai-license-ecommerce-food-business/); the FSSAI PDF itself returned an error
- [DPDP Act and Rules brought into force](https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-), Hogan Lovells
- [UPI MDR regime from 15 October](https://inc42.com/?p=572596), Inc42, and [UPI charges: MDR vs platform fees](https://razorpay.com/blog/upi-charges-explained-mdr-vs-platform-fees/), Razorpay
- [WhatsApp Business price update](https://telecomtalk.info/whatsappbusiness-price-reveal-telegram-arattai-may-benefit/1012403/), TelecomTalk, Oct 2026
- [Ola Maps pricing](https://maps.olakrutrim.com/pricing) and [Google Maps Platform pricing for India](https://developers.google.com/maps/billing-and-pricing/pricing-india); both change, so check before budgeting
- [KiranaPro joins ONDC](https://itln.in/e-commerce/kiranapro-becomes-first-ondc-powered-quick-commerce-company-1354510) and [Is tier 3 India ready for its own DMart?](https://yourstory.com/2024/08/tier-3-india-ready-dmart), YourStory
