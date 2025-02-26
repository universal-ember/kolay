import Service, { service } from '@ember/service';
import { Shadowed } from 'ember-primitives/components/shadowed';
import { compile } from 'ember-repl';
import { CommentQuery, APIDocs } from '../../typedoc/renderer.js';
import { ComponentSignature } from '../../typedoc/signature/component.js';
import { HelperSignature } from '../../typedoc/signature/helper.js';
import { ModifierSignature } from '../../typedoc/signature/modifier.js';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { g, i } from 'decorator-transforms/runtime';
import * as eModifier from 'ember-modifier';
import * as emberResources from 'ember-resources';
import * as trackedBuiltIns from 'tracked-built-ins';
import { Logs } from '../../components/logs.js';
import { Page } from '../../components/page.js';

class CompileState {
  static {
    g(this.prototype, "isCompiling", [tracked], function () {
      return true;
    });
  }
  #isCompiling = (i(this, "isCompiling"), void 0);
  static {
    g(this.prototype, "error", [tracked], function () {
      return null;
    });
  }
  #error = (i(this, "error"), void 0);
  static {
    g(this.prototype, "component", [tracked]);
  }
  #component = (i(this, "component"), void 0);
  #promise;
  #resolve;
  #reject;
  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }
  then = (...args) => this.#promise.then(...args);
  success = component => {
    assert(`Resolve is missing`, this.#resolve);
    this.component = component;
    this.isCompiling = false;
    this.error = null;
    this.#resolve(component);
  };
  fail = error => {
    assert(`Reject is missing`, this.#reject);
    this.error = error;
    this.#reject(error);
  };
  get isReady() {
    return !this.isCompiling;
  }
}

function getDefaultOptions() {
  return {
    format: 'glimdown',
    importMap: {
      'ember-resources': emberResources,
      'tracked-built-ins': trackedBuiltIns,
      'ember-modifier': eModifier,
      kolay: {
        APIDocs,
        ComponentSignature,
        CommentQuery
      },
      'kolay/components': {
        Logs,
        Page
      }
    }
  };
}

class Compiler extends Service {
  static {
    g(this.prototype, "docs", [service('kolay/docs')]);
  }
  #docs = (i(this, "docs"), void 0);
  // for debugging in the inspector / console

  compileMD = code => {
    const state = new CompileState();
    this.last = state;
    if (!code) {
      return state;
    }
    const {
      additionalResolves: importMap,
      additionalTopLevelScope: topLevelScope,
      remarkPlugins,
      rehypePlugins
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
      remarkPlugins: remarkPlugins,
      rehypePlugins: rehypePlugins,
      importMap: {
        ...defaults.importMap,
        ...importMap
      },
      topLevelScope: {
        Shadowed,
        APIDocs,
        CommentQuery,
        ComponentSignature,
        ModifierSignature,
        HelperSignature,
        ...topLevelScope
      },
      onSuccess: async component => state.success(component),
      onError: async e => {
        // wtf?
        if (e.includes('registerTemplateCompiler')) return;
        state.fail(e);
      },
      onCompileStart: async () => state.isCompiling = true
    });
    return state;
  };
}

export { Compiler as default };
//# sourceMappingURL=compiler.js.map
