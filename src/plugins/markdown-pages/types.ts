export type { Collection, Manifest, Page } from '@universal-ember/kolay-ui/services/kolay/types';
import type { Collection, Page } from '@universal-ember/kolay-ui/services/kolay/types';

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
