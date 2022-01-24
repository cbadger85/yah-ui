import { Plugin } from 'vite';
import { build } from 'tsup';
import path from 'path';

interface EmitDtsOptions {
  mode: string;
  outDir: string;
}

/**
 * `tsup` is being used to tree shake the generated types. This prevents
 * internal api details from leaking out. Additionally, the types are bundled
 *  into a single file for easy use.
 */
export default function emitDts(options?: Partial<EmitDtsOptions>): Plugin {
  let entry: string | undefined;
  let outDir: string | undefined;

  return {
    name: 'emit-dts',
    apply: (_, env) =>
      options?.mode ? env.mode === options.mode : env.mode === 'production',
    async configResolved(config) {
      const { logger } = config;

      outDir = options?.outDir
        ? path.resolve(config.root, options.outDir)
        : path.resolve(config.root, config.build?.outDir);

      const viteEntryPath =
        typeof config.build?.lib === 'object'
          ? config.build.lib.entry
          : undefined;

      if (!viteEntryPath) {
        return logger.warn(
          `Expected "build.lib.entry" to exist in vite config.`,
        );
      }

      entry = path.resolve(config.root, viteEntryPath);
    },
    async buildStart() {
      await build({
        entry: [entry],
        outDir,
        dts: {
          only: true,
        },
        clean: false,
      });
    },
  };
}
