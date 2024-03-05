'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { prebuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

  if (!process.env.WEBPACK) {
    return prebuild(app);
  }

  if (process.env.WEBPACK) {
    const { Webpack } = require('@embroider/webpack');
    const { markdownPages, apiDocs, setup } = await import('kolay/webpack');

    return require('@embroider/compat').compatBuild(app, Webpack, {
      staticAddonTestSupportTrees: true,
      staticAddonTrees: true,
      staticHelpers: true,
      staticModifiers: true,
      staticComponents: true,
      staticEmberSource: true,
      skipBabel: [
        {
          package: 'qunit',
        },
      ],
      packagerOptions: {
        webpackConfig: {
          devtool: 'source-map',
          plugins: [
            setup(),
            markdownPages({
              src: 'public/docs',
              groups: [
                {
                  name: 'Runtime',
                  src: '../ui/docs',
                },
              ],
            }),
            apiDocs({ packages: ['kolay', 'ember-primitives', 'ember-resources'] }),
          ],
        },
      },
    });
  }

  throw new Error('Good luck reproducing the situation that got you here.');
};
