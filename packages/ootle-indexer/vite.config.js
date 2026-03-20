import dts from "unplugin-dts/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    dts({
      outDirs: "dist",
      entryRoot: "src",
      bundleTypes: true,
    }),
    wasm(),
    topLevelAwait(),
  ],
  build: {
    lib: {
      name: "@tari-project/ootle-indexer",
      entry: "src/index.ts",
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      external: ["@tari-project/ootle-ts-bindings", "@tari-project/ootle"],
      output: {
        globals: {
          "@tari-project/ootle-ts-bindings": "ootle-ts-bindings",
          "@tari-project/ootle": "ootle",
        },
      },
    },
  },
};
