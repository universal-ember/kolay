import { describe, expect, test } from 'vitest';

import { reshape } from '../build/plugins/markdown-pages/hydrate.js';
import { getIndexPage, isRedundantWithHeading } from './page-tree.ts';

import type { Page, PageTree } from '../types.ts';

/**
 * Built rather than hand-written, because what `getIndexPage` answers depends
 * on where sorting puts an `index` page. A literal fixture could pin an order
 * the build never produces and pass while the two disagree.
 */
async function folder(paths: string[], name: string): Promise<PageTree> {
  // `reshape` is untyped JS; it builds exactly the shape these helpers take.
  const { tree } = (await reshape({
    paths,
    configs: [],
    cwd: '.',
    prefix: '/',
    base: '/',
  })) as { tree: PageTree };
  const found = tree.pages.find((node): node is PageTree => node.name === name);

  expect(found, `built a folder named ${name}`).toBeDefined();

  return found as PageTree;
}

describe('getIndexPage', () => {
  test('a page named index, wherever it sorts alphabetically', async () => {
    const a = await folder(['a/b.md', 'a/index.md'], 'a');

    expect(getIndexPage(a)?.path).toBe('/a/index.md');
  });

  test('the first page when the folder has no index', async () => {
    const a = await folder(['a/b.md', 'a/c.md'], 'a');

    expect(getIndexPage(a)?.path).toBe('/a/b.md');
  });

  test('an index outranks a sibling folder', async () => {
    const a = await folder(['a/b/deep.md', 'a/index.md'], 'a');

    expect(getIndexPage(a)?.path).toBe('/a/index.md');
  });

  test('the fallback descends into a first child folder', async () => {
    const a = await folder(['a/b/deep.md', 'a/zzz.md'], 'a');

    expect(getIndexPage(a)?.path).toBe('/a/b/deep.md');
  });

  test('it always answers with the page the folder redirects to', async () => {
    for (const paths of [
      ['a/b.md', 'a/index.md'],
      ['a/b.md', 'a/c.md'],
      ['a/b/deep.md', 'a/index.md'],
      ['a/b/deep.md', 'a/zzz.md'],
    ]) {
      const a = await folder(paths, 'a');

      expect(getIndexPage(a)?.path, paths.join(' + ')).toBe(a.first);
    }
  });

  test('a folder with no pages has none', () => {
    expect(getIndexPage({ name: 'a', pages: [] } as unknown as PageTree)).toBeUndefined();
  });
});

describe('isRedundantWithHeading', () => {
  const page = (title?: string) => ({ title }) as Page;
  const tree = (title?: string) => ({ title, pages: [] }) as unknown as PageTree;

  test('a page whose title the heading already says', () => {
    expect(isRedundantWithHeading(tree('Guides'), page('Guides'))).toBe(true);
  });

  test('a page saying something the heading does not', () => {
    expect(isRedundantWithHeading(tree('Guides'), page('Getting started'))).toBe(false);
  });

  test('an untitled folder never covers a page', () => {
    expect(isRedundantWithHeading(tree(undefined), page(undefined))).toBe(false);
    expect(isRedundantWithHeading(tree(''), page(''))).toBe(false);
  });

  test('a folder is never redundant: it renders as a heading of its own', () => {
    expect(isRedundantWithHeading(tree('Guides'), tree('Guides'))).toBe(false);
  });
});
