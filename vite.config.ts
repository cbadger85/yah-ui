import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import pkg from './package.json';

export default defineConfig(({ mode }) => {
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
    plugins: [mode === 'development' && sourceDts()],
  };
});

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
  let outputFileNames: string[] = [];

  return {
    name: 'source-dts',
    apply: 'build',
    async configResolved(config) {
      const { logger } = config;
      const { outDir } = config.build;
      const { entry, formats, fileName } = config.build.lib || {};

      outputFileNames = formats.map((format) => `${fileName}.${format}.js`);

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
    generateBundle(_, bundle) {
      const filename = Object.keys(bundle)[0];

      // This make sure this file is only emitted when the first JS
      // bundle is created and not for each bundle. This prevents the
      // types from being emitted multiple times.
      const isFirstBundle =
        outputFileNames.length && outputFileNames[0] === filename;

      if (isFirstBundle && typePath && dtsModule) {
        this.emitFile({
          type: 'asset',
          fileName: typePath,
          source: dtsModule,
        });
      }
    },
  };
}
