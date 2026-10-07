import { defineConfig, devices } from '@playwright/test';

// A port that is not the dev server's, so e2e always tests the production build and never
// silently reuses a `pnpm dev` that happens to be running.
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // No retries: a flaky test is a defect to fix, not to hide.
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  // Mobile first: these towns browse on phones.
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
  webServer: {
    // Needs `next build` first; `pnpm e2e` at the repo root runs the build before this.
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
