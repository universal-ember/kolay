import {
  assets,
  compatPrebuild,
  contentFor,
  hbs,
  optimizeDeps,
  resolver,
  scripts,
  templateTag,
} from "@embroider/vite";

import { babel } from "@rollup/plugin-babel";
import { kolay } from "kolay/vite";
import { defineConfig } from "vite";

const extensions = [".mjs", ".gjs", ".js", ".mts", ".gts", ".ts", ".hbs", ".json"];

const optimizeOpts = optimizeDeps();

optimizeOpts.esbuildOptions.target = "esnext";

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      extensions,
    },
    plugins: [
      kolay({
        src: "public/docs",
        groups: [
          {
            name: "Runtime",
            src: "./node_modules/@universal-ember/kolay-ui/docs",
          },
        ],
        packages: ["kolay", "ember-primitives", "ember-resources"],
      }),
      hbs(),
      templateTag(),
      scripts(),
      resolver(),
      compatPrebuild(),
      assets(),
      contentFor(),

      babel({
        babelHelpers: "runtime",
        extensions,
      }),
    ],
    optimizeDeps: optimizeOpts,
    server: {
      port: 4200,
      watch: {
        ignored: [
          "!**/node_modules/**",
          (p) => {
            return p.includes("node_modules") && !p.includes("@universal-ember/kolay-ui");
          },
        ],
      },
    },
    build: {
      sourcemap: "inline",
      target: "esnext",
      outDir: "dist",
      rollupOptions: {
        input: {
          main: "index.html",
          ...(shouldBuildTests(mode) ? { tests: "tests/index.html" } : undefined),
        },
      },
    },
  };
});

function shouldBuildTests(mode) {
  return mode !== "production" || process.env.FORCE_BUILD_TESTS;
}
