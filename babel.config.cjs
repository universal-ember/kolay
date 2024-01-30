'use strict';

const minifier = require('ember-hbs-minifier/hbs-minifier-plugin').createRegistryPlugin;

module.exports = {
  plugins: [
    '@embroider/addon-dev/template-colocation-plugin',
    [
      'babel-plugin-ember-template-compilation',
      {
        targetFormat: 'hbs',
        transforms: [minifier({})],
      },
    ],
    ['module:decorator-transforms', { runtime: { import: 'decorator-transforms/runtime' } }],
  ],
};
