/* eslint-disable no-undef */

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

const projectRoot = __dirname;

/** @type {(import('rollup').RollupOptions)} */
const baseConfig = {
  input: path.join(projectRoot, 'src/index.ts'),
  external: (id) => externals.has(id),
};

const isWatchMode = !!process.env.ROLLUP_WATCH;

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
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
      swc({ root }),
    ],
  },
  {
    ...baseConfig,
    output: [{ file: 'dist/index.d.ts' }],
    plugins: [dts()],
  },
];

export default config;

/**
 * adhoc plugin to use swc as transpiler
 *
 * @returns {import('rollup').Plugin}
 */
function swc({ root = process.cwd() }) {
  function getSwcOptions() {
    try {
      return JSON.parse(readFileSync(path.join(root, '.swcrc'), 'utf8'));
    } catch (e) {
      if (e instanceof Error && e.code === 'ENOENT') {
        return undefined; // if no config is found, use the default provided by SWC
      }

      throw e;
    }
  }

  return {
    name: 'swc',
    transform(code) {
      return transform(code, getSwcOptions());
    },
  };
}
