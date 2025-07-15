import type { KnipConfig } from "knip";

const config: KnipConfig = {
  rules: {
    files: "error",
    dependencies: "warn",
    unlisted: "error",
    exports: "warn",
    types: "warn",
    duplicates: "error",
  },
  ignoreBinaries: ["commitlint"],
  ignoreExportsUsedInFile: true,
};

export default config;
