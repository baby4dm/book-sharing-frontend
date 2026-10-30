import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:5180", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: {
        ...devices["Desktop Chrome"],
        // Шлях до вже встановленого Chromium, якщо браузер Playwright не завантажено
        launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
      } }],
  webServer: {
    command: "npx vite --port 5180 --strictPort",
    url: "http://localhost:5180",
    reuseExistingServer: true,
  },
});
