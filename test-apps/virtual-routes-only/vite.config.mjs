import { defineConfig } from "vite";
import { extensions, ember } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";
import { docs } from "kolay/vite";

export default defineConfig({
  plugins: [
    // one group; its routes are mounted ONLY via its virtual module —
    // there is no top-level addRoutes in this app (see app/router.ts)
    docs(import.meta.resolve("./guides", import.meta.url)),
    ember(),
    babel({
      babelHelpers: "runtime",
      extensions,
    }),
  ],
});
