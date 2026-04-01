import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection } from 'typedoc';
type SingleSignature = {
    Element: any;
    Args: any;
    Blocks: any;
};
type UnionSignature = {
    variants: SingleSignature[];
};
type SignatureResult = SingleSignature | UnionSignature;
export declare function getSignature(info: Reflection | undefined, project: ProjectReflection): SignatureResult | undefined;
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
export {};
//# sourceMappingURL=component.d.ts.map