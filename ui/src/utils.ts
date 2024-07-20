import type { Collection, Page } from './services/kolay/types.ts';

export function isCollection(x: Page | Collection): x is Collection {
  return 'pages' in x;
}

export function isIndex(x: Page | Collection) {
  if (isCollection(x)) return false;

  return x.path.endsWith('index.md');
}

export function getIndexPage(x: Collection): Page | undefined {
  let page = x.pages.find(isIndex);

  if (page && isCollection(page)) return;

  return page;
}
