import Component from '@glimmer/component';
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
export declare class ClassC extends Component<SignatureC> {
}
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
//# sourceMappingURL=component.gts.d.ts.map