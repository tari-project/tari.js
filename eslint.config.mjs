// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      // "no-console": ["warn", { allow: ["info", "warn", "debug", "error"] }],
      "no-unused-vars": "off", // base rule must be disabled
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
    ignores: ["**/*.config.js", "!**/eslint.config.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: ".",
      },
    },
  },
  eslintConfigPrettier,
);
