import esbuild from 'rollup-plugin-esbuild';
import { defineConfig } from 'rollup';
import path from 'path';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import { builtinModules } from 'module';
import del from 'rollup-plugin-delete';

const externals = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...builtinModules,
]);

export default [
  defineConfig({
    input: path.join(__dirname, 'src/index.ts'),
    external: (id) => externals.has(id),
    output: [
      { file: 'dist/index.es.js', format: 'es' },
      { file: 'dist/index.cjs.cjs', format: 'cjs' },
    ],
    plugins: [del({ targets: 'dist/*', runOnce: true }), esbuild()],
  }),
  defineConfig({
    input: path.join(__dirname, 'src/index.ts'),
    external: (id) => externals.has(id),
    output: [
      { file: 'dist/index.es.d.ts', format: 'es' },
      { file: 'dist/index.js.d.ts', format: 'cjs' },
    ],
    plugins: [dts()],
  }),
];
