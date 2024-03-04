'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

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
};
