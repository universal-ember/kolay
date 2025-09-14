import Service from '@ember/service';
export default class DocsService extends Service {
    _packages: string[];
    loadApiDocs: Record<string, () => ReturnType<typeof fetch>>;
    get packages(): string[];
    load: (name: string) => Promise<Response>;
}
//# sourceMappingURL=api-docs.d.ts.map