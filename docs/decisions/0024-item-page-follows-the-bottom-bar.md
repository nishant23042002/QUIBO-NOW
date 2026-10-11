# 0024. The item page hides the bottom bar and shrinks the cart bar, like Home

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-11
- **Source:** the owner, after seeing that the cart bar only behaved this way on Home

## Context

ADR 0021 let Home, shop pages and search hide the bottom bar on scroll and shrink the cart bar into a small note and button, but kept
the item page fixed because it has its own ADD bar. The result was that the same cart bar behaved two ways in the same app.

## Decision

1. **The item page follows the bottom bar.** Scrolling down hides the bottom bar; scrolling up brings it back. It uses the same
   shared value as every other screen (`ui/chrome.ts`), so nothing about the motion is new.
2. **The ADD bar slides down with it** by the bottom bar's height, so it rests on the bottom edge with no gap, and the cart bar
   (`CartLayer` with `follow`) shrinks into its small note and button resting just above it.
3. **With "reduce motion" on, the item page keeps its bars where they are.** It neither reports scrolling nor follows, so the
   page never rearranges itself for someone who has asked for less movement.
4. **A page counts as scrolling only while it is in front** (`ui/useChromeScroll.ts`), so a page still gliding when its tab was left
   cannot hide the bar on the next screen. Orders, a main tab, keeps its bar always.

## Consequences

- The cart bar now means the same thing everywhere it appears: Home, a shop, search and an item.
- Pages that have their own bottom action (cart, checkout, address) still keep the bar in place.
- Categories gets the same two lines when it is built.
