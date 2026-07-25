import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { docs } from "kolay/vite";

export default defineConfig({
  plugins: [
    // Multiple usages of the docs plugin: each usage slurps up its own
    // source directory, and each group is mounted as its own route
    // (see app/router.ts)
    docs({
      groups: [
        {
          name: "guides",
          src: import.meta.resolve("./guides", import.meta.url),
        },
      ],
    }),
    docs({
      groups: [
        {
          name: "demos",
          src: import.meta.resolve("./demos", import.meta.url),
        },
      ],
      // only THIS usage's .gjs.md files get <Callout> in scope
      scope: `import { Callout } from '#app/components/callout.gjs';`,
    }),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
