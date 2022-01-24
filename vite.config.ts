import path from 'path';
import { defineConfig } from 'vite';
import emitDts from './.vite/plugins/emitDts';
import sourceDts from './.vite/plugins/sourceDts';

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: 'index',
      },
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
    plugins: [sourceDts(), emitDts({ outDir: 'dist/types' })],
  };
});
