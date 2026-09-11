/**
 * @typedef {object} ParseOptions
 * @property {Array<{ path: string, data: Record<string, unknown> }>} [frontmatter] per-page frontmatter data, keyed by the same (possibly prefix-stripped) paths as `paths`
 * @property {import('./populate-manifest-entry.js').PopulateManifestEntry} [populateManifestEntry] finalizes each page or directories manifest entry — `defaultPopulateManifestEntry` when not given
 */
/**
 * @param {string[]} paths
 * @param {string} cwd path on disk that the paths are relative to - needed for looking up configs
 * @param {Array<{ path: string, config: object }>} [providedConfigs] already-read configs; when given, configs are taken from here instead of read from disk (the paths may not be resolvable against cwd, e.g. the stripped app/src/templates prefix)
 * @param {ParseOptions} [options]
 *
 * @returns {Promise<import('./types.ts').PageTree>}
 */
export function parse(paths: string[], cwd: string, providedConfigs?: Array<{
    path: string;
    config: object;
}>, options?: ParseOptions): Promise<any>;
/**
 *
 * @param {string} segment
 * @returns {string}
 */
export function cleanSegment(segment: string): string;
/**
 *
 * @param {import('./types.ts').GatheredDocs} docs
 * @param {import('./populate-manifest-entry.js').PopulateManifestEntry} [populate] finalizes each page or directories manifest entry; when omitted, entries are the raw structural default (the direct-call path used by tests)
 */
export function build(docs: any, populate?: import("./populate-manifest-entry.js").PopulateManifestEntry): any;
/**
 * @param {string} filePath
 */
export function readJSONC(filePath: string): Promise<any>;
export type ParseOptions = {
    /**
     * per-page frontmatter data, keyed by the same (possibly prefix-stripped) paths as `paths`
     */
    frontmatter?: {
        path: string;
        data: Record<string, unknown>;
    }[] | undefined;
    /**
     * finalizes each page or directories manifest entry — `defaultPopulateManifestEntry` when not given
     */
    populateManifestEntry?: import("./populate-manifest-entry.js").PopulateManifestEntry | undefined;
};
//# sourceMappingURL=parse.d.ts.map