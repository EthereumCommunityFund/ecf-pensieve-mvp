import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@next/next/recommended',
    'prettier',
    'plugin:tailwindcss/recommended',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },

    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],

      'import/newline-after-import': [
        'error',
        {
          count: 1,
        },
      ],

      'no-empty-function': 'off',
      'no-useless-catch': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',

      'react/no-unknown-property': [
        'error',
        {
          ignore: ['css'],
        },
      ],

      'tailwindcss/no-contradicting-classname': [
        'error',
        {
          config: {
            classNameContradictions: {
              'font-mona': [],
              'font-saira': [],
              'font-sans': [],
            },
          },
        },
      ],
      'tailwindcss/no-custom-classname': [
        'warn',
        {
          whitelist: ['font-mona', 'font-saira', 'font-sans', 'scrollbar-hide'],
        },
      ],
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnpm-store/**',
      '**/package.json',
      '**/pnpm-lock.yaml',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/.DS_Store',
      '**/*.pem',
      '**/.pnpm-debug.log*',
      '**/.env*',
      '**/*.tsbuildinfo',
      '**/next-env.d.ts',
      '**/.idea/**',
      '**/.vscode/**',
      '**/README.md',
      '**/LICENSE',
    ],
  },
];
