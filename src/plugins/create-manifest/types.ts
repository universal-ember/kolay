export interface Page {
  path: string;
  name: string;
  groupName: string;
  tutorialName: string;
}

export interface Collection {
  name: string;
  firstPath: string;
  pages: (Page | Collection)[];
}

export type GatheredDocs = Array<{ mdPath: string; config: object }>;
