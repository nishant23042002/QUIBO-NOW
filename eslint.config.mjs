import { base, ignores, native } from '@quibo/config/eslint';
import { defineConfig } from 'eslint/config';

// One config for the whole repo. Every workspace's `lint` script runs `eslint .`
// from its own folder and finds this file. Framework rules are scoped by path.
export default defineConfig(
  ignores,
  base,
  { files: ['apps/customer/**'], extends: [native] },
  {
    // The only places a colour value may be typed: the palette itself, and tests, which need
    // literal colours to prove the contrast check can fail.
    files: ['apps/customer/src/theme/palette.ts', 'apps/customer/**/*.test.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
