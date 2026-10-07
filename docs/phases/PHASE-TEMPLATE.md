# Phase N: <name>

> Copy this file to `docs/phases/PHASE-N.md` at the start of a phase and fill it in. Write the Phase N
> prompt from the results of the previous phase's report. One phase per session; plan, build, test,
> review, gate, tag. Park anything outside the phase in `PHASE-(N+1)-notes.md`.

**Surface:** customer app | admin panel and store portal | driver app | backend | hardening
**Kind:** UI on mock data | live against the API
**Depends on:** `phase-(N-1)-complete` tagged

## Goal

One or two sentences: what exists at the end that did not exist at the start.

## Context

What the previous phase's report and `PHASE-N-notes.md` say that matters here. Link the PLAN sections the
work comes from (every feature traces to a PLAN section 4 row or the section 6 screen inventory).

## Scope

### In

- [ ] Deliverable, each testable by a command or a described check

### Out (not this phase)

- Things that are tempting but belong later, so they are not built by accident

## Plan (written first, approved before any code)

File tree, dependencies with a reason each, commands, risks, and anything in the prompt you would change.
Record the approval here: who approved and when.

## Verification

Numbered, each with the exact command or check and the expected result.

1. [ ] ...

## Budgets (working targets)

- First-load JavaScript on key routes: **\_\_\_ kB gzip**
- Lighthouse mobile performance on key screens: **90 or higher**
- Other numbers specific to this phase

## Gate checklist (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install, with no unexplained warnings
- [ ] Playwright flows for the phase pass locally and in CI, in both fulfilment modes
- [ ] axe shows no serious accessibility issues; screens stay usable at 200% text size
- [ ] Lighthouse mobile performance 90 or higher on the phase's key screens, and first-load JavaScript
      inside the budget above
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] No open blocker or major defects; minor ones are logged with an owner
- [ ] `PHASE-N-report.md` written, demo done, human sign-off recorded, tag `phase-N-complete` pushed

## Done means

Types and lint pass; tests added (Vitest for logic, Playwright for flows); accessibility check passes;
migration and seed updated when data changes; docs updated if scope changed (`CLAUDE.md`, "Definition of
done").

## Report

When the gate passes, write `docs/phases/PHASE-N-report.md`: what was built, every command run with
pass or fail, the numbers, deviations from the prompt, open risks. Then stop and wait for sign-off.
