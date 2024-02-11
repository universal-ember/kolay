export interface Tutorial {
  path: string;
  name: string;
  groupName: string;
  tutorialName: string;
}

export interface Collection {
  name: string;
  pages: Page[];
}

export type Page = Tutorial | Collection;

export type GatheredDocs = Array<{ mdPath: string; config?: object }>;

export interface CreateManifestOptions {
  /**
   * The source directory for where to look for files to create the manifest from.
   * This is relative to the CWD.
   */
  src: string;
  /**
   * The name of the file that is written.
   * Defaults to 'manifest.json'
   */
  name?: string;
  /**
   * Where to place the manifest
   */
  dest?: string;
  /**
   * Globby glob to find paths
   * Defaults to all, **\/*
   */
  include?: string;
  /**
   * Array of exclusion patterns. Will filter out the anything found by the include pattern.
   * default: []
   */
  exclude?: string[];
  /**
   * Only generate a manifest of directories.
   * This ignores all of the files on disk, useful if you have many
   * convention-based file names and some other means of enforcing that they all exist.
   * (such as runtime testing)
  */
  onlyDirectories?: boolean;
}
