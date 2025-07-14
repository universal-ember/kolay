/* eslint-disable ember/no-empty-glimmer-component-classes */
import Component from '@glimmer/component';

export default class DefaultClassA extends Component<{
  Element: HTMLDivElement;
  Args: {
    foo: number;
    bar: string;
  };
  Blocks: {
    namedBlockA: [first: boolean];
  };}> {}
