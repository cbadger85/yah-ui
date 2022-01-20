import path from 'path';
import { existsSync, readdirSync, lstatSync, rmdirSync, unlinkSync } from 'fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

emptyDir(path.resolve(__dirname, 'types'));

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

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
    outDir: 'dist',
    minify: false,
    sourcemap: true,
  },
  plugins: [
    dts({
      outputDir: 'types',
      staticImport: true,
      insertTypesEntry: true,
      logDiagnostics: true,
    }),
  ],
}));

function emptyDir(dir: string): void {
  if (!existsSync(dir)) {
    return;
  }

  for (const file of readdirSync(dir)) {
    const abs = path.resolve(dir, file);

    // baseline is Node 12 so can't use rmSync
    if (lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      rmdirSync(abs);
    } else {
      unlinkSync(abs);
    }
  }
}
