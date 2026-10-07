# Phase 0 report: Foundation

- **Branch:** `phase-0/foundation` (17 build commits on top of `master`, plus this report). Not pushed, not merged, not tagged.
- **Status:** every automated check passes in a fresh clone of the final commit. **Four things need your decision or
  your hands before sign-off** (section 9): the first-load JavaScript budget, the OrderStatus stub, the Hindi and
  Marathi text, and a test on a real low-end Android phone.
- **Nothing outside Phase 0 was built.** Everything found but not built is in `PHASE-1-notes.md`.

## 1. What exists

| Area                  | Result                                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace and tooling | pnpm 10 + Turborepo; Node 24.21.0 pinned (`.nvmrc`, `engines`, `engine-strict`); strict TypeScript from one base; ESLint flat config, Prettier, EditorConfig, Husky + lint-staged + commitlint (active on every commit here)     |
| `apps/customer-web`   | Next.js 16 App Router, Tailwind v4, `/en` `/hi` `/mr` static pages, language switcher (plain links), web app manifest, generated icons. No service worker.                                                                       |
| Placeholder apps      | `admin`, `driver`, `api`, `worker`: `package.json`, `tsconfig.json`, `src/index.ts`, README naming the phase. They pass lint and typecheck.                                                                                      |
| `packages/contracts`  | `Money` (branded integer paise; add, subtract, multiply by quantity, rupee formatting), `TownId`, `FulfilmentMode`, `StockMode`, `StoreType`, `OrderStatus` + transitions table (**stub**), `Town`, `HealthResponse`. 190 tests. |
| `packages/mocks`      | MSW 3: `GET */health` handler, Node server and browser worker entry points, `partnerTown` and `darkTown` fixtures parsed through the contracts. 9 tests.                                                                         |
| `packages/ui`         | CSS-variable tokens, Tailwind v4 theme, `Button` `Input` `Card` `Badge` `Sheet`, 22 stories (Default, Disabled, Loading, Error each), Storybook with the a11y add-on.                                                            |
| `packages/i18n`       | en, hi, mr messages; completeness, placeholder, script and "no 10-minute copy" tests (21), plus a compile-time key check.                                                                                                        |
| `packages/config`     | Shared tsconfigs, ESLint config, Zod env loader (never echoes values) and its tests (12), including a guard that `.env.example` is valid and secret-free.                                                                        |
| `infra/`              | `docker-compose.yml` (PostGIS 17, Redis 8.10), localhost-only, no password in the repo. Validated with `docker compose config`; **containers not started**.                                                                      |
| CI                    | `.github/workflows/ci.yml`, one job, 15 steps, all actions pinned to commit SHAs, `contents: read`. **Structurally checked, never run on GitHub.**                                                                               |
| Docs                  | ADRs 0001 to 0006, `PHASE-0.md`, `PHASE-TEMPLATE.md`, `PHASE-1-notes.md`, root README. `PLAN.md` and `CLAUDE.md` untouched.                                                                                                      |

## 2. Environment

Windows 11, Git Bash. **Your system Node (22.12.0) was not changed.** With your agreement I used a portable
Node 24.21.0 (official zip, SHA-256 matched nodejs.org's `SHASUMS256.txt`) on `PATH` for my commands only. pnpm
10.34.5. Chrome (system install) for Lighthouse; Playwright's own Chromium for Storybook and e2e (**719 MB on disk**,
more than the ~160 MB I estimated in the plan).

Exact pins: Next 16.4.0, React 19.3.0, next-intl 4.14.9, Tailwind 4.3.3, Zod 4.6.5, MSW 3.0.2, Vitest 5.0.3,
Playwright 1.64.0, Storybook 10.6.1, Vite 8.3.3, TypeScript **6.0.3**, ESLint **10.12.0**, typescript-eslint 8.71.1,
eslint-config-next 16.4.0, Prettier 3.9.9, Husky 9.1.7, lint-staged 17.6.0, commitlint 21.2.3, Turbo 2.11.7. Reasons
for every pin below `latest` are in ADR 0003.

## 3. Commands run (final state)

Run in a **new `git clone` of commit `2afd341`**, so nothing depended on untracked or ignored files.

