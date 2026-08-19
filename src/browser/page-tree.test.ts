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
  /** A folder holding one page, with that page as its index. */
  const folderOf = (folderTitle: string | undefined, pageTitle: string | undefined) =>
    ({
      name: 'guides',
      title: folderTitle,
      first: '/guides/index.md',
      pages: [{ path: '/guides/index.md', name: 'index', title: pageTitle }],
    }) as unknown as PageTree;

  test('the index page, under the words the heading already used', () => {
    const folder = folderOf('Guides', 'Guides');

    expect(isRedundantWithHeading(folder, folder.pages[0] as Page)).toBe(true);
  });

  test('the index page, saying something the heading does not', () => {
    const folder = folderOf('Guides', 'Getting started');

    expect(isRedundantWithHeading(folder, folder.pages[0] as Page)).toBe(false);
  });

  test('an untitled folder never covers a page', () => {
    expect(
      isRedundantWithHeading(folderOf(undefined, undefined), { title: undefined } as Page)
    ).toBe(false);
    expect(isRedundantWithHeading(folderOf('', ''), { title: '' } as Page)).toBe(false);
  });

  test('a folder is never redundant: it renders as a heading of its own', () => {
    const folder = folderOf('Guides', 'Guides');

    expect(isRedundantWithHeading(folder, folder)).toBe(false);
  });

  test('a page that merely shares the folder title, but is not its index page', () => {
    // the folder is titled by its own meta.json, so its title matches a page
    // the heading does not link to
    const folder = {
      name: 'guides',
      title: 'Guides',
      first: '/guides/index.md',
      pages: [
        { path: '/guides/index.md', name: 'index', title: 'Overview' },
        { path: '/guides/guides.md', name: 'guides', title: 'Guides' },
      ],
    } as unknown as PageTree;
    const notTheIndex = folder.pages[1] as Page;

    expect(getIndexPage(folder)?.path).toBe('/guides/index.md');
    expect(
      isRedundantWithHeading(folder, notTheIndex),
      'the heading links to the index page, so it does not stand in for this one'
    ).toBe(false);
  });
});
