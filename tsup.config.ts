import { defineConfig } from 'tsup';
import path from 'path';

/**
 * `tsup` is only used to tree shake the generated types. This prevents
 * internal api details from leaking out. Additionally, the types are bundled
 *  into a single file for easy use.
 */
export default defineConfig({
  entry: { ['index']: path.resolve(__dirname, 'src/index.ts') },
  outDir: 'dist/types',
  dts: {
    only: true,
  },
  clean: false,
});
