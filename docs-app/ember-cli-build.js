'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { maybeEmbroider } = require('@embroider/test-setup');
const path = require('path');
const fs = require('fs');

const USE_WEBPACK = Boolean(process.env.WEBPACK);

module.exports = async function (defaults) {
  if (!USE_WEBPACK) {
    const app = new EmberApp(defaults, {
      'ember-cli-babel': {
        disableDecoratorTransforms: true,
        enableTypeScriptTransform: true,
      },
    });

    return maybeEmbroider(app);
  }

  const { readPackageUpSync } = await import('read-package-up');

  const app = new EmberApp(defaults, {
    // Add options here
    trees: {
      app: (() => {
        let sideWatch = require('@embroider/broccoli-side-watch');

        let paths = ['kolay', '@universal-ember/kolay-ui'].map((libraryName) => {
          let entry = require.resolve(libraryName);
          let { packageJson, path: packageJsonPath } = readPackageUpSync({ cwd: entry });
          let packagePath = path.dirname(packageJsonPath);

          console.debug(
            `Side-watching ${libraryName} from ${packagePath}, which started in ${entry}`
          );

          let toWatch = packageJson.files
            .map((f) => path.join(packagePath, f))
            .filter((p) => {
              if (!fs.existsSync(p)) return false;
              if (!fs.lstatSync(p).isDirectory()) return false;

              return !p.endsWith('/src');
            });

          return toWatch;
        });

        return sideWatch('app', { watching: paths.flat() });
      })(),
    },
    'ember-cli-babel': {
      disableDecoratorTransforms: true,
      enableTypeScriptTransform: true,
    },
    autoImport: {
      watchedDependencies: ['kolay', '@universal-ember/kolay-ui'],
    },
  });

  const { Webpack } = require('@embroider/webpack');

  const { kolay } = await import('kolay/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: false,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
        plugins: [
          kolay({
            src: 'public/docs',
            groups: [
              {
                name: 'Runtime',
                src: '../ui/docs',
              },
            ],
            packages: ['kolay'],
          }),
        ],
      },
    },
  });
};
