import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { docs, typedoc } from "kolay/vite";

export default defineConfig({
  plugins: [
    docs({
      groups: [
        {
          name: "Docs",
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
