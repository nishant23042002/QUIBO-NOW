# 0054. Trust signals and moment screens

- **Status:** Proposed (designed in the Home mock, version 4; not built in the app)
- **Date:** 2026-10-14
- **Source:** the product owner's concept notes and ADR 0053; mock `Quibo Home Redesign`

## Context

The reason to choose Quibo is trust: a shop the customer already walks into packs the order, with no hidden warehouse for
everyday items (ADR 0053). That has to be shown, not asserted once. The customer should meet it again and again while using the
app, in small amounts, without being slowed down.

## Decision

1. **The argument is what a customer can check.** The trust case against a dark store is not that it is unclean, which nobody
   can prove; it is that a customer cannot see or visit it and takes it on faith, while a shop can be walked into. "Know your
   shop" asks one question ("Would you trust what you can't see?") and answers it with five checkable things: where it was
   packed, who packed it, how it is kept, what happens when something is wrong, and whose name is on the bag. It ends on a score
   of 0 of 5 against 5 of 5. It never names a company, never says anyone's food is worse, and carries a line saying so. Legal
   review before launch.
2. **Where the signals sit on Home** (a new customer meets them earlier than a returning one):
   - a "Visited shops only" pill in the payment strip under the hero, which opens "How we check a shop";
   - "Know your shop", straight under the payment strip for a new customer and after Bestsellers for a returning one. Its
     parts are a draggable scene, five swipeable questions and the score (a closing card that pointed to the shops was
     removed by the owner on 2026-10-14, ADR 0057);
   - "The Quibo promise" near the bottom with the "How we check a shop" sheet;
   - the shop's name on the live order card, and "Your money stays in Roha" in the footer.
3. **Moment screens.** A full-screen card with one trust fact, a thin progress line and "tap to skip":
   - **Launch**, about 2.4 seconds, the logo, the tagline and one fact.
   - **Between navigation**, about 1.5 seconds, on the first navigation and then every third, never twice within 20 seconds.
   - **Order placed**, about 2.4 seconds, naming the shops that are packing.
   - They never appear on every tap, never delay a result the customer is waiting for, never run while a screen is loading
     content, and with reduced motion they show the same card without movement. A moment is cut short by any tap.
4. **Facts are a short list in data**, not in code, so wording can change per town. Each fact must be true for the town it is
   shown in (for example the year a shop opened, or "visited on" a real date).
5. **Pharmacy and exclusive items** appear only as "Coming soon" cards with Notify me (ADR 0053), never as trust claims.

## Consequences

- Needs shop data the pilot must collect at onboarding: owner name, year opened, a one-line quote with the owner's consent,
  photos, and the date of the Quibo visit (PLAN section 7).
- The moment screens are an `ui` component with a rate limiter on the phone; they must pass the low-end phone and weak-network
  rules (no images beyond the bundled ones).
- Every sample quote, date and shop in the mock is a placeholder and must be replaced with real, consented content.
