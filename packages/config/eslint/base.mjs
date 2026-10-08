import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Paths no workspace should ever lint. */
export const ignores = globalIgnores([
  '**/node_modules/**',
  '**/.turbo/**',
  '**/.expo/**',
  '**/dist/**',
  '**/coverage/**',
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
  },
  prettier,
);
