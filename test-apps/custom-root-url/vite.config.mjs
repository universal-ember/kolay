import { defineConfig } from "vite";
import { kolay } from "kolay/vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";

export default defineConfig({
  base: "/my-github-project/",
  plugins: [
    kolay({
      groups: [
        {
          // Use something other than "Docs" so md files don't load raw
          name: "Documentation",
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
