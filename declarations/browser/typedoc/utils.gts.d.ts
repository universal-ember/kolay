import Component from '@glimmer/component';
import type APIDocsService from '../services/kolay/api-docs.ts';
import type { TOC } from '@ember/component/template-only';
import type { DeclarationReflection } from 'typedoc';
export declare function findChildDeclaration(info: DeclarationReflection, name: string): DeclarationReflection | undefined;
export declare const infoFor: (data: DeclarationReflection, module: string, name: string) => DeclarationReflection | undefined;
export declare const Query: TOC<{
    Args: {
        module: string;
        name: string;
        info: DeclarationReflection;
    };
    Blocks: {
        default: [DeclarationReflection];
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
        default: [DeclarationReflection, any];
    };
}> {
    apiDocs: APIDocsService;
    /**
     * TODO: move this to the service and dedupe requests
     */
    request: import("reactiveweb/function").State<Promise<any>>;
}
