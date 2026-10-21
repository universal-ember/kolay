import { describe, expect, test } from 'vitest';

import { addPaths } from './hydrate.js';
import { parse } from './parse.js';
import { sortTree } from './sort.js';

const cwd = '/definitely/not/read/from';

type Node = Record<string, unknown> & { name: string };
type Tree = { pages: Array<Node & { pages?: Node[] }> };

describe('markdown at the root of a source', () => {
  test('a top-level page is gathered, not skipped', async () => {
    const tree = (await parse(['intro.md'], cwd, [])) as unknown as Tree;

    expect(tree.pages.map((node) => node.name)).toEqual(['intro']);
  });

  test('top-level pages and folders live side by side, and sort together', async () => {
    const tree = (await parse(
      ['guides/getting-started.md', 'about.md', 'index.md', 'x-last.md'],
      cwd,
      []
    )) as unknown as Tree;

    // a top-level index is the source's first page, and `x-` still sorts last —
    // the same ordering rules folders get
    expect(tree.pages.map((node) => node.name)).toEqual(['index', 'guides', 'about', 'x-last']);

    const guides = tree.pages.find((node) => node.name === 'guides');

    expect(guides?.pages?.map((node) => node.name)).toEqual(['getting-started']);
  });

  test('a top-level json config applies to its top-level page', async () => {
    const tree = (await parse(['intro.md', 'intro.json'], cwd, [
      { path: 'intro.json', config: { title: 'Introduction' } },
    ])) as unknown as Tree;

    const page = tree.pages.find((node) => node.name === 'intro');

    expect(page?.title).toBe('Introduction');
  });

  test("a top-level meta.json is the source's own config, not a page", async () => {
    const tree = (await parse(['intro.md', 'meta.json'], cwd, [
      { path: 'meta.json', config: { order: ['intro'] } },
    ])) as unknown as Tree;

    expect(tree.pages.map((node) => node.name)).toEqual(['intro']);
  });

  test('a top-level json with an href (and no page of its own) is a nav-only link entry', async () => {
    const tree = (await parse(['elsewhere.json'], cwd, [
      { path: 'elsewhere.json', config: { href: '/TypeDoc/plugin/api-docs.md' } },
    ])) as unknown as Tree;

    const link = tree.pages.find((node) => node.name === 'elsewhere');

    expect(link?.href).toBe('/TypeDoc/plugin/api-docs.md');
  });

  test("a root meta.json's order can place a top-level page among the folders", async () => {
    const configs = [{ path: 'meta.json', config: { order: ['about', 'guides'] } }];

    let tree = await parse(['guides/index.md', 'about.md', 'meta.json'], cwd, configs);

    tree = sortTree(tree, configs);

    expect((tree as unknown as Tree).pages.map((node) => node.name)).toEqual(['about', 'guides']);
  });

  test('a top-level page gets the group prefix and the base', async () => {
    const tree = (await parse(['intro.md'], cwd, [])) as unknown as Tree;

    addPaths(tree as unknown as Parameters<typeof addPaths>[0], '/Documentation', '/my-app/');

    const page = tree.pages.find((node) => node.name === 'intro');

    expect(page?.appRelativePath).toBe('/Documentation/intro.md');
    expect(page?.path).toBe('/my-app/Documentation/intro.md');
  });

  test('the co-located pages root (app/src templates) may hold top-level pages', async () => {
    const tree = (await parse(
      ['./src/templates/index.md', './src/templates/guides/nested.md'],
      cwd,
      []
    )) as unknown as Tree;

    expect(tree.pages.map((node) => node.name)).toEqual(['index', 'guides']);
  });
});
