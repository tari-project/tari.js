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
      entry: "src/index.ts",
      name: "@tari-project/ootle",
      formats: ["es"],
    },
    rolldownOptions: {
      external: ["@tari-project/ootle-ts-bindings"],
      output: {
        globals: {
          "@tari-project/ootle-ts-bindings": "ootle-ts-bindings",
        },
      },
    },
  },
};
