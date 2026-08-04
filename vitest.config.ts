import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/api/**/*.test.ts"],
    setupFiles: ["tests/config/setup.ts"],
    fileParallelism: false,
    reporters: [
      "default",
      "junit",
      "allure-vitest/reporter",
    ],
    outputFile: {
      junit: "./reports/junit/api-tests.xml",
    },
  },
});
