import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig(({ mode }) => ({
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    emptyOutDir: mode === 'production',
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      output: {
        sourcemapExcludeSources: true,
      },
    },
    outDir: 'dist',
    minify: false,
    sourcemap: true,
  },
  plugins: [
    mode === 'production' &&
      checker({
        typescript: true,
        eslint: { files: ['./src'], extensions: ['.ts', '.tsx'] },
      }),
  ],
}));
