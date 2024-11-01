import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { service } from '@ember/service';

import { trackedFunction } from 'reactiveweb/function';

import type APIDocsService from '../services/kolay/api-docs.ts';
import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';

export function findChildDeclaration(
  info: DeclarationReflection,
  name: string,
) {
  return info.children?.find(
    (child) => child.variant === 'declaration' && child.name === name,
  );
}

export const infoFor = (
  data: DeclarationReflection,
  module: string,
  name: string,
) => {
  let moduleType = data.children?.find((child) => child.name === module);

  assert(
    `Could not find module by name: ${module}. Available modules in this set of api docs are: ${data.children
      ?.map((child) => child.name)
      .join(', ')}`,
    moduleType,
  );

  let found = moduleType?.children?.find(
    (grandChild) => grandChild.name === name,
  );

  return found as DeclarationReflection | undefined;
};

export const Query: TOC<{
  Args: { module: string; name: string; info: DeclarationReflection };
  Blocks: { default: [DeclarationReflection]; notFound: [] };
}> = <template>
  {{#let (infoFor @info @module @name) as |info|}}
    {{#if info}}
      {{yield info}}
    {{else}}
      {{yield to='notFound'}}
    {{/if}}
  {{/let}}
</template>;

function isDeclarationReflection(info: unknown): info is DeclarationReflection {
  return true;
}

const stringify = (x: unknown) => String(x);

export class Load extends Component<{
  Args: {
    module: string;
    name: string;
    package: string;
  };
  Blocks: { default: [DeclarationReflection, any] };
}> {
  @service('kolay/api-docs') declare apiDocs: APIDocsService;

  /**
   * TODO: move this to the service and dedupe requests
   */
  request = trackedFunction(this, async () => {
    let { package: pkg } = this.args;

    if (!pkg) {
      throw new Error(`A @package must be specified to load.`);
    }

    let req = await this.apiDocs.load(pkg);
    let json = await req.json();

    return json;
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
        {{#if (isDeclarationReflection this.request.value)}}
          <Query
            @info={{this.request.value}}
            @module={{@module}}
            @name={{@name}}
            as |type|
          >
            {{yield type this.request.value}}
          </Query>
        {{/if}}
      </section>
    {{/if}}
  </template>
}
