/**
 * ESLint Flat Config (ESLint 9+)
 *
 * Extends @react-native/eslint-config (flat variant) and layers project-specific
 * TypeScript rules on top. Ported from the legacy .eslintrc.js.
 */

const rnConfig = require('@react-native/eslint-config/flat');

module.exports = [
  // ── Global ignores (must be in its own config object) ─────────────────────
  {
    ignores: [
      'node_modules/',
      'android/',
      'ios/',
      'dist/',
      'build/',
      'coverage/',
      '.bundle/',
      'vendor/',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'jest.setup.js',
      '.prettierrc.js',
      'eslint.config.js',
    ],
  },

  // ── Base: React Native flat config (ESLint, TS, React, RN, Jest plugins) ──
  ...rnConfig,

  // ── Disable ft-flow rules globally ────────────────────────────────────────
  // eslint-plugin-ft-flow (ship-er bareng @react-native/eslint-config) belum
  // kompatibel dengan ESLint 9 — rule-nya call context.getAllComments() yang
  // sudah dihapus. Project ini TypeScript-only, jadi Flow rules tidak relevan.
  {
    rules: {
      'ft-flow/define-flow-type': 'off',
      'ft-flow/use-flow-type': 'off',
    },
  },

  // ── Project-specific rule overrides for TypeScript files ──────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // Allow `void promise.foo()` as a statement — idiomatic for fire-and-forget
      // (React Query invalidateQueries, BootSplash.hide, i18next.init, dll).
      'no-void': ['warn', { allowAsStatement: true }],
      // Allow components passed as props (e.g. react-navigation `headerLeft`,
      // `tabBar`, FlatList `renderItem`) — required pattern oleh React Navigation API.
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    },
  },
];
