# 0023. Quicker taps: shorter pretend loads and frozen tabs

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-11
- **Source:** the owner, after the app felt slow to answer a tap

## Context

On a phone running the app through Expo Go in development mode, scrolling held 50 to 55 frames a second on both threads, but
touching a bottom-bar icon or an item dropped the JavaScript thread below 30. Three things in the code explain it:

1. A page drew its real content under a skeleton from the first frame, then waited a pretend 350 to 600 ms (standing in for the
   server) before fading the skeleton out. Every tap paid for two trees and then a wait.
2. The tabs navigator keeps every visited screen mounted, and each one redrew whenever the cart, the clock or a timer
   changed. Home's typewriter hint kept ticking behind every other tab.
3. One cart change redraws everything that reads the cart (see "Not done yet").

## Decision

1. The pretend loads are 150 to 200 ms instead of 350 to 600 ms (`home/loading.ts`, and the three screens that keep their own:
   Home's category change, a shop page and an item page). The skeleton, offline and failed states are unchanged.
2. Tabs not in front are frozen (`freezeOnBlur` on the tabs navigator): they keep what they show and their place, and are not
   drawn again until they come back to the front.

## Not done yet

The cart is still one object that changes on every edit, so each screen that reads it is redrawn on a change. The fix is to
let an item card read only its own quantity. It is held back until the two changes above have been measured on a phone, because
a release build (`pnpm dev -- --no-dev --minify`) may show development mode is most of the cost.

## Consequences

- Real server calls will take their own time; these waits were never a measure of that.
- A frozen screen does no work while hidden. Anything that must keep running in the background has to live outside the screen.
