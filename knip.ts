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
  ignoreBinaries: ["commitlint", "info"],
  ignoreExportsUsedInFile: true,
  workspaces: {
    // Explicit workspace declarations so knip scans TypeScript source rather than
    // unbuilt dist/ files. Entry patterns are auto-detected from pnpm workspace but
    // listed here to ensure correct resolution order.
    "packages/ootle": {},
    "packages/ootle-indexer": {},
    "packages/ootle-secret-key-wallet": {},
    "packages/ootle-wallet-daemon-signer": {},
    "examples/connect-button": {},
    "examples/indexer-explorer": {},
    "examples/template-inspector": {},
  },
};

export default config;
