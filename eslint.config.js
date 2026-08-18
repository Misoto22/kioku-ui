import kioku from './internal/eslint-plugin-kioku/src/index.mjs';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '.changeset/**',
      '.github/workflows/**',
      'apps/*/dist/**',
      'apps/example-*/.next/**',
      'apps/example-*/dist/**',
      'apps/storybook/storybook-static/**',
      'node_modules/**',
      'packages/*/dist/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    // Only the component sources answer to the token contract; tests, stories,
    // and templates legitimately spell out literal values.
    files: ['packages/core/src/**/*.tsx'],
    ignores: ['packages/core/src/**/*.test.tsx'],
    plugins: {kioku},
    rules: {
      'kioku/no-raw-design-values': 'error',
    },
  },
];
