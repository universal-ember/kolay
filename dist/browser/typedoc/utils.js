
import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { trackedFunction } from 'reactiveweb/function';
import { ConsoleLogger, Deserializer, FileRegistry } from 'typedoc/browser';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { g, i } from 'decorator-transforms/runtime';

function findChildDeclaration(info, name) {
  if (!info.isDeclaration()) {
    return;
  }
  return info.children?.find(child => child.variant === 'declaration' && child.name === name);
}
const infoFor = (project, module, name) => {
  const moduleDoc = project.getChildByName([module]);
  assert(`Could not find module by name: ${module}. Make sure that the d.ts file is present in the generated api docs.`, moduleDoc);
  const found = moduleDoc.getChildByName([name]);
  return found;
};
const Query = setComponentTemplate(precompileTemplate("\n  {{#let (infoFor @info @module @name) as |info|}}\n    {{#if info}}\n      {{yield info}}\n    {{else}}\n      {{yield to=\"notFound\"}}\n    {{/if}}\n  {{/let}}\n", {
  strictMode: true,
  scope: () => ({
    infoFor
  })
}), templateOnly());
const stringify = x => String(x);
const cache = new Map();
class Load extends Component {
  static {
    g(this.prototype, "apiDocs", [service('kolay/api-docs')]);
  }
  #apiDocs = (i(this, "apiDocs"), void 0);
  /**
  * TODO: move this to the service and dedupe requests
  */
  request = trackedFunction(this, async () => {
    const {
      package: pkg
    } = this.args;
    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }
    let seen = cache.get(pkg);
    if (seen) {
      return seen;
    }
    const loadNew = async () => {
      const req = await this.apiDocs.load(pkg);
      const json = await req.json();
      const logger = new ConsoleLogger();
      const deserializer = new Deserializer(logger);
      const project = deserializer.reviveProject('API Docs', json, {
        projectRoot: '/',
        registry: new FileRegistry()
      });
      return project;
    };
    seen = waitForPromise(loadNew());
    cache.set(pkg, seen);
    return seen;
  });
  static {
    setComponentTemplate(precompileTemplate("\n    {{#if this.request.isLoading}}\n      Loading api docs...\n    {{/if}}\n\n    {{#if this.request.isError}}\n      {{stringify this.request.error}}\n    {{/if}}\n\n    {{#if this.request.value}}\n      <section>\n        <Query @info={{this.request.value}} @module={{@module}} @name={{@name}} as |type|>\n          {{yield type this.request.value}}\n        </Query>\n      </section>\n    {{/if}}\n  ", {
      strictMode: true,
      scope: () => ({
        stringify,
        Query
      })
    }), this);
  }
}

export { Load, Query, findChildDeclaration, infoFor };
//# sourceMappingURL=utils.js.map
