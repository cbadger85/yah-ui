import resolve from '@rollup/plugin-node-resolve';
import { transform } from '@swc/core';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const root = __dirname;
const isWatchMode = !!process.env.ROLLUP_WATCH;

const externals = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  // should this be a dependency? The outputed build depends on it, but it's
  // only imported by the compiler at build time...
  '@swc/helpers',
]);

/** @type {(import('rollup').RollupOptions)} */
const baseConfig = {
  input: path.join(root, 'src/index.ts'),
  external: (id) => externals.has(id),
};

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
      swc(),
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
 * Compile project with SWC
 *
 * @param {Object} [config={}]
 * @param {string} [config.swcConfig] the path to the swc config. if not provided, it will use the config in `process.cwd()` if it exists.
 * @returns {import('rollup').Plugin}
 */
function swc({ swcConfig } = {}) {
  function getSwcOptions() {
    if (swcConfig) {
      return JSON.parse(readFileSync(swcConfig, 'utf8'));
    }

    const defaultSwcPath = path.join(process.cwd(), '.swcrc');

    if (existsSync(defaultSwcPath)) {
      return JSON.parse(readFileSync(defaultSwcPath, 'utf8'));
    }

    return undefined;
  }

  return {
    name: 'swc',
    transform(code) {
      return transform(code, getSwcOptions());
    },
  };
}
