# Phase 0b report: React Native customer app and cleanup

- **Branch:** `phase-0/foundation` (10 build commits on top of the Phase 0 report `c4ac9ce`, plus this report). Not pushed, not merged, not
  tagged.
- **Status:** every automated check passes in a fresh clone of the final commit. **Nothing has run on a phone
  or an emulator yet.** That is yours to do (README, "Run the customer app on your phone"), and it is the
  only check of money maths on the phone's own JavaScript engine.
- **Nothing outside Phase 0b was built.** What was found but not built is in `PHASE-1-notes.md`.

## 1. The answer to the question that started this phase

**The customer app is now a React Native app.** Before this phase it was not: `apps/customer` was the
Next.js PWA with its folder renamed. It is now an Expo SDK 57 app (React Native 0.86, Expo Router) that Expo
Go opens on a phone. Evidence: its `package.json` has no Next.js, the dev server serves an Android and an
iOS bundle with HTTP 200, and `expo-doctor` passes 21 of 21 checks.

## 2. What exists

| Area                 | Result                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/customer`      | Expo app: placeholder home, English / Hindi / Marathi switch (device language by default), and a Components screen. 1,197 lines in 18 tracked files                                          |
| Building blocks      | `Text`, `Screen`, `Button`, `Input`, `Card`, `Badge`, `Sheet` and plain-TypeScript design tokens in `src/ui`, each with loading, error and disabled states where they apply                  |
| Components screen    | Every building block in every state, in all three languages, plus **On this phone**: `formatRupees(12345650)` and `GET /health` on the mock API, each with a green `ok` or a red `wrong`     |
| `packages/i18n`      | Static messages and a typed `translate()` (a misspelt key fails to compile); `loadMessages` removed                                                                                          |
| `packages/mocks`     | The mock API as plain functions. An unmocked route throws. MSW removed (it has no React Native entry)                                                                                        |
| `packages/contracts` | `formatRupees` rewritten without `Intl`; the 190 existing tests are unchanged and pass                                                                                                       |
| `packages/config`    | `expo` tsconfig, `native` ESLint preset (hooks rules and no hard-coded JSX text), env schema reads an optional `EXPO_PUBLIC_API_URL`; web presets and their dependencies removed             |
| Cleanup              | `packages/ui`, Next.js, Tailwind, Storybook, Playwright, MSW and the web-only config removed; `pnpm clean` added; ignore files tidied; all ten `package.json` files sorted                   |
| Docs                 | ADR 0007, ADRs 0001, 0003, 0004 and 0006 updated, README with a phone guide, `PHASE-0b.md`, `PHASE-1-notes.md` rewritten, template gates no longer web-only, `CLAUDE.md` and `PLAN.md` edits |

## 3. Commits

| Commit    | Subject                                                              |
| --------- | -------------------------------------------------------------------- |
| `21ee557` | refactor: rename customer-web to customer (your rename, as it was)   |
| `b104704` | refactor(contracts): format rupees without Intl                      |
| `2ce04ff` | refactor(i18n): add static messages and a typed translate helper     |
| `e97f8c0` | refactor(mocks): replace msw with a plain mock api                   |
| `2a343b3` | chore(config): add expo tsconfig and native eslint preset            |
| `33a1b35` | feat(customer): switch the customer app to Expo (React Native)       |
| `159f978` | feat(customer): add ui primitives and a components screen            |
| `bffe5db` | chore: remove the web ui kit, storybook, playwright and next tooling |
| `89a6e5e` | chore: add a clean script and tidy ignore files                      |
| `eb28e32` | docs: add ADR 0007 and phase 0b notes, update the readme             |

Against `c4ac9ce`: 113 files changed, 48 deleted and 26 added; tracked files went from 137 to 115. Each
commit left lint, typecheck and the tests green (checked by running them before the commit), and the commit hooks
(ESLint and Prettier on staged files, commit message check) ran on every one.

## 4. Verification run

Run in a fresh clone of the final commit `eb28e32` (Node 24.21.0, pnpm 10.34.5), then deleted.

| Check                                              | Result                                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                   | Pass, **no warnings**. 822 packages in 9 s (the web setup had 980)                                                           |
| `pnpm lint` (9 workspaces, root files, Prettier)   | Pass                                                                                                                         |
| `pnpm typecheck` (9 workspaces)                    | Pass                                                                                                                         |
| `pnpm test`                                        | Pass: 276 tests (contracts 190, customer 32, i18n 30, config 13, mocks 11)                                                   |
| `pnpm build` (`expo export --platform android`)    | Pass: Metro bundled 1,323 modules and Hermes compiled them to a 3.3 MB bundle                                                |
| `expo install --check`                             | "Dependencies are up to date": every Expo package matches SDK 57                                                             |
| `expo-doctor` (run once with `dlx`, not installed) | 21 of 21 checks passed, no issues                                                                                            |
| Dev server, Android manifest and bundle            | HTTP 200 and 200 (7.1 MB development bundle)                                                                                 |
| Dev server, iOS bundle                             | HTTP 200                                                                                                                     |
| `git status` after all of the above                | Clean: the Expo CLI rewrote no tracked file and left nothing untracked                                                       |
| `pnpm clean`                                       | Removed 12 folders; `node_modules`, `.env` and the git hooks untouched; a second run says so                                 |
| CI workflow structure (a script of mine)           | Pass: 9 steps, `lint`, `typecheck`, `test`, `build` in order, every action pinned to a commit. **It has not run on GitHub.** |

**Web preview at phone width** (Expo's browser preview, on the working copy; not a phone): the home screen and
the Components screen render, all three languages switch with exactly one language button checked each
time, no console errors, no horizontal scroll, Hindi and Marathi text is not clipped, buttons are 48 px
tall. The sheet opens in its default, error (alert announced) and busy variants, and closes with its X, a tap
on the dimmed area and Escape. **The sheet's exit animation could not be watched finishing:** the preview pane
throttles animations, so those three close paths were verified with the animation switched off, then
restored (the file was compared with a backup).

**Planted defects, each caught by the right check, then reverted:** hard-coded text in a screen (`react/jsx-no-literals`),
a conditional hook (`rules-of-hooks`), an unused variable, a misspelt message key (TypeScript), a low-contrast
warning colour (the contrast test, 2.63:1), a 40 dp tap target (the size test), and an unused variable in a
`.mjs` config file. A lint-broken file in `dist/` and `.expo/` is ignored.

## 5. Cleanup

- **Deleted from the repository:** `packages/ui` (the Tailwind primitives, tokens, Storybook, the axe run), the
  Next.js app files and config, `e2e/` (25 end-to-end tests), the web ESLint presets and tsconfigs, MSW and its
  handlers, and 158 packages from the install. 22 axe tests and 4 unit tests went with `packages/ui`.
- **Dead code removed:** the JS-file ESLint override that existed only for Next's Babel parser; the stale
  `@quibo/customer-web` step in CI; peer and ignored-build rules for packages that are gone; `loadMessages`.
- **Generated junk removed:** `.turbo` (about 53 MB), `storybook-static` (about 7 MB), per-package `.turbo`
  folders, test reports.
- **Not deleted, outside the repository: Playwright's Chromium, about 720 MB** in `%LOCALAPPDATA%\ms-playwright`.
  It may be used by your other projects. If it is not, remove it with
  `Remove-Item -Recurse -Force $env:LOCALAPPDATA\ms-playwright`.

## 6. Deviations from the approved plan

1. **Peer settings were needed, and they were not in the plan.** `expo-router` 57 requires
   `react-native-drawer-layout`, which lists `react-native-reanimated` and `react-native-gesture-handler` as
   peers. With the default settings pnpm installed them at the newest versions (reanimated 4.7.1, worklets
   0.13.0), which do not match Expo Go (4.5.1 and 0.10.1) and printed three peer warnings. I set
   `autoInstallPeers: false`, ignored those two peers by name (the native stack the app uses never loads
   them, checked in the package source), and allowed one deprecated build-tool package (`uuid` 7.0.3). All
   three are in ADR 0003. **The alternative is to add reanimated, gesture-handler and worklets at Expo's
   pinned versions, as Expo's own template does;** I chose not to, to keep the app small on 2 GB phones.
2. **`vite` is back in the catalog and the root `package.json`.** With peers no longer auto-installed, Vitest
   needs it explicitly; it had only been found because the old UI kit brought it in. Same version as Phase 0.
3. **`react-dom` stays in the catalog** (the plan removed it). It is the web preview's partner of `react` and
   must match it exactly. `@types/react-dom` is gone.
4. **No committed `expo-env.d.ts`.** The plan said to commit a static one. The Expo CLI deletes it, and
   removes it from `tsconfig.json`, whenever typed routes are off. `tsconfig.json` just includes `src`.
5. **Contrast unit tests were added** (`tokens.test.ts`, 32 tests). The plan listed "no flow tests" and did not
   say what replaces the axe contrast guard; this does.
6. **Components screen extras:** the mock API check next to the money check, and ten new message keys in
   three languages. The link to the screen shows only in development builds.
7. **Cards have no shadow.** React Native Web warns that `shadow*` props are deprecated, and shadows are
   costly on low-end Android; the 2 px border does the job.
8. **A top-level `scripts/` folder** holds the clean script (plain Node, no new dependency).
9. **`CLAUDE.md` changed in four lines, not three:** the plan's three edits plus `ui` removed from the
   `packages:` line, which would otherwise name a package that no longer exists. Exact diff is in `eb28e32`.
10. **Accessibility props:** the building blocks use `role` and `aria-*` rather than `accessibilityRole` and
    `accessibilityState`, because React Native Web silently dropped `accessibilityState`. Both are real
    React Native props; these work on the phone and in the preview.

## 7. Numbers

| Number                       | Value                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Android Hermes bundle        | 3.3 MB (2.6 MB before the building blocks, `contracts`, `mocks` and Zod were added) |
| Packages installed           | 822 (980 with the web setup)                                                        |
| Lowest text contrast         | 5.37:1 (info on its subtle background); AA needs 4.5:1                              |
| Lowest control-edge contrast | 4.08:1 (the input border on the canvas); AA needs 3:1                               |
| Tap targets                  | 48 dp minimum, tested                                                               |
| Text size                    | Follows the phone's setting, capped at 200% on `Text`                               |

## 8. Open risks and decisions for you

1. **Node.** The Node on this machine's PATH is `v26.7.0` (seen whenever a command ran without my helper), which
   `engine-strict` rejects (`>=24.21.0 <25`). Every command above ran with a portable Node 24.21.0 that lives
   outside the repository. Before `pnpm install`
   works for you, install 24.21.0: <https://nodejs.org/dist/v24.21.0/node-v24.21.0-x64.msi>, open a new
   terminal, and `node -v` must print `v24.21.0`. If you would rather stay on Node 26, say so: widening the
   pin is a deliberate change to ADR 0003 (React Native 0.86 itself allows Node 25 and up).
2. **Expo Go must support SDK 57.** Update it from the store before scanning.
3. **The on-device check is still open.** Money maths uses BigInt; Hermes compiles it, but only your phone can
   show it runs. The **On this phone** section shows `₹1,23,456.50` and `200 {"status":"ok"}`. If either
   shows `wrong`, the fallback is plain integer maths in `money.ts`.
4. **What leaving the PWA costs** (ADR 0007): customers install from the Play Store (or a sideloaded file in
   the pilot), a shared shop link has no preview unless we add a small public page, and iPhones are not
   covered. You asked for React Native; this is only to make sure the pilot plan accounts for it.
5. **`Sheet` has never run on a phone.** The back button, the keyboard and the animation are untested.
6. **Bundle size.** Expo Router brings a 971 KB icon font the app does not use, and Zod about 0.7 MB. Tuning is
   deferred, but the numbers are recorded in `PHASE-1-notes.md`.
7. **Carried over from Phase 0:** the OrderStatus table is a reconstructed stub to confirm against PLAN
   section 7; the Hindi and Marathi text (now about 10 strings more) is the assistant's draft and needs a
   native speaker; and there is still no test on a real low-end phone with a throttled network.
8. **No security layer, push, background location, OTA updates, crash monitoring or release setup**, by your
   instruction. `CLAUDE.md`'s basics hold.

## 9. Gate checklist for you

It is in [`PHASE-0b.md`](./PHASE-0b.md). The steps that need your hands:

1. Install Node 24.21.0, open a new terminal, `pnpm install`.
2. Update Expo Go, run `pnpm dev`, scan the QR code (README has the details).
3. Check the home screen, the three languages, the Components screen and the **On this phone** results, and
   try the largest font size.
4. If it all looks right, sign off and push the tag `phase-0-complete`. Phase 0 and Phase 0b close together.
