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

- Bundle size: **\_\_\_** (web screens: first-load JavaScript in kB gzip; phone apps: the Android Hermes
  bundle in MB)
- Lighthouse mobile performance on key web screens: **90 or higher**
- Other numbers specific to this phase

## Gate checklist (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install, with no unexplained warnings
- [ ] Flow tests for the phase pass (Maestro for the phone apps, Playwright for the admin panel), in both
      fulfilment modes
- [ ] No serious accessibility issues (axe on the admin panel; the contrast tests, a screen-reader pass and
      the largest font size on the phone apps); screens stay usable at 200% text size
- [ ] Performance inside the budget above (Lighthouse mobile 90 or higher on key web screens; bundle size and
      a cold start on a 2 GB phone for the phone apps)
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] No open blocker or major defects; minor ones are logged with an owner
- [ ] `PHASE-N-report.md` written, demo done, human sign-off recorded, tag `phase-N-complete` pushed

## Done means

Types and lint pass; tests added (Vitest for logic, Maestro for phone-app flows, Playwright for admin web
flows); accessibility check passes; migration and seed updated when data changes; docs updated if scope
changed (`CLAUDE.md`, "Definition of done").

## Report

When the gate passes, write `docs/phases/PHASE-N-report.md`: what was built, every command run with
pass or fail, the numbers, deviations from the prompt, open risks. Then stop and wait for sign-off.
