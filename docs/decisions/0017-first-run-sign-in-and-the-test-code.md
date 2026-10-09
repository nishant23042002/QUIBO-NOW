# 0017. First-run sign-in with a mobile number and a code

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the Phase 1 plan for first run and address (1e)

## Context

A new shopper has to choose a language and prove a phone number before ordering. There is no server in Phase 1, so the code check
is a mock; it must still behave the way the real one will, and must not become a habit of showing or logging a code.

## Decision

1. **Three steps, in order:** language, mobile number, six-digit code. Until they are done the app is just these steps. A shopper
   who has been through them goes straight to Home.
2. **The mock code is one fixed test code** in `src/account/otp.ts`. It is never shown on a screen and never written to a log. The
   real code comes by text message from the server in Phase 2.
3. **The rules are the real ones:** a code works for five minutes, five wrong tries lock it (the right code is then refused too),
   and a new code can be asked for after thirty seconds. They are plain logic with tests.
4. **Consent is logged.** The line under the number field is the agreement. When the code is right, the time and the wording's
   version are kept with the number. Changing the wording means changing the version.
5. **Only what is needed is kept:** the checked ten-digit number, the language, and the agreement. Signing out forgets the number and
   the agreement and keeps the language, which belongs to the phone.
6. **Testers can skip.** Development builds only show "Skip sign-in (testing)" on each step. A skipped sign-in has no number, and
   Log out undoes it.

## Consequences

- The number is not yet tied to an account on a server; Phase 2 replaces the mock code check and stores the account there.
- An address is not yet tied to a number: saved addresses are kept on the phone for now.
