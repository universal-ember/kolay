import Service, { service } from '@ember/service';

import { Shadowed } from 'ember-primitives/components/shadowed';
import { compile } from 'ember-repl';

import { APIDocs, CommentQuery } from '../../typedoc/renderer.gts';
import { ComponentSignature } from '../../typedoc/signature/component.gts';
import { HelperSignature } from '../../typedoc/signature/helper.gts';
import { ModifierSignature } from '../../typedoc/signature/modifier.gts';
import { CompileState } from './compiler/compile-state.ts';
import { getDefaultOptions } from './compiler/import-map.ts';

import type DocsService from './docs.ts';

export default class Compiler extends Service {
  @service('kolay/docs') declare docs: DocsService;

  // for debugging in the inspector / console
  last?: CompileState;

  compileMD = (code: string | undefined | null) => {
    const state = new CompileState();

    this.last = state;

    if (!code) {
      return state;
    }

    const {
      additionalResolves: importMap,
      additionalTopLevelScope: topLevelScope,
      remarkPlugins,
      rehypePlugins,
    } = this.docs;
    const defaults = getDefaultOptions();

    compile(code, {
      ...defaults,
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
      ShadowComponent: 'Shadowed',
      // Oops, I broke the types
      remarkPlugins: remarkPlugins as never,
      rehypePlugins: rehypePlugins as never,
      importMap: {
        ...defaults.importMap,
        ...importMap,
      },
      topLevelScope: {
        Shadowed,
        APIDocs,
        CommentQuery,
        ComponentSignature,
        ModifierSignature,
        HelperSignature,
        ...topLevelScope,
      },
      onSuccess: async (component) => state.success(component),
      onError: async (e) => {
        // wtf?
        if (e.includes('registerTemplateCompiler')) return;
        state.fail(e);
      },
      onCompileStart: async () => (state.isCompiling = true),
    });

    return state;
  };
}
