import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/** React components outside Next.js (packages/ui): hooks and accessibility rules. */
export const react = defineConfig({
  files: ['**/*.{ts,tsx}'],
  extends: [jsxA11y.flatConfigs.recommended, reactHooks.configs.flat.recommended],
  languageOptions: { globals: globals.browser },
});
