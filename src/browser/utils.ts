import type { Collection, Page } from '../types.ts';

export function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

export function isIndex(x: Page | Collection) {
  if (isCollection(x)) return false;

  return x.path.endsWith('index.md');
}

export function getIndexPage(x: Collection): Page | undefined {
  const page = x.pages.find(isIndex);

  if (page && isCollection(page)) return;

  return page;
}
