import sass from 'rollup-plugin-sass'
import typescript from 'rollup-plugin-typescript2'
import image from '@rollup/plugin-image'
import postcss from 'rollup-plugin-postcss'

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
    sass({ insert: true }),
    typescript(),
    image(),
    postcss({
      modules: true
    })
  ],
  external: ['react', 'react-dom']
}
