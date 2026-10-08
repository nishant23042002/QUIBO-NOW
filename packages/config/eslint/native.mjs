import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * React Native (Expo) apps: the hooks rules, no text typed straight into a screen, and no colour
 * typed straight into a style.
 */
export const native = defineConfig({
  files: ['**/*.{ts,tsx}'],
  extends: [reactHooks.configs.flat.recommended],
  plugins: { react },
  rules: {
    // CLAUDE.md: no hard-coded UI strings, use message keys for en, hi, mr.
    'react/jsx-no-literals': ['error', { noStrings: false }],
    // The design is locked (ADR 0008): every colour comes from the theme, so both themes stay in step.
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
        message:
          'Use a colour from useTheme(), not a hex value. Colours live in src/theme/palette.ts.',
      },
      {
        selector: 'Literal[value=/^(rgb|hsl)a?\\(/]',
        message:
          'Use a colour from useTheme(), not rgb() or hsl(). Colours live in src/theme/palette.ts.',
      },
    ],
  },
});
