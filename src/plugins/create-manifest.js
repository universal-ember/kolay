const { createUnplugin } = require("unplugin");

export const createManifest = createUnplugin((options) => {
  let { src, dest, name, include, exclude } = options ?? {};

  dest ??= src;
  name ??= "manifest.json";
  include ??= "**/*";
  exclude ??= [];

  return {
    name: "create-manifest",
    async buildStart() {
      const path = await import("node:path");
      const { globbySync } = await import("globby");

      let paths = globbySync(include, {
        cwd: path.join(process.cwd(), src),
        expandDirectories: true,
      });

      paths = paths.filter(
        (path) => !exclude.some((pattern) => path.match(pattern)),
      );

      await this.emitFile({
        type: "asset",
        fileName: path.join(dest, name),
        source: JSON.stringify(reshape(paths)),
      });
    },
    // watchChange(id) {
    //   console.debug('watchChange', id);
    // },
  };
});
