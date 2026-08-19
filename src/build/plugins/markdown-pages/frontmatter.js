import matter from '@11ty/gray-matter';

/**
 * A *closed* block: `---`, lines, `---`. @11ty/gray-matter alone would treat an
 * unclosed leading `---` as frontmatter-to-EOF and swallow the document,
 * while the render pipelines (micromark) treat it as a plain thematic
 * break and render everything — closed blocks are the only shape the two
 * agree on.
 */
const CLOSED_BLOCK = /^---\r?\n([\s\S]*?\r?\n)?---(\r?\n|$)/;

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
export function extractFrontmatter(source, filePath) {
  // micromark strips a BOM before recognizing frontmatter; match that
  const text = source.replace(/^\uFEFF/, '');

  if (!CLOSED_BLOCK.test(text)) {
    return { data: undefined, content: source };
  }

  try {
    const { data, content } = matter(text);
    const usable =
      typeof data === 'object' && data !== null && !Array.isArray(data) ? data : undefined;

    return { data: usable, content };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(`Could not parse frontmatter in ${filePath}\n${reason}`, { cause: error });
  }
}
