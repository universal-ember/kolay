/**
 * Reads the YAML frontmatter block off the top of a markdown source.
 *
 * `data` is undefined when there is no block,
 * data is `{}` when the block is empty.
 * `content` is the markdown remaining after stripping frontmatter.
 * Invalid YAML fails loudly (naming the file): the render
 * pipelines strip the block syntactically whether or not the YAML
 * parses, so swallowing the error would leave the data silently missing
 * from the manifest.
 *
 * @param {string} source
 * @param {string} filePath where the source was read from, for error messages
 * @returns {{ data: Record<string, unknown> | undefined, content: string }}
 */
export function extractFrontmatter(source: string, filePath: string): {
    data: Record<string, unknown> | undefined;
    content: string;
};
//# sourceMappingURL=frontmatter.d.ts.map