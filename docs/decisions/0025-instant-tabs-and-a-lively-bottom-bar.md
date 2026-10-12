# 0025. Instant tabs and a lively bottom bar

- **Status:** Accepted (Phase 1). Point 3 is reversed for Categories, Cart and Orders by [0035](./0035-tab-skeletons-return-and-mirror-their-content.md)
- **Date:** 2026-10-11
- **Source:** the owner, after screen-recording another grocery app's bottom bar next to ours

## Context

In the recording the other app answered a tap in one frame: the new screen and the lit tab changed together, with no skeleton and no
fade, even when the shopper switched tabs about twice a second. A thin line glided along the top edge to the chosen tab, whose icon
turned solid and gave a short pulse. The header and the cart pill stayed put. Ours felt stuck for three reasons:

1. The lit tab came from the router, so it changed only after the screen change had been drawn. A busy phone showed nothing at first.
2. Cart and Orders showed a skeleton and a 200 ms fade each time they came to the front, though their data is on the phone.
3. A tab was built on its first visit, so the first tap on each paid for building it.

## Decision

1. **A press lights its tab at once** (`shownTab` in `ui/logic/navBar.ts`); the screen change follows a frame later. The router's word
   takes over as soon as it says anything else is chosen, and a press that goes nowhere stops being lit after 700 ms.
2. **The main tabs are built early.** After Home has settled, Cart, Orders and Categories are built one at a time, 450 ms apart
   (the first after 900 ms) and only when the phone is idle (`requestIdleCallback`, within 2 s; React Native 0.86 deprecates
   `InteractionManager`), by turning off `lazy` for each in turn. They are frozen while out of front (ADR 0023), so they cost
   nothing more once built.
3. **Cart and Orders never show their skeleton on the way back** (`quietReturn`), and one built early is ready at once, with no pretend
   wait (`backgroundReady` in `useScreenLoad`), so the first tap shows it straight away. Screens that need the server, and every
   screen built as it opens, keep their skeleton, offline and failed states.
4. **The lively look** (`NAV_STYLE = 'lively'`): a 28 by 3 dp line on the bar's top edge glides to the chosen tab in 260 ms on the
   bottom bar's curve; the chosen icon turns solid (home, grid, cart and receipt have solid forms in `Icon`) and gives a short spring
   pop when chosen, never when the screen first draws. All of it runs on the animation thread. With "reduce motion" on the line jumps
   and nothing pops. The names keep one weight, so choosing a tab still moves nothing (ADR 0015's alignment pass).
5. **Going back.** `NAV_STYLE = 'classic'` removes the line, the solid icon and the pop (the pistachio pill and outline icons remain).
   Steps 1 to 3 are separate from it.

6. **Screens cross-fade** (added after the first phone test: the lit tab was instant but the screen then cut in). Changing screen in
   the tab group is a 220 ms cross-fade on the bottom bar's curve (`animation: 'fade'` with a tuned `transitionSpec`, native-driven),
   so the screen leaving fades out as the one arriving fades in. The bars sit outside it and do not move. It is part of the lively look
   (`NAV_STYLE`) and is left out with "reduce motion" on. The stack's page background sits behind the tabs, so nothing else shows
   through mid-fade.

## Consequences

- The testing switches "Pretend offline" and "Next load fails" no longer meet Cart or Orders on a return to them, or on a first visit
  after they were built early; they still meet the delivery-time, coupons and checkout pages and every screen built as it opens.
- A few hundred ms of background work run after launch, one tab at a time. To be measured on a 2 GB phone.
- Not done: keeping the cart pill and the header across tabs (the other app does), and any change to what Home shows.
