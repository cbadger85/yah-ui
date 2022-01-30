import esbuild from 'rollup-plugin-esbuild';
import { defineConfig } from 'rollup';
import path from 'path';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import del from 'rollup-plugin-delete';

const externals = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]);

const isWatchMode = !!process.env.ROLLUP_WATCH;

const baseConfig = defineConfig({
  input: path.join(__dirname, 'src/index.ts'),
  external: (id) => externals.has(id),
});

export default [
  defineConfig({
    ...baseConfig,
    output: [
      {
        file: 'dist/index.es.js',
        format: 'es',
        sourcemap: isWatchMode,
        sourcemapExcludeSources: true,
      },
      {
        file: 'dist/index.cjs.cjs',
        format: 'cjs',
        sourcemap: isWatchMode,
        sourcemapExcludeSources: true,
      },
    ],
    plugins: [del({ targets: 'dist/*', runOnce: isWatchMode }), esbuild()],
  }),
  defineConfig({
    ...baseConfig,
    output: [{ file: 'dist/index.d.ts' }],
    plugins: [dts()],
  }),
];
