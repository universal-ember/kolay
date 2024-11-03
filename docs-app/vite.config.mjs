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
import wasm from "vite-plugin-wasm";

const extensions = [".mjs", ".gjs", ".js", ".mts", ".gts", ".ts", ".hbs", ".json"];

const optimizeOpts = optimizeDeps();

optimizeOpts.esbuildOptions.target = "esnext";

const aliasPlugin = {
  name: "env",
  setup(build) {
    // Intercept import paths called "env" so esbuild doesn't attempt
    // to map them to a file system location. Tag them with the "env-ns"
    // namespace to reserve them for this plugin.
    build.onResolve({ filter: /^kolay.*:virtual$/ }, (args) => ({
      path: args.path,
      external: true,
    }));

    build.onResolve({ filter: /ember-template-compiler$/ }, (args) => ({
      path: "ember-source/dist/ember-template-compiler",
      external: true,
    }));
  },
};

const o = optimizeDeps();

o.esbuildOptions.target = "esnext";
o.esbuildOptions.plugins.splice(0, 0, aliasPlugin);

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      extensions,
    },
    plugins: [
      wasm(),
      kolay({
        src: "public/docs",
        groups: [
          {
            name: "Runtime",
            src: "./node_modules/kolay/docs",
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
    optimizeDeps: o,
    server: {
      port: 4200,
      // watch: {
      // ignored: [
      //   "!**/node_modules/**",
      //   (p) => {
      //     return p.includes("node_modules") && !p.includes("kolay/dist");
      //   },
      // ],
      // },
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
