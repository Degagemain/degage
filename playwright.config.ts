import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  globalSetup: require.resolve('./e2e/global-setup'),
  timeout: 120_000,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-public',
      testMatch: /simulation\.public\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-admin',
      testMatch: [/admin\.users\.spec\.ts/, /admin\/.*\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
