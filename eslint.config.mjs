import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([globalIgnores(['**/dump-strings.js']), {
  extends: fixupConfigRules(compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  )),

  plugins: {
    'react-hooks': fixupPluginRules(reactHooks),
    '@typescript-eslint': fixupPluginRules(typescriptEslint),
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  settings: {
    react: {
      version: '16.14.0',
    },

    'import/resolver': {
      typescript: true,
    },
  },

  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    'no-multiple-empty-lines': ['error', {
      max: 1,
      maxEOF: 1,
    }],

    'comma-style': ['error', 'last'],

    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],

    'object-curly-spacing': ['error', 'always'],

    'object-curly-newline': ['error', {
      ImportDeclaration: {
        multiline: true,
        minProperties: 6,
      },
    }],

    'quote-props': ['error', 'as-needed'],
    'arrow-parens': ['error', 'always'],
    'no-trailing-spaces': ['error'],
    'jsx-quotes': ['error', 'prefer-double'],
    'no-multi-spaces': 'error',
    'no-duplicate-imports': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'react/jsx-wrap-multilines': ['error', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'ignore',
    }],

    'react/jsx-tag-spacing': ['error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'proportional-always',
    }],

    'react/jsx-curly-spacing': ['error', {
      when: 'never',
      children: true,
    }],

    'react/self-closing-comp': ['error', {
      component: true,
      html: true,
    }],

    'react/jsx-closing-bracket-location': ['error'],

    '@typescript-eslint/ban-ts-comment': [2, {
      'ts-ignore': 'allow-with-description',
    }],

    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default': 'off',
    'import/first': 'error',

    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
        'object',
        'type',
      ],

      'newlines-between': 'always',
    }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}]);