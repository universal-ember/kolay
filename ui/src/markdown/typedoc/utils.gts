import Component from '@glimmer/component';

import { RemoteData } from 'reactiveweb/remote-data';

import { highlight } from '../../highlight.ts';

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
    package?: string;
    apiDocs?: string;
  };
  Blocks: { default: [DeclarationReflection] };
}> {
  get url() {
    let { apiDocs, package: pkg } = this.args;

    if (apiDocs) return apiDocs;

    if (pkg) {
      throw new Error(`Not Implemented`);
    }

    throw new Error(
      `Missing Docs Source provided for ${this.args.module} > ${this.args.name}`,
    );
  }

  <template>
    {{#let (RemoteData this.url) as |request|}}
      {{#if request.isLoading}}
        Loading api docs...
      {{/if}}

      {{#if request.isError}}
        {{stringify request.error}}
      {{/if}}

      {{#if request.value}}
        <section {{highlight request.value}}>
          {{#if (isDeclarationReflection request.value)}}
            <Query
              @info={{request.value}}
              @module={{@module}}
              @name={{@name}}
              as |type|
            >
              {{yield type}}
            </Query>
          {{/if}}
        </section>
      {{/if}}
    {{/let}}
  </template>
}
