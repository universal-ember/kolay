import { Shadowed } from 'ember-primitives';
import { Compiled as REPLCompiled } from 'ember-repl';
import { resource, resourceFactory } from 'ember-resources';

import { getDefaultOptions } from './import-map.ts';
import { APIDocs } from './typedoc/renderer.gts';
import { ComponentSignature } from './typedoc/signature/component.gts';

type Input = string | undefined | null;
type Format = 'glimdown' | 'gjs' | 'hbs';
export interface Options {
  format?: Format;
  importMap?: Record<string, Record<string, unknown>>;
  topLevelScope?: Record<string, unknown>;
}

export function Compiled(
  markdownText: Input | (() => Input),
  options?: Options | (() => Options),
): ReturnType<typeof REPLCompiled> {
  let userOptions = typeof options === 'function' ? options() : options;

  return resource(({ use }) => {
    let defaults = getDefaultOptions();
    let options = {
      ShadowComponent: 'Shadowed',
      ...defaults,
      ...userOptions,
      importMap: {
        ...defaults.importMap,
        ...userOptions?.importMap,
      },
      topLevelScope: {
        Shadowed,
        APIDocs,
        ComponentSignature,
        ...userOptions?.topLevelScope,
      },
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
    };

    // @ts-expect-error - bah
    let output = use(REPLCompiled(markdownText, options));

    return () => {
      return output.current;
    };
  });
}

// template-only support
resourceFactory(Compiled);
