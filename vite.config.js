import path from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json';
// import tsconfigPaths from 'vite-tsconfig-paths';
// import dts from 'vite-dts';

const isExternal = (id) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig(() => ({
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        sourcemapExcludeSources: true,
      },
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    // tsconfigPaths(),
    // dts(),
  ],
}));
