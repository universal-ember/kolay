/* eslint-disable ember/no-empty-glimmer-component-classes */
import Component from '@glimmer/component';

import type { WithDefaultArgs } from '@glint/template';
import type { TOC } from '@ember/component/template-only';

export interface SignatureA {
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}

export type ArgsC = {
  foo: number;
  bar: string;
};

export interface SignatureC {
  Element: HTMLDivElement;
  Args: ArgsC;
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
    namedBlockC : [WithDefaultArgs<typeof ClassC, 'foo' | 'bar'>];
  };
}

export interface NullElement {
  /**
   * Element:hehe
   */
  Element: null;
}

export class ClassA extends Component<{
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}> {}

export class ClassB extends Component<SignatureA> {}

export class ClassC extends Component<SignatureC> {}

export const TemplateOnlyC: TOC<SignatureA> = <template>hi there</template>;

export const TemplateOnlyD: TOC<{
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    default: [first: number, second: string];
    namedBlockA: [first: typeof ClassA];
    namedBlockB: [boolean];
  };
}> = <template>hi</template>;
