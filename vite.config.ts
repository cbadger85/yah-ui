import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, Plugin } from 'vite';
import fs from 'fs';
import pkg from './package.json';

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
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      output: {
        sourcemapExcludeSources: true,
      },
    },
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    emptyOutDir: mode === 'production',
  },
  plugins: [
    mode === 'production' &&
      checker({
        typescript: true,
        eslint: { files: ['./src'], extensions: ['.ts', '.tsx'] },
      }),
    mode === 'development' && sourceDts(),
  ],
}));

const fsPromises = fs.promises;

/**
 * instead of using TypeScript to generate a .d.ts file,
 * this plugin will generate a dummy .d.ts file that points to the source code.
 *
 * This plugin was adapted from `vite-dts`. https://github.com/alloc/vite-dts
 */
function sourceDts(): Plugin {
  let dtsModule: string | undefined;
  let typePath: string | undefined;
  let isGenerated = false;

  return {
    name: 'dev-dts',
    apply: 'build',
    async configResolved(config) {
      dtsModule = undefined;
      typePath = undefined;
      isGenerated = false;

      const { logger } = config;
      const { outDir } = config.build;
      const { entry } = config.build.lib || {};

      if (!entry) {
        return logger.warn(
          `Expected "build.lib.entry" to exist in vite config.`,
        );
      }

      if (!pkg.types) {
        return logger.warn(`Expected "types" to exist in package.json`);
      }

      const entryPath = path.resolve(config.root, entry);
      const posixEntryImportPath = path
        .relative(
          path.resolve(config.root, path.dirname(pkg.types)),
          entryPath.replace(/\.tsx?$/, ''),
        )
        .split(path.sep)
        .join(path.posix.sep);

      const entryFile = await fsPromises.readFile(entryPath, 'utf-8');
      const hasDefaultExport =
        /^(export default |export \{[^}]+? as default\s*[,}])/m.test(entryFile);

      const baseDtsModule = `export * from "${posixEntryImportPath}"`;
      dtsModule = hasDefaultExport
        ? baseDtsModule.concat(
            `\nexport {default} from "${posixEntryImportPath}"`,
          )
        : baseDtsModule;

      typePath = path.relative(outDir, pkg.types);
    },
    generateBundle() {
      if (!isGenerated && typePath && dtsModule) {
        this.emitFile({
          type: 'asset',
          fileName: typePath,
          source: dtsModule,
        });
      }

      isGenerated = true;
    },
  };
}
