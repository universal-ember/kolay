import * as eModifier from 'ember-modifier';
// ember-resources
import * as emberResources from 'ember-resources';
// other
import * as trackedBuiltIns from 'tracked-built-ins';

import { Logs } from '../../../components/logs.gts';
import { Page } from '../../../components/page.gts';
import { APIDocs, CommentQuery } from '../../../typedoc/renderer.gts';
import { ComponentSignature } from '../../../typedoc/signature/component.gts';

export function getDefaultOptions() {
  return {
    format: 'glimdown',
    importMap: {
      'ember-resources': emberResources,
      'tracked-built-ins': trackedBuiltIns,
      'ember-modifier': eModifier,
      kolay: {
        APIDocs,
        ComponentSignature,
        CommentQuery,
      },
      'kolay/components': {
        Logs,
        Page,
      },
    },
  } as const;
}
