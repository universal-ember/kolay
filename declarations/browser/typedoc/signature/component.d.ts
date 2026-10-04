import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection } from 'typedoc';
export type SingleSignature = {
    Element: any;
    Args: any;
    Blocks: any;
    Return: any;
};
export type UnionSignature = {
    variants: SingleSignature[];
};
export type SignatureResult = SingleSignature | UnionSignature;
export declare function getSignature(info: Reflection | undefined, project: ProjectReflection): SignatureResult | undefined;
export declare function isUnionSignature(info: SignatureResult | undefined): info is UnionSignature;
/**
 * The declaration a signature is read from. Different types can lead to the
 * same one -- `SignatureC`, `ComponentLike<SignatureC>`, and
 * `WithBoundArgs<ClassC, ...>` all do -- which is what makes it usable as the
 * identity of a signature, for spotting one that refers back to itself.
 */
export declare function signatureSource(info: Reflection | undefined, project: ProjectReflection): Reflection | undefined;
export declare const ComponentSignature: TOC<{
    Args: {
        /**
         * Which module to import the type from
         */
        module: string;
        /**
         * The name of the component to render the type / JSDoc of
         */
        name: string;
        /**
         * The name of the package to lookup the module and export name.
         */
        package: string;
    };
}>;
export declare const ComponentDeclaration: TOC<{
    Args: {
        signature: SingleSignature;
    };
}>;
//# sourceMappingURL=component.d.ts.map