export interface Manifest {
  groups: {
    name: string;
    list: Page[];
    tree: Collection;
  }[];
}

export interface Collection {
  path: string;
  name: string;
  first?: string;
  pages: (Collection | Page)[];
  groupName?: never;
}

export interface Page {
  path: string;
  name: string;
  groupName: string;
  cleanedName: string;
}

export type Node = Page | Collection;

export type GatheredDocs = Array<{ mdPath: string; config?: object }>;

export interface MarkdownPagesOptions {
  src?: string | undefined;
  groups: {
    name: string;
    src: string;
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

  name?: string | undefined;
  dest?: string | undefined;
}
