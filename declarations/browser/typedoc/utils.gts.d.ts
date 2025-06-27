import Component from '@glimmer/component';
import { type ProjectReflection } from 'typedoc/browser';
import type APIDocsService from '../services/kolay/api-docs.ts';
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
    apiDocs: APIDocsService;
    /**
     * TODO: move this to the service and dedupe requests
     */
    request: import("reactiveweb/function").State<Promise<ProjectReflection>>;
}
//# sourceMappingURL=utils.gts.d.ts.map