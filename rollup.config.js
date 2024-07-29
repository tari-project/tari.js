import typescript from 'rollup-plugin-typescript2'
import nodeResolve from "@rollup/plugin-node-resolve";

import pkg from './package.json' assert { type: 'json' }

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'es',
      exports: 'named',
      sourcemap: true,
      strict: true
    }
  ],

  plugins: [
    nodeResolve(),
    typescript(),
  ],
  external: ["@tari-project/wallet_jrpc_client", "@metamask/providers"]
}
