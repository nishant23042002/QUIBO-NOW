# 0055. Home v5, the locked redesign

- **Status:** Proposed (Phase 1, sub-phase 1m). Accepted when the owner signs off the close-out step.
- **Date:** 2026-10-14
- **Source:** the owner's approval of the mock `Quibo Home Redesign` version 5 (`docs/design/home-v5-mock.html`) and of
  `docs/phases/PHASE-1-home-v5.md`

## Context

Home was built section by section from ADR 0031 to ADR 0052. The owner reviewed it against the leading quick-commerce apps and
locked a new design that changes the structure, not only the look: one canvas at the top, a payment and trust strip, an argument
for connected shops ("Know your shop"), grouped categories with Coming soon and Notify me, and the modules after them. The
reasons are in ADR 0053 (trust first, a flat shop plan, standing orders) and ADR 0054 (trust signals and moment screens).

## Decision

1. **Home is rebuilt to the locked mock in twelve steps**, each ending in a phone check (see the phase file). Nothing is built
   ahead of its step.
2. **One canvas.** The deep aubergine header, the search bar, the category tabs and the "Right now in Roha" mosaic are one
   surface. The page slides up over it with rounded top corners.
3. **The delivery range leads.** "Estimated delivery" and the range in minutes are the first thing in the header. A "Schedule a
   slot" slot sits in the search bar. The range is an estimate, never a guarantee (ADR 0012).
4. **The product card, bottom bar and cart bar are unchanged.**
5. **Rules that outrank the mock.** Corners follow ADR 0049 (12 and 16 at most). Text never goes below 14. The Daily essentials
   control stays squared (ADR 0048). Moment screens have no progress line, because there are no countdown timers. Anything
   shown as a fact must come from a shop record.
6. **No new dependency in this sub-phase.** The mock's display font is replaced by the system font in a heavy weight.
7. **The palette is unchanged.** The colour change was dropped by the owner.

## What this supersedes

- ADR 0050 in part: the offers no longer sit under the tabs; the mosaic takes that place and offers move to "Offers for you".
- ADR 0031 and ADR 0046 in part: "Shop by category" becomes the grouped list (step 5).
- ADR 0052: the lean switch is replaced by the new-customer layout (step 4).

## Consequences

- The shared header (ADR 0028) changes for Categories and Orders too, so step 1 is checked on all three tabs.
- New data lives next to `items.ts` with `town_id`, as the earlier sections do, and moves to `packages/contracts` in Phase 2.
- Every new string is a message key in English, Hindi and Marathi; Hindi and Marathi are drafts until a native speaker reads them.
