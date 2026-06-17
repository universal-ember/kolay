/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 *
 * @returns {Promise<import('./types.ts').Collection>}
 */
export function parse(paths: string[], cwd: string): Promise<any>;
/**
 *
 * @param {string} segment
 * @returns {string}
 */
export function cleanSegment(segment: string): string;
/**
 *
 * @param {import('./types.ts').GatheredDocs} docs
 */
export function build(docs: any): any;
/**
 * @param {string} filePath
 */
export function readJSONC(filePath: string): Promise<any>;
//# sourceMappingURL=parse.d.ts.map