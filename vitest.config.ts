import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      // точка входу лише монтує застосунок у DOM
      exclude: ["src/main.tsx", "src/**/*.d.ts", "src/test/**"],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