| Command                                | Result          | Notes                                                                                                   |
| -------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`       | **pass** (11 s) | No warnings of any kind (no peer, deprecation, or ignored-build messages)                               |
| `pnpm lint`                            | **pass** (16 s) | 10 workspaces, `--max-warnings 0`, plus Prettier check                                                  |
| `pnpm typecheck`                       | **pass** (4 s)  | 10 workspaces                                                                                           |
| `pnpm test`                            | **pass** (4 s)  | 236 unit tests: config 12, contracts 190, i18n 21, mocks 9, ui 4. No browser needed.                    |
| `pnpm build`                           | **pass** (6 s)  | `/en`, `/hi`, `/mr`, manifest and both icons prerendered as static                                      |
| `pnpm a11y`                            | **pass** (5 s)  | 22 story tests in real Chromium, axe, zero violations (this is stricter than "no serious")              |
| `pnpm build-storybook`                 | **pass** (3 s)  | No warnings                                                                                             |
| `pnpm e2e`                             | **pass** (6 s)  | 25 tests, mobile Chromium, against the production build                                                 |
| Literal item 1 in the working copy     | **pass**        | Deleted all `node_modules` (and `.turbo`, `.next`), `pnpm install --frozen-lockfile`: 10 s, no warnings |
| `pnpm dev` + Playwright switcher tests | **pass**        | Served on port 3000; 8 switcher and home tests passed against the dev server                            |
| `docker compose config`                | **pass**        | Fails with a clear message when `POSTGRES_PASSWORD` is unset, renders when set. Containers not started. |
| CI workflow structural check           | **pass**        | Parsed; SHA-pinned actions; every `run:` maps to a root script; order is the local order                |
| `actionlint` on the workflow           | **not run**     | Docker was not running and downloading a new binary was outside what you approved                       |
| CI on GitHub                           | **not run**     | Nothing was pushed                                                                                      |

## 4. Your nine verification items

1. **Fresh clone.** Done twice: a real `git clone` and the literal "remove `node_modules`, `pnpm install --frozen-lockfile`". Both clean.
2. **`lint`, `typecheck`, `test`, `build`.** All pass, zero warnings (table above).
3. **`pnpm dev` on port 3000.** Verified. `/` redirects by `Accept-Language` (hi-IN to `/hi`, mr to `/mr`, otherwise `/en`). Heading and `<html lang>` change per language; the switcher was clicked through en, hi, mr and back, in a real browser, including with JavaScript turned off.
4. **Storybook and axe.** Builds; `pnpm a11y` finds no violations on any primitive state.
5. **`pnpm e2e`.** 25 of 25 pass (section 7 lists what they cover).
6. **Lighthouse mobile.** Section 5.
7. **CI file.** Valid and matching, structurally. Steps are the local commands in the local order; I **added** `a11y` and `build-storybook` to what you listed.
8. **Money tests.** 68 tests: 18 for construction and rejection (floats, NaN, Infinity, unsafe integers, strings, negative zero), 4 addition, 4 subtraction, 27 multiplication (14 are rounding boundary cases, including negatives and half-way values; fourth-decimal and overflow rejection), 15 formatting (Indian grouping, negatives, `always` mode, Latin digits, the safe-integer limits).
9. **Enum contracts.** `FulfilmentMode` (24 tests), `StockMode` (22), `StoreType` (22): every valid value accepted; wrong case, padding, blanks, `null`, `undefined`, numbers, objects, arrays, and values from a sibling enum rejected (`hybrid` is rejected as a `StoreType`).

## 5. Lighthouse (mobile, production build)

Lighthouse 13.5.0 (`pnpm dlx`, pinned, not in the lockfile), system Chrome headless, default mobile profile
(Moto G emulation, simulated slow 4G, 4x CPU slowdown), against `next start` on localhost. **Lab numbers on a
fast PC with a local server: not a phone.**

| Run      | Perf | A11y | Best practices | SEO | FCP   | LCP   | TBT   | CLS | SI    |
| -------- | ---- | ---- | -------------- | --- | ----- | ----- | ----- | --- | ----- |
| `/en` #1 | 100  | 100  | 100            | 100 | 0.8 s | 1.9 s | 20 ms | 0   | 0.8 s |
| `/en` #2 | 99   | 100  | 100            | 100 | 0.8 s | 2.0 s | 20 ms | 0   | 0.8 s |
| `/en` #3 | 99   | 100  | 100            | 100 | 0.8 s | 2.0 s | 20 ms | 0   | 0.8 s |
| `/hi`    | 99   | 100  | 100            | 100 | 0.8 s | 2.0 s | 10 ms | 0   | 0.8 s |
| `/mr`    | 100  | 100  | 100            | 100 | 0.8 s | 1.9 s | 20 ms | 0   | 0.8 s |

Median of the three `/en` runs: **performance 99, accessibility 100, best practices 100, SEO 100.** No failed
audits, no run warnings.

**First-load JavaScript: 134.8 kB gzip** (446.6 kB raw), 6 script requests; whole page 151.1 kB transferred.
Next 16 no longer prints "First Load JS", so this is the sum of script transfer sizes from Lighthouse's network
log.

### The budget finding (needs your decision)

The plan proposed **130 kB gzip** and said to report the real number and ask before changing it. The number:

| Page                                                  | JS, gzip     |
| ----------------------------------------------------- | ------------ |
| A bare Next 16.4.0 + React 19.3.0 app with one `<h1>` | **133.9 kB** |
| Phase 0 home page, final                              | **134.8 kB** |
| Phase 0 home page, as first built                     | 149.9 kB     |

The budget is **below the framework's own floor**, so no Next 16.4 page can meet it. React DOM (72 kB) and Next's
client runtime (50 kB) are about 91% of the bare app's total. I did not edit the number. **Recommendation: 140 kB**, and from
Phase 1 a per-screen budget of "floor plus what the screen needs". `PHASE-0.md` still shows 130 kB with "not met".

How the page got from 149.9 to 134.8 kB (the real cause was not the one I first guessed): importing
`src/i18n/navigation.ts` into the language switcher registered next-intl's client `Link`, so Next shipped
next-intl's runtime (`IntlMessageFormat` and friends) with the page though nothing rendered it. My first fix
(dropping the provider and the `Link` the switcher rendered) saved only 1.8 kB, because the import was still
there; removing the import saved the other 13.3 kB. The switcher is now plain `<a>` links.

## 6. What the checks caught (and what I broke on purpose)

I treated a green check as unproven until I had seen it fail. These defects were **found by verification**:

| Found                                                                                                                                                                                                                | How                                                     | Fix                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **`pnpm lint` failed on a fresh clone** (and would have in CI): types for `next/root-params` come from `next typegen`, which lint did not run. Hidden locally by leftover `.next` files.                             | Fresh `git clone`                                       | `lint` runs `next typegen`; `prepare` generates types on install (also fixes the pre-commit hook) |
| The 130 kB JavaScript budget is unreachable (above)                                                                                                                                                                  | Measuring a bare Next app                               | Reported; decision left to you                                                                    |
| **axe silently skips some Devanagari text** when measuring contrast (on `/hi` it measured 4 of 6 text elements and skipped the subtitle and the active "हिन्दी" link). A planted low-contrast Hindi link passed axe. | Mutation test of the e2e a11y check                     | `e2e/contrast.ts` measures every text node; it fails `/hi` under the same plant (self-tested)     |
| ESLint 9 is end of life (2026-08-06); the approved plan pinned it                                                                                                                                                    | Registry deprecation notice, then ESLint's support page | Moved to ESLint 10.12.0, rules verified on it, three peer ranges allowed explicitly (ADR 0003)    |
| MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`, and my "unmocked request fails" test passed for the wrong reason (connection refused)                                                                      | Typecheck, then a probe of the real error               | Test now asserts MSW's own refusal; fails if the guard is removed                                 |
| `.storybook` was silently outside the tsconfig (a bare directory include skips dot-folders), which hid a real type error on the CSS import                                                                           | Linter's project service                                | Explicit include; a `*.css` module declaration                                                    |
| A favicon request would 404 (the proxy skips paths with extensions)                                                                                                                                                  | Reasoning while writing the console-errors test         | Icons declared in metadata; test asserts the `<link rel="icon">`                                  |
| `turbo` printed "no output files" warning on `test`                                                                                                                                                                  | Output of the first test run                            | Removed the unused `outputs` declaration                                                          |
| Turbo cache would not re-run the `.env.example` test when that file changed                                                                                                                                          | Reasoning, then an edit-and-rerun check                 | `$TURBO_ROOT$/.env.example` added as a test input                                                 |

