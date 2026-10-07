# Phase 0: Foundation

**Goal.** Create the monorepo skeleton, tooling, design-system foundation, shared contracts package,
mock-API package, i18n scaffold and CI, so that Phase 1 (customer UI on mock data) starts with zero setup
work. **No business logic, no real screens beyond the placeholder home and the Storybook primitives, no API
endpoints, no database schema.**

Results of the verification run are in [`PHASE-0-report.md`](./PHASE-0-report.md). Boxes below are ticked
only for what was checked by command; the last section is for the human to verify.

## A. Workspace and tooling

- [ ] pnpm workspaces and Turborepo; Node pinned in `.nvmrc` and `engines`; `packageManager` set
- [ ] TypeScript strict everywhere (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) from a shared base in `packages/config`
- [ ] ESLint (flat config), Prettier, EditorConfig, Husky with lint-staged, commitlint
- [ ] Vitest for unit tests, Playwright for end-to-end tests, Storybook for `packages/ui` with the accessibility add-on
- [ ] GitHub Actions: frozen-lockfile install, lint, typecheck, test, build, Playwright smoke test; pnpm and Turborepo caches
- [ ] `.env.example` and a Zod-validated env loader in `packages/config`; no secrets in the repository

## B. Folder structure

- [ ] `apps/customer-web`: runnable Next.js app (App Router, TypeScript, Tailwind), PWA manifest, placeholder home, en/hi/mr language switcher, nothing more
- [ ] `apps/admin`, `apps/driver`, `apps/api`, `apps/worker`: placeholder workspaces that pass lint and typecheck, each with a README naming its phase
- [ ] `packages/contracts`: Money (integer paise, branded, add, subtract, multiply by quantity, rupee formatting, tests), TownId, FulfilmentMode, StockMode, StoreType, OrderStatus with the allowed-transitions table (stub), one index export
- [ ] `packages/mocks`: MSW with a single `/health` handler and two fixtures typed by the contracts (a town in partner mode, a town in dark-store mode)
- [ ] `packages/ui`: design tokens as CSS variables, a Tailwind theme, `Button`, `Input`, `Card`, `Badge`, `Sheet`, each with Default, Disabled, Loading and Error stories; tap targets at least 48px
- [ ] `packages/i18n`: en, hi, mr message files and a test that fails if any key is missing in any language
- [ ] `packages/config`: tsconfig, eslint, env validation
- [ ] `infra/docker-compose.yml` (PostgreSQL + PostGIS, Redis) and a README
- [ ] `docs/decisions/0001` and `0002`, this file, and `PHASE-TEMPLATE.md`; `PLAN.md` and `CLAUDE.md` untouched

## C. Guardrails

- [ ] Root README with setup steps, commands and the phase workflow
- [ ] Versions looked up at install time; dependencies not named in the prompt were approved in the plan
- [ ] No business logic, no extra screens, no API endpoints, no database schema

## Verification

1. [ ] Fresh clone: remove `node_modules`, run `pnpm install --frozen-lockfile`
2. [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
3. [ ] `pnpm dev` serves customer-web on port 3000; the home page loads; the switcher changes visible text for en, hi and mr
4. [ ] `pnpm build-storybook` builds; axe reports no violations on the primitives (`pnpm a11y`)
5. [ ] `pnpm e2e` smoke test passes (home loads, language switch works)
6. [ ] Lighthouse mobile run on the home page: scores and first-load JavaScript size
7. [ ] The CI workflow file is valid and its steps match the commands above
8. [ ] Money tests cover rounding, addition, negative values and rupee formatting
9. [ ] Contract tests show `FulfilmentMode`, `StockMode` and `StoreType` accept valid values and reject invalid ones

## Budgets (working targets, set here as PLAN section 16 asks)

- **First-load JavaScript on the home route: 130 kB gzip or less.** Next 16 no longer prints this in
  `next build`, so it is measured from the browser's network trace and Lighthouse.
- **Lighthouse mobile performance: 90 or higher** on the home page.

## Gate checklist for the human (PLAN section 16)

- [ ] Plan approved before coding; nothing outside the phase was built
- [ ] Node 24.21.0 is active (`node -v`); a fresh clone installs with `pnpm install --frozen-lockfile`
- [ ] `lint`, `typecheck`, `test` and `build` pass on a clean install with no warnings
- [ ] Playwright flows pass locally and in CI (the Phase 0 flows cover the language switcher; the two
      fulfilment modes appear in fixtures only, because there are no mode-dependent screens yet)
- [ ] axe finds no violations; the home page stays usable at 200% text size
- [ ] Lighthouse mobile performance 90 or higher, and first-load JavaScript inside the budget above
- [ ] Tested by hand on a real low-end Android phone with a throttled network
- [ ] **The OrderStatus table matches the lifecycle diagram in PLAN section 7** (it is a reconstructed
      stub; see `packages/contracts/src/order-status.ts`)
- [ ] **Hindi and Marathi text reviewed by a native speaker** (drafted by the assistant)
- [ ] No secrets in the repository; `.env.example` holds placeholders only
- [ ] No open blocker or major defects; minor ones are logged with an owner (see the report)
- [ ] Verification report read, demo done, sign-off recorded, tag `phase-0-complete` pushed
