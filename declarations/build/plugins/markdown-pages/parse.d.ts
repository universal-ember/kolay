/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @param {Array<{ path: string, config: object }>} [providedConfigs] already-read configs; when given, configs are taken from here instead of read from disk (the paths may not be resolvable against cwd, e.g. the stripped app/src/templates prefix)
 *
 * @returns {Promise<import('./types.ts').Collection>}
 */
export function parse(paths: string[], cwd: string, providedConfigs?: Array<{
    path: string;
    config: object;
}>): Promise<any>;
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