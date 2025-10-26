/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 *
 * @returns {Promise<import('./types.ts').Collection>}
 */
export function parse(paths: string[], cwd: string): Promise<any>;
/**
 *
 * @param {import('./types.ts').GatheredDocs} docs
 */
export function build(docs: any): any;
/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 */
export function configsFrom(paths: string[], cwd: string): Promise<{
    path: string;
    config: any;
}[]>;
//# sourceMappingURL=parse.d.ts.map