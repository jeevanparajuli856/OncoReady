import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT || 5173);

export default defineConfig({
  testDir: './tests',
  testMatch: '**/e2e.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${previewPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    port: previewPort,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
