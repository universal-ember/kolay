import Component from '@glimmer/component';
import { type ProjectReflection } from 'typedoc/browser';
import type { TOC } from '@ember/component/template-only';
import type { Reflection } from 'typedoc';
export declare function findChildDeclaration(info: Reflection, name: string): import("typedoc", { with: { "resolution-mode": "import" } }).DeclarationReflection | undefined;
export declare const infoFor: (project: ProjectReflection, module: string, name: string) => Reflection | undefined;
export declare const Query: TOC<{
    Args: {
        module: string;
        name: string;
        info: ProjectReflection;
    };
    Blocks: {
        default: [Reflection];
        notFound: [];
    };
}>;
export declare class Load extends Component<{
    Args: {
        module: string;
        name: string;
        package: string;
    };
    Blocks: {
        default: [Reflection, ProjectReflection];
    };
}> {
    #private;
    get request(): import("reactiveweb/get-promise-state").State<ProjectReflection>;
    resolved: ProjectReflection | undefined;
}
//# sourceMappingURL=utils.d.ts.map