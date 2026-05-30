import { defineConfig, devices } from "@playwright/test";

// vite preview のデフォルトポート（4173）で確認する。
const BASE_URL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    url: BASE_URL,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
