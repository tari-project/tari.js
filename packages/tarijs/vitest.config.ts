import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  root: '.',
  test: {
    env: loadEnv("", "./integration-tests/", ""),
  },
});
