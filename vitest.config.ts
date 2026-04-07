import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'src/**/types.ts',
        'src/**/index.ts',
        'node_modules/**',
      ],
      thresholds: {
        // Start with achievable thresholds, increase over time
        statements: 20,
        branches: 15,
        functions: 20,
        lines: 20,
      },
    },
  },
})
