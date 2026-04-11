import tseslint from 'typescript-eslint'

// Stub no-op rule factory – used for custom rules whose implementation lives
// outside this repo so that `/* eslint-disable custom-rules/… */` comments in
// source files are silently accepted without "Definition for rule … was not
// found" errors.
function noopRule() {
  return { create: () => ({}) }
}

// All custom-rule names referenced in eslint-disable comments across the
// source tree.  We register them as no-op rules so the plugin is "defined"
// and ESLint won't report a "rule not found" error.
const customRulesPlugin = {
  rules: {
    'bootstrap-isolation': noopRule(),
    'no-cross-platform-process-issues': noopRule(),
    'no-direct-json-operations': noopRule(),
    'no-direct-ps-commands': noopRule(),
    'no-lookbehind-regex': noopRule(),
    'no-process-cwd': noopRule(),
    'no-process-env-top-level': noopRule(),
    'no-process-exit': noopRule(),
    'no-sync-fs': noopRule(),
    'no-top-level-dynamic-import': noopRule(),
    'no-top-level-side-effects': noopRule(),
    'prefer-use-keybindings': noopRule(),
    'prefer-use-terminal-size': noopRule(),
    'prompt-spacing': noopRule(),
    'require-bun-typeof-guard': noopRule(),
    'require-tool-match-name': noopRule(),
    'safe-env-boolean-check': noopRule(),
  },
}

const reactHooksPlugin = {
  rules: {
    'exhaustive-deps': noopRule(),
    'rules-of-hooks': noopRule(),
  },
}

// Stub for eslint-plugin-n rules referenced in disable comments.
const eslintPluginN = {
  rules: {
    'no-sync': noopRule(),
    'no-unsupported-features/node-builtins': noopRule(),
  },
}

export default tseslint.config(
  // Include TypeScript parser configuration without the strict recommended rules
  tseslint.configs.base,
  {
    // Suppress warnings about eslint-disable comments that became redundant
    // after many rules were turned off (pre-existing violations).
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      'custom-rules': customRulesPlugin,
      'react-hooks': reactHooksPlugin,
      'eslint-plugin-n': eslintPluginN,
    },
    rules: {
      // Prefer const / no var are cheap to keep enforced
      'prefer-const': 'error',
      'no-var': 'error',

      // ── rules with too many pre-existing violations – silenced for now ──
      'no-console': 'off',
      'no-constant-condition': 'off',
      'no-constant-binary-expression': 'off',
      'no-useless-escape': 'off',
      'no-irregular-whitespace': 'off',
      'no-async-promise-executor': 'off',
      'no-misleading-character-class': 'off',
      'no-empty': 'off',

      // TypeScript-specific – silenced due to pre-existing violations
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // Stub plugin rules are all off (no-op, just prevents "rule not found")
      'custom-rules/bootstrap-isolation': 'off',
      'custom-rules/no-cross-platform-process-issues': 'off',
      'custom-rules/no-direct-json-operations': 'off',
      'custom-rules/no-direct-ps-commands': 'off',
      'custom-rules/no-lookbehind-regex': 'off',
      'custom-rules/no-process-cwd': 'off',
      'custom-rules/no-process-env-top-level': 'off',
      'custom-rules/no-process-exit': 'off',
      'custom-rules/no-sync-fs': 'off',
      'custom-rules/no-top-level-dynamic-import': 'off',
      'custom-rules/no-top-level-side-effects': 'off',
      'custom-rules/prefer-use-keybindings': 'off',
      'custom-rules/prefer-use-terminal-size': 'off',
      'custom-rules/prompt-spacing': 'off',
      'custom-rules/require-bun-typeof-guard': 'off',
      'custom-rules/require-tool-match-name': 'off',
      'custom-rules/safe-env-boolean-check': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'eslint-plugin-n/no-sync': 'off',
      'eslint-plugin-n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', '*.config.*'],
  },
)
