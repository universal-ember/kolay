import * as eModifier from 'ember-modifier';
// ember-resources
import * as emberResources from 'ember-resources';
// other
import * as trackedBuiltIns from 'tracked-built-ins';

import { Logs } from '../components/logs.gts';
import { highlight } from '../highlight.ts';
import { APIDocs, CommentQuery,ComponentSignature } from './typedoc/index.ts';

export const defaultOptions = {
  format: 'glimdown',
  importMap: {
    'ember-resources': emberResources,
    'tracked-built-ins': trackedBuiltIns,
    'ember-modifier': eModifier,
    'kolay': {
      Logs,
      APIDocs,
      ComponentSignature,
      CommentQuery,
      highlight
    },
  },
};
