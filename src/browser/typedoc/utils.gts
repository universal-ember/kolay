import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';

import { trackedFunction } from 'reactiveweb/function';
import { ConsoleLogger, Deserializer, FileRegistry, type ProjectReflection } from 'typedoc/browser';

import { typedocLoader } from '../services/api-docs.ts';

import type { TOC } from '@ember/component/template-only';
import type { Reflection } from 'typedoc';

export function findChildDeclaration(info: Reflection, name: string) {
  if (!info.isDeclaration()) {
    return;
  }

  return info.children?.find((child) => child.variant === 'declaration' && child.name === name);
}

export const infoFor = (
  project: ProjectReflection,
  module: string,
  name: string
): Reflection | undefined => {
  const moduleDoc = project.getChildByName([module]);

  assert(
    `Could not find module by name: ${module}. Make sure that the d.ts file is present in the generated api docs.`,
    moduleDoc
  );

  const found = moduleDoc.getChildByName([name]);

  return found;
};

export const Query: TOC<{
  Args: { module: string; name: string; info: ProjectReflection };
  Blocks: { default: [Reflection]; notFound: [] };
}> = <template>
  {{#let (infoFor @info @module @name) as |info|}}
    {{#if info}}
      {{yield info}}
    {{else}}
      {{yield to='notFound'}}
    {{/if}}
  {{/let}}
</template>;

const stringify = (x: unknown) => String(x);

const cache = new Map<string, Promise<ProjectReflection>>();

export class Load extends Component<{
  Args: {
    module: string;
    name: string;
    package: string;
  };
  Blocks: { default: [Reflection, ProjectReflection] };
}> {
  get #apiDocs() {
    return typedocLoader();
  }

  /**
   * TODO: move this to the service and dedupe requests
   */
  request = trackedFunction(this, async () => {
    const { package: pkg } = this.args;

    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }

    let seen = cache.get(pkg);

    if (seen) {
      return seen;
    }

    const loadNew = async (): Promise<ProjectReflection> => {
      const req = await this.#apiDocs.load(pkg);
      const json = await req.json();

      const logger = new ConsoleLogger();
      const deserializer = new Deserializer(logger);
      const project = deserializer.reviveProject('API Docs', json, {
        projectRoot: '/',
        registry: new FileRegistry(),
      });

      return project;
    };

    seen = waitForPromise(loadNew());

    cache.set(pkg, seen);

    return seen;
  });

  <template>
    {{#if this.request.isLoading}}
      Loading api docs...
    {{/if}}

    {{#if this.request.isError}}
      {{stringify this.request.error}}
    {{/if}}

    {{#if this.request.value}}
      <section>
        <Query @info={{this.request.value}} @module={{@module}} @name={{@name}} as |type|>
          {{yield type this.request.value}}
        </Query>
      </section>
    {{/if}}
  </template>
}
