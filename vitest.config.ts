import { defineConfig } from "vitest/config";

const testExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.next/**",
  "**/app/generated/**",
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    restoreMocks: true,
    exclude: testExclude,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude: [...testExclude, "**/*.integration.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "happy-dom",
          include: ["**/*.test.tsx"],
          exclude: testExclude,
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["**/*.integration.test.ts"],
          exclude: testExclude,
          setupFiles: ["./vitest.integration.setup.ts"],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
