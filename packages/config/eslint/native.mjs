import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

/** React Native (Expo) apps: the hooks rules, and no text typed straight into a screen. */
export const native = defineConfig({
  files: ['**/*.{ts,tsx}'],
  extends: [reactHooks.configs.flat.recommended],
  plugins: { react },
  rules: {
    // CLAUDE.md: no hard-coded UI strings, use message keys for en, hi, mr.
    'react/jsx-no-literals': ['error', { noStrings: false }],
  },
});
