import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  timeout: 30 * 1000,
  /*timeout for each expect() call. If the assertion is not met within this time, the test will fail. */
  expect: {
    timeout: 5000,
  },
  /*timeout for each test. If the test does not complete within this time, it will fail. */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list']]
    : [['html', { open: 'never' }]],
  /* Note: 'list' reporter is intentionally excluded locally — it causes console.log output to be printed
     twice (once from the worker, once echoed by the reporter). It is kept in CI for GitHub Actions log visibility. */
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',
    headless: true,
    /* Headless kept true for CI */
    trace: 'on-first-retry',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    screenshot: 'only-on-failure',
    /* screenshot only for failures */
    video: 'retain-on-failure',
    /* video tracing only for failures */
    har: { omitContent: false },
    /* HAR network capture - filtered to failures only via custom fixture */
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-headless',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: { width: 1580, height: 1080 },
        ...devices['Desktop Chrome']
      }
    },

    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized']
        }
      }
    },

    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1580, height: 1080 },
        ...devices['Desktop Firefox']
      }
    },

    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        viewport: { width: 1580, height: 1080 },
        ...devices['Desktop Safari']
      }
    },

    // Mobile viewports (optional)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  //Global Setup & Teardown
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

});