**Deliberate bugs planted to prove the checks can fail** (each was caught, then reverted and re-run green):
rounding half-up instead of away from zero; accepting any number of decimals; Western digit grouping; unchecked
float add; a transition table allowing `ready` to `delivered`; a missing, extra, empty or untranslated message key;
a 10-minute promise in Marathi; a low-contrast button and badge; an input label not tied to its field; a close
button with no accessible name; a favicon removed; `lang` tags and 48 px targets removed; a low-contrast active
language link; a real password in `.env.example`; an unpinned action, a missing script and a non-frozen install in
the CI file; the unhandled-request guard disabled.

## 7. What the e2e suite covers (25 tests)

Home loads for `/`, `/en`, `/hi`, `/mr`; no console errors or failed requests; unknown language is a 404;
switcher text and `<html lang>` change en, hi, mr, en; every link carries its own `lang`, `hreflang` and `href`;
touch targets of at least 48 px; switcher works with JavaScript off; `Accept-Language` hi-IN and mr-IN pick the
language; manifest is linked and complete; icons are real PNGs of the size they claim (read from the file); no
sideways scroll at 100% and 200% text size in all three languages; axe finds no violations in all three
languages; direct AA contrast on every text node in all three languages; two self-tests of the contrast checker.
Both fulfilment modes appear only as fixtures in Phase 0: there is no mode-dependent screen yet.

