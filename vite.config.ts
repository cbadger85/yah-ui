import path from 'path';
import { defineConfig } from 'vite';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig(({ mode }) => ({
  esbuild: {
    jsxInject: "import React from 'react'",
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    emptyOutDir: mode === 'production',
    rollupOptions: {
      external: isExternal,
      output: {
        sourcemapExcludeSources: true,
      },
    },
    outDir: 'dist',
    minify: false,
    sourcemap: true,
  },
}));
