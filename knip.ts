import type { KnipConfig } from "knip";

const config: KnipConfig = {
  rules: {
    files: "error",
    dependencies: "warn",
    unlisted: "warn",
    exports: "warn",
    types: "warn",
    duplicates: "warn",
  },
  ignoreBinaries: ["commitlint"],
  ignoreExportsUsedInFile: true,
  ignore: ["docusaurus/**/*.ts"],
};

export default config;
