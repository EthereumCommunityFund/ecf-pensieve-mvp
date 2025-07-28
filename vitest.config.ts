import path from 'node:path';

import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: path.resolve(__dirname, '.env.local.test') });

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts', 'tests/unit/**/*.test.ts'],
    exclude: ['stories/**/*', '.storybook/**/*'],
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    globalSetup: ['tests/integration/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: [
        'lib/trpc/routers/**/*.ts',
        'lib/utils.ts',
        'lib/services/**/*.ts',
        'lib/utils/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  esbuild: {
    target: 'node20',
  },
});
