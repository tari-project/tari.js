import sass from 'rollup-plugin-sass'
import typescript from 'rollup-plugin-typescript2'
import image from '@rollup/plugin-image'
import postcss from 'rollup-plugin-postcss'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  plugins: [
    sass({ insert: true }),
    typescript(),
    image(),
    postcss({
      modules: true
    })
  ],
  external: ['react', 'react-dom']
}
