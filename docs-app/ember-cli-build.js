'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
  });

  const { Webpack } = require('@embroider/webpack');

  const { createManifest, apiDocs } = await import('kolay/webpack');

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
          createManifest({ src: 'public/docs' }),
          apiDocs({ package: 'kolay' }),
          apiDocs({ package: 'ember-primitives' }),
          apiDocs({ package: 'ember-resources' }),
        ],
      },
    },
  });
};
