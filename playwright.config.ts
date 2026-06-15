import { defineConfig, devices } from '@playwright/test';

/**
 * Airalo Partner API configuration
 *
 * 1. Explore the API:
 *    - Visit the Airalo Developer Portal to understand available endpoints and usage:
 *      https://developers.partners.airalo.com
 *
 * 2. Base URL:
 *    - https://partners-api.airalo.com/v2
 *
 * 3. Authentication (OAuth2 client credentials):
 *    - Obtain access tokens via POST /v2/token
 *    - Required params: client_id, client_secret, grant_type=client_credentials
 *    - Access tokens are valid for 24 hours (rate limit: 3 requests/minute)
 */
// Environment variables are loaded automatically from .env by Playwright (v1.45+).

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'playwright/e2e',
  fullyParallel: true,
  retries: 2,
  reporter: [['html', {outputFolder: 'playwright-report'}], ['list']],
  use: {
    baseURL: 'https://www.airalo.com',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
