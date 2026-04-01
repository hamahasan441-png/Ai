import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      // Allow explicit any for gradual migration
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Enforce no console in production code (use logError/logForDebugging)
      'no-console': 'warn',
      // Prefer const
      'prefer-const': 'error',
      // No var
      'no-var': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', '*.config.*'],
  },
)
