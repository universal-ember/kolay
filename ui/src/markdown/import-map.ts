import * as eModifier from 'ember-modifier';
// ember-resources
import * as emberResources from 'ember-resources';
// other
import * as trackedBuiltIns from 'tracked-built-ins';

export const defaultOptions = {
  format: 'glimdown',
  importMap: {
    'ember-resources': emberResources,
    'tracked-built-ins': trackedBuiltIns,
    'ember-modifier': eModifier,
  },
};
