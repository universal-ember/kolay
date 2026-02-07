import Component from '@glimmer/component';
import { assert } from '@ember/debug';

import { Provide } from 'ember-primitives/dom-context';
import { getPromiseState } from 'reactiveweb/get-promise-state';
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

const cache = new Map<string, () => Promise<ProjectReflection>>();

export class Load extends Component<{
  Args: {
    module: string;
    name: string;
    package: string;
  };
  Blocks: { default: [Reflection, ProjectReflection] };
}> {
  get #apiDocs() {
    return typedocLoader(this);
  }

  get request() {
    return getPromiseState(this.#createProject);
  }

  get #createProject() {
    const { package: pkg } = this.args;

    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }

    const seen = cache.get(pkg);

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

    cache.set(pkg, loadNew);

    return loadNew;
  }

  <template>
    {{log this.request}}

    {{#if this.request.isLoading}}
      Loading api docs...
    {{/if}}

    {{#if this.request.error}}
      {{errorFor this.request.error}}
    {{/if}}

    {{#if this.request.resolved}}
      <section>
        <Query @info={{this.request.resolved}} @module={{@module}} @name={{@name}} as |type|>
          <Provide @data={{this.request.resolved}} @key='project'>
            {{yield type this.request.resolved}}
          </Provide>
        </Query>
      </section>
    {{/if}}
  </template>
}

function errorFor(error: unknown): string | undefined {
  if (typeof error === 'object' && null !== error) {
    if ('reason' in error && typeof error.reason === 'string') {
      return error.reason;
    }
  }

  if (error instanceof Error) {
    return `Error loading API docs: ${error.message}`;
  }

  return `Error loading API docs: ${String(error)}`;
}
