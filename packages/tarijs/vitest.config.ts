import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig({
  root: ".",
  test: {
    // Not sure why this doesnt work
    env: loadEnv("", process.cwd() + "/test/integration-tests/", ""),
  },
});
