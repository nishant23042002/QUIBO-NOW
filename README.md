# Quibo Now

Hyperlocal grocery delivery for tier 3 and 4 Indian towns. Customers order from the kirana, dairy and
vegetable shops in their own town; shops accept and pack; paid riders deliver. Partner stores are the
default, and a single company dark store per town is a switchable alternative. We promise a delivery
**window**, never minutes. Quibo Now is a working name; the brand is not decided.

- Plan: [`docs/PLAN.md`](docs/PLAN.md). Working rules: [`CLAUDE.md`](CLAUDE.md).
- **Current status:** Phase 0 (foundation), including Phase 0b, which made the customer app a React Native
  app. See [`docs/phases/`](docs/phases/).

## Requirements

| Tool    | Version                                  | Notes                                                                                                                                                                                           |
| ------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js | **24.21.0** (see `.nvmrc`)               | `engine-strict` is on: `pnpm install` stops on any other major. On Windows use the installer from <https://nodejs.org/dist/v24.21.0/node-v24.21.0-x64.msi>. Elsewhere: `nvm`, `fnm` or `volta`. |
| pnpm    | **10.x** (`packageManager` says 10.34.5) | `corepack enable` on Node 24, or `npm install -g pnpm@10.34.5`. pnpm 10 switches to the pinned version by itself.                                                                               |
| Git     | any recent                               |                                                                                                                                                                                                 |
| Expo Go | the current store version                | On your phone, from the Play Store or the App Store. It must support Expo SDK 57, so update it first.                                                                                           |
| Docker  | optional                                 | Only for `infra/` (PostgreSQL and Redis), which nothing uses until Phase 2.                                                                                                                     |

## Set up

```bash
git clone <this repository> && cd QUIBO-NOW
pnpm install --frozen-lockfile        # also installs the git hooks (Husky)
cp .env.example .env                  # optional until Phase 2; .env is git-ignored
```

## Run the customer app on your phone

1. Put the phone and the computer on the **same Wi-Fi**.
2. Run `pnpm dev`. A QR code appears in the terminal. If Windows asks whether to let Node through the
   firewall, allow it on private networks.
3. Open **Expo Go** on the phone. On Android tap **Scan QR code**; on an iPhone use the Camera app.
4. The first load takes up to a minute while the app is bundled. Later reloads are fast.

What you should see:

- The home screen in your phone's language (English, Hindi or Marathi) with three language buttons. Tap
  one and the whole screen changes.
- A **Components** button. It opens every building block in every state.
- At the bottom of that screen, **On this phone** shows `₹1,23,456.50` and `200 {"status":"ok"}`, each with
  a green `ok`. This is the check that money maths and the mock API work on your phone's own JavaScript
  engine. If either shows `wrong`, or the screen shows an error, that is a defect: tell the maintainer.
- Large text: in the phone's settings set the font size to the largest. Nothing should be cut off.

Stop with Ctrl+C. To see the app in a desktop browser instead, press `w` in the terminal (a preview for
developers; the phone is the real target).

## Commands

Run from the repository root. Turborepo runs each one in every workspace that has it and caches the result.

| Command          | What it does                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm dev`       | Starts the customer app's dev server (QR code for Expo Go). Extra flags pass through: `pnpm dev --tunnel`   |
| `pnpm lint`      | ESLint in every workspace (zero warnings allowed) and the Prettier check                                    |
| `pnpm typecheck` | `tsc --noEmit` everywhere (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)                |
| `pnpm test`      | Vitest unit tests. No phone or browser needed.                                                              |
| `pnpm build`     | Bundles the customer app for Android with Metro and compiles it for Hermes (output in `apps/customer/dist`) |
| `pnpm format`    | Prettier, write                                                                                             |
| `pnpm clean`     | Deletes build output and caches. Never touches `node_modules`, `.env` or the git hooks.                     |

CI (`.github/workflows/ci.yml`) runs: install, lint, typecheck, test, build.

## Layout

```text
apps/
  customer/       Expo (React Native) customer app (phases 1 and 2)                      <- the only real app so far
  driver/         Expo (React Native) rider app (phases 5 and 6)                         placeholder
  admin/          Next.js ops panel, store portal, dark-store console (phases 3 and 4)   placeholder
  api/            NestJS modular monolith (from phase 2)                                 placeholder
  worker/         BullMQ jobs (from phase 2)                                             placeholder
