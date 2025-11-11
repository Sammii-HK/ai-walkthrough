import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/__mocks__/**',
        '**/*.config.{ts,js}',
        '**/test/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@ai-walkthrough/core': path.resolve(__dirname, './packages/core/src'),
      '@ai-walkthrough/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});

