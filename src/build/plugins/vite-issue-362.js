import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// the REPL libraries use workers, but vite doesn't have good support
// for following references to worker files
//
// See:
// - https://github.com/vitejs/rolldown-vite/issues/362
// - https://github.com/vitejs/vite/issues/11672#issuecomment-1415820673
// - https://github.com/vitejs/vite/issues/15618
export function fixViteForIssue362() {
  return {
    name: 'vite:#362',

    // has a wasm-dependency, as well as web-worker,
    // which vite can't optimize at this this stage
    config(config) {
      const cwd = process.cwd();
      const ember = require.resolve('ember-repl', cwd);
      const sdk = require.resolve('repl-sdk', ember);
      const manifestPath = sdk.replace(/src\/index.js$/, 'package.json');
      const contents = readFileSync(manifestPath);
      const manifest = JSON.parse(contents.toString());

      const replSdkDeps = Object.keys(manifest.dependencies)
        .map((x) => {
          if (x === 'mdast') return;

          return `ember-repl > repl-sdk > ${x}`;
        })
        .filter(Boolean);

      config.optimizeDeps ||= {};
      config.optimizeDeps.include ||= [];
      config.optimizeDeps.exclude ||= [];

      if (!config.optimizeDeps.exclude.includes('ember-repl')) {
        config.optimizeDeps.exclude.push('ember-repl');
      }

      config.optimizeDeps.include.push(...replSdkDeps);
    },
  };
}
