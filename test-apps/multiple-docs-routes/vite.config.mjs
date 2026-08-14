import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { demos, docs, importEntrypoints } from "kolay/vite";

export default defineConfig({
  plugins: [
    // One usage of the docs plugin per group: the last path segment is
    // the group name, and each group is mounted as its own route
    // (see app/router.ts).
    //
    // A 'Docs' group with no pages of its own collects both, so the nav
    // presents them as a single 'Docs' entry with each group a section of
    // it — their routes and URLs are unaffected, and each keeps its own
    // markdown options.
    docs("Docs", {
      collection: [
        import.meta.resolve("./guides", import.meta.url),
        {
          src: import.meta.resolve("./demos", import.meta.url),
          // only THIS group's .gjs.md files get <Callout> in scope
          scope: `import { Callout } from '#app/components/callout.gjs';`,
        },
      ],
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