## 8. Deviations from the prompt

Every one of these is a choice I made; none is hidden.

1. **ESLint 10.12.0, not the 9.39.5 you approved in the plan.** Changed after approval, on evidence (section 6, ADR 0003).
2. **Pins below `latest`:** TypeScript 6.0.3 (typescript-eslint caps it), pnpm 10.34.5. Node 24.21.0 as agreed.
3. **"Tailwind preset"** is a Tailwind v4 CSS `@theme` file (`packages/ui/src/styles/theme.css`); v4 has no JS presets.
4. **Added beyond the file list:** `Town` and `HealthResponse` schemas; ADRs 0003 to 0006 (you asked for 0001 and 0002); `build-storybook` and `a11y` scripts and CI steps; `e2e/contrast.ts`; the `.env.example` test; root `lint` also runs the Prettier check.
5. **No MSW wiring in customer-web** (`public/mockServiceWorker.js` and a provider), to keep "nothing more". First Phase 1 task.
6. **No service worker.** The PWA shell is the manifest and icons only.
7. **Env validation runs when the layout is built**, not in `next.config.ts` (a TypeScript config cannot import the source-only `@quibo/config` package without extra setup). A bad value still fails `next build`.
8. **The switcher uses plain `<a>` links and there is no `NextIntlClientProvider`**, instead of next-intl's `Link` and provider. next-intl is still used server-side for messages and routing.
9. **Steps 9 and 10 are one commit** (shared `package.json` and lockfile). That gives 17 build commits where the plan listed 15: one merge, and three extra commits for a favicon fix, the lint-types fix and the performance fix.
10. **`packages/db` not created** (PLAN section 16: from Phase 2).
11. **First-load JS measured through Lighthouse's network log**, because Next 16 prints no such figure.
12. **On a branch**, not `master`. Nothing pushed, merged or tagged.
13. **Dark-store and partner states are not drawn in the Phase 0 home** (no mode-dependent screen exists); they exist as fixtures.
14. **Story "states" for non-form primitives are interpretations.** Card, Badge and Sheet: disabled = muted and inert, loading = skeleton or busy, error = error tone or banner. Button's error story is the retry-after-failure pattern (a button tied to its error message).
15. **Brand placeholders:** name "Quibo Now", scope `@quibo/*`, palette, and the "Q" icon.
16. **Storybook telemetry is off** and two Storybook-only build notices are filtered in `.storybook/main.ts` (explained there).

## 9. Not verified, and decisions for you

**Decisions and hands-on items (the gate needs these):**

1. **Budget.** Accept 140 kB (recommended), or tell me another number. The 130 kB figure cannot be met.
2. **OrderStatus is a reconstructed stub.** PLAN section 7's lifecycle diagram did not export to Markdown (`[embedded content: ...]`). I used five states (placed, accepted, ready, picked_up, delivered) and three exits (rejected, cancelled, undelivered). Check them against your diagram.
3. **Hindi and Marathi text is my draft.** Have a native speaker review `packages/i18n/messages/hi.json` and `mr.json`.
4. **A real low-end Android phone on a throttled network** (PLAN gate item). Not done: I have no device. Lighthouse here is a lab number from a PC.

**Things I did not or could not verify:**

- **CI has never run on GitHub.** I checked the file's structure and ran every step locally, in order, in a fresh clone. First real run may expose something (for example `playwright install --with-deps` on the runner).
- **`actionlint` was not run** (Docker not running). Worth one run.
- **The compose file was validated, not started.** Image tags exist on Docker Hub (checked by API). PostGIS images are amd64-only.
- **Only Chromium was tested** (no WebKit or Firefox). The `Sheet` uses native `<dialog>`; untested on Android WebView and iOS Safari.
- **Only on Windows.** CI is Linux; line endings are forced to LF to reduce risk.
- **Hooks need Node 24 on your `PATH`** or commits in your own terminal will fail (engine check).

