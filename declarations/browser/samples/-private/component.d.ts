import Component from '@glimmer/component';
import type DefaultClassA from './default-export-component';
import type { TOC } from '@ember/component/template-only';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
export interface SignatureA {
    Element: HTMLDivElement;
    Args: {
        /**
         * Every property on a type can have docs, and code fences
         *
         * example:
         * ```gjs
         * import { A } from 'somewhere';
         *
         * <template>
         *  <A @foo={{2}} @bar="hello">...</A>
         * </template>
         * ```
         */
        foo: number;
        bar: string;
    };
    Blocks: {
        /**
         * Block documentation should have examples of how to use the yielded data
         *
         * ```gjs
         * import { A } from 'somewhere';
         *
         * <template>
         *  <A as |first second|>...
         *    {{first}} a number
         *    {{second}} a string
         *  </A>
         * </template>
         * ```
         */
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
        namedBlockC: [WithBoundArgs<typeof ClassA, 'foo' | 'bar'>];
        namedBlockD: [WithBoundArgs<ClassC, 'foo' | 'bar'>];
    };
}
export interface NullElement {
    /**
     * Element:hehe
     */
    Element: null;
}
export declare class ClassA extends Component<{
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
}> {
}
export declare class ClassB extends Component<SignatureA> {
}
export type ClassC = ComponentLike<SignatureC>;
export declare const TemplateOnlyC: TOC<SignatureA>;
export declare const TemplateOnlyD: TOC<{
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
}>;
export default class ClassE extends Component<{
    Element: HTMLDivElement;
    Args: {
        foo: number;
        bar: string;
    };
    Blocks: {
        default: [first: number, second: string];
        namedBlockA: [first: typeof DefaultClassA];
        namedBlockB: [first: WithBoundArgs<typeof DefaultClassA, 'foo'>];
    };
}> {
}
//# sourceMappingURL=component.d.ts.map