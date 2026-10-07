# Quibo Now

Hyperlocal grocery delivery for tier 3 and 4 Indian towns. Customers order from the kirana, dairy and
vegetable shops in their own town; shops accept and pack; paid riders deliver. Partner stores are the
default, and a single company dark store per town is a switchable alternative. We promise a delivery
**window**, never minutes. Quibo Now is a working name; the brand is not decided.

- Plan: [`docs/PLAN.md`](docs/PLAN.md). Working rules: [`CLAUDE.md`](CLAUDE.md).
- **Current status:** Phase 0 (foundation). See [`docs/phases/`](docs/phases/).

## Requirements

| Tool    | Version                                  | Notes                                                                                                                                               |
| ------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js | **24.21.0** (see `.nvmrc`)               | `engine-strict` is on: `pnpm install` stops on any other major. On Windows: `winget install OpenJS.NodeJS.LTS`. Elsewhere: `nvm`, `fnm` or `volta`. |
| pnpm    | **10.x** (`packageManager` says 10.34.5) | `corepack enable` on Node 24, or `npm install -g pnpm@10.34.5`. pnpm 10 switches to the pinned version by itself.                                   |
| Git     | any recent                               |                                                                                                                                                     |
| Docker  | optional                                 | Only for `infra/` (PostgreSQL and Redis), which nothing uses until Phase 2.                                                                         |

## Set up

```bash
git clone <this repository> && cd QUIBO-NOW
pnpm install --frozen-lockfile        # also installs the git hooks (Husky)
pnpm --filter @quibo/customer-web exec playwright install chromium   # once; needed by pnpm a11y and pnpm e2e (about 720 MB)
cp .env.example .env                  # optional until Phase 2; .env is git-ignored
```

Then `pnpm dev` and open <http://localhost:3000>. `/` sends you to `/en`, `/hi` or `/mr` by browser language.

## Commands

Run from the repository root. Turborepo runs each one in every workspace that has it and caches the result.

| Command                | What it does                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm dev`             | Customer app on <http://localhost:3000>                                                      |
| `pnpm lint`            | ESLint in every workspace (zero warnings allowed) and the Prettier check                     |
| `pnpm typecheck`       | `tsc --noEmit` everywhere (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `pnpm test`            | Vitest unit tests. No browser needed.                                                        |
| `pnpm build`           | Production build of the apps                                                                 |
| `pnpm e2e`             | Builds, then runs the Playwright smoke test against the production build on port 3100        |
| `pnpm storybook`       | Storybook for `packages/ui` on <http://localhost:6006>                                       |
| `pnpm build-storybook` | Static Storybook build                                                                       |
| `pnpm a11y`            | Renders every Storybook story in real Chromium and fails on any axe violation                |
| `pnpm format`          | Prettier, write                                                                              |

CI (`.github/workflows/ci.yml`) runs: install, lint, typecheck, test, build, a11y, build-storybook, e2e.

## Layout

```text
apps/
  customer-web/   Next.js PWA (phases 1 and 2)           <- the only real app so far
  admin/          Next.js ops panel, store portal, dark-store console (phases 3 and 4)   placeholder
  driver/         Expo React Native rider app (phases 5 and 6)                           placeholder
  api/            NestJS modular monolith (from phase 2)                                 placeholder
  worker/         BullMQ jobs (from phase 2)                                             placeholder
packages/
  contracts/      Zod schemas and types: Money, ids, fulfilment enums, order status
  mocks/          MSW handlers and typed fixtures (the mock API)
  ui/             Design tokens, Tailwind theme, primitives, Storybook
  i18n/           English, Hindi and Marathi messages and the checks that keep them in step
  config/         Shared tsconfig, ESLint config, env validation
infra/            docker-compose for PostgreSQL with PostGIS and Redis
docs/
  PLAN.md         The plan (do not edit casually)
  decisions/      One short file per architecture decision
  phases/         PHASE-N.md, PHASE-N-report.md, PHASE-N-notes.md, PHASE-TEMPLATE.md
```

`packages/db` does not exist yet; it arrives in Phase 2.

## How we work: UI first, phase-gated

The full rules are in [`CLAUDE.md`](CLAUDE.md). In short:

1. **Surface order:** customer app, then admin panel (with the store portal), then driver app. Each
   surface is a **UI phase on mock data**, then a **live phase** against the real API.
2. **One phase at a time**, described in `docs/phases/PHASE-N.md`. Never build ahead: ideas for later go in
   `PHASE-(N+1)-notes.md`.
3. **Plan first.** Every task starts with a written plan that is approved before any code.
4. **A phase is done only when its gate passes:** lint, typecheck, unit tests, e2e, build, accessibility
   and performance checks, with zero open blocker or major defects.
5. At the end of a phase, write `docs/phases/PHASE-N-report.md`, then stop. The human signs off and tags
   `phase-N-complete`.

Screens read data through the contracts in `packages/contracts`, served by the mock API in UI phases and by
the real API in live phases (ADR 0001). Fulfilment mode (partner, dark or hybrid) is town configuration and
shared code never branches on it (ADR 0002).

## Conventions

- **Conventional commits** (`feat(ui): ...`, `fix: ...`). The commit-msg hook rejects anything else.
- **The pre-commit hook** runs ESLint and Prettier on staged files. Do not skip hooks or loosen a check to
  get green; fix the cause.
- **Money is integer paise**, never a float. **No hard-coded UI strings:** use message keys in `packages/i18n`.
- **Ask before adding a dependency.** Record architecture decisions in `docs/decisions/`.
- **No "10-minute" copy anywhere**, and no rider penalties for lateness. A test enforces the first.

## Troubleshooting

- **`ERR_PNPM_UNSUPPORTED_ENGINE`:** your Node is not 24.x. Check `node -v` and install 24.21.0.
- **Port 3000 or 3100 is busy:** stop the other process; the dev and e2e servers fail instead of changing port.
- **`pnpm a11y` or `pnpm e2e` cannot find a browser:** run the `playwright install chromium` command above.
- **A cached build looks stale after switching branches:** delete `apps/customer-web/.next` and rebuild.
- **Line endings:** `.gitattributes` forces LF; if Git reports whole-file changes on Windows, do not
  commit them and tell the maintainer.

## Docs

- Decisions: [`docs/decisions/`](docs/decisions/) (UI first, fulfilment mode, version pins, packages as
  source, money, locale routing)
- Phase 0: [`checklist`](docs/phases/PHASE-0.md), [`report`](docs/phases/PHASE-0-report.md), and
  [`notes for Phase 1`](docs/phases/PHASE-1-notes.md)
- Local infrastructure: [`infra/README.md`](infra/README.md)
