import { defineConfig } from 'rollup';
import path from 'path';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import del from 'rollup-plugin-delete';
import { transform } from '@swc/core';
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

const externals = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  '@swc/helpers',
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
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: isWatchMode,
        sourcemapExcludeSources: true,
      },
    ],
    plugins: [
      del({ targets: 'dist/*', runOnce: isWatchMode }),
      resolve({ extensions: ['.ts', '.tsx'] }),
      // adhoc plugin to use swc as transpiler
      {
        name: 'swc',
        transform(code) {
          return transform(
            code,
            JSON.parse(
              readFileSync(path.join(process.cwd(), '.swcrc'), 'utf8'),
            ),
          );
        },
      },
    ],
  }),
  defineConfig({
    ...baseConfig,
    output: [{ file: 'dist/index.d.ts' }],
    plugins: [dts()],
  }),
];
