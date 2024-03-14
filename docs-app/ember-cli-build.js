'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { prebuild } = require('@embroider/compat');

const USE_WEBPACK = Boolean(process.env.WEBPACK);

module.exports = async function (defaults) {
  if (!USE_WEBPACK) {
    const app = new EmberApp(defaults, {
      // Add options here
    });

    return prebuild(app);
  }

  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
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
            packages: ['kolay', 'ember-primitives', 'ember-resources'],
          }),
        ],
      },
    },
  });
};
