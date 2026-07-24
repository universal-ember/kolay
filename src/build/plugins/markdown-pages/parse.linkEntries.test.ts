import { describe, expect, test } from 'vitest';

import { addPaths } from './hydrate.js';
import { parse } from './parse.js';

const cwd = '/definitely/not/read/from';

type Node = Record<string, unknown> & { name: string };
type Tree = { pages: Array<Node & { pages?: Node[] }> };

describe('nav-only link entries', () => {
  test('a json config with an href (and no page of its own) becomes an entry', async () => {
    const tree = (await parse(
      ['development/rendering-pages.md', 'development/configuring-typedoc.json'],
      cwd,
      [
        {
          path: 'development/configuring-typedoc.json',
          config: { href: '/TypeDoc/plugin/typedoc.md', componentName: 'Configuring typedoc(...)' },
        },
      ]
    )) as unknown as Tree;

    const development = tree.pages.find((node) => node.name === 'development');

    expect(development && 'pages' in development).toBe(true);

    const names = (development?.pages ?? []).map((node) => node.name);

    expect(names).toContain('rendering-pages');
    expect(names).toContain('configuring-typedoc');

    const link = (development?.pages ?? []).find((node) => node.name === 'configuring-typedoc');

    expect(link?.href).toBe('/TypeDoc/plugin/typedoc.md');
    expect(link?.componentName).toBe('Configuring typedoc(...)');
  });

  test('the group prefix does not apply to the href; the base does', async () => {
    const tree = (await parse(['development/configuring-typedoc.json'], cwd, [
      {
        path: 'development/configuring-typedoc.json',
        config: { href: '/TypeDoc/plugin/typedoc.md' },
      },
    ])) as unknown as Tree;

    addPaths(tree as unknown as Parameters<typeof addPaths>[0], '/Home-ish-prefix', '/my-app/');

    const development = tree.pages.find((node) => node.name === 'development');
    const link = (development?.pages ?? []).find((node) => node.name === 'configuring-typedoc');

    expect(link?.appRelativePath).toBe('/TypeDoc/plugin/typedoc.md');
    expect(link?.path).toBe('/my-app/TypeDoc/plugin/typedoc.md');
  });

  test('configs that belong to a page, and meta files, do not become entries', async () => {
    const tree = (await parse(['development/rendering-pages.md'], cwd, [
      {
        path: 'development/rendering-pages.json',
        config: { href: '/somewhere-else.md' },
      },
      { path: 'development/meta.json', config: { href: '/nope.md' } },
    ])) as unknown as Tree;

    const development = tree.pages.find((node) => node.name === 'development');
    const names = (development?.pages ?? []).map((node) => node.name);

    expect(names).toEqual(['rendering-pages']);
  });
});
