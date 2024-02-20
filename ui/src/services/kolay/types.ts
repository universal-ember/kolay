export interface Manifest {
  list: Page[];
  tree: Collection;
}

export interface Collection {
  name: string;
  first?: string;
  pages: (Collection | Page)[];
  groupName: never;
}

export interface Page {
  path: string;
  name: string;
  groupName: string;
}