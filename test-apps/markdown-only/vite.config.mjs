import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { kolay } from "kolay/vite";

export default defineConfig({
  plugins: [
    kolay({
      groups: [
        {
          name: "Docs",
          src: import.meta.resolve("./docs", import.meta.url),
        },
      ],
      packages: ["ember-primitives", "ember-resources"],
      scope: `
        import { APIDocs, CommentQuery, ComponentSignature, HelperSignature, ModifierSignature } from 'kolay';
        `,
    }),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
