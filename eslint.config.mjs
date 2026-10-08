import { base, ignores, native, react } from '@quibo/config/eslint';
import { defineConfig } from 'eslint/config';

// One config for the whole repo. Every workspace's `lint` script runs `eslint .`
// from its own folder and finds this file. Framework rules are scoped by path.
export default defineConfig(
  ignores,
  base,
  { files: ['apps/customer/**'], extends: [native] },
  { files: ['packages/ui/**'], extends: [react] },
);
