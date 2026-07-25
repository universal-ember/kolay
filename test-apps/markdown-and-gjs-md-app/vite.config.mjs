import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { docs, apiDocs } from "kolay/vite";

export default defineConfig({
  plugins: [
    docs("Docs", {
      src: import.meta.resolve("./docs", import.meta.url),
    }),
    apiDocs(["ember-primitives", "ember-resources"]),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
