'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
  });

  const { Webpack } = require('@embroider/webpack');

  const { markdownPages, apiDocs, setup } = await import('kolay/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    // https://github.com/emberjs/ember.js/issues/20640
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
          setup(),
          markdownPages({
            src: 'public/docs',
            include: ['../README.md'],
            groups: [
              {
                name: 'Runtime',
                include: ['../ui/docs/**/*'],
              },
            ],
          }),
          apiDocs({ packages: ['kolay', 'ember-primitives', 'ember-resources'] }),
        ],
      },
    },
  });
};
