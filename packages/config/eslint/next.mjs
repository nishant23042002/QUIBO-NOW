import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

/**
 * Next.js app rules: eslint-config-next (react, react-hooks, jsx-a11y, import and
 * @next/next) plus the project's own guard against hard-coded UI strings.
 */
export const next = defineConfig(nextVitals, {
  files: ['**/*.tsx'],
  rules: {
    // CLAUDE.md: no hard-coded UI strings, use message keys for en, hi, mr.
    'react/jsx-no-literals': ['error', { noStrings: false }],
  },
});
