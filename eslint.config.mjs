import globals from 'globals';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'build/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      // 💅 Let Prettier handle styling
      ...prettierConfig.rules, // Disables conflicting ESLint formatting rules

      // ✅ Enable Prettier as an ESLint rule
      'prettier/prettier': 'error',

      // 🛠️ Linting rules (best practices)
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off',
    },
  },
];
