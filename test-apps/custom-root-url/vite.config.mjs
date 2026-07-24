import { defineConfig } from "vite";
import { docs, typedoc } from "kolay/vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";

export default defineConfig({
  base: "/my-github-project/",
  plugins: [
    docs({
      groups: [
        {
          // Use something other than "Docs" so md files don't load raw
          name: "Documentation",
          src: import.meta.resolve("./docs", import.meta.url),
        },
      ],
      scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        `,
    }),
    typedoc({
      packages: ["ember-primitives", "ember-resources"],
    }),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
