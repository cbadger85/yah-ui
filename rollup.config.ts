/**
 * Build config for yah-ui.
 *
 *! Though the file is technically a .ts file, type annotations will cause
 *! this file to not compile.
 */

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
  // should this be a dependency? The outputed build depends on it, but it's
  // only imported by the compiler at build time...
  '@swc/helpers',
]);

const root = __dirname;

const baseConfig = defineConfig({
  input: path.join(root, 'src/index.ts'),
  external: (id) => externals.has(id),
});

const isWatchMode = !!process.env.ROLLUP_WATCH;

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
            JSON.parse(readFileSync(path.join(root, '.swcrc'), 'utf8')),
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
