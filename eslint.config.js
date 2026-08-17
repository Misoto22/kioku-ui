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
];
