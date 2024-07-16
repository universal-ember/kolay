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
