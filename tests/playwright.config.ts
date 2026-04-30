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
      command: "pnpm dev:front:test",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "..",
    },
  ],
  // TODO: Verificar problema de concorrencia no adoption-workflow, por enquanto isso está ok, mas so foi necessario por erros de concorrencia
  projects: [
    {
      name: "adoption-workflow",
      testMatch: /adoption-workflow\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "remaining-tests",
      dependencies: ["adoption-workflow"],
      testIgnore: /adoption-workflow\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
