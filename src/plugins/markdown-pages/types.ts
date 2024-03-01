export type { Collection, Manifest, Page } from '@universal-ember/kolay-ui/services/kolay/types';
import type { Collection, Page } from '@universal-ember/kolay-ui/services/kolay/types';

export type Node = Page | Collection;

export type GatheredDocs = Array<{ mdPath: string; config?: object }>;

export interface MarkdownPagesOptions {
  /**
   * The source directory for where to look for files to include in  the build and create the manifest from.
   * This is relative to the CWD.
   * Note that only md, json, and jsonc files are used.
   *
   * This option is the same as the one in `groups`, but is a shorthand for if
   * you only have one set of docs with no configuration needed.
   */
  src?: string;

  /**
   * Additional markdown sources to include
   * These will be copied into your dist directory, and will be grouped by each entry's "name" property
   */
  groups: {
    /**
     * The name of the group
     */
    name: string;
    /**
     * The source directory for where to look for files to include in  the build and create the manifest from.
     * This is relative to the CWD.
     * Note that only md, json, and jsonc files are used.
     */
    src: string;

    /**
     * Only generate a manifest of directories.
     * This ignores all of the files on disk, useful if you have many
     * convention-based file names and some other means of enforcing that they all exist.
     * (such as runtime testing)
     */
    onlyDirectories?: boolean;

    /**
     * @internal
     * Globby glob to find paths
     * Defaults to all, **\/*
     */
    include?: string;

    /**
     * @internal
     * Array of exclusion patterns. Will filter out the anything found by the include pattern.
     * default: []
     */
    exclude?: string[];
  }[];

  /**
   * The name of the file that is written.
   * Defaults to 'manifest.json'
   */
  name?: string;
  /**
   * Where to place the manifest
   * Defaults to 'docs'
   */
  dest?: string;
}
