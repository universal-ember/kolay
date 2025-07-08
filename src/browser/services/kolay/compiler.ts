import Service, { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

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

  cache = new Map<string, CompileState>();


  compileMD = (code: string | undefined | null) => {
    const state = new CompileState();

    this.last = state;

    if (this.cache.has(code)) {
      this.last = this.cache.get(code);

      return this.cache.get(code);
    }

    this.cache.set(code, state);

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

    const promise = compile(code, {
      ...defaults,
      /**
       * Documentation can only be in markdown.
       */
      format: 'glimdown',
      ShadowComponent: 'Shadowed',
      remarkPlugins: remarkPlugins,
      rehypePlugins: rehypePlugins,
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

    waitForPromise(promise);

    return state;
  };
}
