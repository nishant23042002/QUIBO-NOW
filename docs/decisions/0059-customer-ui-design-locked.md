# 0059. The customer app's UI and design are locked

- **Status:** Accepted
- **Date:** 2026-10-17
- **Source:** the product owner, at the end of the Phase 1 polish

## Context

Phase 1 built the customer app on mock data, and its look changed many times on the owner's feedback (Home v5, the header colour,
moments, the clean-up, category screens, transitions). A phase can only be finished and signed off if its design stops moving.

## Decision

1. The customer app's UI and design are locked for the rest of Phase 1. The list of what is locked is in section 8 of
   `docs/phases/PHASE-1-report.md`.
2. From now on a change is a defect fix to the locked design, or a correction of wording. A new idea is written in
   `docs/phases/PHASE-1-notes.md` for a later phase and not built.
3. Sample content may grow (items, brands, descriptions, nutrition) because it fills the design without changing it.
4. The remaining Phase 1 work is checking: the phone check, a development build, Maestro, TalkBack, a cold start on a low-end phone,
   the Hindi and Marathi review and the people test. The owner then signs off and `phase-1-complete` is tagged.

## Consequences

- The live phase (Phase 2) swaps the mocks for the real API without changing screens, as the plan says; the locked design is what it
  builds against.
- The admin panel and the driver app have their own mock-data UI phases and are not covered by this lock.
- Anything the owner asks for that is a change of design after this point is a reopening of this decision, and is recorded as one.
