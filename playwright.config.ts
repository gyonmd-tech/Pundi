import { defineConfig, devices } from "@playwright/test";

/**
 * E2E jalur kritis (P0), dijalankan terhadap build produksi (`next start`).
 * Memakai mode demo, jadi tidak butuh Appwrite. Jalankan:
 *   npm run build && npm run test:e2e
 */
const PORT = Number(process.env.E2E_PORT || 3200);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testMatch: /landing\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
