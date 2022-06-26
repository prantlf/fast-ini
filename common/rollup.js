import cleanup from 'rollup-plugin-cleanup'
import { minify } from 'rollup-plugin-swc-minify'

export function library (suffix) {
  const name = `fastIni${suffix}`
  const outprefix = 'dist/index'
  return {
    input: 'src/index.js',
    output: [
      { file: `${outprefix}.cjs`, format: 'cjs', sourcemap: true },
      { file: `${outprefix}.mjs`, sourcemap: true },
      {
        file: `${outprefix}.min.mjs`,
        sourcemap: true,
        plugins: [minify()]
      },
      { file: `${outprefix}.umd.js`, format: 'umd', name, sourcemap: true },
      {
        file: `${outprefix}.umd.min.js`,
        format: 'umd',
        name,
        sourcemap: true,
        plugins: [minify()]
      }
    ],
    plugins: [cleanup()]
  }
}
