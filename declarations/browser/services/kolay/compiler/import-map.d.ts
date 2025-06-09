import * as eModifier from 'ember-modifier';
import * as emberResources from 'ember-resources';
import * as trackedBuiltIns from 'tracked-built-ins';
import { Logs } from '../../../components/logs.gts';
import { Page } from '../../../components/page.gts';
export declare function getDefaultOptions(): {
    readonly format: "glimdown";
    readonly importMap: {
        readonly 'ember-resources': typeof emberResources;
        readonly 'tracked-built-ins': typeof trackedBuiltIns;
        readonly 'ember-modifier': typeof eModifier;
        readonly kolay: {
            readonly APIDocs: import("@ember/component/template-only").TOC<{
                Args: {
                    module: string;
                    name: string;
                    package: string;
                };
            }>;
            readonly ComponentSignature: import("@ember/component/template-only").TOC<{
                Args: {
                    module: string;
                    name: string;
                    package: string;
                };
            }>;
            readonly CommentQuery: import("@ember/component/template-only").TOC<{
                Args: {
                    module: string;
                    name: string;
                    package: string;
                };
            }>;
        };
        readonly 'kolay/components': {
            readonly Logs: typeof Logs;
            readonly Page: typeof Page;
        };
    };
};
//# sourceMappingURL=import-map.d.ts.map