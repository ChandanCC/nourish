import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.NOURIQ_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: '.',
  testMatch: ['smoke/**/*.spec.js', 'visual/**/*.spec.js', 'replay/**/*.spec.js'],
  outputDir: 'reports/playwright-results',
  snapshotDir: 'visual/baselines',

  use: {
    baseURL: BASE_URL,
    viewport: { width: 390, height: 844 }, // iPhone 14 — primary target
    colorScheme: 'dark',
    locale: 'en-IN',
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  },

  // Start Vite preview server if not already running
  webServer: {
    command: 'npm run build -w frontend && npm run preview -w frontend',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],

  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/playwright.json' }],
  ],

  timeout: 15_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // single server, sequential is more stable
  retries: 0,
});
