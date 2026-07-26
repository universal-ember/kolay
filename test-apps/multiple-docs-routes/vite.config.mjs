import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { demos, docs } from "kolay/vite";

export default defineConfig({
  plugins: [
    // One usage of the docs plugin per group: the last path segment is
    // the group name, and each group is mounted as its own route
    // (see app/router.ts)
    docs(import.meta.resolve("./guides", import.meta.url)),
    docs(import.meta.resolve("./demos", import.meta.url), {
      // only THIS usage's .gjs.md files get <Callout> in scope
      scope: `import { Callout } from '#app/components/callout.gjs';`,
    }),
    // fences (runtime and build-time) import these as '#demos/kit/*'
    demos(import.meta.resolve("./shared-demos", import.meta.url), { as: "#demos/kit" }),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
