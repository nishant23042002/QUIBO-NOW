# 0003. Toolchain version pins

- **Status:** Accepted (Phase 0); updated in Phase 0b for the Expo apps and in Phase 0c for two more
  packages
- **Date:** 2026-10-08

## Context

Versions were looked up in the npm registry on 2026-10-08. Several current releases are brand-new majors,
and some of the latest versions cannot be used together. Every version is an exact pin (`.npmrc` has
`save-exact`), shared versions live in the `catalog:` of `pnpm-workspace.yaml`, and the lockfile is
committed. Anything below `latest` is listed here with the reason and the condition to revisit it.

## Decision

| Tool                                                            | Pinned to                                                                                                                                        | Latest seen | Why not latest, and when to revisit                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node                                                            | 24.21.0 (`.nvmrc`, engines)                                                                                                                      | 26.11.0     | 24 is the LTS. React Native 0.86 accepts Node 20.19.4+, 22.13+, 24.3+ or 25+, and lint-staged 17 needs 22.22.1+, so the previous local Node, 22.12.0, was too old. `engine-strict=true` makes a wrong Node fail loudly at install. Revisit when 26 becomes LTS.                                                                     |
| TypeScript                                                      | 6.0.3                                                                                                                                            | 7.0.2       | `typescript-eslint` 8.71.1 declares `typescript <6.1.0`, so TypeScript 7 would break type-aware linting. Expo SDK 57's own template also uses 6.0.x. Revisit when typescript-eslint supports 7.                                                                                                                                     |
| ESLint                                                          | 10.12.0                                                                                                                                          | 10.12.0     | The first plan was ESLint 9, but it reached end of life on 2026-08-06, and the rules we use were checked to run correctly on ESLint 10. `eslint-plugin-react` still lists ESLint 9 as its peer limit, so that one peer range is allowed in `peerDependencyRules`. Remove the allowance when the plugin publishes an ESLint 10 peer. |
| pnpm                                                            | 10.34.5                                                                                                                                          | 12.10.1     | Not stacked on top of this many new majors. Revisit as its own change.                                                                                                                                                                                                                                                              |
| Vitest, Vite                                                    | 5.0.3, 8.3.3                                                                                                                                     | same        | Current. Vitest lists Vite as a peer; because peers are not auto-installed (below), Vite is declared once, in the root `package.json`.                                                                                                                                                                                              |
| Expo SDK 57                                                     | `expo` 57.0.27, `expo-router` 57.0.25, React Native 0.86.3, React 19.2.3 and the other `expo-*` and `react-native-*` packages in `apps/customer` | SDK 57 list | The set is Expo SDK 57's own compatibility list, and `pnpm --filter @quibo/customer exec expo install --check` confirms it. Native modules must match the versions inside Expo Go, so they move together: upgrade by SDK, never one package at a time. React is pinned to the SDK's 19.2.3 for the whole repo.                      |
| `react-native-svg`, `@react-native-async-storage/async-storage` | 15.15.4, 2.2.0                                                                                                                                   | SDK 57 list | The exact versions Expo SDK 57 pins (`expo install --check` confirms them), added in Phase 0c for the logo and icons and for the remembered theme and language (ADR 0008). Each needs only `react` and `react-native`, so nothing extra is installed. They move with the SDK, like the other native modules.                        |
| Zod                                                             | 4.6.5                                                                                                                                            | same        | Current.                                                                                                                                                                                                                                                                                                                            |

**pnpm settings** (all in `pnpm-workspace.yaml`):

- `autoInstallPeers: false`. Expo Go contains one fixed version of each native module, and a peer that pnpm
  installs at "latest" does not match it. `expo-router` lists `react-native-reanimated` and
  `react-native-gesture-handler` as peers (through `react-native-drawer-layout`) for its Drawer and
  JS-stack layouts only. They are ignored by name in `peerDependencyRules.ignoreMissing`, because the
  native stack the app uses loads neither (checked in the package source), and leaving them out saves
  memory on 2 GB phones.
- `allowedDeprecatedVersions: uuid 7.0.3`. It arrives through Expo's config plugins (`xcode`), only in
  build tooling, never in the app.
- **Install scripts.** pnpm 10 skips dependency install scripts. Nothing is allowed to run one, and no
  remaining package needs it, so the Phase 0 `ignoredBuiltDependencies` list went with the packages it named.

## Consequences

- Upgrading any pinned tool is a deliberate change that updates this file.
- The settings above are the only places where a package manager warning was acknowledged instead of
  satisfied. Any other peer problem still prints, and a clean `pnpm install --frozen-lockfile` prints none.
- **History.** Phase 0 also pinned Next.js 16.4.0, Tailwind CSS 4.3.3, MSW 3.0.2, Storybook 10.6.1,
  Playwright 1.64.0 and next-intl 4.14.9 for the web customer app (and ran Lighthouse 13 by hand). Phase 0b
  removed them (ADR 0007). The admin panel pins its own web tools in Phase 3.
