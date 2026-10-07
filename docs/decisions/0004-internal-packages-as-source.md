# 0004. Internal packages are consumed as TypeScript source

- **Status:** Accepted (Phase 0)
- **Date:** 2026-10-08

## Context

`packages/contracts`, `config`, `i18n`, `mocks` and `ui` are used by several apps. Each could be compiled
to JavaScript and declaration files first, or imported as source.

## Decision

Internal packages export their TypeScript source (`"exports": { ".": "./src/index.ts" }`) and have no build
step. The consumers compile them: Next.js through `transpilePackages`, Vite, Vitest and Storybook directly.
Type checking runs per package (`tsc --noEmit`). `pnpm build` therefore builds only the apps.

## Consequences

- No watch-and-rebuild loop, no stale `dist/`, and a change in `contracts` is visible to every consumer
  immediately.
- **Phase 2 must decide how the NestJS API consumes the packages.** Nest compiles to CommonJS with `tsc`
  or SWC and does not transpile workspace TypeScript by default. Options: add a small build step to
  `contracts` (and `config`'s env loader) that emits ESM and CJS, or bundle the API with esbuild. This is
  not decided now because nothing in Phase 0 needs it.
- Each consuming Next.js app must list the packages in `transpilePackages`, and Tailwind must be pointed
  at `packages/ui/src` with `@source` (see `apps/customer-web/src/app/globals.css`).
