import Service, { service } from '@ember/service';

import { Shadowed } from 'ember-primitives';
import { compile } from 'ember-repl';

import { APIDocs } from '../../markdown/typedoc/renderer.gts';
import { ComponentSignature } from '../../markdown/typedoc/signature/component.gts';
import { CompileState } from './compiler/compile-state.ts';
import { getDefaultOptions } from './compiler/import-map.ts';

import type DocsService from './docs.ts';

export type Input = string | undefined | null;

export default class Compiler extends Service {
  @service('kolay/docs') declare docs: DocsService;

  compileMD = (code: Input) => {
    let state = new CompileState();

    if (!code) {
      return state;
    }

    let { additionalResolves: importMap, additionalTopLevelScope: topLevelScope, remarkPlugins, rehypePlugins } = this.docs;
    let defaults = getDefaultOptions();

    compile(code, {
      ...defaults,
      ShadowComponent: 'Shadowed',
      importMap: {
        ...defaults.importMap,
        ...importMap,
      },
      topLevelScope: {
        Shadowed,
        APIDocs,
        ComponentSignature,
        ...topLevelScope,
      },
      remarkPlugins,
      rehypePlugins,
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
      onSuccess: async (component) => {
        state.success(component);
      },
      onError: async (e) => {
        state.fail(e);
      },
      onCompileStart: async () => {
        state.isCompiling = true;
      },
    });

    return state;
  };
}