## 10. Unplanned side effects (tell-tale of the tools, not the work)

- Turbo wrote an `AGENTS.md` into the repo root when it detected an agent. I opted out with `"agentGuidance": false` and deleted it.
- The Claude desktop app created `.claude/launch.json` (a dev-server entry). It is git-ignored and Prettier-ignored, not committed.
- `next typegen` creates `next-env.d.ts` and `.next/types`; both are git-ignored and regenerated on install.
- A stale `.next` can survive a Turbo cache restore and serve old output; I hit this while mutation testing. CI starts empty and is unaffected. Delete `apps/customer-web/.next` if a cached build looks wrong (README).

## 11. Open risks

| Risk                                                                                                                                | Level  | Mitigation / next step                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Many brand-new majors (Vitest 5, MSW 3, Storybook 10, Next 16, Tailwind 4, Zod 4, ESLint 10); my knowledge of them was partly stale | Medium | Every API used was checked against the installed package; lockfile committed; ADR 0003 lists pins |
| Bundle size grows quickly once Phase 1 adds client components (the floor is already 134 kB)                                         | Medium | Per-screen budget in Phase 1; re-measure after each client component; notes list what to avoid    |
| axe has a Devanagari blind spot; Storybook's run very likely shares it (untested there)                                             | Medium | `e2e/contrast.ts` for the app; use the same helper for any Hindi or Marathi story                 |
| OrderStatus stub differs from the real lifecycle                                                                                    | Medium | Confirm now; Phase 2 builds the state machine on it                                               |
| `TownId` is a UUID by assumption                                                                                                    | Low    | Change before Phase 2 creates the database                                                        |
| Source-only packages need a decision for NestJS in Phase 2                                                                          | Low    | ADR 0004 lists the options                                                                        |
| Two peer-range allowances (ESLint plugins, Vitest's optional `msw`) and four skipped install scripts                                | Low    | Documented and scoped; remove when upstream catches up                                            |
| CI never executed on GitHub                                                                                                         | Low    | Push the branch and watch the first run                                                           |

## 12. Commits

```text
1136c29 chore: add repo hygiene files
b2fb356 chore: scaffold pnpm workspace and turborepo
065d90c chore: add eslint, prettier, husky, lint-staged and commitlint
2e9ac5e chore: add placeholder workspaces for admin, driver, api and worker
a2a6040 feat(config): add zod env loader
1ae0b80 feat(contracts): add money, ids, fulfilment enums and order status
83cdd3c feat(i18n): add en, hi and mr messages with completeness test
d9edb6d feat(mocks): add msw health handler and town fixtures
6c3d2bc feat(ui): add design tokens, tailwind theme, primitives and storybook
e8f157f feat(customer-web): add next app with pwa manifest and language switcher
a4cd13f fix(customer-web): declare icons so browsers do not request /favicon.ico
796e663 test(customer-web): add playwright smoke test
16c6da3 ci: add github actions workflow
97c1312 chore(infra): add docker compose for postgres/postgis and redis
9ede35a docs: add decisions, phase docs and root readme
aab41df fix(customer-web): generate Next route types before lint and on install
2afd341 perf(customer-web): stop shipping next-intl's client runtime on the home page
```

## 13. Gate checklist for you

The same list is in [`PHASE-0.md`](./PHASE-0.md). Items 1 to 5 are quick; 6 to 9 need you.

- [ ] `node -v` shows 24.21.0; a clean clone runs `pnpm install --frozen-lockfile` with no warnings
- [ ] `pnpm lint`, `typecheck`, `test`, `build` pass; `pnpm a11y` and `pnpm e2e` pass (browsers installed once)
- [ ] `pnpm dev`: <http://localhost:3000> goes to a language; the switcher changes the text for en, hi, mr
- [ ] `pnpm storybook`: every primitive shows Default, Disabled, Loading, Error
- [ ] Push the branch and confirm the CI run is green
- [ ] **Decide the first-load JavaScript budget** (130 kB cannot be met; 140 kB recommended)
- [ ] **Confirm the OrderStatus stub** against the PLAN section 7 diagram
- [ ] **Have the Hindi and Marathi text reviewed** by a native speaker
- [ ] **Open the site on a real low-end Android phone** over a throttled network
- [ ] Sign off, then tag `phase-0-complete`
