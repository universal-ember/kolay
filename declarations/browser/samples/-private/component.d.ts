import Component from '@glimmer/component';
import type DefaultClassA from './default-export-component';
import type { ESignature, helperLikeB } from './helper.ts';
import type { functionModifierC, ModifierSignatureA } from './modifier.ts';
import type { TOC } from '@ember/component/template-only';
import type { ComponentLike, HelperLike, ModifierLike, WithBoundArgs } from '@glint/template';
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
        namedBlockE: [WithBoundArgs<typeof ClassA, 'foo'>];
    };
}
export interface NullElement {
    /**
     * Element:hehe
     */
    Element: null;
}
export interface SignatureWithCommentHeadings {
    /**
     * #### Element notes
     *
     * Attributes and modifiers are applied to the root element.
     */
    Element: HTMLDivElement;
    Args: {
        foo: number;
    };
    Blocks: {
        /**
         * #### Block usage
         *
         * Documentation for the default block.
         */
        default: [];
    };
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
/**
 * A component with two usage modes expressed as a discriminated union.
 *
 * **Compact:** `@indicator` arg + default block.
 * **Named blocks:** `<:indicator>`, `<:summary>`, and `<:content>`.
 */
export type UnionSignature = {
    Element: HTMLDivElement;
    Args: {
        /**
         * Visual status of the entry.
         */
        status?: 'complete' | 'current' | 'incomplete';
        /**
         * Icon rendered inside the indicator dot.
         */
        indicator: string | ComponentLike;
    };
    Blocks: {
        /** Main content for the entry. */
        default: [];
    };
} | {
    Element: HTMLDivElement;
    Args: {
        /**
         * Visual status of the entry.
         */
        status?: 'complete' | 'current' | 'incomplete';
    };
    Blocks: {
        /** Custom icon inside the indicator dot. */
        indicator: [];
        /** Brief headline. */
        summary: [];
        /** Expanded detail content. */
        content: [];
    };
};
/**
 * The invokables a component can hand back through a block: as a plain
 * `*Like` type, and with args already bound.
 */
export interface YieldsInvokables {
    Blocks: {
        default: [
            component: ComponentLike<SignatureA>,
            modifier: ModifierLike<ModifierSignatureA>,
            helper: HelperLike<ESignature>,
            /**
             * `@foo` is bound, `@bar` is not.
             */
            boundComponent: WithBoundArgs<typeof ClassA, 'foo'>,
            /**
             * `invert` is bound, the positional args are not.
             */
            boundModifier: WithBoundArgs<typeof functionModifierC, 'invert'>,
            /**
             * `optional` is bound.
             */
            boundHelper: WithBoundArgs<typeof helperLikeB, 'optional'>,
            onChange: (value: string) => void
        ];
    };
}
/**
 * Components may yield bound copies of each other -- rendering the bound
 * signatures has to stop somewhere.
 */
export declare class Ping extends Component<{
    Args: {
        foo: number;
    };
    Blocks: {
        default: [WithBoundArgs<typeof Pong, 'ping'>];
    };
}> {
}
export declare class Pong extends Component<{
    Args: {
        ping: string;
        pong: string;
    };
    Blocks: {
        default: [WithBoundArgs<typeof Ping, 'foo'>];
    };
}> {
}
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