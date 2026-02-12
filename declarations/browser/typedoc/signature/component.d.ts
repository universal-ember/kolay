import type { TOC } from '@ember/component/template-only';
import type { ProjectReflection, Reflection } from 'typedoc';
export declare function getSignature(info: Reflection | undefined, project: ProjectReflection): {
    Element: import("typedoc", { with: { "resolution-mode": "import" } }).DeclarationReflection | undefined;
    Args: import("typedoc", { with: { "resolution-mode": "import" } }).DeclarationReflection | undefined;
    Blocks: import("typedoc", { with: { "resolution-mode": "import" } }).DeclarationReflection | undefined;
} | undefined;
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
        signature: NonNullable<ReturnType<typeof getSignature>>;
    };
}>;
//# sourceMappingURL=component.d.ts.map