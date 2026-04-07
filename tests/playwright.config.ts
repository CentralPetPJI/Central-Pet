import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  globalSetup: "./global-setup.ts",
  use: {
    baseURL: "http://localhost:5174",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm dev:back:test",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "..",
    },
    {
      command:
        "VITE_API_URL=http://localhost:3001/api VITE_AUTH_STRATEGY=jwt pnpm dev:front --host 0.0.0.0 --port 5174",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "..",
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
