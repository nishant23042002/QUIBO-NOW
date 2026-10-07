import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Paths no workspace should ever lint. */
export const ignores = globalIgnores([
  '**/node_modules/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/dist/**',
  '**/coverage/**',
  '**/storybook-static/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/next-env.d.ts',
]);

/** TypeScript-first rules for every workspace. Type-aware via the project service. */
export const base = defineConfig(
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always'],
      // Never log request bodies, OTPs or Aadhaar numbers (CLAUDE.md). Allow warn/error only.
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Plain JS config files are not part of any tsconfig, so skip type-aware rules there.
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
    rules: {
      // Next's Babel parser (used for JS files by eslint-config-next) does not give the
      // TypeScript variant the scope data it needs and it wrongly reports `export default x`
      // as unused. ESLint's core rule is used for JS files instead.
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  prettier,
);
