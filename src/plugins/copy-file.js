import { createUnplugin } from 'unplugin';

/**
 *
 */
export const copyFile = createUnplugin((options) => {
  let { src, dest } = options ?? {};

  return {
    name: 'copy',
    async buildStart() {
      const path = await import('node:path');
      const fs = await import('fs/promises');

      let source = path.resolve(src);
      let name = source.split('/').reverse()[0];
      let file = await fs.readFile(source);
      let content = await file.toString();

      dest ??= name;

      await this.emitFile({
        type: 'asset',
        fileName: dest,
        source: content,
      });
    },
    // watchChange(id) {
    //   console.debug('watchChange', id);
    // },
  };
});
