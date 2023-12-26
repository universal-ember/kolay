import fs from "node:fs";
import path from "node:path";
import { globbySync } from "globby";
import { createUnplugin } from "unplugin";

export const copyToPublic = createUnplugin((options) => {
  let name = "copy-files-to-public";
  let { src, include, dest } = options ?? {};

  dest ??= src;
  include ??= "**/*";

  return {
    name,
    async buildStart() {
      const files = globbySync(include, { cwd: src });

      await Promise.all(
        files.map(async (file) => {
          let source = path.join(src, file);

          this.addWatchFile(source);

          await this.emitFile({
            type: "asset",
            fileName: path.join(dest, file),
            source: fs.readFileSync(source).toString(),
          });
        }),
      );
    },
    // watchChange(id) {
    //   console.debug("watchChange", id);
    // },
  };
});