packages/
  contracts/      Zod schemas and types: Money, ids, fulfilment enums, order status
  mocks/          The mock API (plain functions) and typed fixtures
  i18n/           English, Hindi and Marathi messages, a typed translate(), and the checks that keep them in step
  config/         Shared tsconfig, ESLint config, env validation
scripts/          The clean script
infra/            docker-compose for PostgreSQL with PostGIS and Redis
docs/
  PLAN.md         The plan (do not edit casually)
  decisions/      One short file per architecture decision
  phases/         PHASE-N.md, PHASE-N-report.md, PHASE-N-notes.md, PHASE-TEMPLATE.md
```

Inside the customer app: `src/app` holds the screens (one file per screen, Expo Router), `src/ui` the
building blocks and design tokens, `src/i18n` the language switch.

`packages/db` does not exist yet; it arrives in Phase 2.

## How we work: UI first, phase-gated

The full rules are in [`CLAUDE.md`](CLAUDE.md). In short:

1. **Surface order:** customer app, then admin panel (with the store portal), then driver app. Each
   surface is a **UI phase on mock data**, then a **live phase** against the real API.
2. **One phase at a time**, described in `docs/phases/PHASE-N.md`. Never build ahead: ideas for later go in
   `PHASE-(N+1)-notes.md`.
3. **Plan first.** Every task starts with a written plan that is approved before any code.
4. **A phase is done only when its gate passes:** lint, typecheck, unit tests, flow tests, build,
   accessibility and performance checks, with zero open blocker or major defects.
5. At the end of a phase, write `docs/phases/PHASE-N-report.md`, then stop. The human signs off and tags
   `phase-N-complete`.

Screens read data through the contracts in `packages/contracts`, served by the mock API in UI phases and by
the real API in live phases (ADR 0001). Fulfilment mode (partner, dark or hybrid) is town configuration and
shared code never branches on it (ADR 0002).

## Conventions

- **Conventional commits** (`feat(customer): ...`, `fix: ...`). The commit-msg hook rejects anything else.
- **The pre-commit hook** runs ESLint and Prettier on staged files. Do not skip hooks or loosen a check to
  get green; fix the cause.
- **Money is integer paise**, never a float. **No hard-coded UI strings:** use message keys in `packages/i18n`
  (the linter rejects text typed straight into a screen).
- **Ask before adding a dependency.** Record architecture decisions in `docs/decisions/`.
- **No "10-minute" copy anywhere**, and no rider penalties for lateness. A test enforces the first.
- **Security hardening comes later** (ADR 0007). The basics hold now: no secrets in git, never log OTPs or
  Aadhaar numbers.

## Troubleshooting

- **`ERR_PNPM_UNSUPPORTED_ENGINE`:** your Node is not 24.x. Check `node -v` and install 24.21.0.
- **Expo Go says the project needs a newer version, or the SDK is not supported:** update Expo Go from the
  store. The app is built for Expo SDK 57.
- **The phone cannot reach the dev server:** check both are on the same Wi-Fi (guest and office networks
  often block it), and that the firewall allows Node on private networks. Or run `pnpm dev --tunnel`; Expo
  asks to install a small helper the first time.
- **Port 8081 is busy:** stop the other dev server, or accept the other port Expo offers.
- **`pnpm clean` says a folder could not be removed:** a dev server is still running. Stop it with Ctrl+C.
- **Line endings:** `.gitattributes` forces LF; if Git reports whole-file changes on Windows, do not
  commit them and tell the maintainer.

## Docs

- Decisions: [`docs/decisions/`](docs/decisions/) (UI first, fulfilment mode, version pins, packages as
  source, money, the old web routing, and the switch to Expo apps)
- Phase 0: [`checklist`](docs/phases/PHASE-0.md) and [`report`](docs/phases/PHASE-0-report.md). Phase 0b
  (the React Native switch): [`checklist`](docs/phases/PHASE-0b.md) and
  [`report`](docs/phases/PHASE-0b-report.md). [`Notes for Phase 1`](docs/phases/PHASE-1-notes.md)
- Local infrastructure: [`infra/README.md`](infra/README.md)
