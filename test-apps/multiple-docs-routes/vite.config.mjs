import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { demos, docs, importEntrypoints } from "kolay/vite";

export default defineConfig({
  plugins: [
    // One usage of the docs plugin per group: the last path segment is
    // the group name, and each group is mounted as its own route
    // (see app/router.ts)
    docs(import.meta.resolve("./guides", import.meta.url)),
    docs(import.meta.resolve("./demos", import.meta.url), {
      // only THIS usage's .gjs.md files get <Callout> in scope
      scope: `import { Callout } from '#app/components/callout.gjs';`,
      // only THIS usage's pages get this shape (frontmatter on a top-level
      // `frontmatter` key); the guides usage keeps the default (under `meta`)
      populateManifestEntry: (entry, frontmatter) => ({ ...entry, frontmatter }),
    }),
    // fences (runtime and build-time) import these as '#demos/kit/*'
    demos(import.meta.resolve("./shared-demos", import.meta.url), { as: "#demos/kit" }),
    // runtime fences can import these packages' entrypoints with no modules
    // config — one usage per package; the maps merge
    importEntrypoints("@universal-ember/test-support"),
    importEntrypoints("ember-strict-application-resolver"),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
